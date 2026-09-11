const express = require('express');
const router = express.Router();
const { createWorkplace } = require('../controllers/workplaces.controller');

function notImplemented(req, res) {
    return res.status(501).json({
        error: 'This workplace operation has not been implemented yet',
    });
}

// Create workplace
router.post('/', createWorkplace);

// Get all workplaces 
router.get('/', notImplemented);

// Get workplace details  
router.get('/:id', notImplemented);

// Update workplace details 
router.put('/:id', notImplemented);

// Employee joins using invite code
router.post('/join', notImplemented);

// Regenerate invite code   
router.post('/:id/invite-code', notImplemented);

module.exports = router;
