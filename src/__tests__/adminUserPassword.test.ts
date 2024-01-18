import {
  VALID_USER,
  VALID_USER_2,
  adminAuthRegister,
  adminUserPassword,
  clear,
  INPUT_ERROR,
  UNAUTHORISED,
  SUCCESSFUL_PASSWORD_CHANGE,
  oldRequestAdminUserPassword
} from '../testHelper';

import HTTPError from 'http-errors';

let token: string;

beforeEach(() => {
  clear();
  token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
});

describe('Testing adminUserPassword', () => {
  test('Test successful adminUserPassword', () => {
    const response = adminUserPassword(token, VALID_USER.PASSWORD, VALID_USER_2.PASSWORD);
    expect(response).toStrictEqual(SUCCESSFUL_PASSWORD_CHANGE);
  });

  test.each([
    ['Old Password is not the correct old password', 'WrongPass1', VALID_USER_2.PASSWORD],
    ['Old Password and New Password match exactly', VALID_USER.PASSWORD, VALID_USER.PASSWORD],
    ['New Password is less than 8 characters', VALID_USER.PASSWORD, 'sh0RT'],
    ['New Password does not contain at least one number', VALID_USER.PASSWORD, 'onlyLettErsPasswOrd'],
    ['New Password does not contain at least one letter', VALID_USER.PASSWORD, '1379111315171921'],
  ])('Test failure (status code: 400): %s', (testCaseName, oldPassword, newPassword) => {
    expect(() => adminUserPassword(token, oldPassword, newPassword)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): New Password has already been used before by this user', () => {
    expect(adminUserPassword(token, VALID_USER.PASSWORD, VALID_USER_2.PASSWORD)).toStrictEqual(SUCCESSFUL_PASSWORD_CHANGE);
    expect(() => adminUserPassword(token, VALID_USER_2.PASSWORD, VALID_USER.PASSWORD)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 401): Token is empty or invalid', () => {
    expect(() => adminUserPassword(token + 1, VALID_USER.PASSWORD, VALID_USER_2.PASSWORD)).toThrow(HTTPError[UNAUTHORISED]);
  });
});

describe('Old Testing adminUserPassword', () => {
  test('Test successful adminUserPassword', () => {
    const response = oldRequestAdminUserPassword(token, VALID_USER.PASSWORD, VALID_USER_2.PASSWORD);
    expect(response).toStrictEqual(SUCCESSFUL_PASSWORD_CHANGE);
  });

  test.each([
    ['Old Password is not the correct old password', 'WrongPass1', VALID_USER_2.PASSWORD],
    ['Old Password and New Password match exactly', VALID_USER.PASSWORD, VALID_USER.PASSWORD],
    ['New Password is less than 8 characters', VALID_USER.PASSWORD, 'sh0RT'],
    ['New Password does not contain at least one number', VALID_USER.PASSWORD, 'onlyLettErsPasswOrd'],
    ['New Password does not contain at least one letter', VALID_USER.PASSWORD, '1379111315171921'],
  ])('Test failure (status code: 400): %s', (testCaseName, oldPassword, newPassword) => {
    expect(() => oldRequestAdminUserPassword(token, oldPassword, newPassword)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): New Password has already been used before by this user', () => {
    expect(oldRequestAdminUserPassword(token, VALID_USER.PASSWORD, VALID_USER_2.PASSWORD)).toStrictEqual(SUCCESSFUL_PASSWORD_CHANGE);
    expect(() => oldRequestAdminUserPassword(token, VALID_USER_2.PASSWORD, VALID_USER.PASSWORD)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 401): Token is empty or invalid', () => {
    expect(() => oldRequestAdminUserPassword(token + 1, VALID_USER.PASSWORD, VALID_USER_2.PASSWORD)).toThrow(HTTPError[UNAUTHORISED]);
  });
});
