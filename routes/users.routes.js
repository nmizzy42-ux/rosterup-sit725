const express = require('express');
const router = express.Router();
// const {  } = require('../controllers/users.controller');

function notImplemented(req, res) {
    return res.status(501).json({
        error: 'This user operation has not been implemented yet',
    });
}

// Register a manager or employee
router.post('/register', notImplemented);

// Authenticate user
router.post('/login', notImplemented);

// Log user out
router.post('/logout', notImplemented);

// Get user/profile details
router.get('/:id', notImplemented);

// Update profile details
router.put('/:id', notImplemented);

// Change password
router.put('/:id/password', notImplemented);

// Approve/reject an employee  
router.put('/:id/status', notImplemented);

module.exports = router;