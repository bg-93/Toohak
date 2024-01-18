import { INPUT_ERROR, VALID_QUIZ, VALID_USER, adminAuthRegister, adminQuizCreate, adminQuizCreateQuestion, clear, requestQuizSessionCreate, validQuestionBody, requestPlayerJoin, requestQuizSessionUpdate, SUCCESSFUL_PLAYER_JOIN, requestSessionStatus } from '../testHelper';
import { AdminQuizAction, QuizState } from '../types';
import HTTPError from 'http-errors';
beforeEach(() => {
  clear();
});

const VALID_AUTOSTARTNUM = 40;

describe('POST /v1/player/join', () => {
  let token: string;
  let quizId: number;
  let sessionId: number;
  let playerId1: number;

  beforeEach(() => {
    token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    quizId = adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    adminQuizCreateQuestion(token, quizId, validQuestionBody);
    sessionId = requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM).sessionId;
  });

  describe('success cases', () => {
    test('one player joins quiz session', () => {
      playerId1 = requestPlayerJoin(sessionId, 'Hayden Smith').playerId;
      expect(playerId1).toStrictEqual(expect.any(Number));
    });

    test('Name is empty', () => {
      expect(requestPlayerJoin(sessionId, '')).toStrictEqual(SUCCESSFUL_PLAYER_JOIN);
      expect(requestPlayerJoin(sessionId, '')).toStrictEqual(SUCCESSFUL_PLAYER_JOIN);
      expect(requestPlayerJoin(sessionId, '')).toStrictEqual(SUCCESSFUL_PLAYER_JOIN);
    });

    test('session automatically starts', () => {
      const sessionId2 = requestQuizSessionCreate(token, quizId, 2).sessionId;
      expect(requestSessionStatus(token, quizId, sessionId2).state).toBe(QuizState.LOBBY);
      expect(requestPlayerJoin(sessionId2, '')).toStrictEqual(SUCCESSFUL_PLAYER_JOIN);
      expect(requestPlayerJoin(sessionId2, '')).toStrictEqual(SUCCESSFUL_PLAYER_JOIN);
      expect(requestSessionStatus(token, quizId, sessionId2).state).toBe(QuizState.QUESTION_COUNTDOWN);
    });
  });

  describe('failure cases', () => {
    test('HTTPError (400): Name of user entered is not unique (compared to other users who have already joined)', () => {
      expect(requestPlayerJoin(sessionId, 'Hayden Smith').playerId).toStrictEqual(expect.any(Number));
      expect(requestPlayerJoin(sessionId, 'John').playerId).toStrictEqual(expect.any(Number));
      expect(() => requestPlayerJoin(sessionId, 'Hayden Smith')).toThrow(HTTPError[INPUT_ERROR]);
      expect(() => requestPlayerJoin(sessionId, 'John')).toThrow(HTTPError[INPUT_ERROR]);
    });

    describe('Session is not in LOBBY state', () => {
      test('Game is in QUESTION_COUNTDOWN state', () => {
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
        expect(() => requestPlayerJoin(sessionId, VALID_USER.NAME_FIRST)).toThrow(HTTPError[INPUT_ERROR]);
      });
      test('Game is in QUESTION_OPEN state', () => {
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.SKIP_COUNTDOWN);
        expect(() => requestPlayerJoin(sessionId, VALID_USER.NAME_FIRST)).toThrow(HTTPError[INPUT_ERROR]);
      });
      test('Game is in END state', () => {
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.END);
        expect(() => requestPlayerJoin(sessionId, VALID_USER.NAME_FIRST)).toThrow(HTTPError[INPUT_ERROR]);
      });
      test('Game is in ANSWER_SHOW state', () => {
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.SKIP_COUNTDOWN);
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.GO_TO_ANSWER);
        expect(() => requestPlayerJoin(sessionId, VALID_USER.NAME_FIRST)).toThrow(HTTPError[INPUT_ERROR]);
      });
      test('Game is in FINAL_RESULTS state', () => {
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.SKIP_COUNTDOWN);
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.GO_TO_ANSWER);
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.GO_TO_FINAL_RESULTS);
        expect(() => requestPlayerJoin(sessionId, VALID_USER.NAME_FIRST)).toThrow(HTTPError[INPUT_ERROR]);
      });
    });
  });
});
