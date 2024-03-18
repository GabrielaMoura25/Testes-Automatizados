const { faker } = require('@faker-js/faker')
const { cpf } = require('cpf-cnpj-validator')

const UserService = require('../../src/services/user-service')
const UserController = require('../../src/controllers/user-ctrl')
const User = require('../../src/schemas/User')
const prefixo = "integracao ";
const mongoose = require('mongoose');
require('dotenv').config();

const user = {
    name: prefixo + faker.name.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    cpf: cpf.generate(),
    password: 'hashedPassword123'
}

const req = {
    body: {
        name: user.name,
        email: user.email,
        password: 'password123'
    }
}
const res = {
    status: jest.fn(() => res),
    json: jest.fn()
}

describe('User Controller Tests', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_DB_BASE_URL);
        await User.deleteMany({ name: { $regex: prefixo } });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test('Should return 201 if a user is created', async () => {
        await UserController.create(req, res)

        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalled()
    })

    test('Should return 400 for invalid email', async () => {
        const req1 = { body: { ...req.body, email: 'invalid-email' } }

        user.email.isValid = jest.fn(() => false)

        await UserController.create(req1, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith('Email inválido')
    })

    test('Should return 400 for missing password', async () => {
        const req1 = { body: { ...req.body, password: '' } }

        await UserController.create(req1, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith('Senha inválida')
    })

    test('Should return 500 for server error', async () => {
        jest.spyOn(UserService, "createUser").mockRejectedValue(new Error()); //Tive de simular um 'bug' no servidor
        await UserController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith('Server Error');
    })

    test('Should return 201 if user was created with sucess', async () => {
        const params = { email: req.body.email, password: req.body.password }
        const result = await UserService.userExistsAndCheckPassword(params);
        expect(result).toBe(true)
    });

    test('Should return false if user does not exist', async () => {
        const params = { email: 'meudeusgabidenovonao', password: req.body.password }
        const result = await UserService.userExistsAndCheckPassword(params);
        expect(result).toBe(false)
    });

    test('Should return false if password is incorrect', async () => {
        const params = { email: req.body.email, password: 'naoacreditoleide' };
        try {
            await UserService.userExistsAndCheckPassword(params)
        } catch (error) {
            expect(error.message).toBe('As senhas não batem')
        }
    });

    test('Should return 200 for successful password change', async () => {
        const req = {
            userEmail: user.email
        }
        await UserController.changePassword(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({ message: 'ok' })
    });
})