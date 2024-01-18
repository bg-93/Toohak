import request from 'sync-request-curl';
import { SERVER_URL, requestHelper } from '../testHelper';
import HTTPError from 'http-errors';

describe('error', () => {
  test('404', () => {
    expect(() => requestHelper('GET', '/thisRouteDoesNotExist', {})).toThrow(HTTPError[404]);
  });
});

describe('docs', () => {
  test('/docs', () => {
    expect(() => request('GET', SERVER_URL + '/', { timeout: 10000 })).not.toThrow(HTTPError[404]);
  });
});
