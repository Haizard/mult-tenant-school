const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auditLogger = require('../utils/auditLogger');

class CommunicationService {
  // Bulk Messaging
  async sendBulkMessage(tenantId, senderId, data) {
    const { recipientIds, subject, content, messageType = 'BROADCAST', priority = 'NORMAL', scheduledAt, templateId, variables } = data;
    
    try {
      let processedContent = content;
      let processedSubject = subject;
      
      // If using a template, process variables
      if (templateId) {
        const template = await prisma.messageTemplate.findFirst({
          where: { id: templateId, tenantId }
        });
        
        if (!template) {
          throw new Error('Template not found');
        }
        
        processedContent = this.processTemplateVariables(template.content, variables || {});
        processedSubject = template.subject ? this.processTemplateVariables(template.subject, variables || {}) : subject;
        
        // Update template usage
        await prisma.messageTemplate.update({
          where: { id: templateId },
          data: { 
            usageCount: { increment: 1 },
            lastUsedAt: new Date()
          }
        });
      }
      
      // Create messages for each recipient
      const messages = [];
      const communicationLogs = [];
      
      for (const recipientId of recipientIds) {
        // Verify recipient exists and belongs to tenant
        const recipient = await prisma.user.findFirst({
          where: { id: recipientId, tenantId }
        });
        
        if (!recipient) {
          console.warn(`Recipient ${recipientId} not found, skipping`);
          continue;
        }
        
        const messageData = {
          tenantId,
          senderId,
          recipientId,
          subject: processedSubject,
          content: processedContent,
          messageType,
          priority,
          status: scheduledAt ? 'SCHEDULED' : 'SENT',
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          sentAt: scheduledAt ? null : new Date()
        };
        
        const message = await prisma.message.create({
          data: messageData
        });
        
        messages.push(message);
        
        // Create communication log
        communicationLogs.push({
          tenantId,
          userId: senderId,
          communicationType: 'BULK_MESSAGE',
          messageId: message.id,
          templateId,
          recipientId,
          recipientType: 'INDIVIDUAL',
          channel: 'IN_APP',
          status: scheduledAt ? 'PENDING' : 'SENT'
        });
      }
      
      // Bulk create communication logs
      if (communicationLogs.length > 0) {
        await prisma.communicationLog.createMany({
          data: communicationLogs
        });
      }
      
      // Log audit
      await auditLogger.log({
        tenantId,
        userId: senderId,
        action: 'CREATE',
        resource: 'BulkMessage',
        resourceId: `bulk-${Date.now()}`,
        details: `Sent bulk message to ${messages.length} recipients`
      });
      
      return {
        success: true,
        messagesSent: messages.length,
        messages
      };
    } catch (error) {
      console.error('Error sending bulk message:', error);
      throw error;
    }
  }
  
  // Template Variable Processing
  processTemplateVariables(template, variables) {
    let processedTemplate = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processedTemplate = processedTemplate.replace(regex, value?.toString() || '');
    });
    
    return processedTemplate;
  }
  
  // Message Threading
  async createMessageThread(tenantId, senderId, recipientIds, subject, content) {
    try {
      const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const messages = [];
      
      for (const recipientId of recipientIds) {
        const message = await prisma.message.create({
          data: {
            tenantId,
            senderId,
            recipientId,
            subject,
            content,
            messageType: 'DIRECT',
            priority: 'NORMAL',
            status: 'SENT',
            sentAt: new Date(),
            threadId
          }
        });
        
        messages.push(message);
      }
      
      return { threadId, messages };
    } catch (error) {
      console.error('Error creating message thread:', error);
      throw error;
    }
  }
  
  async getMessageThread(tenantId, threadId, userId) {
    try {
      const messages = await prisma.message.findMany({
        where: {
          tenantId,
          threadId,
          OR: [
            { senderId: userId },
            { recipientId: userId }
          ]
        },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          recipient: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      });
      
      return messages;
    } catch (error) {
      console.error('Error fetching message thread:', error);
      throw error;
    }
  }
  
  // Read Receipts and Delivery Tracking
  async markMessageAsRead(tenantId, messageId, userId) {
    try {
      const message = await prisma.message.findFirst({
        where: {
          id: messageId,
          tenantId,
          recipientId: userId,
          isRead: false
        }
      });
      
      if (!message) {
        return { success: false, message: 'Message not found or already read' };
      }
      
      await prisma.message.update({
        where: { id: messageId },
        data: { 
          isRead: true, 
          readAt: new Date(),
          status: 'READ'
        }
      });
      
      // Update communication log
      await prisma.communicationLog.updateMany({
        where: {
          tenantId,
          messageId,
          recipientId: userId
        },
        data: {
          status: 'READ',
          readAt: new Date()
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }
  
  async getUnreadMessageCount(tenantId, userId) {
    try {
      const count = await prisma.message.count({
        where: {
          tenantId,
          recipientId: userId,
          isRead: false,
          status: { in: ['SENT', 'DELIVERED'] }
        }
      });
      
      return count;
    } catch (error) {
      console.error('Error getting unread message count:', error);
      throw error;
    }
  }
  
  // Communication Analytics
  async getCommunicationStats(tenantId, params = {}) {
    const { startDate, endDate, type } = params;
    
    try {
      const where = { tenantId };
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }
      
      if (type) where.communicationType = type;
      
      const [
        totalCommunications,
        messageStats,
        announcementStats,
        channelStats,
        statusStats
      ] = await Promise.all([
        prisma.communicationLog.count({ where }),
        prisma.communicationLog.groupBy({
          by: ['communicationType'],
          where,
          _count: { id: true }
        }),
        prisma.announcement.groupBy({
          by: ['category'],
          where: { 
            tenantId,
            ...(startDate || endDate ? {
              createdAt: {
                ...(startDate && { gte: new Date(startDate) }),
                ...(endDate && { lte: new Date(endDate) })
              }
            } : {})
          },
          _count: { id: true }
        }),
        prisma.communicationLog.groupBy({
          by: ['channel'],
          where,
          _count: { id: true }
        }),
        prisma.communicationLog.groupBy({
          by: ['status'],
          where,
          _count: { id: true }
        })
      ]);
      
      return {
        totalCommunications,
        messageStats,
        announcementStats,
        channelStats,
        statusStats
      };
    } catch (error) {
      console.error('Error getting communication stats:', error);
      throw error;
    }
  }
  
  // Scheduled Message Processing
  async processScheduledMessages() {
    try {
      const now = new Date();
      
      // Find messages scheduled to be sent now or in the past
      const scheduledMessages = await prisma.message.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledAt: { lte: now }
        },
        include: {
          sender: true,
          recipient: true
        }
      });
      
      for (const message of scheduledMessages) {
        try {
          await prisma.message.update({
            where: { id: message.id },
            data: {
              status: 'SENT',
              sentAt: now
            }
          });
          
          // Update communication log
          await prisma.communicationLog.updateMany({
            where: { messageId: message.id },
            data: { status: 'SENT' }
          });
          
          console.log(`Sent scheduled message ${message.id}`);
        } catch (error) {
          console.error(`Error sending scheduled message ${message.id}:`, error);
          
          // Mark as failed
          await prisma.message.update({
            where: { id: message.id },
            data: { status: 'FAILED' }
          });
          
          await prisma.communicationLog.updateMany({
            where: { messageId: message.id },
            data: { 
              status: 'FAILED',
              failureReason: error.message
            }
          });
        }
      }
      
      return { processedCount: scheduledMessages.length };
    } catch (error) {
      console.error('Error processing scheduled messages:', error);
      throw error;
    }
  }
}

module.exports = new CommunicationService();
