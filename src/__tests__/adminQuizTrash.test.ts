import {
  clear,
  adminAuthRegister,
  VALID_USER,
  VALID_QUIZ,
  SUCCESSFUL_QUIZ_TRASH,
  adminQuizTrash,
  adminQuizCreate,
  adminQuizRemove,
  UNAUTHORISED,
  oldRequestAdminQuizTrash,
} from '../testHelper';

import HTTPError from 'http-errors';

let token: string;
let quizId: number;

beforeEach(() => {
  clear();
  token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
  quizId = adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
  adminQuizRemove(token, quizId);
});

describe('Testing adminQuizTrash', () => {
  describe('Success Case', () => {
    test('1 Quiz in Trash', () => {
      expect(adminQuizTrash(
        token
      ))
        .toStrictEqual(SUCCESSFUL_QUIZ_TRASH);
    });

    test('Multiple Quizzes in Trash', () => {
      const quizId2 = adminQuizCreate(token, 'Quiz2', 'My Quiz').quizId;
      adminQuizRemove(token, quizId2);
      expect(adminQuizTrash(
        token
      ))
        .toEqual({
          quizzes: [
            {
              quizId: quizId,
              name: VALID_QUIZ.NAME
            },
            {
              quizId: quizId2,
              name: 'Quiz2'
            }
          ]
        });
    });
  });

  describe('Error Case', () => {
    test('Invalid token (status code: 401)', () => {
      expect(() => adminQuizTrash(token + 1)).toThrow(HTTPError[UNAUTHORISED]);
    });
  });
});

describe('Old Testing adminQuizTrash', () => {
  describe('Success Case', () => {
    test('1 Quiz in Trash', () => {
      expect(oldRequestAdminQuizTrash(
        token
      ))
        .toStrictEqual(SUCCESSFUL_QUIZ_TRASH);
    });

    test('Multiple Quizzes in Trash', () => {
      const quizId2 = adminQuizCreate(token, 'Quiz2', 'My Quiz').quizId;
      adminQuizRemove(token, quizId2);
      expect(oldRequestAdminQuizTrash(
        token
      ))
        .toEqual({
          quizzes: [
            {
              quizId: quizId,
              name: VALID_QUIZ.NAME
            },
            {
              quizId: quizId2,
              name: 'Quiz2'
            }
          ]
        });
    });
  });

  describe('Error Case', () => {
    test('Invalid token (status code: 401)', () => {
      expect(() => oldRequestAdminQuizTrash(token + 1)).toThrow(HTTPError[UNAUTHORISED]);
    });
  });
});
