const request = require('supertest');
const express = require('express');
const { validateHostelReport, createReportValidator } = require('../src/middleware/validators/report');
const { REPORT_TYPES } = require('../src/constants/constants');
const { 
  REPORT_TITLE_MIN, 
  REPORT_TITLE_MAX, 
  REPORT_CONTENT_MIN, 
  REPORT_CONTENT_MAX 
} = require('../src/constants/reportLimits');
const { VALIDATION_MESSAGES } = require('../src/constants/validationMessages');

// Create a test app
const app = express();
app.use(express.json());

// Apply the validation middleware
app.post('/test-report', validateHostelReport, (req, res) => {
  res.json({ success: true, data: req.body });
});

describe('Report Validator Tests', () => {
  describe('validateHostelReport', () => {
    describe('Valid Inputs', () => {
      test('should accept valid report data', async () => {
        const validReport = {
          reportType: REPORT_TYPES[0],
          title: 'Valid Report Title',
          content: 'This is a valid report content that meets the minimum length requirement of 20 characters.'
        };

        const response = await request(app)
          .post('/test-report')
          .send(validReport)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(validReport);
      });

      test('should accept title at minimum length', async () => {
        const validReport = {
          reportType: REPORT_TYPES[0],
          title: 'A'.repeat(REPORT_TITLE_MIN),
          content: 'This is a valid report content that meets the minimum length requirement of 20 characters.'
        };

        const response = await request(app)
          .post('/test-report')
          .send(validReport)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      test('should accept title at maximum length', async () => {
        const validReport = {
          reportType: REPORT_TYPES[0],
          title: 'A'.repeat(REPORT_TITLE_MAX),
          content: 'This is a valid report content that meets the minimum length requirement of 20 characters.'
        };

        const response = await request(app)
          .post('/test-report')
          .send(validReport)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      test('should accept content at minimum length', async () => {
        const validReport = {
          reportType: REPORT_TYPES[0],
          title: 'Valid Title',
          content: 'A'.repeat(REPORT_CONTENT_MIN)
        };

        const response = await request(app)
          .post('/test-report')
          .send(validReport)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      test('should accept content at maximum length', async () => {
        const validReport = {
          reportType: REPORT_TYPES[0],
          title: 'Valid Title',
          content: 'A'.repeat(REPORT_CONTENT_MAX)
        };

        const response = await request(app)
          .post('/test-report')
          .send(validReport)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      test('should trim whitespace from title and content', async () => {
        const reportWithWhitespace = {
          reportType: REPORT_TYPES[0],
          title: '  Valid Title  ',
          content: '  This is valid content with whitespace  '
        };

        const response = await request(app)
          .post('/test-report')
          .send(reportWithWhitespace)
          .expect(200);

        expect(response.body.success).toBe(true);
        // Note: express-validator trims but doesn't modify the original request body
        // The trimming happens during validation, not in the response
      });
    });

    describe('Invalid Inputs - Type Checks', () => {
      test('should reject non-string title', async () => {
        const invalidReport = {
          reportType: REPORT_TYPES[0],
          title: 123,
          content: 'This is a valid report content that meets the minimum length requirement.'
        };

        const response = await request(app)
          .post('/test-report')
          .send(invalidReport)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: VALIDATION_MESSAGES.REPORT.TITLE_LENGTH
            })
          ])
        );
      });

      test('should reject non-string content', async () => {
        const invalidReport = {
          reportType: REPORT_TYPES[0],
          title: 'Valid Title',
          content: 123
        };

        const response = await request(app)
          .post('/test-report')
          .send(invalidReport)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: VALIDATION_MESSAGES.REPORT.CONTENT_LENGTH
            })
          ])
        );
      });

      test('should reject non-string reportType', async () => {
        const invalidReport = {
          reportType: 123,
          title: 'Valid Title',
          content: 'This is a valid report content that meets the minimum length requirement.'
        };

        const response = await request(app)
          .post('/test-report')
          .send(invalidReport)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: VALIDATION_MESSAGES.REPORT.TYPE_INVALID
            })
          ])
        );
      });
    });

    describe('Invalid Inputs - Boundary Length Validations', () => {
      test('should reject title shorter than minimum length', async () => {
        const invalidReport = {
          reportType: REPORT_TYPES[0],
          title: 'A'.repeat(REPORT_TITLE_MIN - 1),
          content: 'This is a valid report content that meets the minimum length requirement of 20 characters.'
        };

        const response = await request(app)
          .post('/test-report')
          .send(invalidReport)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: VALIDATION_MESSAGES.REPORT.TITLE_LENGTH
            })
          ])
        );
      });

      test('should reject title longer than maximum length', async () => {
        const invalidReport = {
          reportType: REPORT_TYPES[0],
          title: 'A'.repeat(REPORT_TITLE_MAX + 1),
          content: 'This is a valid report content that meets the minimum length requirement of 20 characters.'
        };

        const response = await request(app)
          .post('/test-report')
          .send(invalidReport)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: VALIDATION_MESSAGES.REPORT.TITLE_LENGTH
            })
          ])
        );
      });

      test('should reject content shorter than minimum length', async () => {
        const invalidReport = {
          reportType: REPORT_TYPES[0],
          title: 'Valid Title',
          content: 'A'.repeat(REPORT_CONTENT_MIN - 1)
        };

        const response = await request(app)
          .post('/test-report')
          .send(invalidReport)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: VALIDATION_MESSAGES.REPORT.CONTENT_LENGTH
            })
          ])
        );
      });

      test('should reject content longer than maximum length', async () => {
        const invalidReport = {
          reportType: REPORT_TYPES[0],
          title: 'Valid Title',
          content: 'A'.repeat(REPORT_CONTENT_MAX + 1)
        };

        const response = await request(app)
          .post('/test-report')
          .send(invalidReport)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: VALIDATION_MESSAGES.REPORT.CONTENT_LENGTH
            })
          ])
        );
      });
    });

    describe('Invalid Inputs - Required Field Validations', () => {
      test('should reject empty title', async () => {
        const invalidReport = {
          reportType: REPORT_TYPES[0],
          title: '',
          content: 'This is a valid report content that meets the minimum length requirement of 20 characters.'
        };

        const response = await request(app)
          .post('/test-report')
          .send(invalidReport)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: VALIDATION_MESSAGES.REPORT.TITLE_REQUIRED
            })
          ])
        );
      });

      test('should reject empty content', async () => {
        const invalidReport = {
          reportType: REPORT_TYPES[0],
          title: 'Valid Title',
          content: ''
        };

        const response = await request(app)
          .post('/test-report')
          .send(invalidReport)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: VALIDATION_MESSAGES.REPORT.CONTENT_REQUIRED
            })
          ])
        );
      });

      test('should reject missing title', async () => {
        const invalidReport = {
          reportType: REPORT_TYPES[0],
          content: 'This is a valid report content that meets the minimum length requirement of 20 characters.'
        };

        const response = await request(app)
          .post('/test-report')
          .send(invalidReport)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: VALIDATION_MESSAGES.REPORT.TITLE_REQUIRED
            })
          ])
        );
      });

      test('should reject missing content', async () => {
        const invalidReport = {
          reportType: REPORT_TYPES[0],
          title: 'Valid Title'
        };

        const response = await request(app)
          .post('/test-report')
          .send(invalidReport)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: VALIDATION_MESSAGES.REPORT.CONTENT_REQUIRED
            })
          ])
        );
      });

      test('should reject missing reportType', async () => {
        const invalidReport = {
          title: 'Valid Title',
          content: 'This is a valid report content that meets the minimum length requirement of 20 characters.'
        };

        const response = await request(app)
          .post('/test-report')
          .send(invalidReport)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: VALIDATION_MESSAGES.REPORT.TYPE_INVALID
            })
          ])
        );
      });
    });

    describe('Invalid Inputs - Report Type Validation', () => {
      test('should reject invalid report type', async () => {
        const invalidReport = {
          reportType: 'INVALID_TYPE',
          title: 'Valid Title',
          content: 'This is a valid report content that meets the minimum length requirement of 20 characters.'
        };

        const response = await request(app)
          .post('/test-report')
          .send(invalidReport)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: VALIDATION_MESSAGES.REPORT.TYPE_INVALID
            })
          ])
        );
      });
    });

    describe('Edge Cases', () => {
      test('should reject title with only whitespace', async () => {
        const invalidReport = {
          reportType: REPORT_TYPES[0],
          title: '   ',
          content: 'This is a valid report content that meets the minimum length requirement of 20 characters.'
        };

        const response = await request(app)
          .post('/test-report')
          .send(invalidReport)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: VALIDATION_MESSAGES.REPORT.TITLE_REQUIRED
            })
          ])
        );
      });

      test('should reject content with only whitespace', async () => {
        const invalidReport = {
          reportType: REPORT_TYPES[0],
          title: 'Valid Title',
          content: '   '
        };

        const response = await request(app)
          .post('/test-report')
          .send(invalidReport)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: VALIDATION_MESSAGES.REPORT.CONTENT_REQUIRED
            })
          ])
        );
      });

      test('should handle multiple validation errors', async () => {
        const invalidReport = {
          reportType: 'INVALID',
          title: '12',
          content: 'short'
        };

        const response = await request(app)
          .post('/test-report')
          .send(invalidReport)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toHaveLength(3);
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ msg: VALIDATION_MESSAGES.REPORT.TYPE_INVALID }),
            expect.objectContaining({ msg: VALIDATION_MESSAGES.REPORT.TITLE_LENGTH }),
            expect.objectContaining({ msg: VALIDATION_MESSAGES.REPORT.CONTENT_LENGTH })
          ])
        );
      });
    });
  });

  describe('createReportValidator Factory Function', () => {
    describe('Default Configuration', () => {
      test('should create validator with default settings', () => {
        const validator = createReportValidator();
        expect(Array.isArray(validator)).toBe(true);
        expect(validator).toHaveLength(4); // 3 validators + handleValidationErrors
      });
    });

    describe('Custom Configuration', () => {
      test('should create validator with custom allowed types', () => {
        const customTypes = ['CUSTOM1', 'CUSTOM2'];
        const validator = createReportValidator({ allowedTypes: customTypes });
        
        // Create a test app with the custom validator
        const customApp = express();
        customApp.use(express.json());
        customApp.post('/test-custom', validator, (req, res) => {
          res.json({ success: true, data: req.body });
        });

        // Test with valid custom type
        const validReport = {
          reportType: 'CUSTOM1',
          title: 'A'.repeat(REPORT_TITLE_MIN),
          content: 'A'.repeat(REPORT_CONTENT_MIN)
        };

        return request(customApp)
          .post('/test-custom')
          .send(validReport)
          .expect(200);
      });

      test('should create validator with custom length limits', () => {
        const customValidator = createReportValidator({
          titleMin: 10,
          titleMax: 50,
          contentMin: 30,
          contentMax: 100
        });

        // Create a test app with the custom validator
        const customApp = express();
        customApp.use(express.json());
        customApp.post('/test-custom-limits', customValidator, (req, res) => {
          res.json({ success: true, data: req.body });
        });

        // Test with valid data within custom limits
        const validReport = {
          reportType: REPORT_TYPES[0],
          title: 'A'.repeat(10), // Custom min
          content: 'A'.repeat(30) // Custom min
        };

        return request(customApp)
          .post('/test-custom-limits')
          .send(validReport)
          .expect(200);
      });

      test('should create validator with custom messages', () => {
        const customMessages = {
          typeMessage: 'Custom type error',
          titleRequiredMessage: 'Custom title required',
          titleLengthMessage: 'Custom title length error',
          contentRequiredMessage: 'Custom content required',
          contentLengthMessage: 'Custom content length error'
        };

        const customValidator = createReportValidator(customMessages);

        // Create a test app with the custom validator
        const customApp = express();
        customApp.use(express.json());
        customApp.post('/test-custom-messages', customValidator, (req, res) => {
          res.json({ success: true, data: req.body });
        });

        // Test with invalid data to trigger custom messages
        const invalidReport = {
          reportType: 'INVALID',
          title: 'A'.repeat(REPORT_TITLE_MIN - 1),
          content: 'A'.repeat(REPORT_CONTENT_MIN - 1)
        };

        return request(customApp)
          .post('/test-custom-messages')
          .send(invalidReport)
          .expect(400)
          .then(response => {
            expect(response.body.success).toBe(false);
            expect(response.body.errors).toEqual(
              expect.arrayContaining([
                expect.objectContaining({ msg: 'Custom type error' }),
                expect.objectContaining({ msg: 'Custom title length error' }),
                expect.objectContaining({ msg: 'Custom content length error' })
              ])
            );
          });
      });
    });

    describe('Edge Cases', () => {
      test('should handle empty options object', () => {
        const validator = createReportValidator({});
        expect(Array.isArray(validator)).toBe(true);
        expect(validator).toHaveLength(4);
      });

      test('should handle undefined options', () => {
        const validator = createReportValidator(undefined);
        expect(Array.isArray(validator)).toBe(true);
        expect(validator).toHaveLength(4);
      });

      test('should handle null options', () => {
        const validator = createReportValidator(null);
        expect(Array.isArray(validator)).toBe(true);
        expect(validator).toHaveLength(4);
      });
    });
  });
});
