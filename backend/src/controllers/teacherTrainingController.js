const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get teacher trainings
const getTrainings = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { teacherId } = req.query;

    const where = { tenantId };
    if (teacherId) where.teacherId = teacherId;

    const trainings = await prisma.teacherTraining.findMany({
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
      orderBy: { startDate: 'desc' }
    });

    res.json(trainings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trainings', error: error.message });
  }
};

// Create training record
const createTraining = async (req, res) => {
  try {
    const {
      teacherId, title, description, trainingType, provider,
      startDate, endDate, certificateUrl, credits, cost
    } = req.body;
    const tenantId = req.tenantId;

    const training = await prisma.teacherTraining.create({
      data: {
        tenantId,
        teacherId,
        title,
        description,
        trainingType,
        provider,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        certificateUrl,
        credits: credits ? parseFloat(credits) : null,
        cost: cost ? parseFloat(cost) : null
      }
    });

    res.status(201).json(training);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create training', error: error.message });
  }
};

// Update training
const updateTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    if (updateData.credits) updateData.credits = parseFloat(updateData.credits);
    if (updateData.cost) updateData.cost = parseFloat(updateData.cost);

    const training = await prisma.teacherTraining.update({
      where: { id },
      data: updateData
    });

    res.json(training);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update training', error: error.message });
  }
};

module.exports = {
  getTrainings,
  createTraining,
  updateTraining
};