import { FORBIDDEN, INPUT_ERROR, SUCCESSFUL_QUIZ_SESSION_UPDATE, UNAUTHORISED, VALID_QUIZ, VALID_USER, VALID_USER_2, adminAuthRegister, adminQuizCreate, adminQuizCreateQuestion, clear, requestQuizSessionCreate, requestQuizSessionUpdate, validQuestionBody } from '../testHelper';
import HTTPError from 'http-errors';
import { AdminQuizAction } from '../types';
beforeEach(() => {
  clear();
});

const VALID_AUTOSTARTNUM = 40;

describe('PUT /v1/admin/quiz/:quizid/session/:sessionid', () => {
  let token: string;
  let quizId: number;
  // let questionId: number;
  let sessionId1: number;

  beforeEach(() => {
    token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    quizId = adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    adminQuizCreateQuestion(token, quizId, validQuestionBody);
    sessionId1 = requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM).sessionId;
  });

  describe('success cases', () => {
    test('valid inputs', () => {
      expect(requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.END)).toStrictEqual(SUCCESSFUL_QUIZ_SESSION_UPDATE);
    });

    test('automatically goes to results', () => {
      expect(requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.NEXT_QUESTION)).toStrictEqual(SUCCESSFUL_QUIZ_SESSION_UPDATE);
    });

    test.skip('correct details', () => {
      requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.END);
      // uncomment when implemented
      // expect(requestQuizSessionStatus(token, quizId, sessionId1).state).toStrictEqual(AdminQuizAction.END)
    });
  });

  describe('fail cases', () => {
    describe('400', () => {
      test('Action provided is not a valid Action enum', () => {
        expect(() => requestQuizSessionUpdate(token, quizId, sessionId1, 'NOT AN ACTION')).toThrow(HTTPError[INPUT_ERROR]);
      });

      test('Session id does not refer to a valid session within this quiz', () => {
        expect(() => requestQuizSessionUpdate(token, quizId, sessionId1 + 1, AdminQuizAction.END)).toThrow(HTTPError[FORBIDDEN]);
      });

      describe('Action enum cannot be applied in the current state', () => {
        test.each([
          { to: 'GO_TO_ANSWER', action: AdminQuizAction.GO_TO_ANSWER },
          { to: 'GO_TO_FINAL_RESULTS', action: AdminQuizAction.GO_TO_FINAL_RESULTS },
          { to: 'SKIP_COUNTDOWN', action: AdminQuizAction.SKIP_COUNTDOWN }
        ])('LOBBY -> $to', ({ action }) => {
          expect(() => requestQuizSessionUpdate(token, quizId, sessionId1, action)).toThrow(HTTPError[INPUT_ERROR]);
        });

        test.each([
          { to: 'GO_TO_ANSWER', action: AdminQuizAction.GO_TO_ANSWER },
          { to: 'GO_TO_FINAL_RESULTS', action: AdminQuizAction.GO_TO_FINAL_RESULTS },
        ])('QUESTION_COUNTDOWN -> $to', ({ action }) => {
          requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.NEXT_QUESTION);
          expect(() => requestQuizSessionUpdate(token, quizId, sessionId1, action)).toThrow(HTTPError[INPUT_ERROR]);
        });

        test.each([
          { to: 'NEXT_QUESTION', action: AdminQuizAction.NEXT_QUESTION },
          { to: 'GO_TO_FINAL_RESULTS', action: AdminQuizAction.GO_TO_FINAL_RESULTS },
          { to: 'SKIP_COUNTDOWN', action: AdminQuizAction.SKIP_COUNTDOWN }
        ])('QUESTION_OPEN -> $to', ({ action }) => {
          requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.NEXT_QUESTION);
          requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.SKIP_COUNTDOWN);
          expect(() => requestQuizSessionUpdate(token, quizId, sessionId1, action)).toThrow(HTTPError[INPUT_ERROR]);
        });

        // Not exactly sure how to implement this test ebcause question close depends on question duration ending
        // test.each([
        //   { to: 'GO_TO_ANSWER', action: AdminQuizAction.GO_TO_ANSWER },
        //   { to: 'GO_TO_FINAL_RESULTS', action: AdminQuizAction.GO_TO_FINAL_RESULTS },
        // ])("QUESTION_CLOSE -> $to", ({ action }) => {
        //   requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.SKIP_COUNTDOWN)
        //   expect(() => requestQuizSessionUpdate(token, quizId, sessionId1, action)).toThrow(HTTPError[400]);
        // });

        test.each([
          { to: 'NEXT_QUESTION', action: AdminQuizAction.NEXT_QUESTION },
          { to: 'GO_TO_FINAL_RESULTS', action: AdminQuizAction.GO_TO_FINAL_RESULTS },
          { to: 'GO_TO_ANSWER', action: AdminQuizAction.GO_TO_ANSWER },
          { to: 'SKIP_COUNTDOWN', action: AdminQuizAction.SKIP_COUNTDOWN }
        ])('FINAL_RESULTS -> $to', ({ action }) => {
          requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.NEXT_QUESTION);
          requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.SKIP_COUNTDOWN);
          requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.GO_TO_ANSWER);
          requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.GO_TO_FINAL_RESULTS);
          expect(() => requestQuizSessionUpdate(token, quizId, sessionId1, action)).toThrow(HTTPError[INPUT_ERROR]);
        });

        test.each([
          { to: 'NEXT_QUESTION', action: AdminQuizAction.NEXT_QUESTION },
          { to: 'GO_TO_FINAL_RESULTS', action: AdminQuizAction.GO_TO_FINAL_RESULTS },
          { to: 'GO_TO_ANSWER', action: AdminQuizAction.GO_TO_ANSWER },
          { to: 'SKIP_COUNTDOWN', action: AdminQuizAction.SKIP_COUNTDOWN },
          { to: 'END', action: AdminQuizAction.END }
        ])('END -> $to', ({ action }) => {
          requestQuizSessionUpdate(token, quizId, sessionId1, AdminQuizAction.END);
          expect(() => requestQuizSessionUpdate(token, quizId, sessionId1, action)).toThrow(HTTPError[INPUT_ERROR]);
        });
      });
    });

    describe('401', () => {
      test('Token is empty or invalid (does not refer to valid logged in user session', () => {
        expect(() => requestQuizSessionUpdate(token + 1, quizId, sessionId1, AdminQuizAction.END)).toThrow(HTTPError[UNAUTHORISED]);
      });
    });

    describe('403', () => {
      test('Valid token is provided but user is not an owner of this quiz', () => {
        const token2 = adminAuthRegister(VALID_USER_2.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
        const quizId2 = adminQuizCreate(token2, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
        expect(() => requestQuizSessionUpdate(token, quizId2, sessionId1, AdminQuizAction.END)).toThrow(HTTPError[FORBIDDEN]);
      });
    });
  });
});
