const express = require('express');
const router = express.Router();
const { listPendingClaims } = require('../controllers/shifts.controller');

function notImplemented(req, res) {
    return res.status(501).json({ error: 'Not implemented' });
}

// Create / Post a shift for cover
router.post('/', notImplemented);

// Get Shifts
router.get('/', notImplemented);

// Manager Lists Pending Shift Claims
router.get('/claims', listPendingClaims);

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
