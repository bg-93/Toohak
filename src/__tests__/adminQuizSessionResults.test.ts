import { createQuizSession } from '../quiz';
import { adminQuizCreateQuestion, validQuestionBody, validQuestionBody2, FORBIDDEN, INPUT_ERROR, SUCCESSFUL_QUIZ_SESSION_RESULTS, UNAUTHORISED, VALID_QUIZ, VALID_USER, VALID_USER_2, adminAuthRegister, adminQuizCreate, clear, requestQuizSessionResults, requestQuizSessionUpdate, VALID_QUIZ_2 } from '../testHelper';
import { AdminQuizAction } from '../types';
import HTTPError from 'http-errors';
beforeEach(() => {
  clear();
});

const VALID_AUTOSTARTNUM = 40;

describe('GET /v1/admin/quiz/:quizid/session/:sessionid/results', () => {
  let token: string;
  let quizId: number;
  let sessionId: number;

  beforeEach(() => {
    token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    quizId = adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    adminQuizCreateQuestion(token, quizId, validQuestionBody);
    adminQuizCreateQuestion(token, quizId, validQuestionBody2);
    sessionId = createQuizSession(token, quizId, VALID_AUTOSTARTNUM).sessionId;
  });

  describe('success case', () => {
    test('return success', () => {
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.SKIP_COUNTDOWN);
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.GO_TO_ANSWER);
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.GO_TO_FINAL_RESULTS);
      expect(requestQuizSessionResults(token, quizId, sessionId)).toStrictEqual(SUCCESSFUL_QUIZ_SESSION_RESULTS);
    });
  });

  describe('error cases', () => {
    describe('400', () => {
      test('sessionid does not refer to a valid session within this quiz', () => {
        const quizId2 = adminQuizCreate(token, VALID_QUIZ_2.NAME, VALID_QUIZ_2.DESCRIPTION).quizId;
        expect(() => requestQuizSessionResults(token, quizId2, sessionId)).toThrow(HTTPError[INPUT_ERROR]);
      });

      describe('session is not in FINAL_RESULTS state', () => {
        test('Game is in QUESTION_COUNTDOWN state', () => {
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
          expect(() => requestQuizSessionResults(token, quizId, sessionId)).toThrow(HTTPError[INPUT_ERROR]);
        });

        test('Game is in QUESTION_OPEN state', () => {
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.SKIP_COUNTDOWN);
          expect(() => requestQuizSessionResults(token, quizId, sessionId)).toThrow(HTTPError[INPUT_ERROR]);
        });

        test('Game is in END state', () => {
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.END);
          expect(() => requestQuizSessionResults(token, quizId, sessionId)).toThrow(HTTPError[INPUT_ERROR]);
        });

        test('Game is in ANSWER_SHOW state', () => {
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.SKIP_COUNTDOWN);
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.GO_TO_ANSWER);
          expect(() => requestQuizSessionResults(token, quizId, sessionId)).toThrow(HTTPError[INPUT_ERROR]);
        });
      });
    });

    describe('401', () => {
      test('token is empty or invalid (does not refer to valid logged in user session', () => {
        expect(() => requestQuizSessionResults(token + 1, quizId, sessionId)).toThrow(HTTPError[UNAUTHORISED]);
      });
    });

    describe('403', () => {
      test('Valid token is provided but user is not an owner of this quiz', () => {
        const token2 = adminAuthRegister(VALID_USER_2.EMAIL, VALID_USER_2.PASSWORD, VALID_USER_2.NAME_FIRST, VALID_USER_2.NAME_LAST).token;
        expect(() => requestQuizSessionResults(token2, quizId, sessionId)).toThrow(HTTPError[FORBIDDEN]);
      });
    });
  });
});
