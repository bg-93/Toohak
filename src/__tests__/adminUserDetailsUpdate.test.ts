import {
  clear,
  adminAuthRegister,
  adminUserDetailsUpdate,
  adminUserDetails,
  VALID_USER,
  INVALID_USER,
  SUCCESSFUL_USER_DETAILS_UPDATE,
  UNAUTHORISED,
  INPUT_ERROR,
  VALID_USER_2,
  INVALID_NAME,
  SHORT_NAME,
  LONG_NAME,
  oldRequestAdminUserDetailsUpdate
} from '../testHelper';

import HTTPError from 'http-errors';

import {
  AdminAuthRegisterReturn,
} from '../types';

let token: string;

beforeEach(() => {
  clear();
  token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
});

describe('Testing adminUserDetailsUpdate', () => {
  test('Success Case', () => {
    let userDetails = adminUserDetails(token);
    expect(userDetails.user.name).toStrictEqual(VALID_USER.NAME_FIRST + ' ' + VALID_USER.NAME_LAST);
    expect(userDetails.user.email).toStrictEqual(VALID_USER.EMAIL);

    expect(adminUserDetailsUpdate(token, VALID_USER_2.EMAIL, 'Hayden', 'Smith')).toStrictEqual(SUCCESSFUL_USER_DETAILS_UPDATE);

    userDetails = adminUserDetails(token);
    expect(userDetails.user.name).toStrictEqual('Hayden Smith');
    expect(userDetails.user.email).toStrictEqual(VALID_USER_2.EMAIL);
  });

  test('Test failure (status code: 400): Invalid Email', () => {
    expect(() => adminUserDetailsUpdate(token, INVALID_USER.EMAIL, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): NameFirst has invalid characters', () => {
    expect(() => adminUserDetailsUpdate(token, VALID_USER.EMAIL, INVALID_NAME, VALID_USER.NAME_LAST)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): NameFirst is too long', () => {
    expect(() => adminUserDetailsUpdate(token, VALID_USER.EMAIL, LONG_NAME, VALID_USER.NAME_LAST)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): NameFirst is too short', () => {
    expect(() => adminUserDetailsUpdate(token, VALID_USER.EMAIL, SHORT_NAME, VALID_USER.NAME_LAST)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): NameLast has invalid characters', () => {
    expect(() => adminUserDetailsUpdate(token, VALID_USER.EMAIL, VALID_USER.NAME_FIRST, INVALID_NAME)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): NameLast is too long', () => {
    expect(() => adminUserDetailsUpdate(token, VALID_USER.EMAIL, VALID_USER.NAME_FIRST, LONG_NAME)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): NameLast is too short', () => {
    expect(() => adminUserDetailsUpdate(token, VALID_USER.EMAIL, VALID_USER.NAME_FIRST, SHORT_NAME)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 401): Invalid Token', () => {
    expect(() => adminUserDetailsUpdate(token + 1, VALID_USER.EMAIL, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST)).toThrow(HTTPError[UNAUTHORISED]);
  });

  test('Test failure (status code: 400): Email is already in use', () => {
    adminAuthRegister(VALID_USER_2.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST) as AdminAuthRegisterReturn;
    expect(() => adminUserDetailsUpdate(token, VALID_USER_2.EMAIL, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST)).toThrow(HTTPError[INPUT_ERROR]);
  });
});

describe('Old Testing adminUserDetailsUpdate', () => {
  test('Success Case', () => {
    let userDetails = adminUserDetails(token);
    expect(userDetails.user.name).toStrictEqual(VALID_USER.NAME_FIRST + ' ' + VALID_USER.NAME_LAST);
    expect(userDetails.user.email).toStrictEqual(VALID_USER.EMAIL);

    expect(oldRequestAdminUserDetailsUpdate(token, VALID_USER_2.EMAIL, 'Hayden', 'Smith')).toStrictEqual(SUCCESSFUL_USER_DETAILS_UPDATE);

    userDetails = adminUserDetails(token);
    expect(userDetails.user.name).toStrictEqual('Hayden Smith');
    expect(userDetails.user.email).toStrictEqual(VALID_USER_2.EMAIL);
  });

  test('Test failure (status code: 400): Invalid Email', () => {
    expect(() => oldRequestAdminUserDetailsUpdate(token, INVALID_USER.EMAIL, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): NameFirst has invalid characters', () => {
    expect(() => oldRequestAdminUserDetailsUpdate(token, VALID_USER.EMAIL, INVALID_NAME, VALID_USER.NAME_LAST)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): NameFirst is too long', () => {
    expect(() => oldRequestAdminUserDetailsUpdate(token, VALID_USER.EMAIL, LONG_NAME, VALID_USER.NAME_LAST)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): NameFirst is too short', () => {
    expect(() => oldRequestAdminUserDetailsUpdate(token, VALID_USER.EMAIL, SHORT_NAME, VALID_USER.NAME_LAST)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): NameLast has invalid characters', () => {
    expect(() => oldRequestAdminUserDetailsUpdate(token, VALID_USER.EMAIL, VALID_USER.NAME_FIRST, INVALID_NAME)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): NameLast is too long', () => {
    expect(() => oldRequestAdminUserDetailsUpdate(token, VALID_USER.EMAIL, VALID_USER.NAME_FIRST, LONG_NAME)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): NameLast is too short', () => {
    expect(() => oldRequestAdminUserDetailsUpdate(token, VALID_USER.EMAIL, VALID_USER.NAME_FIRST, SHORT_NAME)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 401): Invalid Token', () => {
    expect(() => oldRequestAdminUserDetailsUpdate(token + 1, VALID_USER.EMAIL, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST)).toThrow(HTTPError[UNAUTHORISED]);
  });

  test('Test failure (status code: 400): Email is already in use', () => {
    adminAuthRegister(VALID_USER_2.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST) as AdminAuthRegisterReturn;
    expect(() => oldRequestAdminUserDetailsUpdate(token, VALID_USER_2.EMAIL, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST)).toThrow(HTTPError[INPUT_ERROR]);
  });
});
