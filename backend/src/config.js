require("dotenv").config();

// Server configuration
const PORT = process.env.PORT || 5000;

// Frontend configuration
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// CORS configuration
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS;

// Environment configuration
const NODE_ENV = process.env.NODE_ENV || "development";

module.exports = {
  PORT,
  FRONTEND_URL,
  ALLOWED_ORIGINS,
  NODE_ENV,
};
