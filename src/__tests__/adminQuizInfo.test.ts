import {
  VALID_USER,
  VALID_QUIZ,
  adminQuizInfo,
  adminQuizCreate,
  adminAuthRegister,
  clear,
  SUCCESSFUL_QUIZ_INFO,
  UNAUTHORISED,
  FORBIDDEN,
  oldRequestAdminQuizInfo,
} from '../testHelper';

import HTTPError from 'http-errors';

beforeEach(() => {
  clear();
});

describe('Testing adminQuizInfo', () => {
  describe('Valid Testing', () => {
    test.each([
      {
        testName: 'returns quiz info',
        authEmail: 'jordanzhu@gmail.com',
        authPassword: 'jordzhu123',
        authFirstName: 'Jordan',
        authLastName: 'Zhu',
        quizName: 'QuizName1',
        timeCreated: 1234,
        timeLastEdited: 12346,
        quizDescription: 'oldQuizDescription1'
      },
      {
        testName: 'returns quiz info',
        authEmail: 'borbrienzeng@gmail.com',
        authPassword: 'borbrienzeng123',
        authFirstName: 'Borbrien',
        authLastName: 'Zeng',
        quizName: 'QuizName2',
        timeCreated: 1235,
        timeLastEdited: 12346,
        quizDescription: 'oldQuizDescription2'
      },
      {
        testName: 'returns quiz info',
        authEmail: 'henrikchan@gmail.com',
        authPassword: 'henriktran123',
        authFirstName: 'Henrik',
        authLastName: 'Chan',
        quizName: 'QuizName3',
        timeCreated: 12345,
        timeLastEdited: 12346,
        quizDescription: 'oldQuizDescription3'
      }
    ])('Test $#: $testName', ({ testName, authEmail, authPassword, authFirstName, authLastName, quizName, quizDescription }) => {
      const token1 = adminAuthRegister(authEmail, authPassword, authFirstName, authLastName).token;
      const quizId = adminQuizCreate(token1, quizName, quizDescription).quizId;

      adminQuizInfo(token1, quizId);
      expect(adminQuizInfo(token1, quizId)).toEqual(SUCCESSFUL_QUIZ_INFO);
    });
  });

  describe('Invalid Testing', () => {
    let token2: string;
    let quizId1: number;

    beforeEach(() => {
      token2 = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
      quizId1 = adminQuizCreate(token2, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    });

    test('Invalid authUserId', () => {
      expect(() => adminQuizInfo(token2 + 1, quizId1)).toThrow(HTTPError[UNAUTHORISED]);
    });

    test('Invalid quizId', () => {
      expect(() => adminQuizInfo(token2, quizId1 + 1)).toThrow(HTTPError[FORBIDDEN]);
    });

    test('Quiz does not belong to user', () => {
      const token3 = adminAuthRegister('borbrien@gmail.com', VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
      const quizId2 = adminQuizCreate(token3, 'Borbriens Quiz', VALID_QUIZ.DESCRIPTION).quizId;
      expect(() => adminQuizInfo(token2, quizId2)).toThrow(HTTPError[FORBIDDEN]);
      expect(() => adminQuizInfo(token3, quizId1)).toThrow(HTTPError[FORBIDDEN]);
    });
  });
});

describe('Old Testing adminQuizInfo', () => {
  describe('Valid Testing', () => {
    test.each([
      {
        testName: 'returns quiz info',
        authEmail: 'jordanzhu@gmail.com',
        authPassword: 'jordzhu123',
        authFirstName: 'Jordan',
        authLastName: 'Zhu',
        quizName: 'QuizName1',
        timeCreated: 1234,
        timeLastEdited: 12346,
        quizDescription: 'oldQuizDescription1'
      },
      {
        testName: 'returns quiz info',
        authEmail: 'borbrienzeng@gmail.com',
        authPassword: 'borbrienzeng123',
        authFirstName: 'Borbrien',
        authLastName: 'Zeng',
        quizName: 'QuizName2',
        timeCreated: 1235,
        timeLastEdited: 12346,
        quizDescription: 'oldQuizDescription2'
      },
      {
        testName: 'returns quiz info',
        authEmail: 'henrikchan@gmail.com',
        authPassword: 'henriktran123',
        authFirstName: 'Henrik',
        authLastName: 'Chan',
        quizName: 'QuizName3',
        timeCreated: 12345,
        timeLastEdited: 12346,
        quizDescription: 'oldQuizDescription3'
      }
    ])('Test $#: $testName', ({ testName, authEmail, authPassword, authFirstName, authLastName, quizName, quizDescription }) => {
      const token1 = adminAuthRegister(authEmail, authPassword, authFirstName, authLastName).token;
      const quizId = adminQuizCreate(token1, quizName, quizDescription).quizId;

      expect(oldRequestAdminQuizInfo(token1, quizId)).toEqual(SUCCESSFUL_QUIZ_INFO);
    });
  });

  describe('Invalid Testing', () => {
    let token2: string;
    let quizId1: number;

    beforeEach(() => {
      token2 = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
      quizId1 = adminQuizCreate(token2, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    });

    test('Invalid authUserId', () => {
      expect(() => oldRequestAdminQuizInfo(token2 + 1, quizId1)).toThrow(HTTPError[UNAUTHORISED]);
    });

    test('Invalid quizId', () => {
      expect(() => oldRequestAdminQuizInfo(token2, quizId1 + 1)).toThrow(HTTPError[FORBIDDEN]);
    });

    test('Quiz does not belong to user', () => {
      const token3 = adminAuthRegister('borbrien@gmail.com', VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
      const quizId2 = adminQuizCreate(token3, 'Borbriens Quiz', VALID_QUIZ.DESCRIPTION).quizId;
      expect(() => oldRequestAdminQuizInfo(token2, quizId2)).toThrow(HTTPError[FORBIDDEN]);
      expect(() => oldRequestAdminQuizInfo(token3, quizId1)).toThrow(HTTPError[FORBIDDEN]);
    });
  });
});
