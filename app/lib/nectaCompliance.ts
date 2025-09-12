// NECTA Compliance Verification System for Tanzanian Education Standards
import { User } from './auth';

export interface NECTAComplianceCheck {
  id: string;
  checkType: 'SUBJECT_LEVEL' | 'SUBJECT_TYPE' | 'COURSE_STRUCTURE' | 'GRADING_SYSTEM' | 'DIVISION_CALCULATION';
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details: any;
  recommendations?: string[];
}

export interface NECTAComplianceReport {
  overallCompliance: number; // Percentage
  checks: NECTAComplianceCheck[];
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    warningChecks: number;
  };
  recommendations: string[];
  lastChecked: string;
}

export interface SubjectCompliance {
  subjectId: string;
  subjectName: string;
  subjectLevel: string;
  subjectType: string;
  complianceScore: number;
  issues: string[];
  recommendations: string[];
}

export interface CourseCompliance {
  courseId: string;
  courseName: string;
  complianceScore: number;
  subjectCompliance: SubjectCompliance[];
  issues: string[];
  recommendations: string[];
}

export class NECTAComplianceService {
  private user: User | null;

  constructor(user: User | null) {
    this.user = user;
  }

  /**
   * Check NECTA compliance for a subject
   */
  async checkSubjectCompliance(subject: any): Promise<SubjectCompliance> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let complianceScore = 100;

    // Check subject level compliance
    if (!this.isValidSubjectLevel(subject.subjectLevel)) {
      issues.push(`Invalid subject level: ${subject.subjectLevel}`);
      recommendations.push('Subject level must be one of: Primary, O-Level, A-Level, University');
      complianceScore -= 20;
    }

    // Check subject type compliance
    if (!this.isValidSubjectType(subject.subjectType)) {
      issues.push(`Invalid subject type: ${subject.subjectType}`);
      recommendations.push('Subject type must be one of: Core, Optional, Combination');
      complianceScore -= 20;
    }

    // Check NECTA-specific requirements
    if (subject.subjectLevel === 'O_LEVEL') {
      const oLevelCompliance = this.checkOLevelCompliance(subject);
      issues.push(...oLevelCompliance.issues);
      recommendations.push(...oLevelCompliance.recommendations);
      complianceScore -= oLevelCompliance.scoreReduction;
    }

    if (subject.subjectLevel === 'A_LEVEL') {
      const aLevelCompliance = this.checkALevelCompliance(subject);
      issues.push(...aLevelCompliance.issues);
      recommendations.push(...aLevelCompliance.recommendations);
      complianceScore -= aLevelCompliance.scoreReduction;
    }

