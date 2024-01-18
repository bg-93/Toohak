import {
  VALID_USER,
  VALID_QUIZ,
  SUCCESSFUL_QUIZ_REMOVE,
  adminAuthRegister,
  adminQuizRemove,
  adminQuizCreate,
  adminQuizInfo,
  clear,
  SUCCESSFUL_QUIZ_INFO,
  FORBIDDEN,
  UNAUTHORISED,
  requestQuizSessionCreate,
  VALID_AUTOSTARTNUM,
  INPUT_ERROR,
  adminQuizCreateQuestion,
  validQuestionBody,
  oldRequestAdminQuizRemove
} from '../testHelper';

import HTTPError from 'http-errors';

let token: string;
let quizId: number;

beforeEach(() => {
  clear();
  token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
  quizId = adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
});

describe('testing adminQuizRemove', () => {
  describe('Valid Removal', () => {
    test('Valid authUserId and quizId', () => {
      expect(adminQuizInfo(token, quizId)).toStrictEqual(SUCCESSFUL_QUIZ_INFO);
      expect(adminQuizRemove(token, quizId)).toStrictEqual(SUCCESSFUL_QUIZ_REMOVE);
      expect(() => adminQuizInfo(token, quizId)).toThrow(HTTPError[FORBIDDEN]);
    });
  });

  describe('Invalid AuthUserId', () => {
    test('Using an invalid AuthUserId', () => {
      const invalidAuthUserId = token + 1;
      expect(() => adminQuizRemove(invalidAuthUserId, quizId)).toThrow(HTTPError[UNAUTHORISED]);
    });
  });

  describe('Invalid QuizId', () => {
    test('Quiz ID does not refer to a valid quiz', () => {
      const invalidQuizId = quizId + 1;
      expect(() => adminQuizRemove(token, invalidQuizId)).toThrow(HTTPError[FORBIDDEN]);
    });

    test('Quiz ID does not refer to a quiz that this user owns', () => {
      const token2 = adminAuthRegister('lolemail@gmail.com', '12345678Abcd', 'Jane', 'Doe').token;
      expect(() => adminQuizRemove(token2, quizId)).toThrow(HTTPError[FORBIDDEN]);
    });
  });

  describe('Sessions', () => {
    test('All Sessions must be in END state', () => {
      adminQuizCreateQuestion(token, quizId, validQuestionBody);
      requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM);
      expect(() => adminQuizRemove(token, quizId)).toThrow(HTTPError[INPUT_ERROR]);
    });
  });
});

describe('Old testing adminQuizRemove', () => {
  describe('Valid Removal', () => {
    test('Valid authUserId and quizId', () => {
      expect(adminQuizInfo(token, quizId)).toStrictEqual(SUCCESSFUL_QUIZ_INFO);
      expect(oldRequestAdminQuizRemove(token, quizId)).toStrictEqual(SUCCESSFUL_QUIZ_REMOVE);
      expect(() => adminQuizInfo(token, quizId)).toThrow(HTTPError[FORBIDDEN]);
    });
  });

  describe('Invalid AuthUserId', () => {
    test('Using an invalid AuthUserId', () => {
      const invalidAuthUserId = token + 1;
      expect(() => oldRequestAdminQuizRemove(invalidAuthUserId, quizId)).toThrow(HTTPError[UNAUTHORISED]);
    });
  });

  describe('Invalid QuizId', () => {
    test('Quiz ID does not refer to a valid quiz', () => {
      const invalidQuizId = quizId + 1;
      expect(() => oldRequestAdminQuizRemove(token, invalidQuizId)).toThrow(HTTPError[FORBIDDEN]);
    });

    test('Quiz ID does not refer to a quiz that this user owns', () => {
      const token2 = adminAuthRegister('lolemail@gmail.com', '12345678Abcd', 'Jane', 'Doe').token;
      expect(() => oldRequestAdminQuizRemove(token2, quizId)).toThrow(HTTPError[FORBIDDEN]);
    });
  });
});
