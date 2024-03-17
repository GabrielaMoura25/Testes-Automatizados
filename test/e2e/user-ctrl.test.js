require('dotenv').config()
const app = require('../../src/app')
const { faker } = require('@faker-js/faker')
const mongoose = require('mongoose')
const superRequest = require('supertest')
const User = require('../../src/schemas/User')

const prefixo = "fake ";

userMock = {
  name: prefixo + faker.name.firstName(),
  email: faker.internet.email(),
  password: faker.internet.password()
}

describe('[e2e] Create user tests', () => {
  beforeAll(async () => {
    mongoose.connect(process.env.MONGO_DB_URL);
    await User.deleteMany({ name: { $regex: prefixo } }); // Apaga só os documentos gerados a partir desses destes
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test("Should return status 201 and response body has 'id' property when a new user is created", async () => {
    const res = await superRequest(app).post('/user').send(userMock);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  test("Should return message 'Senha inválida' when a missing password is provided", async () => {
    const usr = { ...userMock }
    delete usr.password;
    const res = await superRequest(app).post('/user').send(usr);
    expect(res.status).toBe(400);
    expect(res.body).toBe("Senha inválida");
  });

  test('Should return status 400 when a missing email is provided', async () => {
    const usr = { ...userMock }
    delete usr.email;
    const res = await superRequest(app).post('/user').send(usr);
    expect(res.status).toBe(400);
  });

  test("Should return message 'Email inválido' when a invalid email is provided", async () => {
    const usr = { ...userMock }
    usr.email = "inváli.mail@*.test";
    const res = await superRequest(app).post('/user').send(usr);
    expect(res.body).toBe('Email inválido');
  });

  test("Should return status 500 and message 'Server Error' when an unknown error occurs", async () => {
    jest.spyOn(User, "create").mockRejectedValue(new Error()); //Tive de simular um 'bug' sem 'message' no servidor
    const res = await superRequest(app).post('/user').send(userMock);
    expect(res.status).toBe(500)
    expect(res.body).toBe('Server Error');
  });

})