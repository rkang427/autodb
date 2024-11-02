const request = require('supertest');
const faker = require('faker');
const { startServer, stopServer } = require('../server'); // Adjust path if necessary

let server;
let sessionCookie; // To store session cookie after login

beforeAll(async () => {
  server = await startServer(4001); // Use a different port for tests
});

afterAll(async () => {
  await stopServer(server);
});

describe('Reports API with Authentication', () => {
  // Step 1: Log in before running the tests to get the session cookie
  beforeAll(async () => {
    const loginResponse = await request(server)
      .post('/auth/login')
      .send({ username: 'ownerdoe', password: 'password' }); // Replace with valid test credentials

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.headers['set-cookie']).toBeDefined();

    // Save the session cookie for subsequent authenticated requests
    sessionCookie = loginResponse.headers['set-cookie'].find((cookie) =>
      cookie.startsWith('connect.sid=')
    );
    expect(sessionCookie).toBeDefined();
  });

  it('should return parts statistics report with valid authentication', async () => {
    const response = await request(server)
      .get('/reports/part_statistics')
      .set('Cookie', sessionCookie); // Set session cookie for authentication

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array); // Assuming the report returns an array of results
  });

  it('should return price per condition report with valid authentication', async () => {
    const response = await request(server)
      .get('/reports/price_condition')
      .set('Cookie', sessionCookie); // Set session cookie for authentication

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array); // Adjust assertion based on actual response
  });

  it('should return avg time in inventory report with valid authentication', async () => {
    const response = await request(server)
      .get('/reports/avg_time_in_inventory')
      .set('Cookie', sessionCookie); // Set session cookie for authentication

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array); // Adjust assertion based on actual response
  });
});
