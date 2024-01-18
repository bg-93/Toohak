import { INPUT_ERROR, VALID_QUIZ, VALID_USER, adminAuthRegister, adminQuizCreate, adminQuizCreateQuestion, clear, requestQuizSessionCreate, validQuestionBody, requestPlayerQuestionAnswer, requestPlayerJoin, requestPlayerQuestionResults, requestQuizSessionUpdate, validQuestionBody3 } from '../testHelper';
import HTTPError from 'http-errors';
import { AdminQuizAction } from '../types';
beforeEach(() => {
  clear();
});

function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}

const VALID_AUTOSTARTNUM = 40;
const validQuestionPosition = 1;
const answerIdsCorrect = [4];
const invalidId = 1000;
const answerIdsIncorrect = [6];
const answerIdsCorrect2 = [7, 9];
const answerIdsIncorrect2 = [7];

describe('GET /v1/player/{playerid}/question/{questionposition}/results', () => {
  let token: string;
  let quizId: number;
  let questionId: number;
  let questionId2: number;
  let sessionId: number;
  let playerId1: number;
  let playerId2: number;

  beforeEach(() => {
    token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    quizId = adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    questionId = adminQuizCreateQuestion(token, quizId, validQuestionBody).questionId;
    questionId2 = adminQuizCreateQuestion(token, quizId, validQuestionBody3).questionId;
    sessionId = requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM).sessionId;
    playerId1 = requestPlayerJoin(sessionId, 'Apple Bee').playerId;
    playerId2 = requestPlayerJoin(sessionId, 'Candy Dunk').playerId;

    requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
    requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.SKIP_COUNTDOWN); // current getData() = session, player1 player2 = {no answers}
  });

  describe('success cases', () => {
    test('1 correct, 1 incorrect', () => {
      requestPlayerQuestionAnswer(answerIdsCorrect, playerId1, validQuestionPosition);
      requestPlayerQuestionAnswer(answerIdsIncorrect, playerId2, validQuestionPosition);
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.GO_TO_ANSWER);
      expect(requestPlayerQuestionResults(playerId1, validQuestionPosition)).toStrictEqual({
        questionId: questionId,
        playersCorrectList: [
          'Apple Bee'
        ],
        averageAnswerTime: expect.any(Number),
        percentCorrect: 50
      });
    });

    test('1 incorrect', () => {
      requestPlayerQuestionAnswer(answerIdsIncorrect, playerId1, validQuestionPosition);
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.GO_TO_ANSWER);
      expect(requestPlayerQuestionResults(playerId1, validQuestionPosition)).toStrictEqual({
        questionId: questionId,
        playersCorrectList: [],
        averageAnswerTime: expect.any(Number),
        percentCorrect: 0
      });
    });

    test('multiple correct', () => {
      requestPlayerQuestionAnswer(answerIdsCorrect, playerId1, validQuestionPosition);
      requestPlayerQuestionAnswer(answerIdsCorrect, playerId2, validQuestionPosition);
      sleepSync(3.1 * 1000);
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.GO_TO_ANSWER);
      expect(requestPlayerQuestionResults(playerId1, validQuestionPosition)).toStrictEqual({
        questionId: questionId,
        playersCorrectList: [
          'Apple Bee',
          'Candy Dunk'
        ],
        averageAnswerTime: expect.any(Number),
        percentCorrect: 100
      });
    });

    test('two correct answers', () => {
      requestPlayerQuestionAnswer(answerIdsCorrect, playerId1, validQuestionPosition);
      requestPlayerQuestionAnswer(answerIdsCorrect, playerId2, validQuestionPosition);
      // sleepSync(4 * 1000);
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.GO_TO_ANSWER);
      expect(requestPlayerQuestionResults(playerId1, validQuestionPosition)).toStrictEqual({
        questionId: questionId,
        playersCorrectList: [
          'Apple Bee',
          'Candy Dunk'
        ],
        averageAnswerTime: expect.any(Number),
        percentCorrect: 100
      });

      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.SKIP_COUNTDOWN);

      requestPlayerQuestionAnswer(answerIdsIncorrect2, playerId1, 2);
      requestPlayerQuestionAnswer(answerIdsCorrect2, playerId2, 2);
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.GO_TO_ANSWER);
      expect(requestPlayerQuestionResults(playerId1, 2)).toStrictEqual({
        questionId: questionId2,
        playersCorrectList: [
          'Candy Dunk'
        ],
        averageAnswerTime: expect.any(Number),
        percentCorrect: 50
      });
    });
  });

  describe('failure cases', () => {
    describe('HTTPError 400', () => {
      test('Player ID does not exist', () => {
        requestPlayerQuestionAnswer(answerIdsCorrect, playerId1, validQuestionPosition);
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.GO_TO_ANSWER);
        expect(() => requestPlayerQuestionResults(invalidId, validQuestionPosition)).toThrow(HTTPError[INPUT_ERROR]);
      });

      test('Question position is not valid for the session this player is in', () => {
        requestPlayerQuestionAnswer(answerIdsCorrect, playerId1, validQuestionPosition);
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.GO_TO_ANSWER);
        expect(() => requestPlayerQuestionResults(playerId1, -1)).toThrow(HTTPError[INPUT_ERROR]);
        expect(() => requestPlayerQuestionResults(playerId1, 10)).toThrow(HTTPError[INPUT_ERROR]);
      });

      test('Session is not in ANSWER_SHOW state', () => {
        requestPlayerQuestionAnswer(answerIdsCorrect, playerId1, validQuestionPosition);
        expect(() => requestPlayerQuestionResults(playerId1, validQuestionPosition)).toThrow(HTTPError[INPUT_ERROR]);
      });

      // We are up to the first question but asking for second question results
      test('If session is not yet up to this question', () => {
        requestPlayerQuestionAnswer(answerIdsCorrect, playerId1, validQuestionPosition);
        requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.GO_TO_ANSWER);
        expect(() => requestPlayerQuestionResults(playerId1, 2)).toThrow(HTTPError[INPUT_ERROR]);
      });
    });
  });
});
