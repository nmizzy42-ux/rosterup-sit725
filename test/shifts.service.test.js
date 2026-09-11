const test = require('node:test');
const assert = require('node:assert/strict');

const { listPendingClaims } = require('../services/shifts.service');

function createShiftQuery(result, captured) {
    return {
        populate(path, fields) {
            captured.populate.push({ path, fields });
            return this;
        },
        sort(value) {
            captured.sort = value;
            return this;
        },
        lean() {
            return Promise.resolve(result);
        },
    };
}

test('requires an authenticated manager', async () => {
    await assert.rejects(
        () => listPendingClaims(),
        (error) => error.statusCode === 401,
    );
});

test('returns an empty list when the manager has no workplace', async () => {
    const claims = await listPendingClaims('manager-1', {
        WorkplaceModel: {
            findOne: async () => null,
        },
        ShiftModel: {
            find: () => {
                throw new Error('Shift lookup should not run');
            },
        },
    });

    assert.deepEqual(claims, []);
});

test('lists pending claims for the manager workplace', async () => {
    const expectedClaims = [{ _id: 'shift-1', status: 'pending' }];
    const captured = { populate: [] };

    const claims = await listPendingClaims('manager-1', {
        WorkplaceModel: {
            findOne: async (filter) => {
                captured.workplaceFilter = filter;
                return { _id: 'workplace-1' };
            },
        },
        ShiftModel: {
            find: (filter) => {
                captured.shiftFilter = filter;
                return createShiftQuery(expectedClaims, captured);
            },
        },
    });

    assert.deepEqual(captured.workplaceFilter, {
        manager_id: 'manager-1',
        active: true,
    });
    assert.deepEqual(captured.shiftFilter, {
        workplace: 'workplace-1',
        status: 'pending',
        claimed_by: { $ne: null },
    });
    assert.deepEqual(captured.populate, [
        {
            path: 'posted_by',
            fields: 'first_name last_name email',
        },
        {
            path: 'claimed_by',
            fields: 'first_name last_name email',
        },
    ]);
    assert.deepEqual(captured.sort, { shift_date: 1, start_time: 1 });
    assert.deepEqual(claims, expectedClaims);
});
