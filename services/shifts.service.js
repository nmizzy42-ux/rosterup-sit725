const shiftsModel = require('../models/Shift');

// async function postShiftsService(filter) {

//     const shifts = await shiftsModel.find(filter);
//     return shifts;
// };

async function getShiftsService(filter) {

    const shifts = await shiftsModel.find(filter);
    return shifts;
};

module.exports = {
    getShiftsService
};