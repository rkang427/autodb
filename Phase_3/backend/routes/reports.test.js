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

describe('Reports API', () => {
  it('should return parts statistics report', async () => {
    const response = await request(server).get('/reports/part_statistics');
    expect(response.status).toBe(200);
  });
  it('should return price per condition report', async () => {
    const response = await request(server).get('/reports/price_condition');
    expect(response.status).toBe(200);
  });
  it('should return avg time in inventory report', async () => {
    const response = await request(server).get(
      '/reports/avg_time_in_inventory'
    );
    expect(response.status).toBe(200);
  });
});
