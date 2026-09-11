const test = require('node:test');
const assert = require('node:assert/strict');

const authController = require('../controllers/auth.controller');

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

test('login rejects a request missing email', async () => {
    const response = createResponseRecorder();

    await authController.login({ body: { password: 'test1234' } }, response);

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.success, false);
});

test('login rejects a request missing password', async () => {
    const response = createResponseRecorder();

    await authController.login({ body: { email: 'nat@test.com' } }, response);

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.success, false);
});

test('logout always responds with success (stateless JWT)', async () => {
    const response = createResponseRecorder();

    await authController.logout({}, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
});

test('register rejects employee registration missing required fields', async () => {
    const response = createResponseRecorder();

    await authController.register({
        body: { email: 'nat@test.com', password: 'test1234', role: 'employee' },
    }, response);

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.success, false);
});

test('register rejects an invalid role', async () => {
    const response = createResponseRecorder();

    await authController.register({
        body: {
            first_name: 'Nat', last_name: 'Smith',
            email: 'nat@test.com', password: 'test1234', role: 'owner',
        },
    }, response);

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.success, false);
});

test('register rejects employee registration without a workplace invite code', async () => {
    const response = createResponseRecorder();

    await authController.register({
        body: {
            first_name: 'Nat', last_name: 'Smith',
            email: 'nat@test.com', password: 'test1234', role: 'employee',
        },
    }, response);

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.success, false);
    assert.match(response.body.message, /invite code/i);
});
