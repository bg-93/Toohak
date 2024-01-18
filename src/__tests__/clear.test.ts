import {
  VALID_USER,
  SUCCESSFUL_QUIZ_CREATION,
  SUCCESSFUL_REGISTRATION,
  clear,
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
  UNAUTHORISED,
  INPUT_ERROR
} from '../testHelper';

import HTTPError from 'http-errors';

import {
  AdminAuthRegisterReturn,
  AdminQuizCreateReturn,
} from '../types';

beforeEach(() => {
  clear();
});

let user: AdminAuthRegisterReturn;

describe('testing clear with auth.js functions', () => {
  beforeEach(() => {
    user = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST) as AdminAuthRegisterReturn;
  });

  test('testing with adminAuthRegister', () => {
    expect(user.token).toStrictEqual(expect.any(String));
    clear();

    // Successful clear if you can register user with the same info
    user = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST) as AdminAuthRegisterReturn;
    expect(user).toStrictEqual(SUCCESSFUL_REGISTRATION);
  });

  test('testing with adminAuthLogin', () => {
    clear();
    expect(() => adminAuthLogin(VALID_USER.EMAIL, VALID_USER.PASSWORD)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('testing with adminUserDetails', () => {
    clear();
    expect(() => adminUserDetails(user.token)).toThrow(HTTPError[UNAUTHORISED]);
  });
});

describe('testing clear with quiz.js functions', () => {
  let quiz: AdminQuizCreateReturn;

  beforeEach(() => {
    user = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST) as AdminAuthRegisterReturn;
    quiz = adminQuizCreate(user.token, 'Quiz', 'Description') as AdminQuizCreateReturn;
    clear();
  });

  // All tests should fail due to invalid userId and quizId
  test('testing with adminQuizList', () => {
    expect(() => adminQuizList(user.token)).toThrow(HTTPError[UNAUTHORISED]);
  });

  test('testing with adminQuizRemove', () => {
    expect(() => adminQuizRemove(user.token, quiz.quizId)).toThrow(HTTPError[UNAUTHORISED]);
  });

  test('testing with adminQuizInfo', () => {
    expect(() => adminQuizInfo(user.token, quiz.quizId)).toThrow(HTTPError[UNAUTHORISED]);
  });

  test('testing with adminQuizNameUpdate', () => {
    expect(() => adminQuizNameUpdate(user.token, quiz.quizId, 'New Name')).toThrow(HTTPError[UNAUTHORISED]);
  });

  test('testing with adminQuizDescriptionUpdate', () => {
    expect(() => adminQuizDescriptionUpdate(user.token, quiz.quizId, 'New Description')).toThrow(HTTPError[UNAUTHORISED]);
  });

  test('clearing when the state is already empty', () => {
    clear();
    user = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST);
    expect(adminQuizCreate(user.token, 'Quiz', 'Description')).toStrictEqual(SUCCESSFUL_QUIZ_CREATION);
  });
});
