const express = require('express');
const router = express.Router();
const { getOpenShiftsController, listPendingClaims } = require('../controllers/shifts.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

function notImplemented(req, res) {
    return res.status(501).json({
        error: 'This shift operation has not been implemented yet',
    });
}

// Create / Post a shift for cover
router.post('/', notImplemented);

// Get Shifts
router.get('/', getOpenShiftsController);

// Manager Lists Pending Shift Claims
// (The controller itself already checks req.user and the manager role, but
// without requireAuth here req.user is never set at all — every request
// hit the 401 branch regardless of token. Same class of bug as the
// manager.routes.js pattern this mirrors.)
router.get('/claims', requireAuth, requireRole('manager'), listPendingClaims);

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
