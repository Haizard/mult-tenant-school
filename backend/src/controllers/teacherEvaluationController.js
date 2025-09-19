const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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
        overallRating: parseFloat(overallRating),
        teachingSkills: teachingSkills ? parseFloat(teachingSkills) : null,
        classroomManagement: classroomManagement ? parseFloat(classroomManagement) : null,
        studentEngagement: studentEngagement ? parseFloat(studentEngagement) : null,
        professionalism: professionalism ? parseFloat(professionalism) : null,
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
        overallRating: updateData.overallRating ? parseFloat(updateData.overallRating) : undefined
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