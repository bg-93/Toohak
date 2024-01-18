import {
  VALID_USER,
  INVALID_USER,
  SUCCESSFUL_LOGIN,
  adminUserDetails,
  adminAuthRegister,
  adminAuthLogin,
  clear,
  INPUT_ERROR,
  UNAUTHORISED,
  oldRequestAdminUserDetails
} from '../testHelper';

import HTTPError from 'http-errors';

beforeEach(() => {
  clear();
});

describe('Testing adminUserDetails', () => {
  let token1: string;
  let token2: string;
  beforeEach(() => {
    token1 = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    token2 = adminAuthRegister('user2@example.com', 'cOOlO@55WarD', 'Abby', 'Lane').token;
  });

  test('Valid authUserId', () => {
    const expected1 = {
      user: {
        userId: expect.any(Number),
        name: 'John Doe',
        email: VALID_USER.EMAIL,
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 1,
      }
    };
    const expected2 = {
      user: {
        userId: expect.any(Number),
        name: 'Abby Lane',
        email: 'user2@example.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      }
    };
    expect(adminUserDetails(token2)).toStrictEqual(expected2);

    expect(adminAuthLogin(VALID_USER.EMAIL, VALID_USER.PASSWORD)).toStrictEqual(SUCCESSFUL_LOGIN);
    expect(() => adminAuthLogin(VALID_USER.EMAIL, INVALID_USER.PASSWORD)).toThrow(HTTPError[INPUT_ERROR]);
    expect(adminUserDetails(token1)).toStrictEqual(expected1);
  });

  test('authUserId is not a valid user', () => {
    expect(() => adminUserDetails(token1 + token2 + 10)).toThrow(HTTPError[UNAUTHORISED]);
    expect(() => adminUserDetails(token1 + token2)).toThrow(HTTPError[UNAUTHORISED]);
    clear();
    expect(() => adminUserDetails(token1)).toThrow(HTTPError[UNAUTHORISED]);
  });
});

describe('Old Testing adminUserDetails', () => {
  let token1: string;
  let token2: string;
  beforeEach(() => {
    token1 = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    token2 = adminAuthRegister('user2@example.com', 'cOOlO@55WarD', 'Abby', 'Lane').token;
  });

  test('Valid authUserId', () => {
    const expected1 = {
      user: {
        userId: expect.any(Number),
        name: 'John Doe',
        email: VALID_USER.EMAIL,
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 1,
      }
    };
    const expected2 = {
      user: {
        userId: expect.any(Number),
        name: 'Abby Lane',
        email: 'user2@example.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      }
    };
    expect(oldRequestAdminUserDetails(token2)).toStrictEqual(expected2);

    expect(adminAuthLogin(VALID_USER.EMAIL, VALID_USER.PASSWORD)).toStrictEqual(SUCCESSFUL_LOGIN);
    expect(() => adminAuthLogin(VALID_USER.EMAIL, INVALID_USER.PASSWORD)).toThrow(HTTPError[INPUT_ERROR]);
    expect(oldRequestAdminUserDetails(token1)).toStrictEqual(expected1);
  });

  test('authUserId is not a valid user', () => {
    expect(() => oldRequestAdminUserDetails(token1 + token2 + 10)).toThrow(HTTPError[UNAUTHORISED]);
    expect(() => oldRequestAdminUserDetails(token1 + token2)).toThrow(HTTPError[UNAUTHORISED]);
    clear();
    expect(() => oldRequestAdminUserDetails(token1)).toThrow(HTTPError[UNAUTHORISED]);
  });
});
