const express = require('express');
const router = express.Router();
const teacherEvaluationController = require('../controllers/teacherEvaluationController');
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', 
  authorize(['teachers:read']), 
  ensureTenantAccess, 
  teacherEvaluationController.getEvaluations
);

router.post('/', 
  authorize(['teachers:create']), 
  ensureTenantAccess, 
  teacherEvaluationController.createEvaluation
);

router.put('/:id', 
  authorize(['teachers:update']), 
  ensureTenantAccess, 
  teacherEvaluationController.updateEvaluation
);

module.exports = router;