const shiftService = require('../services/shifts.service');

function buildListPendingClaimsController(service = shiftService) {
    return async function listPendingClaims(req, res) {
        try {
            const managerId = req.user?.id || req.user?._id;

            if (!managerId) {
                return res.status(401).json({
                    error: 'An authenticated manager is required',
                });
            }

            if (req.user.role && req.user.role !== 'manager') {
                return res.status(403).json({
                    error: 'Manager access is required',
                });
            }

            const claims = await service.listPendingClaims(managerId);

            return res.status(200).json({ claims });
        } catch (error) {
            const statusCode = error.statusCode || 500;

            return res.status(statusCode).json({
                error: statusCode === 500
                    ? 'Unable to load pending claims'
                    : error.message,
            });
        }
    };
}

const listPendingClaims = buildListPendingClaimsController();

module.exports = {
    buildListPendingClaimsController,
    listPendingClaims,
};
