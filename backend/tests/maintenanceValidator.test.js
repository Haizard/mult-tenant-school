const request = require('supertest');
const express = require('express');
const { validateMaintenanceCreation, validateMaintenanceUpdate } = require('../src/middleware/validators/maintenance');
const { MAINTENANCE_ISSUE_TYPES, MAINTENANCE_PRIORITY, MAINTENANCE_STATUS } = require('../src/constants/constants');

// Create a test app
const app = express();
app.use(express.json());

// Apply the validation middleware
app.post('/test-maintenance', validateMaintenanceCreation, (req, res) => {
  res.json({ success: true, data: req.body });
});

app.put('/test-maintenance/:id', validateMaintenanceUpdate, (req, res) => {
  res.json({ success: true, data: req.body });
});

describe('Maintenance Validator Tests', () => {
  describe('validateMaintenanceCreation (Create)', () => {
    describe('Valid Inputs', () => {
      test('should accept valid maintenance data', async () => {
        const validMaintenance = {
          roomId: 1,
          issueType: MAINTENANCE_ISSUE_TYPES[0],
          description: 'This is a valid maintenance description that meets the minimum length requirement.',
          priority: MAINTENANCE_PRIORITY[0]
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(validMaintenance)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(validMaintenance);
      });

      test('should accept description at minimum length (10 characters)', async () => {
        const validMaintenance = {
          roomId: 1,
          issueType: MAINTENANCE_ISSUE_TYPES[0],
          description: '1234567890',
          priority: MAINTENANCE_PRIORITY[0]
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(validMaintenance)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      test('should accept description at maximum length (500 characters)', async () => {
        const validMaintenance = {
          roomId: 1,
          issueType: MAINTENANCE_ISSUE_TYPES[0],
          description: 'A'.repeat(500),
          priority: MAINTENANCE_PRIORITY[0]
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(validMaintenance)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      test('should accept roomId at minimum value (1)', async () => {
        const validMaintenance = {
          roomId: 1,
          issueType: MAINTENANCE_ISSUE_TYPES[0],
          description: 'This is a valid maintenance description that meets the minimum length requirement.',
          priority: MAINTENANCE_PRIORITY[0]
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(validMaintenance)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      test('should accept large roomId values', async () => {
        const validMaintenance = {
          roomId: 999999,
          issueType: MAINTENANCE_ISSUE_TYPES[0],
          description: 'This is a valid maintenance description that meets the minimum length requirement.',
          priority: MAINTENANCE_PRIORITY[0]
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(validMaintenance)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe('Invalid Inputs - Type Checks', () => {
      test('should reject non-integer roomId', async () => {
        const invalidMaintenance = {
          roomId: 'not-a-number',
          issueType: MAINTENANCE_ISSUE_TYPES[0],
          description: 'This is a valid maintenance description that meets the minimum length requirement.',
          priority: MAINTENANCE_PRIORITY[0]
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(invalidMaintenance)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Valid room ID is required'
            })
          ])
        );
      });

      test('should reject non-string issueType', async () => {
        const invalidMaintenance = {
          roomId: 1,
          issueType: 123,
          description: 'This is a valid maintenance description that meets the minimum length requirement.',
          priority: MAINTENANCE_PRIORITY[0]
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(invalidMaintenance)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Invalid issue type'
            })
          ])
        );
      });

      test('should reject non-string description', async () => {
        const invalidMaintenance = {
          roomId: 1,
          issueType: MAINTENANCE_ISSUE_TYPES[0],
          description: 123,
          priority: MAINTENANCE_PRIORITY[0]
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(invalidMaintenance)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Description must be between 10 and 500 characters'
            })
          ])
        );
      });

      test('should reject non-string priority', async () => {
        const invalidMaintenance = {
          roomId: 1,
          issueType: MAINTENANCE_ISSUE_TYPES[0],
          description: 'This is a valid maintenance description that meets the minimum length requirement.',
          priority: 123
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(invalidMaintenance)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Invalid priority level'
            })
          ])
        );
      });
    });

    describe('Invalid Inputs - Boundary Length Validations', () => {
      test('should reject description shorter than minimum length (9 characters)', async () => {
        const invalidMaintenance = {
          roomId: 1,
          issueType: MAINTENANCE_ISSUE_TYPES[0],
          description: '123456789',
          priority: MAINTENANCE_PRIORITY[0]
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(invalidMaintenance)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Description must be between 10 and 500 characters'
            })
          ])
        );
      });

      test('should reject description longer than maximum length (501 characters)', async () => {
        const invalidMaintenance = {
          roomId: 1,
          issueType: MAINTENANCE_ISSUE_TYPES[0],
          description: 'A'.repeat(501),
          priority: MAINTENANCE_PRIORITY[0]
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(invalidMaintenance)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Description must be between 10 and 500 characters'
            })
          ])
        );
      });

      test('should reject roomId less than minimum value (0)', async () => {
        const invalidMaintenance = {
          roomId: 0,
          issueType: MAINTENANCE_ISSUE_TYPES[0],
          description: 'This is a valid maintenance description that meets the minimum length requirement.',
          priority: MAINTENANCE_PRIORITY[0]
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(invalidMaintenance)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Valid room ID is required'
            })
          ])
        );
      });

      test('should reject negative roomId', async () => {
        const invalidMaintenance = {
          roomId: -1,
          issueType: MAINTENANCE_ISSUE_TYPES[0],
          description: 'This is a valid maintenance description that meets the minimum length requirement.',
          priority: MAINTENANCE_PRIORITY[0]
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(invalidMaintenance)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Valid room ID is required'
            })
          ])
        );
      });
    });

    describe('Invalid Inputs - Required Field Validations', () => {
      test('should reject empty description', async () => {
        const invalidMaintenance = {
          roomId: 1,
          issueType: MAINTENANCE_ISSUE_TYPES[0],
          description: '',
          priority: MAINTENANCE_PRIORITY[0]
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(invalidMaintenance)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Description is required'
            })
          ])
        );
      });

      test('should reject missing roomId', async () => {
        const invalidMaintenance = {
          issueType: MAINTENANCE_ISSUE_TYPES[0],
          description: 'This is a valid maintenance description that meets the minimum length requirement.',
          priority: MAINTENANCE_PRIORITY[0]
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(invalidMaintenance)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Valid room ID is required'
            })
          ])
        );
      });

      test('should reject missing issueType', async () => {
        const invalidMaintenance = {
          roomId: 1,
          description: 'This is a valid maintenance description that meets the minimum length requirement.',
          priority: MAINTENANCE_PRIORITY[0]
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(invalidMaintenance)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Invalid issue type'
            })
          ])
        );
      });

      test('should reject missing description', async () => {
        const invalidMaintenance = {
          roomId: 1,
          issueType: MAINTENANCE_ISSUE_TYPES[0],
          priority: MAINTENANCE_PRIORITY[0]
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(invalidMaintenance)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Description is required'
            })
          ])
        );
      });

      test('should reject missing priority', async () => {
        const invalidMaintenance = {
          roomId: 1,
          issueType: MAINTENANCE_ISSUE_TYPES[0],
          description: 'This is a valid maintenance description that meets the minimum length requirement.'
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(invalidMaintenance)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Invalid priority level'
            })
          ])
        );
      });
    });

    describe('Invalid Inputs - Enum Validations', () => {
      test('should reject invalid issue type', async () => {
        const invalidMaintenance = {
          roomId: 1,
          issueType: 'INVALID_TYPE',
          description: 'This is a valid maintenance description that meets the minimum length requirement.',
          priority: MAINTENANCE_PRIORITY[0]
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(invalidMaintenance)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Invalid issue type'
            })
          ])
        );
      });

      test('should reject invalid priority', async () => {
        const invalidMaintenance = {
          roomId: 1,
          issueType: MAINTENANCE_ISSUE_TYPES[0],
          description: 'This is a valid maintenance description that meets the minimum length requirement.',
          priority: 'INVALID_PRIORITY'
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(invalidMaintenance)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Invalid priority level'
            })
          ])
        );
      });
    });

    describe('Edge Cases', () => {
      test('should reject description with only whitespace', async () => {
        const invalidMaintenance = {
          roomId: 1,
          issueType: MAINTENANCE_ISSUE_TYPES[0],
          description: '   ',
          priority: MAINTENANCE_PRIORITY[0]
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(invalidMaintenance)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Description is required'
            })
          ])
        );
      });

      test('should handle multiple validation errors', async () => {
        const invalidMaintenance = {
          roomId: 'invalid',
          issueType: 'INVALID',
          description: 'short',
          priority: 'INVALID'
        };

        const response = await request(app)
          .post('/test-maintenance')
          .send(invalidMaintenance)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toHaveLength(4);
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ msg: 'Valid room ID is required' }),
            expect.objectContaining({ msg: 'Invalid issue type' }),
            expect.objectContaining({ msg: 'Description must be between 10 and 500 characters' }),
            expect.objectContaining({ msg: 'Invalid priority level' })
          ])
        );
      });
    });
  });

  describe('validateMaintenanceUpdate (Update)', () => {
    const validObjectId = '507f1f77bcf86cd799439011';

    describe('Valid Inputs', () => {
      test('should accept valid update with status only', async () => {
        const validUpdate = {
          status: MAINTENANCE_STATUS[1]
        };

        const response = await request(app)
          .put(`/test-maintenance/${validObjectId}`)
          .send(validUpdate)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(validUpdate);
      });

      test('should accept valid update with priority only', async () => {
        const validUpdate = {
          priority: MAINTENANCE_PRIORITY[2]
        };

        const response = await request(app)
          .put(`/test-maintenance/${validObjectId}`)
          .send(validUpdate)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(validUpdate);
      });

      test('should accept valid update with description only', async () => {
        const validUpdate = {
          description: 'This is a valid updated description that meets the minimum length requirement.'
        };

        const response = await request(app)
          .put(`/test-maintenance/${validObjectId}`)
          .send(validUpdate)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(validUpdate);
      });

      test('should accept valid update with multiple fields', async () => {
        const validUpdate = {
          status: MAINTENANCE_STATUS[2],
          priority: MAINTENANCE_PRIORITY[1],
          description: 'This is a valid updated description that meets the minimum length requirement.'
        };

        const response = await request(app)
          .put(`/test-maintenance/${validObjectId}`)
          .send(validUpdate)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(validUpdate);
      });

      test('should accept description at minimum length (10 characters)', async () => {
        const validUpdate = {
          description: '1234567890'
        };

        const response = await request(app)
          .put(`/test-maintenance/${validObjectId}`)
          .send(validUpdate)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      test('should accept description at maximum length (500 characters)', async () => {
        const validUpdate = {
          description: 'A'.repeat(500)
        };

        const response = await request(app)
          .put(`/test-maintenance/${validObjectId}`)
          .send(validUpdate)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe('Invalid Inputs - Parameter Validation', () => {
      test('should reject invalid ObjectId format', async () => {
        const validUpdate = {
          status: MAINTENANCE_STATUS[0]
        };

        const response = await request(app)
          .put('/test-maintenance/invalid-id')
          .send(validUpdate)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Invalid maintenance ObjectId format'
            })
          ])
        );
      });

      test('should reject empty ObjectId', async () => {
        const validUpdate = {
          status: MAINTENANCE_STATUS[0]
        };

        const response = await request(app)
          .put('/test-maintenance/')
          .send(validUpdate)
          .expect(404); // Express route not found

        // This test verifies the route structure, not validation
      });
    });

    describe('Invalid Inputs - Type Checks', () => {
      test('should reject non-string status', async () => {
        const invalidUpdate = {
          status: 123
        };

        const response = await request(app)
          .put(`/test-maintenance/${validObjectId}`)
          .send(invalidUpdate)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Invalid maintenance status'
            })
          ])
        );
      });

      test('should reject non-string priority', async () => {
        const invalidUpdate = {
          priority: 123
        };

        const response = await request(app)
          .put(`/test-maintenance/${validObjectId}`)
          .send(invalidUpdate)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Invalid priority level'
            })
          ])
        );
      });

      test('should reject non-string description', async () => {
        const invalidUpdate = {
          description: 123
        };

        const response = await request(app)
          .put(`/test-maintenance/${validObjectId}`)
          .send(invalidUpdate)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Description must be between 10 and 500 characters'
            })
          ])
        );
      });
    });

    describe('Invalid Inputs - Boundary Length Validations', () => {
      test('should reject description shorter than minimum length (9 characters)', async () => {
        const invalidUpdate = {
          description: '123456789'
        };

        const response = await request(app)
          .put(`/test-maintenance/${validObjectId}`)
          .send(invalidUpdate)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Description must be between 10 and 500 characters'
            })
          ])
        );
      });

      test('should reject description longer than maximum length (501 characters)', async () => {
        const invalidUpdate = {
          description: 'A'.repeat(501)
        };

        const response = await request(app)
          .put(`/test-maintenance/${validObjectId}`)
          .send(invalidUpdate)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Description must be between 10 and 500 characters'
            })
          ])
        );
      });
    });

    describe('Invalid Inputs - Enum Validations', () => {
      test('should reject invalid status', async () => {
        const invalidUpdate = {
          status: 'INVALID_STATUS'
        };

        const response = await request(app)
          .put(`/test-maintenance/${validObjectId}`)
          .send(invalidUpdate)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Invalid maintenance status'
            })
          ])
        );
      });

      test('should reject invalid priority', async () => {
        const invalidUpdate = {
          priority: 'INVALID_PRIORITY'
        };

        const response = await request(app)
          .put(`/test-maintenance/${validObjectId}`)
          .send(invalidUpdate)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Invalid priority level'
            })
          ])
        );
      });
    });

    describe('Invalid Inputs - No-op Update Prevention', () => {
      test('should reject empty request body', async () => {
        const response = await request(app)
          .put(`/test-maintenance/${validObjectId}`)
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'At least one updatable field (status, priority, or description) must be provided'
            })
          ])
        );
      });

      test('should reject request with only null values', async () => {
        const invalidUpdate = {
          status: null,
          priority: null,
          description: null
        };

        const response = await request(app)
          .put(`/test-maintenance/${validObjectId}`)
          .send(invalidUpdate)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'At least one updatable field (status, priority, or description) must be provided'
            })
          ])
        );
      });

      test('should reject request with only empty string values', async () => {
        const invalidUpdate = {
          status: '',
          priority: '',
          description: ''
        };

        const response = await request(app)
          .put(`/test-maintenance/${validObjectId}`)
          .send(invalidUpdate)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'At least one updatable field (status, priority, or description) must be provided'
            })
          ])
        );
      });

      test('should reject request with only undefined values', async () => {
        const invalidUpdate = {
          status: undefined,
          priority: undefined,
          description: undefined
        };

        const response = await request(app)
          .put(`/test-maintenance/${validObjectId}`)
          .send(invalidUpdate)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'At least one updatable field (status, priority, or description) must be provided'
            })
          ])
        );
      });

      test('should reject request with only non-updatable fields', async () => {
        const invalidUpdate = {
          roomId: 123,
          issueType: 'ELECTRICAL',
          someOtherField: 'value'
        };

        const response = await request(app)
          .put(`/test-maintenance/${validObjectId}`)
          .send(invalidUpdate)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'At least one updatable field (status, priority, or description) must be provided'
            })
          ])
        );
      });
    });

    describe('Edge Cases', () => {
      test('should reject description with only whitespace', async () => {
        const invalidUpdate = {
          description: '   '
        };

        const response = await request(app)
          .put(`/test-maintenance/${validObjectId}`)
          .send(invalidUpdate)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Description must be between 10 and 500 characters'
            })
          ])
        );
      });

      test('should handle multiple validation errors', async () => {
        const invalidUpdate = {
          status: 'INVALID',
          priority: 'INVALID',
          description: 'short'
        };

        const response = await request(app)
          .put(`/test-maintenance/${validObjectId}`)
          .send(invalidUpdate)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toHaveLength(3);
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ msg: 'Invalid maintenance status' }),
            expect.objectContaining({ msg: 'Invalid priority level' }),
            expect.objectContaining({ msg: 'Description must be between 10 and 500 characters' })
          ])
        );
      });
    });
  });
});
