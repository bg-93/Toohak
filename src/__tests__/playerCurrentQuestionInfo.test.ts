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
  requestPlayerJoin,
  requestQuizSessionUpdate,
  requestSessionStatus,
  requestPlayerCurrentQuestionInfo,
  SUCCESSFUL_PLAYER_CURRENT_QUESTION_INFO,
  validQuestionBody2
} from '../testHelper';
import { AdminQuizAction } from '../types';
import HTTPError from 'http-errors';
beforeEach(() => {
  clear();
});

const VALID_AUTOSTARTNUM = 40;
const q1Pos = 1;

describe('POST /v1/player/join', () => {
  let token: string;
  let quizId: number;
  let sessionId: number;
  let playerId1: number;

  beforeEach(() => {
    token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    quizId = adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    adminQuizCreateQuestion(token, quizId, validQuestionBody);
    adminQuizCreateQuestion(token, quizId, validQuestionBody2);
    sessionId = requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM).sessionId;
    playerId1 = requestPlayerJoin(sessionId, 'Hayden Smith').playerId;
  });

  describe('success cases', () => {
    test('expected return', () => {
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
      const playerCurrentQuestionInfo = requestPlayerCurrentQuestionInfo(playerId1, q1Pos);
      expect(playerCurrentQuestionInfo).toStrictEqual(SUCCESSFUL_PLAYER_CURRENT_QUESTION_INFO);
    });
  });

  describe('failure cases', () => {
    test('(400) player Id does not exist', () => {
      expect(() => requestPlayerCurrentQuestionInfo(playerId1 + 1, q1Pos)).toThrow(HTTPError[INPUT_ERROR]);
    });

    test('(400) question position not valid for player session', () => {
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.SKIP_COUNTDOWN);
      expect(() => requestPlayerCurrentQuestionInfo(playerId1, -1)).toThrow(HTTPError[INPUT_ERROR]);
    });

    test('(400) session is not currently on this question', () => {
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.SKIP_COUNTDOWN);
      const sessionCurrentQuestion = requestSessionStatus(token, quizId, sessionId).atQuestion;
      expect(() => requestPlayerCurrentQuestionInfo(playerId1, sessionCurrentQuestion + 1)).toThrow(HTTPError[INPUT_ERROR]);
    });

    test('(400) session is in the LOBBY state', () => {
      expect(() => requestPlayerCurrentQuestionInfo(playerId1, 1)).toThrow(HTTPError[INPUT_ERROR]);
    });

    test('(400) session is in the END state', () => {
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.END);
      expect(() => requestPlayerCurrentQuestionInfo(playerId1, 1)).toThrow(HTTPError[INPUT_ERROR]);
    });
  });
});
