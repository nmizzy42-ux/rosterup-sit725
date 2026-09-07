const userService = require('../services/users.service'); 

const getPendingEmployeesController = async (req, res) => {
    try {
        const { workplace } = req.query;

        const filter = {};

        if (workplace) filter.workplace = workplace;
        filter.workplace_status = "pending";
        filter.role = "employee";

        const users = await userService.getUsersService(filter);

        res.status(200).json(users);
    } catch (error) {
        if (error.name == "CastError") {
            res.status(500).json({message: `Unable to cast value from ${error.valueType} to ${error.kind}`})
        } else {
            res.status(500).json({ message: error.message, error: error });
        }
        
    }
};

module.exports = {
    getPendingEmployeesController
};