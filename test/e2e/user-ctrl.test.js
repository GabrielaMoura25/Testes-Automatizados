const superRequest = require('supertest')
const { faker } = require('@faker-js/faker')
const mongoose = require('mongoose')
const User = require('../../src/schemas/User')
const app = require('../../src/app')
require('dotenv').config()
const prefixo = "fake ";
userMock = {
  name: prefixo + faker.name.firstName(),
  email: faker.internet.email(),
  password: faker.internet.password()
}

describe('[e2e] Create user tests', () => {
  beforeAll(async () => {
    mongoose.connect(process.env.MONGO_DB_URL);
    await User.deleteMany({ name: { $regex: prefixo } });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('Should return status 201 when a new user is created', async () => {
    const res = await superRequest(app).post('/user').send(userMock);
    expect(res.status).toBe(201);
  });

  test("Should must return a body with the 'id' property", async () => {
    const res = await superRequest(app).post('/user').send(userMock);
    expect(res.body).toHaveProperty('id');
  });

  test('Should return status 400 when an missing password is provided', async () => {
    const usr = { ...userMock }
    delete usr.password;
    const res = await superRequest(app).post('/user').send(usr);
    expect(res.status).toBe(400);
  });

  test("Should return message 'Senha inválida' when an missing password is provided", async () => {
    const usr = { ...userMock }
    delete usr.password;
    const res = await superRequest(app).post('/user').send(usr);
    expect(res.body).toBe("Senha inválida");
  });

  test('Should return status 400 when an missing email is provided', async () => {
    const usr = { ...userMock }
    delete usr.email;
    const res = await superRequest(app).post('/user').send(usr);
    expect(res.status).toBe(400);
  });

  test("Should return message 'Email inválido' when an missing email is provided", async () => {
    const usr = { ...userMock }
    delete usr.email;
    const res = await superRequest(app).post('/user').send(usr);
    expect(res.body).toBe('Email inválido');
  });

  test("Should return status 500 and message 'Server Error' when an unknown error occurs", async () => {
    jest.spyOn(User, "create").mockRejectedValue(new Error()); //Tive de simular um 'bug' no servidor
    const res = await superRequest(app).post('/user').send(userMock);
    expect(res.status).toBe(500)
    expect(res.body).toBe('Server Error');
  });

})