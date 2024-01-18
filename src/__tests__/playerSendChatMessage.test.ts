import {
  INPUT_ERROR,
  VALID_USER,
  adminAuthRegister,
  clear,
  requestPlayerJoin,
  requestSendChatMessage,
  VALID_QUIZ,
  adminQuizCreate,
  adminQuizCreateQuestion,
  requestQuizSessionCreate,
  validQuestionBody,
  // requestPlayerGetAllMessages,

} from '../testHelper';

import HTTPError from 'http-errors';

beforeEach(() => {
  clear();
});

const VALID_AUTOSTARTNUM = 40;

describe('PUT /v1/admin/quiz/:quizid/session/:sessionid', () => {
  const VALID_MESSAGE = {
    message: {
      messageBody: 'hello everyone Nice to chat',
    }
  };

  const SHORT_MESSAGE = {
    message: {
      messageBody: '',
    }
  };

  const LONG_MESSAGE = {
    message: {
      messageBody: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
    }
  };

  let token: string;
  let quizId: number;
  let sessionId: number;
  let playerId: number;

  beforeEach(() => {
    token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    quizId = adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    adminQuizCreateQuestion(token, quizId, validQuestionBody);
    sessionId = requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM).sessionId;
    playerId = requestPlayerJoin(sessionId, 'hayden').playerId;
  });

  describe('success expected', () => {
    test('valid inputs', () => {
      expect(requestSendChatMessage(playerId, VALID_MESSAGE)).toStrictEqual({});
    });

  // test('expected effect on ', () => {
  //  requestSendChatMessage(playerId, VALID_MESSAGE);
  //  requestPlayerGetAllMessages(playerId).toStrictEqual({
  //    messages: expect.any(Array<
  //    {
  //    messageBody: string,
  //      playerId: number,
  //      playerName: string,
  //      timeSent: number
  //    }
  //  >)
  //  });
    // });
  });

  describe('error cases', () => {
    describe('400', () => {
      test('playerId does not exist', () => {
        expect(() => requestSendChatMessage(playerId + 1, VALID_MESSAGE)).toThrow(HTTPError[INPUT_ERROR]);
      });

      test('if message is less than 1 character', () => {
        expect(() => requestSendChatMessage(playerId, SHORT_MESSAGE)).toThrow(HTTPError[INPUT_ERROR]);
      });

      test('if message is more than 100 characters', () => {
        expect(() => requestSendChatMessage(playerId, LONG_MESSAGE)).toThrow(HTTPError[INPUT_ERROR]);
      });
    });
  });
});
