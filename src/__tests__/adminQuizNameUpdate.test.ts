import {
  VALID_USER,
  adminAuthRegister,
  adminQuizCreate,
  adminQuizInfo,
  adminQuizNameUpdate,
  clear,
  SUCCESSFUL_QUIZ_INFO,
  SUCCESSFUL_QUIZ_NAME_UPDATE,
  UNAUTHORISED,
  FORBIDDEN,
  INPUT_ERROR,
  oldRequestAdminQuizNameUpdate,
} from '../testHelper';

import HTTPError from 'http-errors';

beforeEach(() => {
  clear();
});

describe('Testing adminQuizNameUpdate', () => {
  describe('error expected', () => {
    let token: string;
    let quizId: number;

    beforeEach(() => {
      token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
      quizId = adminQuizCreate(token, 'Wang quiz', 'very difficult').quizId;
    });

    test('authUserId is not a valid user', () => {
      expect(() => adminQuizNameUpdate(token + 1, quizId, 'Wang quiz Modified')).toThrow(HTTPError[UNAUTHORISED]);
    });

    test('quizId is not a valid quiz', () => {
      expect(() => adminQuizNameUpdate(token, quizId + 1, 'Wang quiz Modified')).toThrow(HTTPError[FORBIDDEN]);
    });

    test('author with authUserId does not an author of quiz with quizId', () => {
      const token2 = adminAuthRegister('mattwang@gmail.com', 'mattwANg123', 'Matt', 'Wang').token;
      expect(() => adminQuizNameUpdate(token2, quizId, 'Matt quiz Modified')).toThrow(HTTPError[FORBIDDEN]);
    });

    test.each([
      { testName: 'no special characters', quizNewName: '#(@(@##@' },
      { testName: 'no special characters with spaces', quizNewName: 'abfdd e(@#2' },
      { testName: 'name length less than 3', quizNewName: 'i3' },
      { testName: 'name length more than 30', quizNewName: 'i    949392jri392jnfjijijij jijijij j j jij9ujkjk983' }
    ])('$testName : $quizNewName', ({ testName, quizNewName }) => {
      expect(() => adminQuizNameUpdate(token, quizId, quizNewName)).toThrow(HTTPError[INPUT_ERROR]);
    });

    test('Name taken by the currently logged in user for another quiz', () => {
      adminQuizCreate(token, 'Wangs second quiz', 'very difficult');
      expect(() => adminQuizNameUpdate(token, quizId, 'Wangs second quiz')).toThrow(HTTPError[INPUT_ERROR]);
    });
  });

  describe('success expected', () => {
    describe('quizNameUpdated return type valid', () => {
      test.each([
        {
          testName: 'returns empty object',
          authEmail: 'max@gmail.com',
          authPassword: 'qweRTy2334',
          authFirstName: 'max',
          authLastName: 'jackson',
          quizName: 'oldName1',
          quizDescription: 'Description1'
        },
        {
          testName: 'returns updated quiz info',
          authEmail: 'james@gmail.com',
          authPassword: 'qwertyIOup123',
          authFirstName: 'james',
          authLastName: 'mikey',
          quizName: 'oldName2',
          quizDescription: 'Description2'
        }

      ])('$testName when changed name to Monkey ', ({ testName, authEmail, authPassword, authFirstName, authLastName, quizName, quizDescription }) => {
        const token = adminAuthRegister(authEmail, authPassword, authFirstName, authLastName).token;
        const quizId = adminQuizCreate(token, quizName, quizDescription).quizId;
        expect(adminQuizNameUpdate(token, quizId, 'Monkey')).toStrictEqual(SUCCESSFUL_QUIZ_NAME_UPDATE);
      });
    });

    describe('quizNameUpdated updates quiz details', () => {
      test.each([
        {
          testName: 'returns updated quiz info',
          authEmail: 'max@gmail.com',
          authPassword: 'qwURUty3432',
          authFirstName: 'max',
          authLastName: 'jackson',
          quizName: 'oldQuizName1',
          quizDescription: 'describing oldQuizName'
        },
        {
          testName: 'returns updated quiz info',
          authEmail: 'james@gmail.com',
          authPassword: 'qwertyiOIER3223p',
          authFirstName: 'james',
          authLastName: 'mikey',
          quizName: 'oldQuizName2',
          quizDescription: 'describing oldQuizName2'
        },
        {
          testName: 'returns updated quiz info',
          authEmail: 'maxy@gmail.com',
          authPassword: 'qWTYE3432',
          authFirstName: 'maxy',
          authLastName: 'jackson',
          quizName: 'oldQuizName3',
          quizDescription: 'describing oldQuizName3'
        }
      ])('$testName  ', ({ testName, authEmail, authPassword, authFirstName, authLastName, quizName, quizDescription }) => {
        const token = adminAuthRegister(authEmail, authPassword, authFirstName, authLastName).token;
        const quizId = adminQuizCreate(token, quizName, quizDescription).quizId;

        adminQuizNameUpdate(token, quizId, 'monkey Quiz');
        expect(adminQuizInfo(token, quizId)).toStrictEqual(SUCCESSFUL_QUIZ_INFO);
      });
    });
  });
});

