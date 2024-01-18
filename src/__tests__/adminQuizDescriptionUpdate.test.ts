import {
  VALID_USER,
  VALID_QUIZ,
  adminQuizCreate,
  adminQuizDescriptionUpdate,
  adminAuthRegister,
  clear,
  SUCCESSFUL_QUIZ_DESCRIPTION_UPDATE,
  INPUT_ERROR,
  FORBIDDEN,
  UNAUTHORISED,
  oldRequestAdminQuizDescriptionUpdate
} from '../testHelper';

import HTTPError from 'http-errors';

beforeEach(() => {
  clear();
});

describe('Testing adminQuizDescriptionUpdate', () => {
  describe('Error expected', () => {
    let token1: string;
    let quizId1: number;

    beforeEach(() => {
      token1 = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
      quizId1 = adminQuizCreate(token1, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    });

    test('AuthUserId is not a valid user', () => {
      expect(() => adminQuizDescriptionUpdate(token1 + 1, quizId1, VALID_QUIZ.DESCRIPTION)).toThrow(HTTPError[UNAUTHORISED]);
    });

    test('QuizId is not a valid quiz', () => {
      expect(() => adminQuizDescriptionUpdate(token1, quizId1 + 1, VALID_QUIZ.DESCRIPTION)).toThrow(HTTPError[FORBIDDEN]);
    });

    test('Author with authUserId is not an author of quiz with quizId', () => {
      const token2 = adminAuthRegister('mattwang@gmail.com', 'mattwaNg123', 'Matt', 'Wang').token;
      expect(() => adminQuizDescriptionUpdate(token2, quizId1, 'Matt description Modified')).toThrow(HTTPError[FORBIDDEN]);
    });

    test.each([
      { testName: 'length more than 101', newDescription: '#(@(@##@fffffffjfjfjjfjfjfjjfjjfjfjfjfjfjfjfjfjfjfjfjffjeieijfie ejfiejf j jd fj dj fjd fj kdjfkdj fkdjfkdjfkjskdjfdkfjdkjfkdjj jjkjkjk jk jkjkjkjk jk fk djf jf kdjfkjdkf jdkjf kdj ksjdkfjkd jfkdj ksdjfkdj fkdj kfjd fkdj fkd jfkd jd kdjfj kdj fdfdfddddddfjdkjkjke jekjk 3 #' },
      { testName: 'length of 101', newDescription: 'klmmmmmmfffffffjfjfjjfjfjfjjfjjfjfjfjfjfjfjfjfjfjfjfjfffjeieijfie ejfiejf j jd fj dj fjd fj kdjfkdj f' }
    ])('$testName : $newDescription', ({ testName, newDescription }) => {
      expect(() => adminQuizDescriptionUpdate(token1, quizId1, newDescription)).toThrow(HTTPError[INPUT_ERROR]);
    });
  });

  describe('Success expected', () => {
    describe('Valid return type', () => {
      test.each([
        {
          testName: 'returns empty object',
          authEmail: VALID_USER.EMAIL,
          authPassword: VALID_USER.PASSWORD,
          authFirstName: VALID_USER.NAME_FIRST,
          authLastName: VALID_USER.NAME_LAST,
          quizName: 'QuizName1',
          quizDescription: 'oldQuizDescription1'
        },
        {
          testName: 'returns empty object',
          authEmail: 'james@gmail.com',
          authPassword: 'qwerTYioup234',
          authFirstName: 'james',
          authLastName: 'mikey',
          quizName: 'QuizName2',
          quizDescription: 'oldQuizDescription2'
        }

      ])('$testName when changed description from $quizDescription to monkey ', ({ testName, authEmail, authPassword, authFirstName, authLastName, quizName, quizDescription }) => {
        const token1 = adminAuthRegister(authEmail, authPassword, authFirstName, authLastName).token;
        const quizId1 = adminQuizCreate(token1, quizName, quizDescription).quizId;
        expect(adminQuizDescriptionUpdate(token1, quizId1, 'Monkey')).toStrictEqual(SUCCESSFUL_QUIZ_DESCRIPTION_UPDATE);
      });
    });

    describe('Correct description update', () => {
      test.each([
        {
          testName: 'returns updated quiz info',
          authEmail: 'max@gmail.com',
          authPassword: 'qwertYI3453',
          authFirstName: 'Max',
          authLastName: 'Jackson',
          quizName: 'QuizName1',
          quizDescription: 'oldQuizDescription1'
        },
        {
          testName: 'returns updated quiz info',
          authEmail: 'james@gmail.com',
          authPassword: 'QWwertyioup273',
          authFirstName: 'james',
          authLastName: 'mikey',
          quizName: 'QuizName2',
          quizDescription: 'oldQuizDescription2'
        },
        {
          testName: 'returns updated quiz info',
          authEmail: 'maxy@gmail.com',
          authPassword: 'qwTY893839',
          authFirstName: 'maxy',
          authLastName: 'Jackinson',
          quizName: 'QuizName3',
          quizDescription: 'oldQuizDescription3'
        }
      ])('$testName  ', ({ testName, authEmail, authPassword, authFirstName, authLastName, quizName, quizDescription }) => {
        const token1 = adminAuthRegister(authEmail, authPassword, authFirstName, authLastName).token;
        const quizId1 = adminQuizCreate(token1, quizName, quizDescription).quizId;
        expect(adminQuizDescriptionUpdate(token1, quizId1, 'Monkey')).toStrictEqual(SUCCESSFUL_QUIZ_DESCRIPTION_UPDATE);
      });
    });
  });
});

describe('Old Testing adminQuizDescriptionUpdate', () => {
  describe('Error expected', () => {
    let token1: string;
    let quizId1: number;

    beforeEach(() => {
      token1 = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
      quizId1 = adminQuizCreate(token1, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    });

    test('AuthUserId is not a valid user', () => {
      expect(() => oldRequestAdminQuizDescriptionUpdate(token1 + 1, quizId1, VALID_QUIZ.DESCRIPTION)).toThrow(HTTPError[UNAUTHORISED]);
    });

    test('QuizId is not a valid quiz', () => {
      expect(() => oldRequestAdminQuizDescriptionUpdate(token1, quizId1 + 1, VALID_QUIZ.DESCRIPTION)).toThrow(HTTPError[FORBIDDEN]);
    });

    test('Author with authUserId is not an author of quiz with quizId', () => {
      const token2 = adminAuthRegister('mattwang@gmail.com', 'mattwaNg123', 'Matt', 'Wang').token;
      expect(() => oldRequestAdminQuizDescriptionUpdate(token2, quizId1, 'Matt description Modified')).toThrow(HTTPError[FORBIDDEN]);
    });

    test.each([
      { testName: 'length more than 101', newDescription: '#(@(@##@fffffffjfjfjjfjfjfjjfjjfjfjfjfjfjfjfjfjfjfjfjffjeieijfie ejfiejf j jd fj dj fjd fj kdjfkdj fkdjfkdjfkjskdjfdkfjdkjfkdjj jjkjkjk jk jkjkjkjk jk fk djf jf kdjfkjdkf jdkjf kdj ksjdkfjkd jfkdj ksdjfkdj fkdj kfjd fkdj fkd jfkd jd kdjfj kdj fdfdfddddddfjdkjkjke jekjk 3 #' },
      { testName: 'length of 101', newDescription: 'klmmmmmmfffffffjfjfjjfjfjfjjfjjfjfjfjfjfjfjfjfjfjfjfjfffjeieijfie ejfiejf j jd fj dj fjd fj kdjfkdj f' }
    ])('$testName : $newDescription', ({ testName, newDescription }) => {
      expect(() => oldRequestAdminQuizDescriptionUpdate(token1, quizId1, newDescription)).toThrow(HTTPError[INPUT_ERROR]);
    });
  });

  describe('Success expected', () => {
    describe('Valid return type', () => {
      test.each([
        {
          testName: 'returns empty object',
          authEmail: VALID_USER.EMAIL,
          authPassword: VALID_USER.PASSWORD,
          authFirstName: VALID_USER.NAME_FIRST,
          authLastName: VALID_USER.NAME_LAST,
          quizName: 'QuizName1',
          quizDescription: 'oldQuizDescription1'
        },
        {
          testName: 'returns empty object',
          authEmail: 'james@gmail.com',
          authPassword: 'qwerTYioup234',
          authFirstName: 'james',
          authLastName: 'mikey',
          quizName: 'QuizName2',
          quizDescription: 'oldQuizDescription2'
        }

      ])('$testName when changed description from $quizDescription to monkey ', ({ testName, authEmail, authPassword, authFirstName, authLastName, quizName, quizDescription }) => {
        const token1 = adminAuthRegister(authEmail, authPassword, authFirstName, authLastName).token;
        const quizId1 = adminQuizCreate(token1, quizName, quizDescription).quizId;
        expect(oldRequestAdminQuizDescriptionUpdate(token1, quizId1, 'Monkey')).toStrictEqual(SUCCESSFUL_QUIZ_DESCRIPTION_UPDATE);
      });
    });

    describe('Correct description update', () => {
      test.each([
        {
          testName: 'returns updated quiz info',
          authEmail: 'max@gmail.com',
          authPassword: 'qwertYI3453',
          authFirstName: 'Max',
          authLastName: 'Jackson',
          quizName: 'QuizName1',
          quizDescription: 'oldQuizDescription1'
        },
        {
          testName: 'returns updated quiz info',
          authEmail: 'james@gmail.com',
          authPassword: 'QWwertyioup273',
          authFirstName: 'james',
          authLastName: 'mikey',
          quizName: 'QuizName2',
          quizDescription: 'oldQuizDescription2'
        },
        {
          testName: 'returns updated quiz info',
          authEmail: 'maxy@gmail.com',
          authPassword: 'qwTY893839',
          authFirstName: 'maxy',
          authLastName: 'Jackinson',
          quizName: 'QuizName3',
          quizDescription: 'oldQuizDescription3'
        }
      ])('$testName  ', ({ testName, authEmail, authPassword, authFirstName, authLastName, quizName, quizDescription }) => {
        const token1 = adminAuthRegister(authEmail, authPassword, authFirstName, authLastName).token;
        const quizId1 = adminQuizCreate(token1, quizName, quizDescription).quizId;
        expect(oldRequestAdminQuizDescriptionUpdate(token1, quizId1, 'Monkey')).toStrictEqual(SUCCESSFUL_QUIZ_DESCRIPTION_UPDATE);
      });
    });
  });
});
