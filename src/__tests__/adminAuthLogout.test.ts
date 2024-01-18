import {
  clear,
  adminAuthRegister,
  adminAuthLogout,
  adminUserDetails,
  VALID_USER,
  SUCCESSFUL_LOGOUT,
  UNAUTHORISED,
  oldRequestAdminAuthLogout
} from '../testHelper';

import HTTPError from 'http-errors';

const expectedDetails = {
  user: {
    userId: expect.any(Number),
    name: expect.any(String),
    email: expect.any(String),
    numSuccessfulLogins: expect.any(Number),
    numFailedPasswordsSinceLastLogin: expect.any(Number)
  }
};

let token1: string;

beforeEach(() => {
  clear();
  token1 = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
});

describe('Testing adminAuthLogout', () => {
  describe('Testing from Register', () => {
    test('Success Case', () => {
      expect(adminUserDetails(token1)).toStrictEqual(expectedDetails);
      const bodyObj = adminAuthLogout(token1);
      expect(bodyObj).toStrictEqual(SUCCESSFUL_LOGOUT);
      expect(() => adminUserDetails(token1)).toThrow(HTTPError[UNAUTHORISED]);
    });

    test('Testing failure (status code: 401): Invalid token', () => {
      expect(() => adminAuthLogout(token1 + 1)).toThrow(HTTPError[UNAUTHORISED]);
    });
  });
});

describe('Old Testing adminAuthLogout', () => {
  describe('Testing from Register', () => {
    test('Success Case', () => {
      expect(adminUserDetails(token1)).toStrictEqual(expectedDetails);
      const bodyObj = oldRequestAdminAuthLogout(token1);
      expect(bodyObj).toStrictEqual(SUCCESSFUL_LOGOUT);
      expect(() => adminUserDetails(token1)).toThrow(HTTPError[UNAUTHORISED]);
    });

    test('Testing failure (status code: 401): Invalid token', () => {
      expect(() => oldRequestAdminAuthLogout(token1 + 1)).toThrow(HTTPError[UNAUTHORISED]);
    });
  });
});
