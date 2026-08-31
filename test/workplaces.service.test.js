const test = require('node:test');
const assert = require('node:assert/strict');

const { createWorkplace } = require('../services/workplaces.service');

const validInput = {
    workplace_name: '  Corner Cafe  ',
    workplace_type: ' Hospitality ',
    workplace_address: ' 1 Main Street ',
    workplace_town: ' Geelong ',
    workplace_postcode: ' 3220 ',
};

test('createWorkplace saves normalised data and a generated invite code', async () => {
    let savedWorkplace;
    const WorkplaceModel = {
        async create(workplace) {
            savedWorkplace = workplace;
            return { _id: 'workplace-1', ...workplace };
        },
    };

    const workplace = await createWorkplace(validInput, 'manager-1', {
        WorkplaceModel,
        inviteCodeGenerator: async () => 'RU-ABC234',
    });

    assert.equal(workplace._id, 'workplace-1');
    assert.deepEqual(savedWorkplace, {
        workplace_name: 'Corner Cafe',
        workplace_type: 'Hospitality',
        workplace_address: '1 Main Street',
        workplace_town: 'Geelong',
        workplace_postcode: '3220',
        invite_code: 'RU-ABC234',
        manager_id: 'manager-1',
    });
});

test('createWorkplace rejects missing required fields', async () => {
    await assert.rejects(
        createWorkplace({ workplace_name: 'Corner Cafe' }, 'manager-1'),
        (error) => {
            assert.equal(error.statusCode, 400);
            assert.match(error.message, /workplace_type/);
            return true;
        },
    );
});

test('createWorkplace requires an authenticated manager', async () => {
    await assert.rejects(
        createWorkplace(validInput),
        (error) => {
            assert.equal(error.statusCode, 401);
            return true;
        },
    );
});
