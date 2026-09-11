const Shift = require('../models/Shift');
const Workplace = require('../models/Workplace');

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
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

module.exports = {
    getShiftsService,
    listPendingClaims,
};
