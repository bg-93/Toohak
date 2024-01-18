import { INPUT_ERROR, VALID_QUIZ, VALID_USER, adminAuthRegister, adminQuizCreate, adminQuizCreateQuestion, clear, requestQuizSessionCreate, validQuestionBody, requestPlayerStatus, requestPlayerJoin } from '../testHelper';
import HTTPError from 'http-errors';
beforeEach(() => {
  clear();
});

const VALID_AUTOSTARTNUM = 40;

describe('GET /v1/player/:playerid', () => {
  let token: string;
  let quizId: number;
  let sessionId1: number;
  let playerId1: number;

  beforeEach(() => {
    token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    quizId = adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    adminQuizCreateQuestion(token, quizId, validQuestionBody);
    sessionId1 = requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM).sessionId;
    playerId1 = requestPlayerJoin(sessionId1, 'Hayden Smith').playerId;
  });

  describe('success cases', () => {
    test('valid inputs', () => {
      expect(requestPlayerStatus(playerId1)).toStrictEqual({
        state: 'LOBBY',
        numQuestions: 1,
        atQuestion: 0
      });
    });
  });

  describe('fail cases', () => {
    describe('400', () => {
      test('playerId does not exist', () => {
        expect(() => requestPlayerStatus(-1)).toThrow(HTTPError[INPUT_ERROR]);
      });
    });
  });
});
