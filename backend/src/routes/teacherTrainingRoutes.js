const express = require('express');
const router = express.Router();
const teacherTrainingController = require('../controllers/teacherTrainingController');
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', 
  authorize(['teachers:read']), 
  ensureTenantAccess, 
  teacherTrainingController.getTrainings
);

router.post('/', 
  authorize(['teachers:create']), 
  ensureTenantAccess, 
  teacherTrainingController.createTraining
);

router.put('/:id', 
  authorize(['teachers:update']), 
  ensureTenantAccess, 
  teacherTrainingController.updateTraining
);

module.exports = router;