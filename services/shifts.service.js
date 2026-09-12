const Shift = require('../models/Shift');
const Workplace = require('../models/Workplace');

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

async function postShiftsService(shift) {

    const allowedFields = [
        'workplace',
        'posted_by',
        'shift_date',
        'start_time',
        'end_time',
        'shift_role',
        'note'
    ];

    for (const field in shift) {
        if (!allowedFields.includes(field)) {
            throw new Error(`Invalid create field: ${field}`);
        }
    }

    const shiftObject = {
        workplace: shift.workplace,
        posted_by: shift.posted_by,
        shift_date: shift.shift_date,
        start_time: shift.start_time,
        end_time: shift.end_time,
        shift_role: shift.shift_role,
        note: shift.note
    };

    return await shiftsModel.create(shiftObject);

};


async function withdrawShiftsService(filter) {
    const shift = await shiftsModel.findOneAndUpdate(
        filter,
        {
            claimed_by: null,
            status: 'open'
        },
        { new: true }
    );

    return shift;
}

async function getShiftsService(filter) {
    // Populated so the client can show who posted the shift without a
    // separate lookup (same pattern as listPendingClaims below).
    const shifts = await Shift.find(filter)
        .populate('posted_by', 'first_name last_name')
        .sort({ shift_date: 1, start_time: 1 });
    return shifts;
}

async function listPendingClaims(managerId, dependencies = {}) {
    if (!managerId) {
        throw createHttpError('An authenticated manager is required', 401);
    }

    const ShiftModel = dependencies.ShiftModel || Shift;
    const WorkplaceModel = dependencies.WorkplaceModel || Workplace;
    const workplace = await WorkplaceModel.findOne({
        manager_id: managerId,
        active: true,
    });

    if (!workplace) {
        return [];
    }

    return ShiftModel.find({
        workplace: workplace._id,
        status: 'pending',
        claimed_by: { $ne: null },
    })
        .populate('posted_by', 'first_name last_name email')
        .populate('claimed_by', 'first_name last_name email')
        .sort({ shift_date: 1, start_time: 1 })
        .lean();
}

const VALID_CLAIM_ACTIONS = ['approve', 'reject'];

// Manager approves (mark covered) or rejects (reopen) a pending shift
// claim — FR-18 / FR-19. Mirrors listPendingClaims' own pattern for
// resolving "this manager's workplace", and manager.controller.js's
// processEmployeeRequest for using one generic "not found" message
// whether the shift doesn't exist, isn't pending, or belongs to a
// different manager's workplace, so a manager can't learn anything about
// another workplace's shifts just by guessing ids.
async function processShiftClaim(shiftId, managerId, action, dependencies = {}) {
    if (!managerId) {
        throw createHttpError('An authenticated manager is required', 401);
    }

    if (!VALID_CLAIM_ACTIONS.includes(action)) {
        throw createHttpError("Invalid action. Must be 'approve' or 'reject'.", 400);
    }

    const ShiftModel = dependencies.ShiftModel || Shift;
    const WorkplaceModel = dependencies.WorkplaceModel || Workplace;

    const workplace = await WorkplaceModel.findOne({
        manager_id: managerId,
        active: true,
    });

    if (!workplace) {
        throw createHttpError('Shift claim not found.', 404);
    }

    const shift = await ShiftModel.findOne({
        _id: shiftId,
        workplace: workplace._id,
        status: 'pending',
        claimed_by: { $ne: null },
    });

    if (!shift) {
        throw createHttpError('Shift claim not found.', 404);
    }

    if (action === 'approve') {
        shift.status = 'covered';
    } else {
        // Reject: back to the open pool for someone else to claim.
        shift.status = 'open';
        shift.claimed_by = null;
    }

    await shift.save();
    return shift;
}

module.exports = {
    getShiftsService,
    listPendingClaims,
    postShiftsService,
    withdrawShiftsService,
    processShiftClaim,
};
    

