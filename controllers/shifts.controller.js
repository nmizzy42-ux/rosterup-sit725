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
            res.status(500).json({message: `Unable to cast value from ${error.valueType} to ${error.kind}`})
        } else {
            res.status(500).json({ message: error.message, error: error });
        }
        
    }
};

module.exports = {
    getOpenShiftsController
};