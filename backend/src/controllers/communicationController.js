const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auditLogger = require('../utils/auditLogger');
const communicationService = require('../services/communicationService');

// Message Controllers

// Get messages for a user
const getMessages = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      status, 
      senderId, 
      recipientId,
      threadId,
      search 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      tenantId: req.tenantId,
      OR: [
        { senderId: req.user.id },
        { recipientId: req.user.id }
      ]
    };
    
    if (type) where.messageType = type;
    if (status) where.status = status;
    if (senderId) where.senderId = senderId;
    if (recipientId) where.recipientId = recipientId;
    if (threadId) where.threadId = threadId;
    if (search) {
      where.OR = [
        { subject: { contains: search } },
        { content: { contains: search } }
      ];
    }
    
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          recipient: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          replyTo: {
            select: { id: true, subject: true, content: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.message.count({ where })
    ]);
    
    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

// Get message by ID
const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await prisma.message.findFirst({
      where: {
        id,
        tenantId: req.tenantId,
        OR: [
          { senderId: req.user.id },
          { recipientId: req.user.id }
        ]
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        recipient: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        replyTo: {
          select: { id: true, subject: true, content: true }
        },
        replies: {
          include: {
            sender: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Mark as read if user is recipient and message is unread
    if (message.recipientId === req.user.id && !message.isRead) {
      await prisma.message.update({
        where: { id },
        data: { 
          isRead: true, 
          readAt: new Date() 
        }
      });
      
      // Log communication
      await prisma.communicationLog.create({
        data: {
          tenantId: req.tenantId,
          userId: req.user.id,
          communicationType: 'MESSAGE',
          messageId: id,
          recipientId: req.user.id,
          recipientType: 'INDIVIDUAL',
          channel: 'IN_APP',
          status: 'READ',
          readAt: new Date()
        }
      });
    }
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message',
      error: error.message
    });
  }
};

// Create new message
const createMessage = async (req, res) => {
  try {
    const {
      recipientId,
      subject,
      content,
      messageType = 'DIRECT',
      priority = 'NORMAL',
      scheduledAt,
      attachments,
      threadId,
      replyToId
    } = req.body;
    
    if (!recipientId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID and content are required'
      });
    }
    
    // Verify recipient exists and belongs to tenant
    const recipient = await prisma.user.findFirst({
      where: {
        id: recipientId,
        tenantId: req.tenantId
      }
    });
    
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }
    
    const messageData = {
      tenantId: req.tenantId,
      senderId: req.user.id,
      recipientId,
      subject,
      content,
      messageType,
      priority,
      status: scheduledAt ? 'SCHEDULED' : 'SENT',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      sentAt: scheduledAt ? null : new Date(),
      attachments: attachments || null,
      threadId,
      replyToId
    };
    
    const message = await prisma.message.create({
      data: messageData,
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        recipient: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });
    
    // Log communication
    await prisma.communicationLog.create({
      data: {
        tenantId: req.tenantId,
        userId: req.user.id,
        communicationType: 'MESSAGE',
        messageId: message.id,
        recipientId,
        recipientType: 'INDIVIDUAL',
        channel: 'IN_APP',
        status: scheduledAt ? 'PENDING' : 'SENT'
      }
    });
    
    // Log audit
    await auditLogger.log({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'CREATE',
      resource: 'Message',
      resourceId: message.id,
      details: `Created message to ${recipient.firstName} ${recipient.lastName}`
    });
    
    res.status(201).json({
      success: true,
      data: message,
      message: 'Message created successfully'
    });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create message',
      error: error.message
    });
  }
};

