const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Simple audit logger utility for direct database logging
 */
class AuditLogger {
  /**
   * Log an action to the audit log
   * @param {Object} user - User object from request
   * @param {string} action - Action performed (CREATE, READ, UPDATE, DELETE, etc.)
   * @param {string} resource - Resource affected (TRANSPORT_ROUTE, VEHICLE, etc.)
   * @param {string|null} resourceId - ID of the specific resource
   * @param {string} details - Additional details about the action
   * @param {string} status - Status of the action (SUCCESS, FAILURE)
   */
  async log(user, action, resource, resourceId = null, details = '', status = 'SUCCESS') {
    try {
      const auditData = {
        userId: user?.id || 'anonymous',
        userEmail: user?.email || 'anonymous',
        userName: user ? `${user.firstName} ${user.lastName}` : 'Anonymous',
        userRoles: JSON.stringify(user?.roles?.map((r) => r.name) || []),
        tenantId: user?.tenantId || null,
        action,
        resource,
        resourceId,
        details,
        ipAddress: 'server', // For direct calls, not from middleware
        userAgent: 'server',
        timestamp: new Date(),
        status,
        errorMessage: status === 'FAILURE' ? details : null,
      };

      await prisma.auditLog.create({ data: auditData });
    } catch (error) {
      console.error('Audit logging error:', error);
      // Don't throw error to avoid breaking the main operation
    }
  }

  /**
   * Log a successful action
   */
  async logSuccess(user, action, resource, resourceId = null, details = '') {
    return this.log(user, action, resource, resourceId, details, 'SUCCESS');
  }

  /**
   * Log a failed action
   */
  async logFailure(user, action, resource, resourceId = null, details = '') {
    return this.log(user, action, resource, resourceId, details, 'FAILURE');
  }

  /**
   * Log a CREATE action
   */
  async logCreate(user, resource, resourceId, details = '') {
    return this.log(user, 'CREATE', resource, resourceId, details);
  }

  /**
   * Log a READ action
   */
  async logRead(user, resource, resourceId = null, details = '') {
    return this.log(user, 'READ', resource, resourceId, details);
  }

  /**
   * Log an UPDATE action
   */
  async logUpdate(user, resource, resourceId, details = '') {
    return this.log(user, 'UPDATE', resource, resourceId, details);
  }

  /**
   * Log a DELETE action
   */
  async logDelete(user, resource, resourceId, details = '') {
    return this.log(user, 'DELETE', resource, resourceId, details);
  }
}

// Export a singleton instance
const auditLogger = new AuditLogger();
module.exports = auditLogger;
