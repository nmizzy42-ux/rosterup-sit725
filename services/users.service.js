const userModel = require('../models/User');
const workplaceModel = require('../models/Workplace');

async function getUsersService(filter) {

    const users = await userModel.find(filter);
    return users;
};

async function getWorkplaceEmployeesService(managerId, dependencies = {}) {
    if (!managerId) {
        const error = new Error('An authenticated manager is required');
        error.statusCode = 401;
        throw error;
    }

    const UserModel = dependencies.UserModel || userModel;
    const WorkplaceModel = dependencies.WorkplaceModel || workplaceModel;
    const workplace = await WorkplaceModel.findOne({
        manager_id: managerId,
        active: true,
    });

    if (!workplace) {
        return [];
    }

    return UserModel.find({
        role: 'employee',
        workplace: workplace._id,
        workplace_status: { $in: ['approved', 'pending'] },
        active: true,
    })
        .select('first_name last_name email workplace_status')
        .sort({ first_name: 1, last_name: 1 })
        .lean();
}

module.exports = {
    getUsersService,
    getWorkplaceEmployeesService,
};
