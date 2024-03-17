const { faker } = require('@faker-js/faker')
const { cpf } = require('cpf-cnpj-validator')
const jwt = require('jsonwebtoken');

const UserService = require('../../src/services/user-service')
const UserController = require('../../src/controllers/user-ctrl')
const User = require('../../src/schemas/User')
const prefixo = "integracao ";
const mongoose = require('mongoose');
require('dotenv').config();


const UserMock = {
    findOne: async () => null,
    findOneWithFoundUser: async () => ({ id: faker.database.mongodbObjectId() }),
    create: async () => ({ id: faker.database.mongodbObjectId() })
}

const user = {
    name: prefixo + faker.name.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    cpf: cpf.generate(),
}

describe('User Controller Tests', () => {
    beforeAll(async () => {
        mongoose.connect(process.env.MONGO_DB_BASE_URL);
        await User.deleteMany({ name: { $regex: prefixo } });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test('Should create a new user', async () => {
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

        await UserController.create(req, res)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalled()
    })

    test('Should return 400 for invalid email', async () => {
        const req = {
            body: {
                name: user.name,
                email: 'invalidemail.com', 
                password: 'password123'
            }
        }
        const res = {
            status: jest.fn(() => res),
            json: jest.fn()
        }

        user.email.isValid = jest.fn(() => false)

        await UserController.create(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith('Email inválido')
    })

    test('Should return 400 for missing password', async () => {
        const req = {
            body: {
                name: user.name,
                email: user.email,
            }
        }
        const res = {
            status: jest.fn(() => res),
            json: jest.fn()
        }

        await UserController.create(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith('Senha inválida')
    })

    test('Should return 500 for server error', async () => {
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

        jest.spyOn(UserService, "createUser").mockRejectedValue(new Error()); //Tive de simular um 'bug' no servidor
        const result = await UserController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith('Server Error');
    })
})