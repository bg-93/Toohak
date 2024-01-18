import { INPUT_ERROR, SUCCESSFUL_QUESTION_ANSWER, VALID_QUIZ, VALID_USER, adminAuthRegister, adminQuizCreate, adminQuizCreateQuestion, clear, requestPlayerQuestionAnswer, requestQuizSessionCreate, requestQuizSessionUpdate, validQuestionBody, validQuestionBody2, requestPlayerJoin } from '../testHelper';
import HTTPError from 'http-errors';
import { AdminQuizAction } from '../types';
beforeEach(() => {
  clear();
});

const VALID_AUTOSTARTNUM = 40;

describe('PUT /v1/player/:playerid/question/:questionposition/answer', () => {
  let playerId: number;
  let questionPosition: number;
  let sessionId: number;
  let token: string;
  let quizId: number;
  let answerIds: number[];
  let name: string;

  beforeEach(() => {
    token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    quizId = adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    adminQuizCreateQuestion(token, quizId, validQuestionBody);
    adminQuizCreateQuestion(token, quizId, validQuestionBody);
    adminQuizCreateQuestion(token, quizId, validQuestionBody);
    name = VALID_USER.NAME_FIRST;
    sessionId = requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM).sessionId;
    playerId = requestPlayerJoin(sessionId, name).playerId;
    answerIds = [
      4,
    ];
    questionPosition = 1;
  });

  describe('success case', () => {
    test('valid inputs', () => {
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.SKIP_COUNTDOWN);
      expect(requestPlayerQuestionAnswer(answerIds, playerId, questionPosition)).toStrictEqual(SUCCESSFUL_QUESTION_ANSWER);
    });
  });

  describe('error cases', () => {
    describe('400', () => {
      test('playerId does not exist', () => {
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.SKIP_COUNTDOWN);
        expect(() => requestPlayerQuestionAnswer(answerIds, -1, questionPosition)).toThrow(HTTPError[INPUT_ERROR]);
      });

      test('question position is not valid for the session this player is in', () => {
        expect(() => requestPlayerQuestionAnswer(answerIds, playerId, questionPosition + 10)).toThrow(HTTPError[INPUT_ERROR]);
      });

      describe('Session is not in QUESTION_OPEN state', () => {
        test('Game is in LOBBY state', () => {
          expect(() => requestPlayerQuestionAnswer(answerIds, playerId, questionPosition)).toThrow(HTTPError[INPUT_ERROR]);
        });
        test('Game is in QUESTION_COUNTDOWN state', () => {
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
          expect(() => requestPlayerQuestionAnswer(answerIds, playerId, questionPosition)).toThrow(HTTPError[INPUT_ERROR]);
        });
        test('Game is in END state', () => {
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.END);
          expect(() => requestPlayerQuestionAnswer(answerIds, playerId, questionPosition)).toThrow(HTTPError[INPUT_ERROR]);
        });
        test('Game is in ANSWER_SHOW state', () => {
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.SKIP_COUNTDOWN);
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.GO_TO_ANSWER);
          expect(() => requestPlayerQuestionAnswer(answerIds, playerId, questionPosition)).toThrow(HTTPError[INPUT_ERROR]);
        });
        test('Game is in FINAL_RESULTS state', () => {
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.SKIP_COUNTDOWN);
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.GO_TO_ANSWER);
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.GO_TO_FINAL_RESULTS);
          expect(() => requestPlayerQuestionAnswer(answerIds, playerId, questionPosition)).toThrow(HTTPError[INPUT_ERROR]);
        });
      });

      test('if sessions are not yet up to this question', () => {
        adminQuizCreateQuestion(token, quizId, validQuestionBody2);
        questionPosition = 3;
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.SKIP_COUNTDOWN);
        expect(() => requestPlayerQuestionAnswer(answerIds, playerId, questionPosition)).toThrow(HTTPError[INPUT_ERROR]);
      });

      test('answer Ids are not valid for this particular question', () => {
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.SKIP_COUNTDOWN);
        answerIds = [
          1234,
        ];
        expect(() => requestPlayerQuestionAnswer(answerIds, playerId, questionPosition)).toThrow(HTTPError[INPUT_ERROR]);
      });

      test('there are duplicate answer IDs provided', () => {
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.SKIP_COUNTDOWN);
        answerIds = [
          2384,
          2384,
        ];
        expect(() => requestPlayerQuestionAnswer(answerIds, playerId, questionPosition)).toThrow(HTTPError[INPUT_ERROR]);
      });

      test('less than 1 answer Id submitted', () => {
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.SKIP_COUNTDOWN);
        answerIds = [];
        expect(() => requestPlayerQuestionAnswer(answerIds, playerId, questionPosition)).toThrow(HTTPError[INPUT_ERROR]);
      });
    });
  });
});
