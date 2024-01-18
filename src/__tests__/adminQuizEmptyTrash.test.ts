import {
  VALID_QUIZ,
  VALID_USER,
  adminAuthRegister,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizEmptyTrash,
  adminQuizTrash,
  clear,
  INPUT_ERROR,
  UNAUTHORISED,
  FORBIDDEN,
  SUCCESSFUL_QUIZ_REMOVE,
  SUCCESSFUL_TRASH_VIEW,
  SUCCESSFUL_TRASH_EMPTY,
  INVALID_QUIZID,
  oldRequestAdminQuizEmptyTrash
} from '../testHelper';

import HTTPError from 'http-errors';

let token1: string;
let token2: string;
let quizId1: number;
let quizId2: number;

beforeEach(() => {
  clear();
  token1 = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
  token2 = adminAuthRegister('newuser@gmail.com', VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
  quizId1 = adminQuizCreate(token1, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
  quizId2 = adminQuizCreate(token2, 'quizId2', VALID_QUIZ.DESCRIPTION).quizId;
});

describe('HTTP testing for adminQuizEmptyTrash', () => {
  test('Test successful empty', () => {
    expect(adminQuizRemove(token1, quizId1)).toStrictEqual(SUCCESSFUL_QUIZ_REMOVE);
    expect(adminQuizRemove(token2, quizId2)).toStrictEqual(SUCCESSFUL_QUIZ_REMOVE);
    expect(adminQuizTrash(token1)).toStrictEqual(SUCCESSFUL_TRASH_VIEW);

    expect(adminQuizEmptyTrash(token1, [quizId1])).toStrictEqual(SUCCESSFUL_TRASH_EMPTY);
    expect(adminQuizEmptyTrash(token2, [quizId2])).toStrictEqual(SUCCESSFUL_TRASH_EMPTY);

    expect(adminQuizTrash(token1).quizzes).toStrictEqual([]);
  });

  test('Test failure (status code: 400): One of two quizIdIDs is not currently in the trash', () => {
    expect(adminQuizRemove(token1, quizId1)).toStrictEqual(SUCCESSFUL_QUIZ_REMOVE);
    const quizId3 = adminQuizCreate(token1, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    expect(() => adminQuizEmptyTrash(token1, [quizId1, quizId3])).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): One of one quizIdID is not currently in the trash', () => {
    expect(() => adminQuizEmptyTrash(token1, [quizId1])).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 401): Token is empty or invalid (does not refer to valid logged in user session)', () => {
    adminQuizRemove(token1, quizId1);
    adminQuizRemove(token2, quizId2);

    expect(() => adminQuizEmptyTrash('', [quizId1])).toThrow(HTTPError[UNAUTHORISED]);
    expect(() => adminQuizEmptyTrash(token2 + 1, [quizId1])).toThrow(HTTPError[UNAUTHORISED]);
  });

  test('Test failure (status code: 403): Valid token is provided, but user is not an owner of this quiz', () => {
    adminQuizRemove(token1, quizId1);
    adminQuizRemove(token2, quizId2);

    expect(() => adminQuizEmptyTrash(token1, [quizId2])).toThrow(HTTPError[FORBIDDEN]);
  });

  test('Test failure (status code: 403): One or more of the quizIdIDs refers to a quizIdthat this current user does not own', () => {
    expect(() => adminQuizEmptyTrash(token1, [quizId2])).toThrow(HTTPError[FORBIDDEN]);
  });

  test('Test failure (status code: 403): One or more of the quizIdIDs is not a valid quiz', () => {
    adminQuizRemove(token1, quizId1);
    adminQuizRemove(token2, quizId2);

    expect(() => adminQuizEmptyTrash(token1, [INVALID_QUIZID])).toThrow(HTTPError[FORBIDDEN]);
  });
});

describe('Old HTTP testing for adminQuizEmptyTrash', () => {
  test('Test successful empty', () => {
    expect(adminQuizRemove(token1, quizId1)).toStrictEqual(SUCCESSFUL_QUIZ_REMOVE);
    expect(adminQuizRemove(token2, quizId2)).toStrictEqual(SUCCESSFUL_QUIZ_REMOVE);

    expect(adminQuizTrash(token1)).toStrictEqual(SUCCESSFUL_TRASH_VIEW);

    const bodyObject = oldRequestAdminQuizEmptyTrash(token1, [quizId1]);
    expect(bodyObject).toStrictEqual(SUCCESSFUL_TRASH_EMPTY);

    const bodyObject2 = oldRequestAdminQuizEmptyTrash(token2, [quizId2]);
    expect(bodyObject2).toStrictEqual(SUCCESSFUL_TRASH_EMPTY);

    expect(adminQuizTrash(token1).quizzes).toStrictEqual([]);
  });

  test('Test failure (status code: 400): One of two quizIdIDs is not currently in the trash', () => {
    expect(adminQuizRemove(token1, quizId1)).toStrictEqual(SUCCESSFUL_QUIZ_REMOVE);
    const quizId3 = adminQuizCreate(token1, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    expect(() => oldRequestAdminQuizEmptyTrash(token1, [quizId1, quizId3])).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): One of one quizIdID is not currently in the trash', () => {
    expect(() => oldRequestAdminQuizEmptyTrash(token1, [quizId1])).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 401): Token is empty or invalid (does not refer to valid logged in user session)', () => {
    adminQuizRemove(token1, quizId1);
    adminQuizRemove(token2, quizId2);

    expect(() => oldRequestAdminQuizEmptyTrash('', [quizId1])).toThrow(HTTPError[UNAUTHORISED]);
    expect(() => oldRequestAdminQuizEmptyTrash(token2 + 1, [quizId1])).toThrow(HTTPError[UNAUTHORISED]);
  });

  test('Test failure (status code: 403): Valid token is provided, but user is not an owner of this quiz', () => {
    adminQuizRemove(token1, quizId1);
    adminQuizRemove(token2, quizId2);

    expect(() => oldRequestAdminQuizEmptyTrash(token1, [quizId2])).toThrow(HTTPError[FORBIDDEN]);
  });

  test('Test failure (status code: 403): One or more of the quizIdIDs refers to a quizIdthat this current user does not own', () => {
    expect(() => oldRequestAdminQuizEmptyTrash(token1, [quizId2])).toThrow(HTTPError[FORBIDDEN]);
  });

  test('Test failure (status code: 403): One or more of the quizIdIDs is not a valid quiz', () => {
    adminQuizRemove(token1, quizId1);
    adminQuizRemove(token2, quizId2);
    expect(() => oldRequestAdminQuizEmptyTrash(token1, [INVALID_QUIZID])).toThrow(HTTPError[FORBIDDEN]);
  });
});
