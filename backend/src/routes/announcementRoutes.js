const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/communicationController');

// Apply authentication to all routes
router.use(authenticateToken);

// Announcement Routes
router.get('/', authorize(['announcements:read', 'announcements:manage']), getAnnouncements);
router.get('/:id', authorize(['announcements:read', 'announcements:manage']), getAnnouncementById);
router.post('/', authorize(['announcements:create', 'announcements:manage']), createAnnouncement);
router.put('/:id', authorize(['announcements:update', 'announcements:manage']), updateAnnouncement);
router.delete('/:id', authorize(['announcements:delete', 'announcements:manage']), deleteAnnouncement);

module.exports = router;