// Update message
const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, content, priority, scheduledAt } = req.body;
    
    const existingMessage = await prisma.message.findFirst({
      where: {
        id,
        tenantId: req.tenantId,
        senderId: req.user.id,
        status: { in: ['DRAFT', 'SCHEDULED'] }
      }
    });
    
    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or cannot be updated'
      });
    }
    
    const updateData = {};
    if (subject !== undefined) updateData.subject = subject;
    if (content !== undefined) updateData.content = content;
    if (priority !== undefined) updateData.priority = priority;
    if (scheduledAt !== undefined) {
      updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
      updateData.status = scheduledAt ? 'SCHEDULED' : 'SENT';
      updateData.sentAt = scheduledAt ? null : new Date();
    }
    
    const message = await prisma.message.update({
      where: { id },
      data: updateData,
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        recipient: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });
    
    // Log audit
    await auditLogger.log({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'UPDATE',
      resource: 'Message',
      resourceId: id,
      details: 'Updated message'
    });
    
    res.json({
      success: true,
      data: message,
      message: 'Message updated successfully'
    });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message',
      error: error.message
    });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await prisma.message.findFirst({
      where: {
        id,
        tenantId: req.tenantId,
        senderId: req.user.id
      }
    });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    await prisma.message.delete({
      where: { id }
    });
    
    // Log audit
    await auditLogger.log({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'DELETE',
      resource: 'Message',
      resourceId: id,
      details: 'Deleted message'
    });
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

// Announcement Controllers

// Get announcements
const getAnnouncements = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      status,
      targetAudience,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      tenantId: req.tenantId
    };

    if (category) where.category = category;
    if (status) where.status = status;
    if (targetAudience) where.targetAudience = targetAudience;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } }
      ];
    }

    // Filter based on user role and target audience
    if (!req.user.roles?.some(role => ['Tenant Admin', 'Super Admin'].includes(role.name))) {
      where.OR = [
        { targetAudience: 'ALL' },
        { targetAudience: req.user.student ? 'STUDENTS' : 'TEACHERS' },
        { targetAudience: req.user.parent ? 'PARENTS' : 'TEACHERS' }
      ];
      where.status = 'PUBLISHED';
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.announcement.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        announcements,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcements',
      error: error.message
    });
  }
};

// Get announcement by ID
const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await prisma.announcement.findFirst({
      where: {
        id,
        tenantId: req.tenantId
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Increment view count
    await prisma.announcement.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    // Log communication
    await prisma.communicationLog.create({
      data: {
        tenantId: req.tenantId,
        userId: req.user.id,
        communicationType: 'ANNOUNCEMENT',
        announcementId: id,
        recipientId: req.user.id,
        recipientType: 'INDIVIDUAL',
        channel: 'IN_APP',
        status: 'READ',
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcement',
      error: error.message
    });
  }
};

// Create announcement
const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      content,
      category = 'GENERAL',
      priority = 'MEDIUM',
      targetAudience = 'ALL',
      publishDate,
      expiryDate,
      attachments
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const announcementData = {
      tenantId: req.tenantId,
      authorId: req.user.id,
      title,
      content,
      category,
      priority,
      targetAudience,
      status: publishDate ? 'SCHEDULED' : 'PUBLISHED',
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      attachments: attachments || null
    };

    const announcement = await prisma.announcement.create({
      data: announcementData,
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    // Log communication
    await prisma.communicationLog.create({
      data: {
        tenantId: req.tenantId,
        userId: req.user.id,
        communicationType: 'ANNOUNCEMENT',
        announcementId: announcement.id,
        recipientType: targetAudience === 'ALL' ? 'ALL_STUDENTS' : targetAudience,
        channel: 'IN_APP',
        status: publishDate ? 'PENDING' : 'SENT'
      }
    });

    // Log audit
    await auditLogger.log({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'CREATE',
      resource: 'Announcement',
      resourceId: announcement.id,
      details: `Created announcement: ${title}`
    });

    res.status(201).json({
      success: true,
      data: announcement,
      message: 'Announcement created successfully'
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create announcement',
      error: error.message
    });
  }
};

// Update announcement
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, priority, targetAudience, publishDate, expiryDate, status } = req.body;

    const existingAnnouncement = await prisma.announcement.findFirst({
      where: {
        id,
        tenantId: req.tenantId,
        authorId: req.user.id
      }
    });

    if (!existingAnnouncement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (targetAudience !== undefined) updateData.targetAudience = targetAudience;
    if (publishDate !== undefined) updateData.publishDate = publishDate ? new Date(publishDate) : null;
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (status !== undefined) updateData.status = status;

    const announcement = await prisma.announcement.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    // Log audit
    await auditLogger.log({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'UPDATE',
      resource: 'Announcement',
      resourceId: id,
      details: `Updated announcement: ${announcement.title}`
    });

    res.json({
      success: true,
      data: announcement,
      message: 'Announcement updated successfully'
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update announcement',
      error: error.message
    });
  }
};

