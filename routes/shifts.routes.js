const express = require('express');
const router = express.Router();
// const {  } = require('../controllers/shifts.controller');

function notImplemented(req, res) {
    return res.status(501).json({
        error: 'This shift operation has not been implemented yet',
    });
}

// Create / Post a shift for cover
router.post('/', notImplemented);

// Get Shifts
router.get('/', notImplemented);

// Get Shift by ID
router.get('/:id', notImplemented);

// Update Shift by ID
router.put('/:id', notImplemented);

// Employee Claims Shift
router.post('/:id/claim', notImplemented);

// Manager Approves / Rejects Employee Shift Claim
router.put('/:id/claim', notImplemented);

// Original Employee Withdraws Shift
router.post('/:id/withdraw', notImplemented);

module.exports = router;