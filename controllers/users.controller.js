const userService = require('../services/users.service'); 

const getUsersController = async (req, res) => {
    try {
        const { workplace, status } = req.query;

        const filter = {};

        if (workplace) filter.workplace = workplace;
        if (status) filter.workplace_status = status;

        const users = await userService.getUsersService(filter);

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsersController
};