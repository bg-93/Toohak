import {
  VALID_USER,
  VALID_QUIZ,
  INVALID_QUIZ,
  SUCCESSFUL_QUIZ_CREATION,
  adminAuthRegister,
  adminQuizCreate,
  clear,
  INPUT_ERROR,
  UNAUTHORISED,
  oldRequestAdminQuizCreate,
} from '../testHelper';

import HTTPError from 'http-errors';

let token1: string;

beforeEach(() => {
  clear();
  token1 = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
});

describe('Testing adminQuizCreate', () => {
  describe('Valid Creation', () => {
    test.each([
      {
        testName: 'Valid Registration',
        name: VALID_QUIZ.NAME,
        description: VALID_QUIZ.DESCRIPTION
      },
      {
        testName: 'Valid Registration with space in name',
        name: 'Quiz 1',
        description: VALID_QUIZ.DESCRIPTION
      },
      {
        testName: 'Valid Registration with empty description',
        name: VALID_QUIZ.NAME,
        description: ''
      }
    ])("Test $#: '$testName'", ({ testName, name, description }) => {
      expect(adminQuizCreate(token1, name, description)).toStrictEqual(SUCCESSFUL_QUIZ_CREATION);
    });
  });

  describe('Invalid AuthUserId', () => {
    test('AuthUserId is invalid', () => {
      const invalidAuthUserId = token1 + 1;
      expect(() => adminQuizCreate(invalidAuthUserId, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION)).toThrow(HTTPError[UNAUTHORISED]);
    });
  });

  describe('Invalid name', () => {
    test.each([
      {
        testName: 'Invalid name with symbols',
        name: 'Quiz@1',
        description: VALID_QUIZ.DESCRIPTION
      },
      {
        testName: 'Invalid name with less than 3 characters',
        name: 'Q1',
        description: VALID_QUIZ.DESCRIPTION
      },
      {
        testName: 'Invalid name with more than 30 characters',
        name: 'Quiz1Quiz1Quiz1Quiz1Quiz1Quiz11',
        description: VALID_QUIZ.DESCRIPTION
      }
    ])("Test $#: '$testName'", ({ name, description }) => {
      expect(() => adminQuizCreate(token1, name, description)).toThrow(HTTPError[INPUT_ERROR]);
    });

    test('Name is already used by the current logged in user for another quiz', () => {
      adminQuizCreate(token1, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION);
      expect(() => adminQuizCreate(token1, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION)).toThrow(HTTPError[INPUT_ERROR]);
    });
  });

  describe('Invalid description', () => {
    test('Description with 107 characters', () => {
      expect(() => adminQuizCreate(token1, VALID_QUIZ.NAME, INVALID_QUIZ.DESCRIPTION)).toThrow(HTTPError[INPUT_ERROR]);
    });
  });
});

describe('Old Testing adminQuizCreate', () => {
  describe('Valid Creation', () => {
    test.each([
      {
        testName: 'Valid Registration',
        name: VALID_QUIZ.NAME,
        description: VALID_QUIZ.DESCRIPTION
      },
      {
        testName: 'Valid Registration with space in name',
        name: 'Quiz 1',
        description: VALID_QUIZ.DESCRIPTION
      },
      {
        testName: 'Valid Registration with empty description',
        name: VALID_QUIZ.NAME,
        description: ''
      }
    ])("Test $#: '$testName'", ({ testName, name, description }) => {
      expect(oldRequestAdminQuizCreate(token1, name, description)).toStrictEqual(SUCCESSFUL_QUIZ_CREATION);
    });
  });

  describe('Invalid AuthUserId', () => {
    test('AuthUserId is invalid', () => {
      const invalidAuthUserId = token1 + 1;
      expect(() => oldRequestAdminQuizCreate(invalidAuthUserId, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION)).toThrow(HTTPError[UNAUTHORISED]);
    });
  });

  describe('Invalid name', () => {
    test.each([
      {
        testName: 'Invalid name with symbols',
        name: 'Quiz@1',
        description: VALID_QUIZ.DESCRIPTION
      },
      {
        testName: 'Invalid name with less than 3 characters',
        name: 'Q1',
        description: VALID_QUIZ.DESCRIPTION
      },
      {
        testName: 'Invalid name with more than 30 characters',
        name: 'Quiz1Quiz1Quiz1Quiz1Quiz1Quiz11',
        description: VALID_QUIZ.DESCRIPTION
      }
    ])("Test $#: '$testName'", ({ name, description }) => {
      expect(() => oldRequestAdminQuizCreate(token1, name, description)).toThrow(HTTPError[INPUT_ERROR]);
    });

    test('Name is already used by the current logged in user for another quiz', () => {
      oldRequestAdminQuizCreate(token1, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION);
      expect(() => oldRequestAdminQuizCreate(token1, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION)).toThrow(HTTPError[INPUT_ERROR]);
    });
  });

  describe('Invalid description', () => {
    test('Description with 107 characters', () => {
      expect(() => oldRequestAdminQuizCreate(token1, VALID_QUIZ.NAME, INVALID_QUIZ.DESCRIPTION)).toThrow(HTTPError[INPUT_ERROR]);
    });
  });
});