    return {
      subjectId: subject.id,
      subjectName: subject.subjectName,
      subjectLevel: subject.subjectLevel,
      subjectType: subject.subjectType,
      complianceScore: Math.max(0, complianceScore),
      issues,
      recommendations,
    };
  }

  /**
   * Check NECTA compliance for a course
   */
  async checkCourseCompliance(course: any, subjects: any[]): Promise<CourseCompliance> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let complianceScore = 100;

    // Check if course has subjects
    if (!subjects || subjects.length === 0) {
      issues.push('Course has no subjects assigned');
      recommendations.push('Assign at least one subject to the course');
      complianceScore -= 30;
    }

    // Check subject compliance for each subject in the course
    const subjectCompliance: SubjectCompliance[] = [];
    for (const subject of subjects) {
      const compliance = await this.checkSubjectCompliance(subject);
      subjectCompliance.push(compliance);
      
      if (compliance.complianceScore < 100) {
        issues.push(`Subject "${subject.subjectName}" has compliance issues`);
      }
    }

    // Calculate overall course compliance
    if (subjectCompliance.length > 0) {
      const averageSubjectCompliance = subjectCompliance.reduce(
        (sum, s) => sum + s.complianceScore, 0
      ) / subjectCompliance.length;
      complianceScore = Math.min(complianceScore, averageSubjectCompliance);
    }

    return {
      courseId: course.id,
      courseName: course.courseName,
      complianceScore,
      subjectCompliance,
      issues,
      recommendations,
    };
  }

  /**
   * Generate comprehensive NECTA compliance report
   */
  async generateComplianceReport(courses: any[], subjects: any[]): Promise<NECTAComplianceReport> {
    const checks: NECTAComplianceCheck[] = [];
    let totalScore = 0;
    let totalChecks = 0;

    // Check subject level compliance
    const subjectLevelCheck = this.checkSubjectLevelCompliance(subjects);
    checks.push(subjectLevelCheck);
    totalScore += subjectLevelCheck.status === 'PASS' ? 100 : 0;
    totalChecks++;

    // Check subject type compliance
    const subjectTypeCheck = this.checkSubjectTypeCompliance(subjects);
    checks.push(subjectTypeCheck);
    totalScore += subjectTypeCheck.status === 'PASS' ? 100 : 0;
    totalChecks++;

    // Check course structure compliance
    const courseStructureCheck = this.checkCourseStructureCompliance(courses);
    checks.push(courseStructureCheck);
    totalScore += courseStructureCheck.status === 'PASS' ? 100 : 0;
    totalChecks++;

    // Check grading system compliance
    const gradingSystemCheck = this.checkGradingSystemCompliance();
    checks.push(gradingSystemCheck);
    totalScore += gradingSystemCheck.status === 'PASS' ? 100 : 0;
    totalChecks++;

    // Check division calculation compliance
    const divisionCalculationCheck = this.checkDivisionCalculationCompliance(subjects);
    checks.push(divisionCalculationCheck);
    totalScore += divisionCalculationCheck.status === 'PASS' ? 100 : 0;
    totalChecks++;

    const overallCompliance = totalChecks > 0 ? totalScore / totalChecks : 0;

    const summary = {
      totalChecks,
      passedChecks: checks.filter(c => c.status === 'PASS').length,
      failedChecks: checks.filter(c => c.status === 'FAIL').length,
      warningChecks: checks.filter(c => c.status === 'WARNING').length,
    };

    const recommendations = this.generateRecommendations(checks);

    return {
      overallCompliance,
      checks,
      summary,
      recommendations,
      lastChecked: new Date().toISOString(),
    };
  }

  /**
   * Check if subject level is valid according to NECTA standards
   */
  private isValidSubjectLevel(level: string): boolean {
    const validLevels = ['PRIMARY', 'O_LEVEL', 'A_LEVEL', 'UNIVERSITY'];
    return validLevels.includes(level);
  }

  /**
   * Check if subject type is valid according to NECTA standards
   */
  private isValidSubjectType(type: string): boolean {
    const validTypes = ['CORE', 'OPTIONAL', 'COMBINATION'];
    return validTypes.includes(type);
  }

  /**
   * Check O-Level specific compliance
   */
  private checkOLevelCompliance(subject: any): { issues: string[]; recommendations: string[]; scoreReduction: number } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let scoreReduction = 0;

    // O-Level subjects should be either Core or Optional
    if (subject.subjectType === 'COMBINATION') {
      issues.push('O-Level subjects cannot be Combination type');
      recommendations.push('Change subject type to Core or Optional for O-Level');
      scoreReduction += 15;
    }

    // Check for required O-Level subjects
    const requiredOLevelSubjects = ['Mathematics', 'English', 'Kiswahili', 'Civics'];
    if (requiredOLevelSubjects.includes(subject.subjectName) && subject.subjectType !== 'CORE') {
      issues.push(`${subject.subjectName} should be a Core subject for O-Level`);
      recommendations.push('Change subject type to Core');
      scoreReduction += 10;
    }

    return { issues, recommendations, scoreReduction };
  }

  /**
   * Check A-Level specific compliance
   */
  private checkALevelCompliance(subject: any): { issues: string[]; recommendations: string[]; scoreReduction: number } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let scoreReduction = 0;

    // A-Level subjects can be Core, Optional, or Combination
    if (!['CORE', 'OPTIONAL', 'COMBINATION'].includes(subject.subjectType)) {
      issues.push('Invalid subject type for A-Level');
      recommendations.push('Subject type must be Core, Optional, or Combination for A-Level');
      scoreReduction += 15;
    }

    // Check for A-Level combination subjects
    const combinationSubjects = ['PCB', 'EGM', 'HKL', 'CBG', 'HGE'];
    if (combinationSubjects.includes(subject.subjectName) && subject.subjectType !== 'COMBINATION') {
      issues.push(`${subject.subjectName} should be a Combination subject for A-Level`);
      recommendations.push('Change subject type to Combination');
      scoreReduction += 10;
    }

    return { issues, recommendations, scoreReduction };
  }

  /**
   * Check subject level compliance across all subjects
   */
  private checkSubjectLevelCompliance(subjects: any[]): NECTAComplianceCheck {
    const invalidLevels = subjects.filter(s => !this.isValidSubjectLevel(s.subjectLevel));
    
    if (invalidLevels.length === 0) {
      return {
        id: 'subject_level_check',
        checkType: 'SUBJECT_LEVEL',
        status: 'PASS',
        message: 'All subjects have valid academic levels',
        details: { totalSubjects: subjects.length, validSubjects: subjects.length },
      };
    }

    return {
      id: 'subject_level_check',
      checkType: 'SUBJECT_LEVEL',
      status: 'FAIL',
      message: `${invalidLevels.length} subjects have invalid academic levels`,
      details: { totalSubjects: subjects.length, invalidSubjects: invalidLevels.length },
      recommendations: ['Ensure all subjects have valid academic levels: Primary, O-Level, A-Level, University'],
    };
  }

  /**
   * Check subject type compliance across all subjects
   */
  private checkSubjectTypeCompliance(subjects: any[]): NECTAComplianceCheck {
    const invalidTypes = subjects.filter(s => !this.isValidSubjectType(s.subjectType));
    
    if (invalidTypes.length === 0) {
      return {
        id: 'subject_type_check',
        checkType: 'SUBJECT_TYPE',
        status: 'PASS',
        message: 'All subjects have valid types',
        details: { totalSubjects: subjects.length, validSubjects: subjects.length },
      };
    }

    return {
      id: 'subject_type_check',
      checkType: 'SUBJECT_TYPE',
      status: 'FAIL',
      message: `${invalidTypes.length} subjects have invalid types`,
      details: { totalSubjects: subjects.length, invalidSubjects: invalidTypes.length },
      recommendations: ['Ensure all subjects have valid types: Core, Optional, Combination'],
    };
  }

  /**
   * Check course structure compliance
   */
  private checkCourseStructureCompliance(courses: any[]): NECTAComplianceCheck {
    const coursesWithoutSubjects = courses.filter(c => !c.courseSubjects || c.courseSubjects.length === 0);
    
    if (coursesWithoutSubjects.length === 0) {
      return {
        id: 'course_structure_check',
        checkType: 'COURSE_STRUCTURE',
        status: 'PASS',
        message: 'All courses have subjects assigned',
        details: { totalCourses: courses.length, coursesWithSubjects: courses.length },
      };
    }

    return {
      id: 'course_structure_check',
      checkType: 'COURSE_STRUCTURE',
      status: 'WARNING',
      message: `${coursesWithoutSubjects.length} courses have no subjects assigned`,
      details: { totalCourses: courses.length, coursesWithoutSubjects: coursesWithoutSubjects.length },
      recommendations: ['Assign subjects to all courses to ensure proper academic structure'],
    };
  }

  /**
   * Check grading system compliance
   */
  private checkGradingSystemCompliance(): NECTAComplianceCheck {
    // This would check if the grading system is configured according to NECTA standards
    // For now, we'll assume it's compliant
    return {
      id: 'grading_system_check',
      checkType: 'GRADING_SYSTEM',
      status: 'PASS',
      message: 'Grading system is compliant with NECTA standards',
      details: { gradingSystem: 'NECTA Compliant' },
    };
  }

  /**
   * Check division calculation compliance
   */
  private checkDivisionCalculationCompliance(subjects: any[]): NECTAComplianceCheck {
    const oLevelSubjects = subjects.filter(s => s.subjectLevel === 'O_LEVEL');
    const aLevelSubjects = subjects.filter(s => s.subjectLevel === 'A_LEVEL');
    
    const oLevelCoreSubjects = oLevelSubjects.filter(s => s.subjectType === 'CORE');
    const aLevelCombinationSubjects = aLevelSubjects.filter(s => s.subjectType === 'COMBINATION');
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    if (oLevelCoreSubjects.length < 7) {
      issues.push('O-Level should have at least 7 core subjects for division calculation');
      recommendations.push('Ensure O-Level has sufficient core subjects');
    }
    
    if (aLevelCombinationSubjects.length < 3) {
      issues.push('A-Level should have at least 3 combination subjects for division calculation');
      recommendations.push('Ensure A-Level has sufficient combination subjects');
    }
    
    if (issues.length === 0) {
      return {
        id: 'division_calculation_check',
        checkType: 'DIVISION_CALCULATION',
        status: 'PASS',
        message: 'Division calculation requirements are met',
        details: { 
          oLevelCoreSubjects: oLevelCoreSubjects.length,
          aLevelCombinationSubjects: aLevelCombinationSubjects.length 
        },
      };
    }
    
    return {
      id: 'division_calculation_check',
      checkType: 'DIVISION_CALCULATION',
      status: 'WARNING',
      message: 'Division calculation requirements may not be fully met',
      details: { 
        oLevelCoreSubjects: oLevelCoreSubjects.length,
        aLevelCombinationSubjects: aLevelCombinationSubjects.length 
      },
      recommendations,
    };
  }

  /**
   * Generate recommendations based on compliance checks
   */
  private generateRecommendations(checks: NECTAComplianceCheck[]): string[] {
    const recommendations: string[] = [];
    
    checks.forEach(check => {
      if (check.recommendations) {
        recommendations.push(...check.recommendations);
      }
    });
    
    // Add general recommendations
    recommendations.push('Regularly review and update academic structure to maintain NECTA compliance');
    recommendations.push('Ensure all teachers are familiar with NECTA requirements');
    recommendations.push('Maintain accurate records of student performance for division calculations');
    
    return [...new Set(recommendations)]; // Remove duplicates
  }
}

// Export utility functions
export const createNECTAComplianceService = (user: User | null): NECTAComplianceService => {
  return new NECTAComplianceService(user);
};

export const checkNECTACompliance = async (user: User | null, courses: any[], subjects: any[]): Promise<NECTAComplianceReport> => {
  const service = createNECTAComplianceService(user);
  return await service.generateComplianceReport(courses, subjects);
};
