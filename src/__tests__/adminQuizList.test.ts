import {
  VALID_USER,
  VALID_QUIZ,
  adminAuthRegister,
  adminQuizCreate,
  adminQuizList,
  clear,
  UNAUTHORISED,
  oldRequestAdminQuizList
} from '../testHelper';

import HTTPError from 'http-errors';

beforeEach(() => {
  clear();
});

describe('Testing adminQuizList', () => {
  describe('Valid Testing', () => {
    test('One Quiz Owned', () => {
      const token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
      adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION);

      expect(adminQuizList(token)).toEqual({
        quizzes: [
          {
            quizId: expect.any(Number),
            name: expect.any(String),
          }
        ]
      });
    });

    test('Two Quizzes Owned', () => {
      const token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
      adminQuizCreate(token, VALID_QUIZ.NAME, '');
      adminQuizCreate(token, 'Quiz2', '');

      expect(adminQuizList(token)).toEqual({
        quizzes: [
          {
            quizId: expect.any(Number),
            name: expect.any(String),
          },
          {
            quizId: expect.any(Number),
            name: expect.any(String),
          }
        ]
      });
    });

    test('Three Quizzes Owned', () => {
      const token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
      adminQuizCreate(token, VALID_QUIZ.NAME, '');
      adminQuizCreate(token, 'Quiz2', '');
      adminQuizCreate(token, 'Quiz3', '');

      expect(adminQuizList(token)).toEqual({
        quizzes: [
          {
            quizId: expect.any(Number),
            name: expect.any(String),
          },
          {
            quizId: expect.any(Number),
            name: expect.any(String),
          },
          {
            quizId: expect.any(Number),
            name: expect.any(String),
          }
        ]
      });
    });
  });

  describe('Invalid Testing', () => {
    test('AuthUserId is not a valid user', () => {
      const token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
      expect(() => adminQuizList(token + 1)).toThrow(HTTPError[UNAUTHORISED]);
    });
  });
});

describe('Old Testing adminQuizList', () => {
  describe('Valid Testing', () => {
    test('One Quiz Owned', () => {
      const token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
      adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION);

      expect(oldRequestAdminQuizList(token)).toEqual({
        quizzes: [
          {
            quizId: expect.any(Number),
            name: expect.any(String),
          }
        ]
      });
    });

    test('Two Quizzes Owned', () => {
      const token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
      adminQuizCreate(token, VALID_QUIZ.NAME, '');
      adminQuizCreate(token, 'Quiz2', '');

      expect(oldRequestAdminQuizList(token)).toEqual({
        quizzes: [
          {
            quizId: expect.any(Number),
            name: expect.any(String),
          },
          {
            quizId: expect.any(Number),
            name: expect.any(String),
          }
        ]
      });
    });

    test('Three Quizzes Owned', () => {
      const token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
      adminQuizCreate(token, VALID_QUIZ.NAME, '');
      adminQuizCreate(token, 'Quiz2', '');
      adminQuizCreate(token, 'Quiz3', '');

      expect(oldRequestAdminQuizList(token)).toEqual({
        quizzes: [
          {
            quizId: expect.any(Number),
            name: expect.any(String),
          },
          {
            quizId: expect.any(Number),
            name: expect.any(String),
          },
          {
            quizId: expect.any(Number),
            name: expect.any(String),
          }
        ]
      });
    });
  });

  describe('Invalid Testing', () => {
    test('AuthUserId is not a valid user', () => {
      const token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
      expect(() => oldRequestAdminQuizList(token + 1)).toThrow(HTTPError[UNAUTHORISED]);
    });
  });
});
