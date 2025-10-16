const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { errorHandler } = require("./middleware/errorHandler");
const { PORT, FRONTEND_URL, ALLOWED_ORIGINS, NODE_ENV } = require("./config");

const app = express();

// Trust proxy for reverse proxy setups
app.set('trust proxy', 1);

// Middleware
app.use(helmet()); // Security headers

// Whitelist of allowed origin patterns for security validation
const ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https?:\/\/[a-zA-Z0-9.-]+\.localhost(:\d+)?$/,
  /^https?:\/\/[a-zA-Z0-9.-]+\.local(:\d+)?$/,
  /^https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  /^https:\/\/[a-zA-Z0-9.-]+\.vercel\.app$/,
  /^https:\/\/[a-zA-Z0-9.-]+\.netlify\.app$/,
  /^https:\/\/[a-zA-Z0-9.-]+\.herokuapp\.com$/,
];

// Validate origin against whitelist patterns
const isValidOrigin = (origin) => {
  // Return false immediately for falsy origin values
  if (!origin) {
    return false;
  }
  return ALLOWED_ORIGIN_PATTERNS.some(pattern => pattern.test(origin));
};

// Normalize origin for consistent comparison
const normalizeOrigin = (origin) => {
  if (!origin) return null;
  
  // Remove trailing slashes, convert to lowercase, ensure consistent protocol
  let normalized = origin.toLowerCase().trim();
  
  // Remove trailing slash
  if (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  
  // Ensure protocol consistency (default to https if no protocol)
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }
  
  return normalized;
};

// Check if origin matches allowed patterns (supports wildcards and subdomains)
const isOriginAllowed = (origin, allowedOrigins) => {
  const normalizedOrigin = normalizeOrigin(origin);
  
  return allowedOrigins.some(allowedOrigin => {
    const normalizedAllowed = normalizeOrigin(allowedOrigin);
    
    // Exact match
    if (normalizedOrigin === normalizedAllowed) {
      return true;
    }
    
    // Wildcard subdomain support (e.g., *.example.com)
    if (normalizedAllowed.includes('*.')) {
      const pattern = normalizedAllowed.replace('*.', '[a-zA-Z0-9.-]*.');
      const regex = new RegExp('^' + pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$');
      return regex.test(normalizedOrigin);
    }
    
    return false;
  });
};

// Dynamic CORS origin function with validation
const getAllowedOrigins = () => {
  if (!ALLOWED_ORIGINS) {
    // Fallback to default origins if ALLOWED_ORIGINS is not set
    return [
      FRONTEND_URL,
      "http://127.0.0.1:3000",
    ];
  }
  
  const origins = ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  
  // Validate each origin against whitelist
  const validOrigins = origins.filter(origin => {
    if (isValidOrigin(origin)) {
      return true;
    } else {
      console.warn(`CORS: Origin "${origin}" is not in the allowed whitelist and will be rejected`);
      return false;
    }
  });
  
  return validOrigins;
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if the origin is in the allowed list using normalized comparison
    if (isOriginAllowed(origin, allowedOrigins)) {
      return callback(null, true);
    }
    
    // Reject the request
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined')); // Logging
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "School Management System API",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Request logging middleware (only for development)
if (NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Centralized route registry
const routeRegistry = {
  "/api/auth": "./routes/authRoutes",
  "/api/users": "./routes/userRoutes",
  "/api/tenants": "./routes/tenantRoutes",
  "/api/roles": "./routes/roleRoutes",
  "/api/academic": "./routes/academicRoutes",
  "/api/examinations": "./routes/examinationRoutes",
  "/api/schedules": "./routes/scheduleRoutes",
  "/api/audit": "./routes/auditRoutes",
  "/api/audit-logs": "./routes/auditRoutes",
  "/api/students": "./routes/studentRoutes",
  "/api/teachers": "./routes/teacherRoutes",
  "/api/teacher-attendance": "./routes/teacherAttendanceRoutes",
  "/api/teacher-leave": "./routes/teacherLeaveRoutes",
  "/api/teacher-evaluations": "./routes/teacherEvaluationRoutes",
  "/api/teacher-training": "./routes/teacherTrainingRoutes",
  "/api/teacher-reports": "./routes/teacherReportsRoutes",
  "/api/parents": "./routes/parentRoutes",
  "/api/attendance": "./routes/attendanceRoutes",
  "/api/leave": "./routes/leaveRoutes",
  "/api/notifications": "./routes/notificationRoutes",
  "/api/library": "./routes/libraryRoutes",
  "/api/transport": "./routes/transportRoutes",
  "/api/hostel": "./routes/hostelRoutes",
  "/api/content": "./routes/contentRoutes",
  "/api/communication": "./routes/communicationRoutes",
  "/api/messages": "./routes/messageRoutes",
  "/api/announcements": "./routes/announcementRoutes",
  "/api/message-templates": "./routes/messageTemplateRoutes",
  "/api/website": "./routes/websiteRoutes",
};

// Dynamically import and mount routes
Object.entries(routeRegistry).forEach(([path, modulePath]) => {
  const routeModule = require(modulePath);
  app.use(path, routeModule);
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 API base URL: http://localhost:${PORT}/api`);
});

module.exports = app;
