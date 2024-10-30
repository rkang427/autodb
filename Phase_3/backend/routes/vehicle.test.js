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

describe('Vehicle API', () => {
  it('should get a vehicle by vin', async () => {
    const knownVehicle = {
      vin: 'WXY93812083121111',
      vehicle_type: 'Van',
      manufacturer: 'Ford',
      model: 'Transit',
      description: 'Widget Nice Corp Delivery Van',
      model_year: 2022,
      fuel_type: 'Gas',
      horsepower: 200,
      purchase_price: '35000.00',
      total_parts_price: '0.00',
      customer_seller: '444555666',
      customer_buyer: null,
      inventory_clerk: 'ownerdoe',
      salesperson: null,
      sale_date: null,
      colors: 'Red, Blue',
      sale_price: '43750.00',
    };

    const response = await request(server).get(
      `/vehicle?vin=${knownVehicle.vin}`
    );

    expect(response.status).toBe(200);

    // Assert that the response body matches the known vehicle data
    const responseBody = response.body;

    for (const [key, value] of Object.entries(knownVehicle)) {
      expect(responseBody[key]).toEqual(value);
    }
  });
  it('should reject a too short vin', async () => {
    const knownVehicle = {
      vin: '2111',
    };
    const response = await request(server).get(
      `/vehicle?vin=${knownVehicle.vin}`
    );
    expect(response.status).toBe(400);
  });
  it('should reject a too long vin', async () => {
    const knownVehicle = {
      vin: '211aasdfsdsssssasdfdsssssdsfaasdffdd1',
    };
    const response = await request(server).get(
      `/vehicle?vin=${knownVehicle.vin}`
    );
    expect(response.status).toBe(400);
  });
  it('should reject a vin with spaces', async () => {
    const knownVehicle = {
      vin: 'WXY93812 83121111',
    };
    const response = await request(server).get(
      `/vehicle?vin=${knownVehicle.vin}`
    );
    expect(response.status).toBe(400);
  });
});

//200: I got your thing
//201: I created thing
