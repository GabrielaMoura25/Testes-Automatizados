const jwt = require('jsonwebtoken');
const SessionService = require('../../src/services/session-service');

require('dotenv').config(); 

describe('SessionService', () => {
  test('should generate a valid token', () => {
    const secretKey = process.env.SECRET_KEY || 'default_secret_key'; 
    const email = 'equipe.ada@gmail.com';
    const token = SessionService.generateToken({ email });
    const decodedToken = jwt.verify(token, secretKey);
    expect(decodedToken.email).toBe(email);
  });
  test('should throw an error if SECRET_KEY is not provided', () => {
    const originalSecretKey = process.env.SECRET_KEY;
    delete process.env.SECRET_KEY;
  
    const email = 'equipe.ada@gmail.com';
  
    expect(() => {
      SessionService.generateToken({ email });
    }).toThrow('secretOrPrivateKey must have a value');
  
    process.env.SECRET_KEY = originalSecretKey;
  });

});
