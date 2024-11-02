const request = require('supertest');
const faker = require('faker');
const { generateVendorData } = require('./test/testUtils');
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
describe('Vendor API with Authentication', () => {
  it('should create a vendor', async () => {
    const vendorData = generateVendorData();
    const response = await request(server)
      .post('/vendor')
      .set('Cookie', cookie) // Set the authentication cookie
      .send(vendorData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('name');
    const response2 = await request(server)
      .get(`/vendor?name=${vendorData.name}`)
      .set('Cookie', cookie); // Use the cookie for the GET request
    expect(response2.status).toBe(200);
  });
  it('should NOT create a duplicate vendor', async () => {
    const vendorData = generateVendorData();
    const response = await request(server)
      .post('/vendor')
      .set('Cookie', cookie)
      .send(vendorData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('name');
    const response2 = await request(server)
      .post('/vendor')
      .set('Cookie', cookie)
      .send(vendorData);
    expect(response2.status).toBe(409);
    const response3 = await request(server)
      .get(`/vendor?name=${vendorData.name}`)
      .set('Cookie', cookie);
    expect(response3.status).toBe(200);
  });
  it('should NOT create a vendor missing fields', async () => {
    const response = await request(server)
      .post('/vendor')
      .set('Cookie', cookie)
      .send({});
    expect(response.status).toBe(400);
  });
});
// TODO: Once we have Vehicle API, create/generate vehicle instead of hardcode vin :)
describe('Parts Order API with Authentication', () => {
  it('should create a Parts Order and Vendor', async () => {
    const vendorData = generateVendorData();
    const response = await request(server)
      .post('/vendor')
      .set('Cookie', cookie)
      .send(vendorData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('name');
    const vin = 'WXY93812083121111';
    const partsOrderData = { vin: vin, vendor_name: vendorData.name };
    const response2 = await request(server)
      .post(`/partsorder`)
      .set('Cookie', cookie)
      .send(partsOrderData);
    expect(response2.status).toBe(201);
  });
});
