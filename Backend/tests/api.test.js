const request = require('supertest');
const app = require('../src/server');

describe('Health Check', () => {
  test('GET /api/health should return health status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('services');
  });
});

describe('Search Endpoints', () => {
  test('GET /api/search/tracks should require query parameter', async () => {
    const response = await request(app)
      .get('/api/search/tracks')
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('code', 'INVALID_QUERY');
  });

  test('GET /api/search/tracks with valid query should return results', async () => {
    const response = await request(app)
      .get('/api/search/tracks?q=test')
      .expect(200);

    expect(response.body).toHaveProperty('tracks');
    expect(response.body).toHaveProperty('pagination');
    expect(response.body).toHaveProperty('query', 'test');
    expect(Array.isArray(response.body.tracks)).toBe(true);
  });
});

describe('Track Endpoints', () => {
  test('GET /api/tracks/trending should return trending tracks', async () => {
    const response = await request(app)
      .get('/api/tracks/trending')
      .expect(200);

    expect(response.body).toHaveProperty('tracks');
    expect(response.body).toHaveProperty('platform');
    expect(Array.isArray(response.body.tracks)).toBe(true);
  });
});

describe('Error Handling', () => {
  test('GET /nonexistent should return 404', async () => {
    const response = await request(app)
      .get('/nonexistent')
      .expect(404);

    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('code', 'NOT_FOUND');
  });
});