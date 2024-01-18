import { INPUT_ERROR, VALID_QUIZ, VALID_USER, adminAuthRegister, adminQuizCreate, adminQuizCreateQuestion, clear, requestQuizSessionCreate, validQuestionBody, requestPlayerJoin, requestSendChatMessage, requestPlayerGetAllMessages } from '../testHelper';
import HTTPError from 'http-errors';

beforeEach(() => {
  clear();
});

const VALID_AUTOSTARTNUM = 40;
const invalidId = 1000;
const playerName1 = 'Apple Bee';
const playerName2 = 'Candy Dunk';
const chatMessage1 = {
  message: {
    messageBody: 'Hello everyone! Nice to chat.',
  }
};
const chatMessage2 = {
  message: {
    messageBody: 'Hi there! Are you ready?',
  }
};
const chatMessage3 = {
  message: {
    messageBody: 'The weather is lovely today!',
  }
};

describe('GET /v1/player/{playerid}/chat', () => {
  let token: string;
  let quizId: number;
  let sessionId: number;
  let playerId1: number;
  let playerId2: number;

  beforeEach(() => {
    token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    quizId = adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    adminQuizCreateQuestion(token, quizId, validQuestionBody);
    sessionId = requestQuizSessionCreate(token, quizId, VALID_AUTOSTARTNUM).sessionId;
    playerId1 = requestPlayerJoin(sessionId, playerName1).playerId;
    playerId2 = requestPlayerJoin(sessionId, playerName2).playerId;
  });

  describe('success cases', () => {
    test('No messages', () => {
      expect(requestPlayerGetAllMessages(playerId1)).toStrictEqual({
        messages: []
      });
      expect(requestPlayerGetAllMessages(playerId2)).toStrictEqual({
        messages: []
      });
    });

    test('One message from one person', () => {
      const expectedTime = Math.floor(Date.now() / 1000);
      requestSendChatMessage(playerId1, chatMessage1);
      const result = requestPlayerGetAllMessages(playerId1);
      const timeSent = result.messages[0].timeSent;

      // Check timeSent is correct
      expect(timeSent).toBeGreaterThanOrEqual(expectedTime - 1);
      expect(timeSent).toBeLessThanOrEqual(expectedTime + 1);

      // Check messages are correct
      expect(requestPlayerGetAllMessages(playerId1)).toStrictEqual({
        messages: [
          {
            messageBody: chatMessage1.message.messageBody,
            playerId: playerId1,
            playerName: playerName1,
            timeSent: expect.any(Number)
          }
        ]
      });
      expect(requestPlayerGetAllMessages(playerId2)).toStrictEqual({
        messages: [
          {
            messageBody: chatMessage1.message.messageBody,
            playerId: playerId1,
            playerName: playerName1,
            timeSent: expect.any(Number)
          }
        ]
      });
    });

    test('Multiple messages from multiple people', () => {
      const expectedTime = Math.floor(Date.now() / 1000);
      requestSendChatMessage(playerId1, chatMessage1);
      requestSendChatMessage(playerId2, chatMessage2);
      requestSendChatMessage(playerId1, chatMessage3);
      const result = requestPlayerGetAllMessages(playerId1);
      const timeSent1 = result.messages[0].timeSent;
      const timeSent2 = result.messages[1].timeSent;
      const timeSent3 = result.messages[2].timeSent;

      // Check timeSent is correct
      expect(timeSent1).toBeGreaterThanOrEqual(expectedTime - 1);
      expect(timeSent1).toBeLessThanOrEqual(expectedTime + 1);
      expect(timeSent2).toBeGreaterThanOrEqual(expectedTime - 1);
      expect(timeSent2).toBeLessThanOrEqual(expectedTime + 1);
      expect(timeSent3).toBeGreaterThanOrEqual(expectedTime - 1);
      expect(timeSent3).toBeLessThanOrEqual(expectedTime + 1);

      // Check messages are correct
      expect(requestPlayerGetAllMessages(playerId1)).toStrictEqual({
        messages: [
          {
            messageBody: chatMessage1.message.messageBody,
            playerId: playerId1,
            playerName: playerName1,
            timeSent: expect.any(Number)
          },
          {
            messageBody: chatMessage2.message.messageBody,
            playerId: playerId2,
            playerName: playerName2,
            timeSent: expect.any(Number)
          },
          {
            messageBody: chatMessage3.message.messageBody,
            playerId: playerId1,
            playerName: playerName1,
            timeSent: expect.any(Number)
          },
        ]
      });

      expect(requestPlayerGetAllMessages(playerId1)).toStrictEqual({
        messages: [
          {
            messageBody: chatMessage1.message.messageBody,
            playerId: playerId1,
            playerName: playerName1,
            timeSent: expect.any(Number)
          },
          {
            messageBody: chatMessage2.message.messageBody,
            playerId: playerId2,
            playerName: playerName2,
            timeSent: expect.any(Number)
          },
          {
            messageBody: chatMessage3.message.messageBody,
            playerId: playerId1,
            playerName: playerName1,
            timeSent: expect.any(Number)
          },
        ]
      });
    });
  });

  describe('failure case', () => {
    describe('HTTPError 400', () => {
      test('Player ID does not exist', () => {
        requestSendChatMessage(playerId1, chatMessage1);
        expect(() => requestPlayerGetAllMessages(invalidId)).toThrow(HTTPError[INPUT_ERROR]);
      });
    });
  });
});
