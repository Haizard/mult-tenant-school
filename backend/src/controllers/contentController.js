const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/content');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common educational file types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'video/mp4',
    'video/avi',
    'video/mov',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/zip'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Get all content with filtering and pagination
const getAllContent = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      content_type, 
      status, 
      grade_level, 
      subject_id, 
      search,
      created_by 
    } = req.query;
    
    const tenant_id = req.user.tenant_id;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const where = {
      tenant_id,
      ...(content_type && { content_type }),
      ...(status && { status }),
      ...(grade_level && { grade_level }),
      ...(subject_id && { subject_id }),
      ...(created_by && { created_by }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } }
        ]
      })
    };
    
    const [content, total] = await Promise.all([
      prisma.content.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          },
          subject: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          _count: {
            select: {
              assignments: true,
              usage: true,
              comments: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.content.count({ where })
    ]);
    
    res.json({
      success: true,
      data: {
        content,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total,
          total_pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content',
      error: error.message
    });
  }
};

// Get single content by ID
const getContentById = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant_id = req.user.tenant_id;
    
    const content = await prisma.content.findFirst({
      where: {
        id,
        tenant_id
      },
      include: {
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        assignments: {
          include: {
            assignedBy: {
              select: {
                id: true,
                first_name: true,
                last_name: true
              }
            }
          }
        },
        versions: {
          orderBy: {
            version_number: 'desc'
          },
          take: 5
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          }
        },
        _count: {
          select: {
            assignments: true,
            usage: true,
            comments: true
          }
        }
      }
    });
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    // Track content view
    await prisma.contentUsage.create({
      data: {
        id: uuidv4(),
        tenant_id,
        content_id: id,
        user_id: req.user.id,
        user_type: req.user.role,
        action_type: 'view',
        ip_address: req.ip,
        device_info: req.get('User-Agent') || 'Unknown'
      }
    });
    
    // Increment view count
    await prisma.content.update({
      where: { id },
      data: {
        views_count: {
          increment: 1
        }
      }
    });
    
    res.json({
      success: true,
      data: content
    });
    
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content',
      error: error.message
    });
  }
};

// Create new content
const createContent = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const created_by = req.user.id;
    
    const {
      title,
      description,
      content_type,
      category,
      tags,
      grade_level,
      subject_id,
      file_url
    } = req.body;
    
    // Handle file upload
    let file_path = null;
    let file_size = null;
    let mime_type = null;
    
    if (req.file) {
      file_path = req.file.filename;
      file_size = req.file.size;
      mime_type = req.file.mimetype;
    }
    
    const content = await prisma.content.create({
      data: {
        id: uuidv4(),
        tenant_id,
        title,
        description,
        content_type,
        file_path,
        file_url,
        file_size,
        mime_type,
        category,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        grade_level,
        subject_id,
        created_by,
        status: 'draft'
      },
      include: {
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });
    
    // Create initial version
    await prisma.contentVersion.create({
      data: {
        id: uuidv4(),
        tenant_id,
        content_id: content.id,
        version_number: 1,
        title,
        description,
        file_path,
        file_url,
        changes_description: 'Initial version',
        created_by
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: content
    });
    
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create content',
      error: error.message
    });
  }
};

// Update content
const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant_id = req.user.tenant_id;
    const updated_by = req.user.id;
    
    const existingContent = await prisma.content.findFirst({
      where: {
        id,
        tenant_id
      }
    });
    
    if (!existingContent) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    const {
      title,
      description,
      content_type,
      category,
      tags,
      grade_level,
      subject_id,
      file_url,
      status,
      changes_description
    } = req.body;
    
    // Handle file upload
    let file_path = existingContent.file_path;
    let file_size = existingContent.file_size;
    let mime_type = existingContent.mime_type;
    
    if (req.file) {
      file_path = req.file.filename;
      file_size = req.file.size;
      mime_type = req.file.mimetype;
      
      // Delete old file if it exists
      if (existingContent.file_path) {
        try {
          const oldFilePath = path.join(__dirname, '../../uploads/content', existingContent.file_path);
          await fs.unlink(oldFilePath);
        } catch (error) {
          console.warn('Could not delete old file:', error.message);
        }
      }
    }
    
    const content = await prisma.content.update({
      where: { id },
      data: {
        title: title || existingContent.title,
        description: description || existingContent.description,
        content_type: content_type || existingContent.content_type,
        file_path,
        file_url: file_url || existingContent.file_url,
        file_size,
        mime_type,
        category: category || existingContent.category,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : existingContent.tags,
        grade_level: grade_level || existingContent.grade_level,
        subject_id: subject_id || existingContent.subject_id,
        status: status || existingContent.status,
        updated_at: new Date()
      },
      include: {
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });
    
    // Create new version if content was significantly updated
    if (title || description || req.file || file_url) {
      const latestVersion = await prisma.contentVersion.findFirst({
        where: { content_id: id },
        orderBy: { version_number: 'desc' }
      });
      
      await prisma.contentVersion.create({
        data: {
          id: uuidv4(),
          tenant_id,
          content_id: id,
          version_number: (latestVersion?.version_number || 0) + 1,
          title: content.title,
          description: content.description,
          file_path: content.file_path,
          file_url: content.file_url,
          changes_description: changes_description || 'Content updated',
          created_by: updated_by
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Content updated successfully',
      data: content
    });
    
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update content',
      error: error.message
    });
  }
};

