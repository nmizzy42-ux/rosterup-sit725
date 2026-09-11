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

module.exports = {
    getShiftsService,
    listPendingClaims,
    postShiftsService,
    withdrawShiftsService,    
};
    

