const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/contentController');

const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// Apply authentication to all routes
router.use(authenticate);

// Content CRUD routes
router.get('/', 
  authorize(['content.read']), 
  getAllContent
);

router.get('/export', 
  authorize(['content.reports.generate']), 
  exportContentReport
);

router.get('/:id', 
  authorize(['content.read']), 
  getContentById
);

router.post('/', 
  authorize(['content.create']),
  upload.single('file'),
  createContent
);

router.put('/:id', 
  authorize(['content.update']),
  upload.single('file'),
  updateContent
);

router.delete('/:id', 
  authorize(['content.delete']), 
  deleteContent
);

// Content sharing and assignment routes
router.post('/:id/assign', 
  authorize(['content.assign']), 
  assignContent
);

router.get('/:id/assignments', 
  authorize(['content.read']), 
  getContentAssignments
);

// Content analytics routes
router.get('/:id/analytics', 
  authorize(['content.analytics.view']), 
  getContentAnalytics
);

module.exports = router;
