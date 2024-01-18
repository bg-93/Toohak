import {
  VALID_USER,
  INVALID_USER,
  SUCCESSFUL_LOGIN,
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  clear,
  INPUT_ERROR
} from '../testHelper';

import {
  AdminAuthRegisterReturn,
  AdminUserDetailsReturn
} from '../types';

import HTTPError from 'http-errors';

beforeEach(() => {
  clear();
});

describe('Testing adminAuthLogin', () => {
  const registeredIds: string[] = [];

  describe('Successful Login', () => {
    test.each([
      {
        testName: 'Single User',
        emailSuffix: '1',
        existingUsers: [1]
      },
      {
        testName: 'Two Users',
        emailSuffix: '1',
        existingUsers: [1, 2]
      },
      {
        testName: 'Second User',
        emailSuffix: '3',
        existingUsers: [1, 3]
      }
    ])('Test $#: $testName', ({ testName, emailSuffix, existingUsers }) => {
      existingUsers.forEach(userSuffix => {
        const { token } = adminAuthRegister(
          userSuffix + VALID_USER.EMAIL,
          VALID_USER.PASSWORD,
          VALID_USER.NAME_FIRST,
          VALID_USER.NAME_LAST
        ) as AdminAuthRegisterReturn;
        registeredIds[userSuffix] = token;
      });
      expect(adminAuthLogin(emailSuffix + VALID_USER.EMAIL, VALID_USER.PASSWORD)).toStrictEqual(SUCCESSFUL_LOGIN);
    });
  });

  describe('Invalid Login', () => {
    test.each([
      {
        testName: 'Email Address is incorrect',
        emailSuffix: '',
        password: VALID_USER.PASSWORD,
        existingUsers: [1]
      },
      {
        testName: 'Password is incorrect for given email',
        emailSuffix: '1',
        password: INVALID_USER.PASSWORD,
        existingUsers: [1, 2, 4]
      },
      {
        testName: 'Both email and password are incorrect',
        emailSuffix: '',
        password: INVALID_USER.PASSWORD,
        existingUsers: []
      },
    ])('Test $#: $testName', ({ testName, emailSuffix, password, existingUsers }) => {
      existingUsers.forEach(userSuffix => {
        const { token } = adminAuthRegister(
          userSuffix + VALID_USER.EMAIL,
          VALID_USER.PASSWORD,
          VALID_USER.NAME_FIRST,
          VALID_USER.NAME_LAST
        ) as AdminAuthRegisterReturn;
        registeredIds[userSuffix] = token;
      });
      expect(() => adminAuthLogin(emailSuffix + VALID_USER.EMAIL, password)).toThrow(HTTPError[INPUT_ERROR]);
    });
  });

  describe('Testing numSuccessfulLogins and numFailedPasswordsSinceLastLogin', () => {
    let user: AdminAuthRegisterReturn;
    let userDetails: AdminUserDetailsReturn;

    beforeEach(() => {
      user = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST) as AdminAuthRegisterReturn;
      userDetails = adminUserDetails(user.token) as AdminUserDetailsReturn;
    });

    test('One failed login', () => {
      expect(() => adminAuthLogin(userDetails.user.email, INVALID_USER.PASSWORD)).toThrow(HTTPError[INPUT_ERROR]);
      userDetails = adminUserDetails(user.token) as AdminUserDetailsReturn;
      expect(userDetails.user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
      expect(userDetails.user.numSuccessfulLogins).toStrictEqual(1);
    });

    test('Multiple failed logins', () => {
      for (let i = 1; i < 5; i++) {
        expect(() => adminAuthLogin(userDetails.user.email, INVALID_USER.PASSWORD)).toThrow(HTTPError[INPUT_ERROR]);
        userDetails = adminUserDetails(user.token) as AdminUserDetailsReturn;
        expect(userDetails.user.numSuccessfulLogins).toStrictEqual(1);
        expect(userDetails.user.numFailedPasswordsSinceLastLogin).toStrictEqual(i);
      }
    });

    test('Multiple successful logins', () => {
      for (let i = 1; i < 5; i++) {
        expect(adminAuthLogin(userDetails.user.email, VALID_USER.PASSWORD)).toStrictEqual(SUCCESSFUL_LOGIN);
        userDetails = adminUserDetails(user.token) as AdminUserDetailsReturn;
        expect(userDetails.user.numSuccessfulLogins).toStrictEqual(1 + i);
        expect(userDetails.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
      }
    });

    test('Failed logins followed by a successful login', () => {
      expect(() => adminAuthLogin(userDetails.user.email, INVALID_USER.PASSWORD)).toThrow(HTTPError[INPUT_ERROR]);
      expect(() => adminAuthLogin(userDetails.user.email, INVALID_USER.PASSWORD)).toThrow(HTTPError[INPUT_ERROR]);
      userDetails = adminUserDetails(user.token) as AdminUserDetailsReturn;
      expect(userDetails.user.numSuccessfulLogins).toStrictEqual(1);
      expect(userDetails.user.numFailedPasswordsSinceLastLogin).toStrictEqual(2);

      expect(adminAuthLogin(userDetails.user.email, VALID_USER.PASSWORD)).toStrictEqual(SUCCESSFUL_LOGIN);
      userDetails = adminUserDetails(user.token) as AdminUserDetailsReturn;
      expect(userDetails.user.numSuccessfulLogins).toStrictEqual(2);
      expect(userDetails.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });
  });
});
