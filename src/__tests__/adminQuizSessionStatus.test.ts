import {
  INPUT_ERROR,
  VALID_QUIZ,
  VALID_USER,
  adminAuthRegister,
  adminQuizCreate,
  adminQuizCreateQuestion,
  clear,
  requestQuizSessionCreate,
  validQuestionBody,
  SUCCESSFUL_SESSION_STATUS,
  requestSessionStatus,
  VALID_USER_2,
  VALID_QUIZ_2
} from '../testHelper';

import { FORBIDDEN, UNAUTHORISED } from '../types';
import HTTPError from 'http-errors';
beforeEach(() => {
  clear();
});

const VALID_AUTOSTARTNUM = 40;

describe('POST /v1/player/join', () => {
  let token: string;
  let tokenSecondAdmin: string;
  let quizId: number;
  let sessionId: number;
  let quizId2: number;
  let sessionId2: number;

  beforeEach(() => {
    token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    tokenSecondAdmin = adminAuthRegister(VALID_USER_2.EMAIL, VALID_USER_2.PASSWORD, VALID_USER_2.NAME_FIRST, VALID_USER_2.NAME_LAST).token;
    quizId = adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    adminQuizCreateQuestion(token, quizId, validQuestionBody);
    sessionId = requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM).sessionId;
  });

  describe('success cases', () => {
    test('expected return value received', () => {
      expect(requestSessionStatus(token, quizId, sessionId)).toStrictEqual(SUCCESSFUL_SESSION_STATUS);
    });
  });

  describe('failure cases', () => {
    test('(400) session Id does not refer to valid session within this quiz', () => {
      quizId2 = adminQuizCreate(token, VALID_QUIZ_2.NAME, VALID_QUIZ_2.DESCRIPTION).quizId;
      adminQuizCreateQuestion(token, quizId2, validQuestionBody);
      sessionId2 = requestQuizSessionCreate(token, quizId2, VALID_AUTOSTARTNUM).sessionId;
      expect(() => requestSessionStatus(token, quizId, sessionId2)).toThrow(HTTPError[INPUT_ERROR]);
    });

    test('(401) token is invalid ', () => {
      expect(() => requestSessionStatus(token + 1, quizId, sessionId)).toThrow(HTTPError[UNAUTHORISED]);
    });

    test('(401) token is empty ', () => {
      expect(() => requestSessionStatus('', quizId, sessionId)).toThrow(HTTPError[UNAUTHORISED]);
    });

    test('(403) valid token but user is not authorised to view this session', () => {
      expect(() => requestSessionStatus(tokenSecondAdmin, quizId, sessionId)).toThrow(HTTPError[FORBIDDEN]);
    });

    test('(403) sessionId doesnt exist', () => {
      expect(() => requestSessionStatus(tokenSecondAdmin, quizId, sessionId + 1)).toThrow(HTTPError[FORBIDDEN]);
    });
  });
});
