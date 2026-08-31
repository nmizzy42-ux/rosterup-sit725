const Shift = require('../models/Shift');
const Workplace = require('../models/Workplace');

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
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
    listPendingClaims,
};
