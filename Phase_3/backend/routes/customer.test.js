const request = require('supertest');
const faker = require('faker');
const { generateCustomerData } = require('./test/testUtils');
const { startServer, stopServer } = require('../server'); // Adjust the path as necessary
let server;
let cookie;
beforeAll(async () => {
  server = await startServer(4001); // Use a different port for tests
  // Log in and store the session cookie
  const loginResponse = await request(server)
    .post('/auth/login')
    .send({ username: 'ownerdoe', password: 'password' });
  expect(loginResponse.status).toBe(200); // Ensure login was successful
  cookie = loginResponse.headers['set-cookie'][0]; // Extract the cookie
});
afterAll(async () => {
  await stopServer(server);
});
describe('Customer API with Authentication', () => {
  it('should create a new individual customer', async () => {
    const customerData = generateCustomerData('i'); // Individual customer
    const response = await request(server)
      .post('/customer')
      .set('Cookie', cookie) // Set the authentication cookie
      .send(customerData);
    try {
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('tax_id');
    } catch (error) {
      console.error('Error in individual customer creation:', {
        status: response.status,
        body: JSON.stringify(response.body),
        error: error.message,
        customerData: customerData,
      });
      throw error; // Re-throw the error to fail the test
    }
    const response2 = await request(server)
      .get(`/customer?tax_id=${customerData.tax_id}`)
      .set('Cookie', cookie);
    try {
      expect(response2.status).toBe(200);
    } catch (error) {
      console.error('Error in retrieving individual customer:', {
        status: response2.status,
        body: JSON.stringify(response2.body),
        error: error.message,
        customerData: customerData,
      });
      throw error; // Re-throw the error to fail the test
    }
  });
  it('should create a new business customer', async () => {
    const customerData = generateCustomerData('b'); // Business customer
    const response = await request(server)
      .post('/customer')
      .set('Cookie', cookie)
      .send(customerData);
    try {
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('tax_id');
    } catch (error) {
      console.error('Error in business customer creation:', {
        status: response.status,
        body: JSON.stringify(response.body),
        error: error.message,
        customerData: customerData,
      });
      throw error; // Re-throw the error to fail the test
    }
    const response2 = await request(server)
      .get(`/customer?tax_id=${customerData.tax_id}`)
      .set('Cookie', cookie);
    try {
      expect(response2.status).toBe(200);
    } catch (error) {
      console.error('Error in retrieving business customer:', {
        status: response2.status,
        body: JSON.stringify(response2.body),
        error: error.message,
        customerData: customerData,
      });
      throw error; // Re-throw the error to fail the test
    }
  });
  it('should NOT create a duplicate business customer', async () => {
    const customerData = generateCustomerData('b'); // Business customer
    const response = await request(server)
      .post('/customer')
      .set('Cookie', cookie)
      .send(customerData);
    try {
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('tax_id');
    } catch (error) {
      console.error('Error in first business customer creation:', {
        status: response.status,
        body: JSON.stringify(response.body),
        error: error.message,
        customerData: customerData,
      });
      throw error; // Re-throw the error to fail the test
    }
    const response2 = await request(server)
      .post('/customer')
      .set('Cookie', cookie)
      .send(customerData);
    try {
      expect(response2.status).toBe(409);
    } catch (error) {
      console.error('Error in duplicate business customer creation:', {
        status: response2.status,
        body: JSON.stringify(response2.body),
        error: error.message,
        customerData: customerData,
      });
      throw error; // Re-throw the error to fail the test
    }
    const response3 = await request(server)
      .get(`/customer?tax_id=${customerData.tax_id}`)
      .set('Cookie', cookie);
    try {
      expect(response3.status).toBe(200);
    } catch (error) {
      console.error('Error in retrieving customer after duplicate attempt:', {
        status: response3.status,
        body: JSON.stringify(response3.body),
        error: error.message,
        customerData: customerData,
      });
      throw error; // Re-throw the error to fail the test
    }
  });
  it('should NOT create a customer missing fields', async () => {
    const response = await request(server)
      .post('/customer')
      .set('Cookie', cookie)
      .send({});
    try {
      expect(response.status).toBe(400);
    } catch (error) {
      console.error('Error in creating customer with missing fields:', {
        status: response.status,
        body: JSON.stringify(response.body),
        error: error.message,
      });
      throw error; // Re-throw the error to fail the test
    }
  });
});
