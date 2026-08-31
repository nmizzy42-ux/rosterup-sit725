const Workplace = require('../models/Workplace');
const { generateUniqueInviteCode } = require('./invite-code.service');

const REQUIRED_FIELDS = [
    'workplace_name',
    'workplace_type',
    'workplace_address',
    'workplace_town',
    'workplace_postcode',
];

function normaliseWorkplaceInput(input = {}) {
    return REQUIRED_FIELDS.reduce((workplace, field) => {
        workplace[field] = typeof input[field] === 'string'
            ? input[field].trim()
            : input[field];
        return workplace;
    }, {});
}

function validateWorkplaceInput(input) {
    const missingFields = REQUIRED_FIELDS.filter((field) => !input[field]);

    if (missingFields.length > 0) {
        const error = new Error(
            `Missing required workplace fields: ${missingFields.join(', ')}`,
        );
        error.statusCode = 400;
        throw error;
    }
}

async function createWorkplace(
    input,
    managerId,
    dependencies = {},
) {
    const WorkplaceModel = dependencies.WorkplaceModel || Workplace;
    const inviteCodeGenerator = dependencies.inviteCodeGenerator
        || (() => generateUniqueInviteCode(WorkplaceModel));
    const workplaceInput = normaliseWorkplaceInput(input);

    validateWorkplaceInput(workplaceInput);

    if (!managerId) {
        const error = new Error('An authenticated manager is required');
        error.statusCode = 401;
        throw error;
    }

    const inviteCode = await inviteCodeGenerator();

    return WorkplaceModel.create({
        ...workplaceInput,
        invite_code: inviteCode,
        manager_id: managerId,
    });
}

module.exports = {
    createWorkplace,
    normaliseWorkplaceInput,
    validateWorkplaceInput,
};
