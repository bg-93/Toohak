import {
  VALID_QUIZ,
  VALID_USER,
  adminAuthRegister,
  adminQuizCreate,
  adminQuizTransfer,
  VALID_SECOND_USER,
  SUCCESSFUL_QUIZ_TRANSFER,
  clear,
  SUCCESSFUL_QUIZ_INFO,
  adminQuizInfo,
  FORBIDDEN,
  INPUT_ERROR,
  UNAUTHORISED,
  adminQuizCreateQuestion,
  requestQuizSessionCreate,
  validQuestionBody,
  VALID_AUTOSTARTNUM,
  oldRequestAdminQuizTransfer
} from '../testHelper';

import HTTPError from 'http-errors';

import {
  AdminQuizCreateReturn,
  AdminQuizTransferReturn
} from '../types';

let token1: string;
let quizId: number;
let token2: string;
const INVALID_TOKEN = token1 + token2;
const NON_EXISTENT_EMAIL = 'a@gmail.com';
beforeEach(() => {
  clear();
  token1 = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
  token2 = adminAuthRegister(VALID_SECOND_USER.EMAIL, VALID_SECOND_USER.PASSWORD, VALID_SECOND_USER.NAME_FIRST, VALID_SECOND_USER.NAME_LAST).token;
  quizId = adminQuizCreate(token1, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
});

describe('testing adminQuizTransfer', () => {
  describe('success expected', () => {
    test('expected return', () => {
      const quizTransferOutput = adminQuizTransfer(token1, quizId, VALID_SECOND_USER.EMAIL) as AdminQuizTransferReturn;
      expect(quizTransferOutput).toStrictEqual(SUCCESSFUL_QUIZ_TRANSFER);
    });

    test('(integration) expected change to quizId of specific quiz', () => {
      adminQuizTransfer(token1, quizId, VALID_SECOND_USER.EMAIL);
      expect(adminQuizInfo(token2, quizId)).toStrictEqual(SUCCESSFUL_QUIZ_INFO);
    });
  });

  describe('error expected', () => {
    describe('error 400', () => {
      test('(400) Non-Existing email', () => {
        expect(() => adminQuizTransfer(token1, quizId, NON_EXISTENT_EMAIL)).toThrow(HTTPError[INPUT_ERROR]);
      });

      test('(400) Transfer to the currently Logged User', () => {
        expect(() => adminQuizTransfer(token1, quizId, VALID_USER.EMAIL)).toThrow(HTTPError[INPUT_ERROR]);
      });

      test('(400) Target user already has Quiz under their name ', () => {
        adminQuizCreate(token2, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION) as AdminQuizCreateReturn;
        expect(() => adminQuizTransfer(token1, quizId, VALID_SECOND_USER.EMAIL)).toThrow(HTTPError[INPUT_ERROR]);
      });

      test('All Sessions must be in END state', () => {
        adminQuizCreateQuestion(token1, quizId, validQuestionBody);
        requestQuizSessionCreate(token1, quizId, VALID_AUTOSTARTNUM);
        expect(() => adminQuizTransfer(token1, quizId, VALID_SECOND_USER.EMAIL)).toThrow(HTTPError[INPUT_ERROR]);
      });
    });

    describe('error 401', () => {
      test('(401) Invalid Token', () => {
        expect(() => adminQuizTransfer(INVALID_TOKEN, quizId, VALID_SECOND_USER.EMAIL)).toThrow(HTTPError[UNAUTHORISED]);
      });
      test('(401) Empty Token', () => {
        expect(() => adminQuizTransfer('', quizId, VALID_SECOND_USER.EMAIL)).toThrow(HTTPError[UNAUTHORISED]);
      });
    });

    describe('error 403', () => {
      test('Token is not Current owner', () => {
        expect(() => adminQuizTransfer(token2, quizId, VALID_SECOND_USER.EMAIL)).toThrow(HTTPError[FORBIDDEN]);
      });
    });
  });
});

describe('Old testing adminQuizTransfer', () => {
  describe('success expected', () => {
    test('expected return', () => {
      const quizTransferOutput = oldRequestAdminQuizTransfer(token1, quizId, VALID_SECOND_USER.EMAIL) as AdminQuizTransferReturn;
      expect(quizTransferOutput).toStrictEqual(SUCCESSFUL_QUIZ_TRANSFER);
    });

    test('(integration) expected change to quizId of specific quiz', () => {
      oldRequestAdminQuizTransfer(token1, quizId, VALID_SECOND_USER.EMAIL);
      expect(adminQuizInfo(token2, quizId)).toStrictEqual(SUCCESSFUL_QUIZ_INFO);
    });
  });

  describe('error expected', () => {
    describe('error 400', () => {
      test('(400) Non-Existing email', () => {
        expect(() => oldRequestAdminQuizTransfer(token1, quizId, NON_EXISTENT_EMAIL)).toThrow(HTTPError[INPUT_ERROR]);
      });

      test('(400) Transfer to the currently Logged User', () => {
        expect(() => oldRequestAdminQuizTransfer(token1, quizId, VALID_USER.EMAIL)).toThrow(HTTPError[INPUT_ERROR]);
      });

      test('(400) Target user already has Quiz under their name ', () => {
        adminQuizCreate(token2, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION) as AdminQuizCreateReturn;
        expect(() => oldRequestAdminQuizTransfer(token1, quizId, VALID_SECOND_USER.EMAIL)).toThrow(HTTPError[INPUT_ERROR]);
      });
    });

    describe('error 401', () => {
      test('(401) Invalid Token', () => {
        expect(() => oldRequestAdminQuizTransfer(INVALID_TOKEN, quizId, VALID_SECOND_USER.EMAIL)).toThrow(HTTPError[UNAUTHORISED]);
      });
      test('(401) Empty Token', () => {
        expect(() => oldRequestAdminQuizTransfer('', quizId, VALID_SECOND_USER.EMAIL)).toThrow(HTTPError[UNAUTHORISED]);
      });
    });

    describe('error 403', () => {
      test('Token is not Current owner', () => {
        expect(() => oldRequestAdminQuizTransfer(token2, quizId, VALID_SECOND_USER.EMAIL)).toThrow(HTTPError[FORBIDDEN]);
      });
    });
  });
});
