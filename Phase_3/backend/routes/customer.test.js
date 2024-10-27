const request = require('supertest');
const faker = require('faker');
const { generateCustomerData } = require('./test/testUtils');

const { startServer, stopServer } = require('../server'); // Adjust the path as necessary

let server;

beforeAll(async () => {
  server = await startServer(4001); // Use a different port for tests
});

afterAll(async () => {
  await stopServer(server);
});

describe('Customer API', () => {
  it('should create a new individual customer', async () => {
    const customerData = generateCustomerData('i'); // Individual customer
    const response = await request(server).post('/customer').send(customerData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('tax_id');
    const response2 = await request(server).get(
      `/customer?tax_id=${customerData.tax_id}`
    );
    expect(response2.status).toBe(200);
  });

  it('should create a new business customer', async () => {
    const customerData = generateCustomerData('b'); // Business customer
    expect(customerData.business_name).not.toBe(null);
    expect(customerData.title).not.toBe(null);
    const response = await request(server).post('/customer').send(customerData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('tax_id');
    const response2 = await request(server).get(
      `/customer?tax_id=${customerData.tax_id}`
    );
    expect(response2.status).toBe(200);
  });

  it('should NOT create a duplicate business customer', async () => {
    const customerData = generateCustomerData('b'); // Business customer
    expect(customerData.business_name).not.toBe(null);
    expect(customerData.title).not.toBe(null);
    const response = await request(server).post('/customer').send(customerData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('tax_id');
    const response2 = await request(server)
      .post('/customer')
      .send(customerData);
    expect(response2.status).toBe(409);
    const response3 = await request(server).get(
      `/customer?tax_id=${customerData.tax_id}`
    );
    expect(response3.status).toBe(200);
  });

  it('should NOT create a customer missing feilds', async () => {
    const response = await request(server).post('/customer').send({});
    expect(response.status).toBe(400);
  });
});
