const SessionController = require("../../src/controllers/session-ctrl");
const UserService = require("../../src/services/user-service");
const SessionService = require("../../src/services/session-service");

const req = {
  body: {
    email: "",
    password: "",
  },
};

const res = {
  statusCode: 200,
  status: function (code) {
    this.statusCode = code;
    return this;
  },
  json: jest.fn(),
};

describe("SessionController", () => {
  describe("create", () => {
    it("should return a valid token for an existing user", async () => {
      req.body.email = 'valid-email@example.com';
      req.body.password = 'validPassword';
      UserService.userExistsAndCheckPassword = jest.fn().mockResolvedValue(true);
      SessionService.generateToken = jest.fn().mockResolvedValue("token123");

      await SessionController.create(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.json).toHaveBeenCalledWith({ token: 'token123' });
    });
    it("should return error 400 for invalid email", async () => {
      req.body.email = "invalidEmail";
      req.body.password = 'validPassword';
      await SessionController.create(req, res);

      expect(res.statusCode).toBe(400);
    });

    it("should return error 400 for invalid password", async () => {
      req.body.email = 'valid-email@example.com';
      req.body.password = "";
      await SessionController.create(req, res);

      expect(res.statusCode).toBe(400);
    });

    it("should return 404 error for user not found", async () => {
      req.body.email = 'valid-email@test.com';
      req.body.password = 'validPassword';
      UserService.userExistsAndCheckPassword = jest.fn().mockResolvedValue(false);
      await SessionController.create(req, res);
    });
    it("should return 500 error for server errors", async () => {
      req.body.email = 'valid-email@test.com';
      req.body.password = 'validPassword';
      UserService.userExistsAndCheckPassword = jest.fn().mockRejectedValue(new Error('Unexpected error'));
      await SessionController.create(req, res);
      expect(res.statusCode).toBe(500);
    });
  });
});
