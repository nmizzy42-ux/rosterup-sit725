const test = require('node:test');
const assert = require('node:assert/strict');

const {
    buildListPendingClaimsController,
} = require('../controllers/shifts.controller');

function createResponse() {
    return {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };
}

test('returns pending claims to an authenticated manager', async () => {
    const expectedClaims = [{ _id: 'shift-1' }];
    const controller = buildListPendingClaimsController({
        listPendingClaims: async (managerId) => {
            assert.equal(managerId, 'manager-1');
            return expectedClaims;
        },
    });
    const res = createResponse();

    await controller({
        user: { id: 'manager-1', role: 'manager' },
    }, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { claims: expectedClaims });
});

test('rejects a request without an authenticated user', async () => {
    const controller = buildListPendingClaimsController({
        listPendingClaims: async () => {
            throw new Error('Service should not run');
        },
    });
    const res = createResponse();

    await controller({}, res);

    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, {
        error: 'An authenticated manager is required',
    });
});

test('rejects an employee request', async () => {
    const controller = buildListPendingClaimsController({
        listPendingClaims: async () => {
            throw new Error('Service should not run');
        },
    });
    const res = createResponse();

    await controller({
        user: { id: 'employee-1', role: 'employee' },
    }, res);

    assert.equal(res.statusCode, 403);
    assert.deepEqual(res.body, { error: 'Manager access is required' });
});

test('does not expose unexpected errors', async () => {
    const controller = buildListPendingClaimsController({
        listPendingClaims: async () => {
            throw new Error('database details');
        },
    });
    const res = createResponse();

    await controller({
        user: { id: 'manager-1', role: 'manager' },
    }, res);

    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, {
        error: 'Unable to load pending claims',
    });
});
