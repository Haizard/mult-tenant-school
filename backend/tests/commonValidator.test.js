const request = require('supertest');
const express = require('express');
const { validateId, handleValidationErrors } = require('../src/middleware/validators/common');

// Create a test app
const app = express();
app.use(express.json());

// Apply the validation middleware
app.get('/test/:id', validateId, (req, res) => {
  res.json({ success: true, id: req.params.id });
});

describe('Common Validator Tests', () => {
  describe('handleValidationErrors - ObjectId Validation', () => {
    describe('Valid ObjectId Inputs', () => {
      test('should accept valid 24-hex ObjectId', async () => {
        const validObjectId = '507f1f77bcf86cd799439011';

        const response = await request(app)
          .get(`/test/${validObjectId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.id).toBe(validObjectId);
      });

      test('should accept valid ObjectId with uppercase hex characters', async () => {
        const validObjectId = '507F1F77BCF86CD799439011';

        const response = await request(app)
          .get(`/test/${validObjectId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.id).toBe(validObjectId);
      });

      test('should accept valid ObjectId with mixed case hex characters', async () => {
        const validObjectId = '507f1F77bCf86Cd799439011';

        const response = await request(app)
          .get(`/test/${validObjectId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.id).toBe(validObjectId);
      });
    });

    describe('Invalid ObjectId Inputs', () => {
      test('should reject ObjectId with invalid length (too short)', async () => {
        const invalidObjectId = '507f1f77bcf86cd79943901'; // 23 characters

        const response = await request(app)
          .get(`/test/${invalidObjectId}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Invalid ObjectId format'
            })
          ])
        );
      });

      test('should reject ObjectId with invalid length (too long)', async () => {
        const invalidObjectId = '507f1f77bcf86cd799439011a'; // 25 characters

        const response = await request(app)
          .get(`/test/${invalidObjectId}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Invalid ObjectId format'
            })
          ])
        );
      });

      test('should reject ObjectId with non-hex characters', async () => {
        const invalidObjectId = '507f1f77bcf86cd79943901g'; // 'g' is not hex

        const response = await request(app)
          .get(`/test/${invalidObjectId}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Invalid ObjectId format'
            })
          ])
        );
      });

      test('should reject ObjectId with special characters', async () => {
        const invalidObjectId = '507f1f77bcf86cd79943901!'; // '!' is not hex

        const response = await request(app)
          .get(`/test/${invalidObjectId}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Invalid ObjectId format'
            })
          ])
        );
      });

      test('should reject ObjectId with spaces', async () => {
        const invalidObjectId = '507f1f77bcf86cd799439 11'; // space in middle

        const response = await request(app)
          .get(`/test/${invalidObjectId}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Invalid ObjectId format'
            })
          ])
        );
      });

      test('should reject empty ObjectId', async () => {
        const response = await request(app)
          .get('/test/')
          .expect(404); // Express route not found for empty param

        // This test verifies the route structure, not validation
      });

      test('should reject ObjectId with numbers only', async () => {
        const invalidObjectId = '123456789012345678901234'; // all numbers, no letters

        const response = await request(app)
          .get(`/test/${invalidObjectId}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Invalid ObjectId format'
            })
          ])
        );
      });

      test('should reject ObjectId with letters only', async () => {
        const invalidObjectId = 'abcdefghijklmnopqrstuvwx'; // all letters, no numbers

        const response = await request(app)
          .get(`/test/${invalidObjectId}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: 'Invalid ObjectId format'
            })
          ])
        );
      });
    });

    describe('Edge Cases', () => {
      test('should handle multiple validation errors if other validators are added', async () => {
        // This test ensures the middleware can handle multiple errors
        const invalidObjectId = 'invalid';

        const response = await request(app)
          .get(`/test/${invalidObjectId}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toBeInstanceOf(Array);
        expect(response.body.errors.length).toBeGreaterThan(0);
      });

      test('should return structured error response format', async () => {
        const invalidObjectId = 'not-a-valid-objectid';

        const response = await request(app)
          .get(`/test/${invalidObjectId}`)
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Validation failed');
        expect(response.body).toHaveProperty('errors');
        expect(Array.isArray(response.body.errors)).toBe(true);
        expect(response.body.errors[0]).toHaveProperty('msg');
        expect(response.body.errors[0]).toHaveProperty('param');
        expect(response.body.errors[0]).toHaveProperty('location');
      });
    });
  });
});
