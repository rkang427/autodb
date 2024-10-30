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
    const response2 = await request(server).get(
      `/vendor?name=${vendorData.name}`
    );
    expect(response2.status).toBe(200);
  });
  it('should NOT create a duplicate vendor', async () => {
    const vendorData = generateVendorData();
    const response = await request(server).post('/vendor').send(vendorData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('name');
    const response2 = await request(server).post('/vendor').send(vendorData);
    expect(response2.status).toBe(409);
    const response3 = await request(server).get(
      `/vendor?name=${vendorData.name}`
    );
    expect(response3.status).toBe(200);
  });
  it('should NOT create a vendor missing feilds', async () => {
    const response = await request(server).post('/vendor').send({});
    expect(response.status).toBe(400);
  });
});

//TODO: Once we have Vehicle API, create/generate vehicle instead of hardcode vin :)
describe('Parts Order API', () => {
  it('should create a Parts Order and Vendor', async () => {
    const vendorData = generateVendorData();
    const response = await request(server).post('/vendor').send(vendorData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('name');
    const vin = 'WXY93812083121111';
    const partsOrderData = { vin: vin, vendor_name: vendorData.name };

    const response2 = await request(server)
      .post(`/partsorder`)
      .send(partsOrderData);
    expect(response2.status).toBe(201);
  });
});

//200: I got your thing
//201: I created thing
