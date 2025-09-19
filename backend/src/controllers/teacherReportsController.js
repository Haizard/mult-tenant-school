const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get teacher demographics report
const getTeacherDemographics = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const teachers = await prisma.teacher.findMany({
      where: { tenantId },
      include: {
        user: true,
        teacherSubjects: {
          include: { subject: true }
        }
      }
    });

    const demographics = {
      total: teachers.length,
      byGender: {
        male: teachers.filter(t => t.gender === 'MALE').length,
        female: teachers.filter(t => t.gender === 'FEMALE').length
      },
      byExperience: {
        '0-2': teachers.filter(t => t.experience <= 2).length,
        '3-5': teachers.filter(t => t.experience >= 3 && t.experience <= 5).length,
        '6-10': teachers.filter(t => t.experience >= 6 && t.experience <= 10).length,
        '10+': teachers.filter(t => t.experience > 10).length
      },
      byQualification: teachers.reduce((acc, t) => {
        const qual = t.qualification || 'Not Specified';
        acc[qual] = (acc[qual] || 0) + 1;
        return acc;
      }, {}),
      bySubject: teachers.reduce((acc, t) => {
        t.teacherSubjects.forEach(ts => {
          const subject = ts.subject.subjectName;
          acc[subject] = (acc[subject] || 0) + 1;
        });
        return acc;
      }, {})
    };

    res.json(demographics);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate demographics', error: error.message });
  }
};

// Get performance analytics
const getPerformanceAnalytics = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const evaluations = await prisma.teacherEvaluation.findMany({
      where: { tenantId },
      include: {
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      }
    });

    const analytics = {
      averageRating: evaluations.length > 0 
        ? evaluations.reduce((sum, e) => sum + e.overallRating, 0) / evaluations.length 
        : 0,
      ratingDistribution: {
        excellent: evaluations.filter(e => e.overallRating >= 4.5).length,
        good: evaluations.filter(e => e.overallRating >= 3.5 && e.overallRating < 4.5).length,
        average: evaluations.filter(e => e.overallRating >= 2.5 && e.overallRating < 3.5).length,
        poor: evaluations.filter(e => e.overallRating < 2.5).length
      },
      byTeacher: evaluations.reduce((acc, e) => {
        const teacherName = `${e.teacher.user.firstName} ${e.teacher.user.lastName}`;
        if (!acc[teacherName]) {
          acc[teacherName] = { ratings: [], average: 0 };
        }
        acc[teacherName].ratings.push(e.overallRating);
        acc[teacherName].average = acc[teacherName].ratings.reduce((sum, r) => sum + r, 0) / acc[teacherName].ratings.length;
        return acc;
      }, {})
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate analytics', error: error.message });
  }
};

// Get workload analysis
const getWorkloadAnalysis = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const teachers = await prisma.teacher.findMany({
      where: { tenantId },
      include: {
        user: {
          select: { firstName: true, lastName: true }
        },
        teacherSubjects: {
          include: { subject: true }
        },
        teacherClasses: {
          include: { class: true }
        }
      }
    });

    const workload = teachers.map(teacher => ({
      id: teacher.id,
      name: `${teacher.user.firstName} ${teacher.user.lastName}`,
      subjects: teacher.teacherSubjects.length,
      classes: teacher.teacherClasses.length,
      workloadScore: teacher.teacherSubjects.length + (teacher.teacherClasses.length * 2),
      subjectList: teacher.teacherSubjects.map(ts => ts.subject.subjectName),
      classList: teacher.teacherClasses.map(tc => tc.class.className)
    }));

    const analysis = {
      teachers: workload,
      averageSubjects: workload.reduce((sum, t) => sum + t.subjects, 0) / workload.length,
      averageClasses: workload.reduce((sum, t) => sum + t.classes, 0) / workload.length,
      overloaded: workload.filter(t => t.workloadScore > 8),
      underutilized: workload.filter(t => t.workloadScore < 3)
    };

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate workload analysis', error: error.message });
  }
};

module.exports = {
  getTeacherDemographics,
  getPerformanceAnalytics,
  getWorkloadAnalysis
};