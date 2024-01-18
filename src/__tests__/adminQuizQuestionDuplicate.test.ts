import {
  VALID_QUIZ,
  VALID_USER,
  validQuestionBody,
  validQuestionBody2,
  adminAuthRegister,
  adminQuizCreate,
  adminQuizCreateQuestion,
  SUCCESSFUL_QUIZ_QUESTION_DUPLICATE,
  adminQuizQuestionDuplicate,
  clear,
  INPUT_ERROR,
  UNAUTHORISED,
  FORBIDDEN,
  oldRequestAdminQuizQuestionDuplicate
} from '../testHelper';

import HTTPError from 'http-errors';

let token: string;
let quizId: number;
let questionId1: number;

beforeEach(() => {
  clear();
  token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
  quizId = adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
  questionId1 = adminQuizCreateQuestion(token, quizId, validQuestionBody).questionId;
  adminQuizCreateQuestion(token, quizId, validQuestionBody2);
});

describe('HTTP tests for adminQuizQuestionDuplicate', () => {
  test('Testing success case', () => {
    const bodyObj = adminQuizQuestionDuplicate(token, quizId, questionId1);
    expect(bodyObj).toStrictEqual(SUCCESSFUL_QUIZ_QUESTION_DUPLICATE);
  });

  test('Test failure (status code: 400): Question Id does not refer to a valid question within this quiz', () => {
    expect(() => adminQuizQuestionDuplicate(token, quizId, questionId1 + 50)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 403): Quiz ID does not refer to a valid quiz', () => {
    expect(() => adminQuizQuestionDuplicate(token, quizId + 50, questionId1)).toThrow(HTTPError[FORBIDDEN]);
  });

  test('Test failure (status code: 401): Token is invalid(does not refer to valid logged in user session)', () => {
    expect(() => adminQuizQuestionDuplicate(token + 1, quizId, questionId1)).toThrow(HTTPError[UNAUTHORISED]);
  });

  test('Test failure (status code: 401): Token is empty (does not refer to valid logged in user session)', () => {
    expect(() => adminQuizQuestionDuplicate('', quizId, questionId1)).toThrow(HTTPError[UNAUTHORISED]);
  });

  test('Test failure (status code: 403): Valid token is provided, but user is not an owner of this quiz', () => {
    const token2 = adminAuthRegister('newuser@gmail.com', VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    expect(() => adminQuizQuestionDuplicate(token2, quizId, questionId1)).toThrow(HTTPError[FORBIDDEN]);
  });
});

describe('Old HTTP tests for adminQuizQuestionDuplicate', () => {
  test('Testing success case', () => {
    const bodyObj = oldRequestAdminQuizQuestionDuplicate(token, quizId, questionId1);
    expect(bodyObj).toStrictEqual(SUCCESSFUL_QUIZ_QUESTION_DUPLICATE);
  });

  test('Test failure (status code: 400): Question Id does not refer to a valid question within this quiz', () => {
    expect(() => oldRequestAdminQuizQuestionDuplicate(token, quizId, questionId1 + 50)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 403): Quiz ID does not refer to a valid quiz', () => {
    expect(() => oldRequestAdminQuizQuestionDuplicate(token, quizId + 50, questionId1)).toThrow(HTTPError[FORBIDDEN]);
  });

  test('Test failure (status code: 401): Token is invalid(does not refer to valid logged in user session)', () => {
    expect(() => oldRequestAdminQuizQuestionDuplicate(token + 1, quizId, questionId1)).toThrow(HTTPError[UNAUTHORISED]);
  });

  test('Test failure (status code: 401): Token is empty (does not refer to valid logged in user session)', () => {
    expect(() => oldRequestAdminQuizQuestionDuplicate('', quizId, questionId1)).toThrow(HTTPError[UNAUTHORISED]);
  });

  test('Test failure (status code: 403): Valid token is provided, but user is not an owner of this quiz', () => {
    const token2 = adminAuthRegister('newuser@gmail.com', VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    expect(() => oldRequestAdminQuizQuestionDuplicate(token2, quizId, questionId1)).toThrow(HTTPError[FORBIDDEN]);
  });
});
