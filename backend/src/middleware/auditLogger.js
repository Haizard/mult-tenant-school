const { PrismaClient } = require("@prisma/client");

let prisma;

if (!global.prisma) {
  global.prisma = new PrismaClient();
}
prisma = global.prisma;

// Audit logging middleware
const auditLogger = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;

    // Capture response data
    let responseData = null;
    let statusCode = null;

    res.send = function (data) {
      responseData = data;
      statusCode = res.statusCode;
      return originalSend.call(this, data);
    };

    res.json = function (data) {
      responseData = data;
      statusCode = res.statusCode;
      return originalJson.call(this, data);
    };

    // Continue with the request
    next();

    // Log after response is sent
    res.on("finish", async () => {
      try {
        // Don't log audit endpoints to avoid infinite loops
        if (req.path.includes("/audit-logs")) {
          return;
        }

        const auditData = {
          userId: req.user?.id || "anonymous",
          userEmail: req.user?.email || "anonymous",
          userName: req.user
            ? `${req.user.firstName} ${req.user.lastName}`
            : "Anonymous",
          userRoles: JSON.stringify(req.user?.roles?.map((r) => r.name) || []),
          tenantId: req.tenantId || req.user?.tenantId || null,
          action: action || req.method,
          resource: resource || req.path,
          resourceId: req.params?.id || null,
          details: JSON.stringify({
            method: req.method,
            path: req.path,
            query: req.query,
            params: req.params,
            body: sanitizeBody(req.body),
            responseStatus: statusCode,
            responseData: sanitizeResponse(responseData),
          }),
          ipAddress: req.ip || req.connection?.remoteAddress || "unknown",
          userAgent: req.get("User-Agent") || "unknown",
          timestamp: new Date(),
          status: statusCode >= 200 && statusCode < 300 ? "SUCCESS" : "FAILURE",
          errorMessage:
            statusCode >= 400 ? getErrorMessage(responseData) : null,
        };

        await prisma.auditLog.create({ data: auditData });
      } catch (error) {
        console.error("Audit logging error:", error);
        // Don't throw error to avoid breaking the main request
      }
    });
  };
};

// Sanitize request body to remove sensitive data
const sanitizeBody = (body) => {
  if (!body || typeof body !== "object") return body;

  const sanitized = { ...body };
  const sensitiveFields = ["password", "token", "secret", "key", "auth"];

  Object.keys(sanitized).forEach((key) => {
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
      sanitized[key] = "[REDACTED]";
    }
  });

  return sanitized;
};

// Sanitize response data to remove sensitive information
const sanitizeResponse = (data) => {
  if (!data) return null;

  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    if (parsed && typeof parsed === "object") {
      const sanitized = { ...parsed };

      // Remove sensitive fields from response
      const sensitiveFields = ["password", "token", "secret", "key"];
      const removeRecursive = (obj) => {
        if (Array.isArray(obj)) {
          return obj.map(removeRecursive);
        } else if (obj && typeof obj === "object") {
          const cleaned = {};
          Object.keys(obj).forEach((key) => {
            if (
              !sensitiveFields.some((field) =>
                key.toLowerCase().includes(field),
              )
            ) {
              cleaned[key] = removeRecursive(obj[key]);
            } else {
              cleaned[key] = "[REDACTED]";
            }
          });
          return cleaned;
        }
        return obj;
      };

      return removeRecursive(sanitized);
    }
    return parsed;
  } catch (error) {
    return "[PARSE_ERROR]";
  }
};

// Extract error message from response
const getErrorMessage = (responseData) => {
  try {
    const parsed =
      typeof responseData === "string"
        ? JSON.parse(responseData)
        : responseData;
    return parsed?.message || parsed?.error || "Unknown error";
  } catch (error) {
    return "Parse error";
  }
};

// Specific audit loggers for different actions
const auditLoggers = {
  // Authentication actions
  login: auditLogger("LOGIN", "auth"),
  logout: auditLogger("LOGOUT", "auth"),

  // User management
  createUser: auditLogger("CREATE", "users"),
  updateUser: auditLogger("UPDATE", "users"),
  deleteUser: auditLogger("DELETE", "users"),
  viewUser: auditLogger("VIEW", "users"),

  // Student management
  createStudent: auditLogger("CREATE", "students"),
  updateStudent: auditLogger("UPDATE", "students"),
  deleteStudent: auditLogger("DELETE", "students"),
  viewStudent: auditLogger("VIEW", "students"),

  // Class management
  createClass: auditLogger("CREATE", "classes"),
  updateClass: auditLogger("UPDATE", "classes"),
  deleteClass: auditLogger("DELETE", "classes"),
  viewClass: auditLogger("VIEW", "classes"),
  assignStudentToClass: auditLogger("ASSIGN_STUDENT", "classes"),
  removeStudentFromClass: auditLogger("REMOVE_STUDENT", "classes"),
  assignTeacherToClass: auditLogger("ASSIGN_TEACHER", "classes"),
  removeTeacherFromClass: auditLogger("REMOVE_TEACHER", "classes"),
  updateClassCapacity: auditLogger("UPDATE_CAPACITY", "classes"),
  updateClassSchedule: auditLogger("UPDATE_SCHEDULE", "classes"),

  // Attendance management
  markAttendance: auditLogger("MARK", "attendance"),
  updateAttendance: auditLogger("UPDATE", "attendance"),
  deleteAttendance: auditLogger("DELETE", "attendance"),
  viewAttendance: auditLogger("VIEW", "attendance"),

  // Leave management
  createLeave: auditLogger("CREATE", "leave"),
  approveLeave: auditLogger("APPROVE", "leave"),
  rejectLeave: auditLogger("REJECT", "leave"),
  deleteLeave: auditLogger("DELETE", "leave"),

  // Tenant management
  createTenant: auditLogger("CREATE", "tenants"),
  updateTenant: auditLogger("UPDATE", "tenants"),
  deleteTenant: auditLogger("DELETE", "tenants"),

  // Role management
  createRole: auditLogger("CREATE", "roles"),
  updateRole: auditLogger("UPDATE", "roles"),
  deleteRole: auditLogger("DELETE", "roles"),
  assignRole: auditLogger("ASSIGN", "roles"),
  revokeRole: auditLogger("REVOKE", "roles"),

  // Generic actions
  create: (resource) => auditLogger("CREATE", resource),
  read: (resource) => auditLogger("READ", resource),
  update: (resource) => auditLogger("UPDATE", resource),
  delete: (resource) => auditLogger("DELETE", resource),
};

module.exports = {
  auditLogger,
  auditLoggers,
};
