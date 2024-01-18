import {
  VALID_USER,
  SUCCESSFUL_REGISTRATION,
  clear,
  adminAuthRegister
} from '../testHelper';

import HTTPError from 'http-errors';
import { INPUT_ERROR } from '../testHelper';

beforeEach(() => {
  clear();
});

describe('Testing adminAuthRegister', () => {
  describe('Valid Registration', () => {
    test.each([
      {
        testName: 'Valid Registration',
        email: VALID_USER.EMAIL,
        password: VALID_USER.PASSWORD,
        nameFirst: VALID_USER.NAME_FIRST,
        nameLast: VALID_USER.NAME_LAST
      },
      {
        testName: 'Valid nameFirst with hyphen',
        email: VALID_USER.EMAIL,
        password: VALID_USER.PASSWORD,
        nameFirst: 'J-hn',
        nameLast: VALID_USER.NAME_LAST
      },
      {
        testName: 'Valid nameFirst with apostrophe',
        email: VALID_USER.EMAIL,
        password: VALID_USER.PASSWORD,
        nameFirst: "J'hn",
        nameLast: VALID_USER.NAME_LAST
      },
      {
        testName: 'Valid nameLast with hyphen',
        email: VALID_USER.EMAIL,
        password: VALID_USER.PASSWORD,
        nameFirst: VALID_USER.NAME_FIRST,
        nameLast: 'D-e'
      },
      {
        testName: 'Valid nameLast with apostrophe',
        email: VALID_USER.EMAIL,
        password: VALID_USER.PASSWORD,
        nameFirst: VALID_USER.NAME_FIRST,
        nameLast: "D'e"
      }
    ])('Test $#: $testName', ({ testName, email, password, nameFirst, nameLast }) => {
      expect(adminAuthRegister(email, password, nameFirst, nameLast)).toStrictEqual(SUCCESSFUL_REGISTRATION);
      expect(() => adminAuthRegister(email, password, nameFirst, nameLast)).toThrow(HTTPError[INPUT_ERROR]);
    });
  });

  describe('Invalid First Name', () => {
    test.each([
      {
        testName: 'Invalid first name with numbers',
        email: VALID_USER.EMAIL,
        password: VALID_USER.PASSWORD,
        nameFirst: 'J0hn',
        nameLast: VALID_USER.NAME_LAST
      },
      {
        testName: "Invalid first name that's too long",
        email: VALID_USER.EMAIL,
        password: VALID_USER.PASSWORD,
        nameFirst: 'JohnathanFrederickLeonardoDecaprio',
        nameLast: VALID_USER.NAME_LAST
      },
      {
        testName: "Invalid first name that's too short",
        email: VALID_USER.EMAIL,
        password: VALID_USER.PASSWORD,
        nameFirst: 'J',
        nameLast: VALID_USER.NAME_LAST
      },
    ])('Test $#: $testName', ({ testName, email, password, nameFirst, nameLast }) => {
      expect(() => adminAuthRegister(email, password, nameFirst, nameLast)).toThrow(HTTPError[INPUT_ERROR]);
    });
  });

  describe('Invalid Last Name', () => {
    test.each([
      {
        testName: 'Invalid last name with numbers',
        email: VALID_USER.EMAIL,
        password: VALID_USER.PASSWORD,
        nameFirst: VALID_USER.NAME_FIRST,
        nameLast: 'D0e'
      },
      {
        testName: "Invalid last name that's too long",
        email: VALID_USER.EMAIL,
        password: VALID_USER.PASSWORD,
        nameFirst: VALID_USER.NAME_FIRST,
        nameLast: 'JohnathanFrederickLeonardoDecaprio'
      },
      {
        testName: "Invalid last name that's too short",
        email: VALID_USER.EMAIL,
        password: VALID_USER.PASSWORD,
        nameFirst: VALID_USER.NAME_FIRST,
        nameLast: 'D'
      }
    ])('Test $#: $testName', ({ testName, email, password, nameFirst, nameLast }) => {
      expect(() => adminAuthRegister(email, password, nameFirst, nameLast)).toThrow(HTTPError[INPUT_ERROR]);
    });
  });

  describe('Invalid Email', () => {
    test.each([
      {
        testName: "Invalid email without '@'",
        email: 'email.gmail.com',
        password: VALID_USER.PASSWORD,
        nameFirst: VALID_USER.NAME_FIRST,
        nameLast: VALID_USER.NAME_LAST
      },
      {
        testName: 'Invalid email without domain',
        email: 'email',
        password: VALID_USER.PASSWORD,
        nameFirst: VALID_USER.NAME_FIRST,
        nameLast: VALID_USER.NAME_LAST
      },
      {
        testName: "Invalid email without '.com'",
        email: 'email@gmail',
        password: VALID_USER.PASSWORD,
        nameFirst: VALID_USER.NAME_FIRST,
        nameLast: VALID_USER.NAME_LAST
      },
    ])('Test $#: $testName', ({ testName, email, password, nameFirst, nameLast }) => {
      expect(() => adminAuthRegister(email, password, nameFirst, nameLast)).toThrow(HTTPError[INPUT_ERROR]);
    });

    test('Email address is used by another user', () => {
      adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST);
      expect(() => adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST)).toThrow(HTTPError[INPUT_ERROR]);
    });
  });

  describe('Invalid Passwords', () => {
    test.each([
      {
        testName: "Invalid password that's too short with mixed characters",
        email: VALID_USER.EMAIL,
        password: '123Abc',
        nameFirst: VALID_USER.NAME_FIRST,
        nameLast: VALID_USER.NAME_LAST
      },
      {
        testName: "Invalid password that's numeric only",
        email: VALID_USER.EMAIL,
        password: '123456789',
        nameFirst: VALID_USER.NAME_FIRST,
        nameLast: VALID_USER.NAME_LAST
      },
      {
        testName: "Invalid password that's alphabetic only",
        email: VALID_USER.EMAIL,
        password: 'abcdefghi',
        nameFirst: VALID_USER.NAME_FIRST,
        nameLast: VALID_USER.NAME_LAST
      }
    ])('Test $#: $testName', ({ testName, email, password, nameFirst, nameLast }) => {
      expect(() => adminAuthRegister(email, password, nameFirst, nameLast)).toThrow(HTTPError[INPUT_ERROR]);
    });
  });
});
