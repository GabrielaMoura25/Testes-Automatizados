const authMiddleware = require('../../../src/middlewares/auth')
const jwt = require('jsonwebtoken')

describe('Auth Middleware', () => {
    it('should return 401 if token is not provided', async () => {
        const req = {
            headers: {}
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token is not provided' });
    })

    it('should set req.userEmail if token is valid', async () => {
        const token = 'valid_token';
        const decoded = { email: 'test@example.com' };

        jwt.verify = jest.fn().mockReturnValue(decoded);

        const req = {
            headers: {
                authorization: `Bearer ${token}`
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await authMiddleware(req, res, next);

        expect(req.userEmail).toBe(decoded.email)
        expect(next).toHaveBeenCalled()
    })

    it('should return 401 if token is invalid', async () => {
        const token = 'invalid_token';
        const errorMessage = 'Invalid token';

        jwt.verify = jest.fn().mockImplementation(() => {
            throw new Error(errorMessage);
        });

        const req = {
            headers: {
                authorization: `Bearer ${token}`
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    })
})
