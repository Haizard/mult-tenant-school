const { PrismaClient } = require('@prisma/client');

// Singleton pattern to prevent multiple instances
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

function validateRating(value, fieldName, required = false) {
  if (value === null || value === undefined) {
    return required ? (() => { throw new Error(`${fieldName} is required`); })() : null;
  }
  const parsed = parseFloat(value);
  if (isNaN(parsed) || parsed < 0 || parsed > 5) {
    throw new Error(`${fieldName} must be a number between 0 and 5`);
  }
  return parsed;
}

// Get teacher evaluations
const getEvaluations = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { teacherId } = req.query;

    const where = { tenantId };
    if (teacherId) where.teacherId = teacherId;

    const evaluations = await prisma.teacherEvaluation.findMany({
      where,
      include: {
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch evaluations', error: error.message });
  }
};

// Create evaluation
const createEvaluation = async (req, res) => {
  try {
    const {
      teacherId, evaluatorId, evaluationType, period, overallRating,
      teachingSkills, classroomManagement, studentEngagement,
      professionalism, comments, recommendations
    } = req.body;
    const tenantId = req.tenantId;

    const evaluation = await prisma.teacherEvaluation.create({
      data: {
        tenantId,
        teacherId,
        evaluatorId,
        evaluationType,
        period,
        overallRating: validateRating(overallRating, 'overallRating', true),
        teachingSkills: validateRating(teachingSkills, 'teachingSkills'),
        classroomManagement: validateRating(classroomManagement, 'classroomManagement'),
        studentEngagement: validateRating(studentEngagement, 'studentEngagement'),
        professionalism: validateRating(professionalism, 'professionalism'),
        comments,
        recommendations
      }
    });

    res.status(201).json(evaluation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create evaluation', error: error.message });
  }
};

// Update evaluation
const updateEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ...updateData } = req.body;

    const evaluation = await prisma.teacherEvaluation.update({
      where: { id },
      data: {
        ...updateData,
        status,
        overallRating: updateData.overallRating ? validateRating(updateData.overallRating, 'overallRating') : undefined
      }
    });

    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update evaluation', error: error.message });
  }
};

module.exports = {
  getEvaluations,
  createEvaluation,
  updateEvaluation
};