// Delete content
const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant_id = req.user.tenant_id;
    
    const content = await prisma.content.findFirst({
      where: {
        id,
        tenant_id
      }
    });
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    // Delete associated file
    if (content.file_path) {
      try {
        const filePath = path.join(__dirname, '../../uploads/content', content.file_path);
        await fs.unlink(filePath);
      } catch (error) {
        console.warn('Could not delete file:', error.message);
      }
    }
    
    // Delete content (cascade will handle related records)
    await prisma.content.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete content',
      error: error.message
    });
  }
};

// Assign content to students/classes
const assignContent = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant_id = req.user.tenant_id;
    const assigned_by = req.user.id;
    
    const {
      assignment_type, // 'student', 'class', 'grade'
      target_ids, // array of student_ids, class_ids, or grade_levels
      due_date,
      instructions,
      is_mandatory = false
    } = req.body;
    
    // Verify content exists
    const content = await prisma.content.findFirst({
      where: {
        id,
        tenant_id
      }
    });
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    // Create assignments
    const assignments = [];
    for (const target_id of target_ids) {
      const assignment = await prisma.contentAssignment.create({
        data: {
          id: uuidv4(),
          tenant_id,
          content_id: id,
          assigned_by,
          assignment_type,
          target_id,
          due_date: due_date ? new Date(due_date) : null,
          instructions,
          is_mandatory
        }
      });
      assignments.push(assignment);
    }
    
    res.json({
      success: true,
      message: `Content assigned to ${assignments.length} ${assignment_type}(s)`,
      data: assignments
    });
    
  } catch (error) {
    console.error('Error assigning content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign content',
      error: error.message
    });
  }
};

// Get content assignments
const getContentAssignments = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant_id = req.user.tenant_id;
    
    const assignments = await prisma.contentAssignment.findMany({
      where: {
        content_id: id,
        tenant_id
      },
      include: {
        assignedBy: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      },
      orderBy: {
        assigned_at: 'desc'
      }
    });
    
    res.json({
      success: true,
      data: assignments
    });
    
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
};

// Get content analytics
const getContentAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant_id = req.user.tenant_id;
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }
    
    const [
      totalUsage,
      viewsOverTime,
      userEngagement,
      deviceStats
    ] = await Promise.all([
      // Total usage statistics
      prisma.contentUsage.groupBy({
        by: ['action_type'],
        where: {
          content_id: id,
          tenant_id,
          accessed_at: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          id: true
        }
      }),
      
      // Views over time (daily)
      prisma.contentUsage.groupBy({
        by: ['accessed_at'],
        where: {
          content_id: id,
          tenant_id,
          action_type: 'view',
          accessed_at: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          id: true
        }
      }),
      
      // User engagement (unique users)
      prisma.contentUsage.groupBy({
        by: ['user_id', 'user_type'],
        where: {
          content_id: id,
          tenant_id,
          accessed_at: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          id: true
        }
      }),
      
      // Device statistics
      prisma.contentUsage.groupBy({
        by: ['device_info'],
        where: {
          content_id: id,
          tenant_id,
          accessed_at: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          id: true
        },
        take: 10
      })
    ]);
    
    res.json({
      success: true,
      data: {
        period,
        date_range: {
          start: startDate,
          end: endDate
        },
        total_usage: totalUsage,
        views_over_time: viewsOverTime,
        user_engagement: userEngagement,
        device_stats: deviceStats
      }
    });
    
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

// Export content usage report
const exportContentReport = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const { 
      format = 'csv',
      content_ids,
      start_date,
      end_date,
      include_analytics = false
    } = req.query;
    
    // Build where clause
    const where = {
      tenant_id,
      ...(content_ids && { id: { in: content_ids.split(',') } }),
      ...(start_date && end_date && {
        created_at: {
          gte: new Date(start_date),
          lte: new Date(end_date)
        }
      })
    };
    
    const contentData = await prisma.content.findMany({
      where,
      include: {
        creator: {
          select: {
            first_name: true,
            last_name: true,
            email: true
          }
        },
        subject: {
          select: {
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            assignments: true,
            usage: true,
            comments: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    if (format === 'csv') {
      const csvHeaders = [
        'Content ID',
        'Title',
        'Type',
        'Status',
        'Creator',
        'Subject',
        'Grade Level',
        'Views',
        'Downloads',
        'Assignments',
        'Comments',
        'Created Date'
      ].join(',');
      
      const csvRows = contentData.map(content => [
        content.id,
        `"${content.title}"`,
        content.content_type,
        content.status,
        `"${content.creator?.first_name} ${content.creator?.last_name}"`,
        `"${content.subject?.name || 'N/A'}"`,
        content.grade_level || 'N/A',
        content.views_count,
        content.downloads_count,
        content._count.assignments,
        content._count.comments,
        content.created_at.toISOString().split('T')[0]
      ].join(','));
      
      const csvContent = [csvHeaders, ...csvRows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=content-report-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);
    } else {
      res.json({
        success: true,
        data: {
          content: contentData,
          summary: {
            total_content: contentData.length,
            by_type: contentData.reduce((acc, item) => {
              acc[item.content_type] = (acc[item.content_type] || 0) + 1;
              return acc;
            }, {}),
            by_status: contentData.reduce((acc, item) => {
              acc[item.status] = (acc[item.status] || 0) + 1;
              return acc;
            }, {})
          }
        }
      });
    }
    
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  assignContent,
  getContentAssignments,
  getContentAnalytics,
  exportContentReport
};
