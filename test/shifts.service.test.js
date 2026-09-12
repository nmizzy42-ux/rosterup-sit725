const test = require('node:test');
const assert = require('node:assert/strict');

const { listPendingClaims, processShiftClaim } = require('../services/shifts.service');

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

function buildFakeShift(overrides = {}) {
    return {
        _id: 'shift-1',
        status: 'pending',
        claimed_by: 'employee-1',
        saved: false,
        ...overrides,
        async save() {
            this.saved = true;
            return this;
        },
    };
}

test('processShiftClaim requires an authenticated manager', async () => {
    await assert.rejects(
        () => processShiftClaim('shift-1', undefined, 'approve'),
        (error) => error.statusCode === 401,
    );
});

test('processShiftClaim rejects an unrecognised action', async () => {
    await assert.rejects(
        () => processShiftClaim('shift-1', 'manager-1', 'delete'),
        (error) => error.statusCode === 400,
    );
});

test('processShiftClaim 404s when the manager has no workplace', async () => {
    await assert.rejects(
        () => processShiftClaim('shift-1', 'manager-1', 'approve', {
            WorkplaceModel: { findOne: async () => null },
            ShiftModel: { findOne: async () => { throw new Error('Shift lookup should not run'); } },
        }),
        (error) => error.statusCode === 404,
    );
});

test('processShiftClaim 404s when the shift is not a pending claim in this workplace', async () => {
    await assert.rejects(
        () => processShiftClaim('shift-1', 'manager-1', 'approve', {
            WorkplaceModel: { findOne: async () => ({ _id: 'workplace-1' }) },
            ShiftModel: { findOne: async () => null },
        }),
        (error) => error.statusCode === 404,
    );
});

test('processShiftClaim approve marks the shift covered without clearing who claimed it', async () => {
    const shift = buildFakeShift();

    const result = await processShiftClaim('shift-1', 'manager-1', 'approve', {
        WorkplaceModel: { findOne: async () => ({ _id: 'workplace-1' }) },
        ShiftModel: { findOne: async () => shift },
    });

    assert.equal(result.status, 'covered');
    assert.equal(result.claimed_by, 'employee-1');
    assert.equal(result.saved, true);
});

test('processShiftClaim reject reopens the shift and clears the claim', async () => {
    const shift = buildFakeShift();

    const result = await processShiftClaim('shift-1', 'manager-1', 'reject', {
        WorkplaceModel: { findOne: async () => ({ _id: 'workplace-1' }) },
        ShiftModel: { findOne: async () => shift },
    });

    assert.equal(result.status, 'open');
    assert.equal(result.claimed_by, null);
    assert.equal(result.saved, true);
});

test('processShiftClaim scopes the shift lookup to the manager\'s own workplace', async () => {
    let capturedFilter;

    await processShiftClaim('shift-1', 'manager-1', 'approve', {
        WorkplaceModel: { findOne: async () => ({ _id: 'workplace-1' }) },
        ShiftModel: {
            findOne: async (filter) => {
                capturedFilter = filter;
                return buildFakeShift();
            },
        },
    });

    assert.deepEqual(capturedFilter, {
        _id: 'shift-1',
        workplace: 'workplace-1',
        status: 'pending',
        claimed_by: { $ne: null },
    });
});