// Delete announcement
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await prisma.announcement.findFirst({
      where: {
        id,
        tenantId: req.tenantId,
        authorId: req.user.id
      }
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await prisma.announcement.delete({
      where: { id }
    });

    // Log audit
    await auditLogger.log({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'DELETE',
      resource: 'Announcement',
      resourceId: id,
      details: `Deleted announcement: ${announcement.title}`
    });

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete announcement',
      error: error.message
    });
  }
};

// Message Template Controllers

// Get message templates
const getMessageTemplates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      isActive,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      tenantId: req.tenantId
    };

    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { content: { contains: search } }
      ];
    }

    const [templates, total] = await Promise.all([
      prisma.messageTemplate.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.messageTemplate.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        templates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching message templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message templates',
      error: error.message
    });
  }
};

// Create message template
const createMessageTemplate = async (req, res) => {
  try {
    const {
      name,
      description,
      subject,
      content,
      category = 'GENERAL',
      variables
    } = req.body;

    if (!name || !content) {
      return res.status(400).json({
        success: false,
        message: 'Name and content are required'
      });
    }

    const template = await prisma.messageTemplate.create({
      data: {
        tenantId: req.tenantId,
        createdById: req.user.id,
        name,
        description,
        subject,
        content,
        category,
        variables: variables || null
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    // Log audit
    await auditLogger.log({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'CREATE',
      resource: 'MessageTemplate',
      resourceId: template.id,
      details: `Created message template: ${name}`
    });

    res.status(201).json({
      success: true,
      data: template,
      message: 'Message template created successfully'
    });
  } catch (error) {
    console.error('Error creating message template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create message template',
      error: error.message
    });
  }
};

// Update message template
const updateMessageTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, subject, content, category, variables, isActive } = req.body;

    const existingTemplate = await prisma.messageTemplate.findFirst({
      where: {
        id,
        tenantId: req.tenantId
      }
    });

    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Message template not found'
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (subject !== undefined) updateData.subject = subject;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (variables !== undefined) updateData.variables = variables;
    if (isActive !== undefined) updateData.isActive = isActive;

    const template = await prisma.messageTemplate.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    // Log audit
    await auditLogger.log({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'UPDATE',
      resource: 'MessageTemplate',
      resourceId: id,
      details: `Updated message template: ${template.name}`
    });

    res.json({
      success: true,
      data: template,
      message: 'Message template updated successfully'
    });
  } catch (error) {
    console.error('Error updating message template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message template',
      error: error.message
    });
  }
};

// Delete message template
const deleteMessageTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await prisma.messageTemplate.findFirst({
      where: {
        id,
        tenantId: req.tenantId
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Message template not found'
      });
    }

    await prisma.messageTemplate.delete({
      where: { id }
    });

    // Log audit
    await auditLogger.log({
      tenantId: req.tenantId,
      userId: req.user.id,
      action: 'DELETE',
      resource: 'MessageTemplate',
      resourceId: id,
      details: `Deleted message template: ${template.name}`
    });

    res.json({
      success: true,
      message: 'Message template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message template',
      error: error.message
    });
  }
};

// Communication Log Controllers

