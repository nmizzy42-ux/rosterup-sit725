const test = require('node:test');
const assert = require('node:assert/strict');

const managerController = require('../controllers/manager.controller');

function createResponseRecorder() {
    return {
        statusCode: null,
        body: null,
        status(statusCode) {
            this.statusCode = statusCode;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };
}

// Only the validation that runs before any database call is unit-tested
// here, matching this codebase's existing convention (see
// auth.controller.test.js) — the DB-touching paths aren't mocked in this
// project, so they're exercised manually against a running Mongo instance
// instead.

test('processEmployeeRequest rejects a missing action', async () => {
    const response = createResponseRecorder();

    await managerController.processEmployeeRequest({
        params: { id: 'employee-1' },
        body: {},
        user: { id: 'manager-1' },
    }, response);

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.success, false);
});

test('processEmployeeRequest rejects an invalid action', async () => {
    const response = createResponseRecorder();

    await managerController.processEmployeeRequest({
        params: { id: 'employee-1' },
        body: { action: 'delete' },
        user: { id: 'manager-1' },
    }, response);

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.success, false);
});

test('getManagerEmployees returns employees from the manager workplace', async () => {
    const response = createResponseRecorder();
    const expectedEmployees = [{ _id: 'employee-1' }];
    const controller = managerController.buildGetManagerEmployeesController({
        getWorkplaceEmployeesService: async (managerId) => {
            assert.equal(managerId, 'manager-1');
            return expectedEmployees;
        },
    });

    await controller({ user: { id: 'manager-1' } }, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, {
        success: true,
        count: 1,
        employees: expectedEmployees,
    });
});

test('getManagerShifts returns shifts from the manager workplace', async () => {
    const response = createResponseRecorder();
    const expectedShifts = [{ _id: 'shift-1' }];
    const controller = managerController.buildGetManagerShiftsController({
        getShiftsService: async (filter, managerId) => {
            assert.deepEqual(filter, {});
            assert.equal(managerId, 'manager-1');
            return expectedShifts;
        },
    });

    await controller({ user: { id: 'manager-1' } }, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, {
        success: true,
        count: 1,
        shifts: expectedShifts,
    });
});
