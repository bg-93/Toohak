import { INPUT_ERROR, VALID_QUIZ, VALID_USER, adminAuthRegister, adminQuizCreate, adminQuizCreateQuestion, clear, requestQuizSessionCreate, validQuestionBody, validQuestionBody2, requestPlayerQuestionAnswer, requestPlayerJoin, requestQuizSessionUpdate, requestPlayerFinalResults } from '../testHelper';
import HTTPError from 'http-errors';
import { AdminQuizAction } from '../types';

function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}

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
const name1 = 'Apple Bee';
const name2 = 'Candy Dunk';

describe('GET /v1/player/{playerid}/results', () => {
  let token: string;
  let quizId: number;
  let questionId1: number;
  let questionId2: number;
  let sessionId: number;
  let playerId1: number;
  let playerId2: number;

  beforeEach(() => {
    token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    quizId = adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    questionId1 = adminQuizCreateQuestion(token, quizId, validQuestionBody).questionId;
    questionId2 = adminQuizCreateQuestion(token, quizId, validQuestionBody2).questionId;
    sessionId = requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM).sessionId;
    playerId1 = requestPlayerJoin(sessionId, name1).playerId;
    playerId2 = requestPlayerJoin(sessionId, name2).playerId;
  });

  describe('success cases', () => {
    test('2 questions, 2 players, 1 person gets both correct, other gets none correct', () => {
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
      sleepSync(3 * 1000);

      requestPlayerQuestionAnswer(answerIdsCorrect1, playerId1, question1Position);
      requestPlayerQuestionAnswer(answerIdsIncorrect1, playerId2, question1Position);

      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.GO_TO_ANSWER);
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.SKIP_COUNTDOWN);

      requestPlayerQuestionAnswer(answerIdsCorrect2, playerId1, question2Position);
      requestPlayerQuestionAnswer(answerIdsIncorrect2, playerId2, question2Position);

      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.GO_TO_ANSWER);
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
      requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.GO_TO_FINAL_RESULTS);

      expect(requestPlayerFinalResults(playerId1)).toStrictEqual({
        usersRankedByScore: [
          {
            name: name1,
            score: 12
          },
          {
            name: name2,
            score: 0
          }
        ],
        questionResults: [
          {
            questionId: questionId1,
            playersCorrectList: [
              name1
            ],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 50
          },
          {
            questionId: questionId2,
            playersCorrectList: [
              name1
            ],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 50
          }
        ]
      });
    });
  });

  describe('failure cases', () => {
    describe('HTTPError 400', () => {
      test('If player ID does not exist', () => {
        expect(() => requestPlayerFinalResults(-1)).toThrow(HTTPError[INPUT_ERROR]);
      });

      describe('Session is not in FINAL_RESULTS state', () => {
        test('Game is in QUESTION_COUNTDOWN state', () => {
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
          expect(() => requestPlayerFinalResults(playerId1)).toThrow(HTTPError[INPUT_ERROR]);
        });
        test('Game is in QUESTION_OPEN state', () => {
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.SKIP_COUNTDOWN);
          expect(() => requestPlayerFinalResults(playerId1)).toThrow(HTTPError[INPUT_ERROR]);
        });
        test('Game is in END state', () => {
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.END);
          expect(() => requestPlayerFinalResults(playerId1)).toThrow(HTTPError[INPUT_ERROR]);
        });
        test('Game is in ANSWER_SHOW state', () => {
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.NEXT_QUESTION);
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.SKIP_COUNTDOWN);
          requestQuizSessionUpdate(token, quizId, sessionId, AdminQuizAction.GO_TO_ANSWER);
          expect(() => requestPlayerFinalResults(playerId1)).toThrow(HTTPError[INPUT_ERROR]);
        });
      });
    });
  });
});
