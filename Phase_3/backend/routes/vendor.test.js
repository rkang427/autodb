const request = require('supertest');
const faker = require('faker');
const { generateVendorData } = require('./test/testUtils');

const { startServer, stopServer } = require('../server'); // Adjust the path as necessary

let server;

beforeAll(async () => {
  server = await startServer(4001); // Use a different port for tests
});

afterAll(async () => {
  await stopServer(server);
});

describe('Vendor API', () => {
  it('should create a vendor', async () => {
    const vendorData = generateVendorData();
    const response = await request(server).post('/vendor').send(vendorData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('name');
  });
});
