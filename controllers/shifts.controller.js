const shiftsService = require('../services/shifts.service');

const getOpenShiftsController = async (req, res) => {
    try {
        const { workplace } = req.query;

        const filter = {};

        if (workplace) filter.workplace = workplace;
        filter.status = "open";

        const shifts = await shiftsService.getShiftsService(filter);

        res.status(200).json(shifts);
    } catch (error) {
        if (error.name == "CastError") {
            res.status(500).json({ message: `Unable to cast value from ${error.valueType} to ${error.kind}` })
        } else {
            res.status(500).json({ message: error.message, error: error });
        }
    }
};

function buildListPendingClaimsController(service = shiftsService) {
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
    getOpenShiftsController,
    buildListPendingClaimsController,
    listPendingClaims,
};
