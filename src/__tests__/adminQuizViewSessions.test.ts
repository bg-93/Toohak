import { FORBIDDEN, SUCCESSFUL_QUIZ_VIEW_SESSIONS, UNAUTHORISED, VALID_QUIZ, VALID_USER, VALID_USER_2, adminAuthRegister, adminQuizCreate, adminQuizCreateQuestion, clear, requestQuizSessionCreate, requestQuizSessionUpdate, requestQuizViewSessions, validQuestionBody } from '../testHelper';
import HTTPError from 'http-errors';
import { AdminQuizAction } from '../types';
beforeEach(() => {
  clear();
});

const VALID_AUTOSTARTNUM = 40;

describe('PUT /v1/admin/quiz/:quizid/session/:sessionid', () => {
  let token: string;
  let quizId: number;

  beforeEach(() => {
    token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    quizId = adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    adminQuizCreateQuestion(token, quizId, validQuestionBody);
    requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM);
  });

  describe('success cases', () => {
    test('valid inputs', () => {
      expect(requestQuizViewSessions(token, quizId)).toStrictEqual(SUCCESSFUL_QUIZ_VIEW_SESSIONS);
    });

    test('correct details', () => {
      const sessionId2 = requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM).sessionId;
      const sessionId3 = requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM).sessionId;
      const sessionId4 = requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM).sessionId;

      requestQuizSessionUpdate(token, quizId, sessionId2, AdminQuizAction.END);
      requestQuizSessionUpdate(token, quizId, sessionId3, AdminQuizAction.END);
      requestQuizSessionUpdate(token, quizId, sessionId4, AdminQuizAction.NEXT_QUESTION);
      // sessionId1 and sessionId4 are in LOBBY, sessionId2/3 are in END.
      expect(requestQuizViewSessions(token, quizId).inactiveSessions).toHaveLength(2);
      expect(requestQuizViewSessions(token, quizId).activeSessions).toHaveLength(2);
    });
  });

  describe('fail cases', () => {
    describe('401', () => {
      test('Token is empty or invalid (does not refer to valid logged in user session', () => {
        expect(() => requestQuizViewSessions(token + 1, quizId)).toThrow(HTTPError[UNAUTHORISED]);
      });
    });

    describe('403', () => {
      test('Valid token is provided but user is not an owner of this quiz', () => {
        const token2 = adminAuthRegister(VALID_USER_2.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
        const quizId2 = adminQuizCreate(token2, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
        expect(() => requestQuizViewSessions(token, quizId2)).toThrow(HTTPError[FORBIDDEN]);
      });
    });
  });
});
