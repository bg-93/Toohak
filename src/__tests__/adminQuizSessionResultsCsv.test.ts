import { FORBIDDEN, INPUT_ERROR, SUCCESSFUL_QUIZ_SESSION_RESULTS_CSV, UNAUTHORISED, VALID_QUIZ, VALID_USER, VALID_USER_2, adminAuthRegister, adminQuizCreate, adminQuizCreateQuestion, clear, requestQuizSessionCreate, requestQuizSessionUpdate, validQuestionBody, requestQuizSessionResultsCsv, validQuestionBody2, requestPlayerJoin, requestPlayerQuestionAnswer, VALID_QUIZ_2 } from '../testHelper';
import HTTPError from 'http-errors';
import { AdminQuizAction } from '../types';
beforeEach(() => {
  clear();
});

const VALID_AUTOSTARTNUM = 40;

const question1Position = 1;
const question2Position = 2;
const answerIdsCorrect1 = [4];
const answerIdsIncorrect1 = [6];
const answerIdsCorrect2 = [7];
const answerIdsIncorrect2 = [9];

function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}

describe('GET /v1/admin/quiz/{quizid}/session/{sessionid}/results/csv', () => {
  let token: string;
  let quizId: number;
  let sessionId1: number;
  let playerId1: number;
  let playerId2: number;
  let playerId3: number;

  beforeEach(() => {
    token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    quizId = adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    adminQuizCreateQuestion(token, quizId, validQuestionBody);
    adminQuizCreateQuestion(token, quizId, validQuestionBody2);
    sessionId1 = requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM).sessionId;
    playerId1 = requestPlayerJoin(sessionId1, 'Hayden Smith').playerId;
    playerId2 = requestPlayerJoin(sessionId1, 'Yechan Yu').playerId;
    playerId3 = requestPlayerJoin(sessionId1, 'Ethan Jiang').playerId;
  });

  describe('success cases', () => {
    test('Player 1 correct all answers', () => {
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.NEXT_QUESTION);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.SKIP_COUNTDOWN);

      requestPlayerQuestionAnswer(answerIdsCorrect1, playerId1, question1Position);
      requestPlayerQuestionAnswer(answerIdsIncorrect1, playerId2, question1Position);

      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.GO_TO_ANSWER);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.NEXT_QUESTION);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.SKIP_COUNTDOWN);

      requestPlayerQuestionAnswer(answerIdsCorrect2, playerId1, question2Position);
      requestPlayerQuestionAnswer(answerIdsIncorrect2, playerId2, question2Position);

      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.GO_TO_ANSWER);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.GO_TO_FINAL_RESULTS);

      const results = requestQuizSessionResultsCsv(token, quizId, sessionId1);
      expect(results).toStrictEqual(SUCCESSFUL_QUIZ_SESSION_RESULTS_CSV);
    });

    test('Player 1 correct Q1, Player 2 correct Q2', () => {
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.NEXT_QUESTION);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.SKIP_COUNTDOWN);

      requestPlayerQuestionAnswer(answerIdsIncorrect1, playerId1, question1Position);
      requestPlayerQuestionAnswer(answerIdsCorrect1, playerId2, question1Position);

      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.GO_TO_ANSWER);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.NEXT_QUESTION);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.SKIP_COUNTDOWN);

      requestPlayerQuestionAnswer(answerIdsCorrect2, playerId1, question2Position);
      requestPlayerQuestionAnswer(answerIdsIncorrect2, playerId2, question2Position);

      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.GO_TO_ANSWER);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.GO_TO_FINAL_RESULTS);

      const results = requestQuizSessionResultsCsv(token, quizId, sessionId1);
      expect(results).toStrictEqual(SUCCESSFUL_QUIZ_SESSION_RESULTS_CSV);
    });

    test('Player 1 and 2 both correct Q1, player 2 correct Q2', () => {
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.NEXT_QUESTION);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.SKIP_COUNTDOWN);

      requestPlayerQuestionAnswer(answerIdsCorrect1, playerId1, question1Position);
      requestPlayerQuestionAnswer(answerIdsCorrect1, playerId2, question1Position);

      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.GO_TO_ANSWER);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.NEXT_QUESTION);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.SKIP_COUNTDOWN);

      requestPlayerQuestionAnswer(answerIdsCorrect2, playerId1, question2Position);
      requestPlayerQuestionAnswer(answerIdsIncorrect2, playerId2, question2Position);

      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.GO_TO_ANSWER);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.GO_TO_FINAL_RESULTS);

      const results = requestQuizSessionResultsCsv(token, quizId, sessionId1);
      expect(results).toStrictEqual(SUCCESSFUL_QUIZ_SESSION_RESULTS_CSV);
    });

    test('P1 P2 P3 correct Q1, P2 incorrect Q2, P1 P3 correct q2', () => {
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.NEXT_QUESTION);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.SKIP_COUNTDOWN);

      requestPlayerQuestionAnswer(answerIdsCorrect1, playerId1, question1Position);
      requestPlayerQuestionAnswer(answerIdsCorrect1, playerId2, question1Position);
      requestPlayerQuestionAnswer(answerIdsCorrect1, playerId3, question1Position);

      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.GO_TO_ANSWER);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.NEXT_QUESTION);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.SKIP_COUNTDOWN);

      requestPlayerQuestionAnswer(answerIdsCorrect2, playerId1, question2Position);
      requestPlayerQuestionAnswer(answerIdsIncorrect2, playerId2, question2Position);
      requestPlayerQuestionAnswer(answerIdsCorrect2, playerId3, question2Position);

      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.GO_TO_ANSWER);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.GO_TO_FINAL_RESULTS);

      const results = requestQuizSessionResultsCsv(token, quizId, sessionId1);
      expect(results).toStrictEqual(SUCCESSFUL_QUIZ_SESSION_RESULTS_CSV);
    });

    test('folder is removed', () => {
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.NEXT_QUESTION);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.SKIP_COUNTDOWN);

      requestPlayerQuestionAnswer(answerIdsCorrect1, playerId1, question1Position);
      requestPlayerQuestionAnswer(answerIdsCorrect1, playerId2, question1Position);

      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.GO_TO_ANSWER);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.NEXT_QUESTION);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.SKIP_COUNTDOWN);

      requestPlayerQuestionAnswer(answerIdsCorrect2, playerId1, question2Position);
      requestPlayerQuestionAnswer(answerIdsIncorrect2, playerId2, question2Position);

      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.GO_TO_ANSWER);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.GO_TO_FINAL_RESULTS);

      const results = requestQuizSessionResultsCsv(token, quizId, sessionId1);
      expect(results).toStrictEqual(SUCCESSFUL_QUIZ_SESSION_RESULTS_CSV);
    });

    test('Player 2 no submission of answers', () => {
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.NEXT_QUESTION);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.SKIP_COUNTDOWN);

      requestPlayerQuestionAnswer(answerIdsCorrect1, playerId1, question1Position);

      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.GO_TO_ANSWER);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.NEXT_QUESTION);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.SKIP_COUNTDOWN);

      requestPlayerQuestionAnswer(answerIdsCorrect2, playerId1, question2Position);

      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.GO_TO_ANSWER);
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.GO_TO_FINAL_RESULTS);

      const results = requestQuizSessionResultsCsv(token, quizId, sessionId1);
      expect(results).toStrictEqual(SUCCESSFUL_QUIZ_SESSION_RESULTS_CSV);
    });
  });

  describe('fail cases', () => {
    describe('400', () => {
      describe('Session is not in FINAL_RESULTS state', () => {
        test('Session is in LOBBY state', () => {
          expect(() => requestQuizSessionResultsCsv(token, quizId, sessionId1)).toThrow(HTTPError[INPUT_ERROR]);
        });

        test('Session is in QUESTION_COUNTDOWN state', () => {
          requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.NEXT_QUESTION);
          expect(() => requestQuizSessionResultsCsv(token, quizId, sessionId1)).toThrow(HTTPError[INPUT_ERROR]);
        });

        test('Session is in QUESTION_OPEN state', () => {
          requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.NEXT_QUESTION);
          requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.SKIP_COUNTDOWN);
          expect(() => requestQuizSessionResultsCsv(token, quizId, sessionId1)).toThrow(HTTPError[INPUT_ERROR]);
        });

        test('Session is in QUESTION_CLOSE state', () => {
          requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.NEXT_QUESTION);
          requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.SKIP_COUNTDOWN);
          sleepSync(2 * 1000);
          expect(() => requestQuizSessionResultsCsv(token, quizId, sessionId1)).toThrow(HTTPError[INPUT_ERROR]);
        });

        test('Session is in ANSWER_SHOW state', () => {
          requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.NEXT_QUESTION);
          requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.SKIP_COUNTDOWN);
          requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.GO_TO_ANSWER);
          expect(() => requestQuizSessionResultsCsv(token, quizId, sessionId1)).toThrow(HTTPError[INPUT_ERROR]);
        });

        test('Session is in END state', () => {
          requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.END);
          expect(() => requestQuizSessionResultsCsv(token, quizId, sessionId1)).toThrow(HTTPError[INPUT_ERROR]);
        });
      });

      test('Session id does not refer to a valid session within this quiz', () => {
        const quizId2 = adminQuizCreate(token, VALID_QUIZ_2.NAME, VALID_QUIZ_2.DESCRIPTION).quizId;
        expect(() => requestQuizSessionResultsCsv(token, quizId2, sessionId1)).toThrow(HTTPError[INPUT_ERROR]);
      });
    });

    describe('401', () => {
      test('Token is empty or invalid (does not refer to valid logged in user session', () => {
        expect(() => requestQuizSessionResultsCsv(token + 1, quizId, sessionId1)).toThrow(HTTPError[UNAUTHORISED]);
      });
    });

    describe('403', () => {
      test('Valid token is provided but user is not authorised to view this session', () => {
        const token2 = adminAuthRegister(VALID_USER_2.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
        adminQuizCreate(token2, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION);
        expect(() => requestQuizSessionResultsCsv(token2, quizId, sessionId1)).toThrow(HTTPError[FORBIDDEN]);
      });
    });
  });
});
