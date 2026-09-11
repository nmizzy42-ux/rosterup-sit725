const express = require('express');
const router = express.Router();
const managerController = require('../controllers/manager.controller');

//GET request to fetch pending rows
router.get('/pending-employees', managerController.getPendingEmployees);

//PATCH request to update pending status triggers
router.patch('/process-employee/:id', managerController.processEmployeeRequest);

module.exports = router;
