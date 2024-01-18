import { FORBIDDEN, INPUT_ERROR, SUCCESSFUL_QUIZ_SESSION_CREATE, UNAUTHORISED, VALID_QUIZ, VALID_USER, VALID_USER_2, adminAuthRegister, adminQuizCreate, adminQuizCreateQuestion, adminQuizDeleteQuestion, clear, requestQuizSessionCreate, requestQuizSessionUpdate, validQuestionBody } from '../testHelper';
import HTTPError from 'http-errors';
import { AdminQuizAction } from '../types';
beforeEach(() => {
  clear();
});

const VALID_AUTOSTARTNUM = 40;

describe('POST /v1/admin/quiz/:quizid/session', () => {
  let token: string;
  let quizId: number;
  let questionId: number;

  beforeEach(() => {
    token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    quizId = adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    questionId = adminQuizCreateQuestion(token, quizId, validQuestionBody).questionId;
  });

  describe('success cases', () => {
    test('valid inputs', () => {
      expect(requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM)).toStrictEqual(SUCCESSFUL_QUIZ_SESSION_CREATE);
    });

    test('unique ids', () => {
      const session1 = requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM);
      const session2 = requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM);
      const session3 = requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM);
      const uniqueIds = Array.from(new Set([session1.sessionId, session2.sessionId, session3.sessionId]));
      expect(uniqueIds).toHaveLength(3);
    });

    test('correct details', () => {
      // const session1 = requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM)
      // const details = requestQuizSessionStatus(token, quizId, sessionId);
      // expect(details.metadata.quizId).toStrictEqual(quizId)
    });

    test('one session is in end', () => {
      const sessionId1 = requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM).sessionId;
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.END);
      for (let i = 0; i < 10; i++) {
        requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM);
      }
      expect(() => requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM)).toThrow(HTTPError[INPUT_ERROR]);
    });
  });

  describe('fail cases', () => {
    describe('400', () => {
      test('400 autoStartNum is a number greater than 50', () => {
        expect(() => requestQuizSessionCreate(token, quizId, 60)).toThrow(HTTPError[INPUT_ERROR]);
      });

      test('A maximum of 10 sessions that are not in END state currently exist', () => {
        for (let i = 0; i < 10; i++) {
          requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM);
        }
        expect(() => requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM)).toThrow(HTTPError[INPUT_ERROR]);
      });

      test('The quiz does not have any questions in it', () => {
        adminQuizDeleteQuestion(quizId, questionId, token);
        expect(() => requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM)).toThrow(HTTPError[INPUT_ERROR]);
      });
    });

    describe('401', () => {
      test('Token is empty or invalid (does not refer to valid logged in user session', () => {
        expect(() => requestQuizSessionCreate(token + 1, quizId, VALID_AUTOSTARTNUM)).toThrow(HTTPError[UNAUTHORISED]);
      });
    });

    describe('403', () => {
      test('Valid token is provided but user is not an owner of this quiz', () => {
        const token2 = adminAuthRegister(VALID_USER_2.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
        const quizId2 = adminQuizCreate(token2, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
        expect(() => requestQuizSessionCreate(token, quizId2, VALID_AUTOSTARTNUM)).toThrow(HTTPError[FORBIDDEN]);
      });
    });
  });
});
