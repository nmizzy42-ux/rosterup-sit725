const workplaceService = require('../services/workplaces.service');

function buildCreateWorkplaceController(service = workplaceService) {
    return async function createWorkplace(req, res) {
        try {
            const managerId = req.user?.id || req.user?._id;
            const workplace = await service.createWorkplace(
                req.body,
                managerId,
            );

            return res.status(201).json({
                message: 'Workplace created successfully',
                workplace,
            });
        } catch (error) {
            if (error.code === 11000 && error.keyPattern?.invite_code) {
                return res.status(409).json({
                    error: 'Invite code already exists. Please try again.',
                });
            }

            const statusCode = error.statusCode
                || (error.name === 'ValidationError' ? 400 : 500);

            return res.status(statusCode).json({
                error: statusCode === 500
                    ? 'Unable to create workplace'
                    : error.message,
            });
        }
    };
}

const createWorkplace = buildCreateWorkplaceController();

module.exports = {
    buildCreateWorkplaceController,
    createWorkplace,
};