import {
  VALID_QUIZ,
  VALID_USER,
  adminAuthRegister,
  adminQuizCreate,
  adminQuizInfo,
  adminQuizRemove,
  adminQuizRestore,
  clear,
  SUCCESSFUL_QUIZ_RESTORE,
  INPUT_ERROR,
  UNAUTHORISED,
  FORBIDDEN,
  SUCCESSFUL_QUIZ_INFO,
  oldRequestAdminQuizRestore
} from '../testHelper';

import HTTPError from 'http-errors';

let token: string;
let quizId: number;

beforeEach(() => {
  clear();
  token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
  quizId = adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
});

describe('HTTP testing for adminQuizRestore', () => {
  test('Test successful restore', () => {
    adminQuizRemove(token, quizId);
    const bodyObj = adminQuizRestore(token, quizId);
    expect(bodyObj).toStrictEqual(SUCCESSFUL_QUIZ_RESTORE);
    expect(adminQuizInfo(token, quizId)).toStrictEqual(SUCCESSFUL_QUIZ_INFO);
  });

  test('Test failure (status code: 400): Quiz name of the restored quiz is already used by another active quiz (from same user)', () => {
    adminQuizRemove(token, quizId);
    adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION);
    expect(() => adminQuizRestore(token, quizId)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): Quiz ID refers to a quiz that is not currently in the trash', () => {
    expect(() => adminQuizRestore(token, quizId)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 401): Token is empty or invalid (does not refer to valid logged in user session)', () => {
    adminQuizRemove(token, quizId);
    expect(() => adminQuizRestore(token + 1, quizId)).toThrow(HTTPError[UNAUTHORISED]);
  });

  test('Test failure (status code: 403): Quiz ID does not refer to a valid quiz', () => {
    adminQuizRemove(token, quizId);
    expect(() => adminQuizRestore(token, quizId + 1)).toThrow(HTTPError[FORBIDDEN]);
  });

  test('Test failure (status code: 403): Valid token is provided, but user is not an owner of this quiz', () => {
    const token2 = adminAuthRegister('newuser@gmail.com', VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    adminQuizRemove(token, quizId);
    expect(() => adminQuizRestore(token2, quizId)).toThrow(HTTPError[FORBIDDEN]);
  });
});

describe('Old HTTP testing for adminQuizRestore', () => {
  test('Test successful restore', () => {
    adminQuizRemove(token, quizId);
    const bodyObj = oldRequestAdminQuizRestore(token, quizId);
    expect(bodyObj).toStrictEqual(SUCCESSFUL_QUIZ_RESTORE);
    expect(adminQuizInfo(token, quizId)).toStrictEqual(SUCCESSFUL_QUIZ_INFO);
  });

  test('Test failure (status code: 400): Quiz name of the restored quiz is already used by another active quiz (from same user)', () => {
    adminQuizRemove(token, quizId);
    adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION);
    expect(() => oldRequestAdminQuizRestore(token, quizId)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): Quiz ID refers to a quiz that is not currently in the trash', () => {
    expect(() => oldRequestAdminQuizRestore(token, quizId)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 401): Token is empty or invalid (does not refer to valid logged in user session)', () => {
    adminQuizRemove(token, quizId);
    expect(() => oldRequestAdminQuizRestore(token + 1, quizId)).toThrow(HTTPError[UNAUTHORISED]);
  });

  test('Test failure (status code: 403): Quiz ID does not refer to a valid quiz', () => {
    adminQuizRemove(token, quizId);
    expect(() => oldRequestAdminQuizRestore(token, quizId + 1)).toThrow(HTTPError[FORBIDDEN]);
  });

  test('Test failure (status code: 403): Valid token is provided, but user is not an owner of this quiz', () => {
    const token2 = adminAuthRegister('newuser@gmail.com', VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    adminQuizRemove(token, quizId);
    expect(() => oldRequestAdminQuizRestore(token2, quizId)).toThrow(HTTPError[FORBIDDEN]);
  });
});