// Get communication logs
const getCommunicationLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      communicationType,
      status,
      channel,
      userId,
      startDate,
      endDate
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      tenantId: req.tenantId
    };

    if (communicationType) where.communicationType = communicationType;
    if (status) where.status = status;
    if (channel) where.channel = channel;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.communicationLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          recipient: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          message: {
            select: { id: true, subject: true, content: true }
          },
          announcement: {
            select: { id: true, title: true, content: true }
          },
          template: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.communicationLog.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching communication logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch communication logs',
      error: error.message
    });
  }
};

// Bulk Messaging
const sendBulkMessage = async (req, res) => {
  try {
    const { recipientIds, subject, content, messageType, priority, scheduledAt, templateId, variables } = req.body;

    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipient IDs array is required'
      });
    }

    if (!content && !templateId) {
      return res.status(400).json({
        success: false,
        message: 'Content or template ID is required'
      });
    }

    const result = await communicationService.sendBulkMessage(req.tenantId, req.user.id, {
      recipientIds,
      subject,
      content,
      messageType,
      priority,
      scheduledAt,
      templateId,
      variables
    });

    res.status(201).json({
      success: true,
      data: result,
      message: `Bulk message sent to ${result.messagesSent} recipients`
    });
  } catch (error) {
    console.error('Error sending bulk message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk message',
      error: error.message
    });
  }
};

// Message Threading
const getMessageThread = async (req, res) => {
  try {
    const { threadId } = req.params;

    const messages = await communicationService.getMessageThread(req.tenantId, threadId, req.user.id);

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching message thread:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message thread',
      error: error.message
    });
  }
};

// Reply to Message
const replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, attachments } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    // Get original message to determine thread and recipient
    const originalMessage = await prisma.message.findFirst({
      where: {
        id,
        tenantId: req.tenantId,
        OR: [
          { senderId: req.user.id },
          { recipientId: req.user.id }
        ]
      }
    });

    if (!originalMessage) {
      return res.status(404).json({
        success: false,
        message: 'Original message not found'
      });
    }

    // Determine recipient (sender of original message if current user is recipient, vice versa)
    const recipientId = originalMessage.senderId === req.user.id ? originalMessage.recipientId : originalMessage.senderId;

    const replyData = {
      tenantId: req.tenantId,
      senderId: req.user.id,
      recipientId,
      subject: originalMessage.subject ? `Re: ${originalMessage.subject}` : 'Re: Message',
      content,
      messageType: 'DIRECT',
      priority: 'NORMAL',
      status: 'SENT',
      sentAt: new Date(),
      attachments: attachments || null,
      threadId: originalMessage.threadId || originalMessage.id,
      replyToId: id
    };

    const reply = await prisma.message.create({
      data: replyData,
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        recipient: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    // Log communication
    await prisma.communicationLog.create({
      data: {
        tenantId: req.tenantId,
        userId: req.user.id,
        communicationType: 'MESSAGE',
        messageId: reply.id,
        recipientId,
        recipientType: 'INDIVIDUAL',
        channel: 'IN_APP',
        status: 'SENT'
      }
    });

    res.status(201).json({
      success: true,
      data: reply,
      message: 'Reply sent successfully'
    });
  } catch (error) {
    console.error('Error replying to message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply',
      error: error.message
    });
  }
};

// Mark Message as Read
const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await communicationService.markMessageAsRead(req.tenantId, id, req.user.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
};

// Get Unread Message Count
const getUnreadMessageCount = async (req, res) => {
  try {
    const count = await communicationService.getUnreadMessageCount(req.tenantId, req.user.id);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error getting unread message count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread message count',
      error: error.message
    });
  }
};

// Communication Stats
const getCommunicationStats = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    const stats = await communicationService.getCommunicationStats(req.tenantId, {
      startDate,
      endDate,
      type
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting communication stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get communication stats',
      error: error.message
    });
  }
};

module.exports = {
  getMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getMessageTemplates,
  createMessageTemplate,
  updateMessageTemplate,
  deleteMessageTemplate,
  getCommunicationLogs,
  sendBulkMessage,
  getMessageThread,
  replyToMessage,
  markMessageAsRead,
  getUnreadMessageCount,
  getCommunicationStats
};