describe('Old Testing adminQuizNameUpdate', () => {
  describe('error expected', () => {
    let token: string;
    let quizId: number;

    beforeEach(() => {
      token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
      quizId = adminQuizCreate(token, 'Wang quiz', 'very difficult').quizId;
    });

    test('authUserId is not a valid user', () => {
      expect(() => oldRequestAdminQuizNameUpdate(token + 1, quizId, 'Wang quiz Modified')).toThrow(HTTPError[UNAUTHORISED]);
    });

    test('quizId is not a valid quiz', () => {
      expect(() => oldRequestAdminQuizNameUpdate(token, quizId + 1, 'Wang quiz Modified')).toThrow(HTTPError[FORBIDDEN]);
    });

    test('author with authUserId does not an author of quiz with quizId', () => {
      const token2 = adminAuthRegister('mattwang@gmail.com', 'mattwANg123', 'Matt', 'Wang').token;
      expect(() => oldRequestAdminQuizNameUpdate(token2, quizId, 'Matt quiz Modified')).toThrow(HTTPError[FORBIDDEN]);
    });

    test.each([
      { testName: 'no special characters', quizNewName: '#(@(@##@' },
      { testName: 'no special characters with spaces', quizNewName: 'abfdd e(@#2' },
      { testName: 'name length less than 3', quizNewName: 'i3' },
      { testName: 'name length more than 30', quizNewName: 'i    949392jri392jnfjijijij jijijij j j jij9ujkjk983' }
    ])('$testName : $quizNewName', ({ testName, quizNewName }) => {
      expect(() => oldRequestAdminQuizNameUpdate(token, quizId, quizNewName)).toThrow(HTTPError[INPUT_ERROR]);
    });

    test('Name taken by the currently logged in user for another quiz', () => {
      adminQuizCreate(token, 'Wangs second quiz', 'very difficult');
      expect(() => oldRequestAdminQuizNameUpdate(token, quizId, 'Wangs second quiz')).toThrow(HTTPError[INPUT_ERROR]);
    });
  });

  describe('success expected', () => {
    describe('quizNameUpdated return type valid', () => {
      test.each([
        {
          testName: 'returns empty object',
          authEmail: 'max@gmail.com',
          authPassword: 'qweRTy2334',
          authFirstName: 'max',
          authLastName: 'jackson',
          quizName: 'oldName1',
          quizDescription: 'Description1'
        },
        {
          testName: 'returns updated quiz info',
          authEmail: 'james@gmail.com',
          authPassword: 'qwertyIOup123',
          authFirstName: 'james',
          authLastName: 'mikey',
          quizName: 'oldName2',
          quizDescription: 'Description2'
        }

      ])('$testName when changed name to Monkey ', ({ testName, authEmail, authPassword, authFirstName, authLastName, quizName, quizDescription }) => {
        const token = adminAuthRegister(authEmail, authPassword, authFirstName, authLastName).token;
        const quizId = adminQuizCreate(token, quizName, quizDescription).quizId;
        expect(oldRequestAdminQuizNameUpdate(token, quizId, 'Monkey')).toStrictEqual(SUCCESSFUL_QUIZ_NAME_UPDATE);
      });
    });

    describe('quizNameUpdated updates quiz details', () => {
      test.each([
        {
          testName: 'returns updated quiz info',
          authEmail: 'max@gmail.com',
          authPassword: 'qwURUty3432',
          authFirstName: 'max',
          authLastName: 'jackson',
          quizName: 'oldQuizName1',
          quizDescription: 'describing oldQuizName'
        },
        {
          testName: 'returns updated quiz info',
          authEmail: 'james@gmail.com',
          authPassword: 'qwertyiOIER3223p',
          authFirstName: 'james',
          authLastName: 'mikey',
          quizName: 'oldQuizName2',
          quizDescription: 'describing oldQuizName2'
        },
        {
          testName: 'returns updated quiz info',
          authEmail: 'maxy@gmail.com',
          authPassword: 'qWTYE3432',
          authFirstName: 'maxy',
          authLastName: 'jackson',
          quizName: 'oldQuizName3',
          quizDescription: 'describing oldQuizName3'
        }
      ])('$testName  ', ({ testName, authEmail, authPassword, authFirstName, authLastName, quizName, quizDescription }) => {
        const token = adminAuthRegister(authEmail, authPassword, authFirstName, authLastName).token;
        const quizId = adminQuizCreate(token, quizName, quizDescription).quizId;

        oldRequestAdminQuizNameUpdate(token, quizId, 'monkey Quiz');
        expect(adminQuizInfo(token, quizId)).toStrictEqual(SUCCESSFUL_QUIZ_INFO);
      });
    });
  });
});
