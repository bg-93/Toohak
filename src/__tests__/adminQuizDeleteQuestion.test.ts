import {
  VALID_QUIZ,
  VALID_USER,
  VALID_QUESTION,
  SUCCESSFUL_QUIZ_DELETE_QUESTION,
  INPUT_ERROR,
  UNAUTHORISED,
  FORBIDDEN,
  adminAuthRegister,
  adminQuizCreate,
  adminQuizCreateQuestion,
  adminQuizDeleteQuestion,
  clear,
  VALID_POINTS,
  VALID_DURATION,
  validQuestionBody,
  VALID_AUTOSTARTNUM,
  requestQuizSessionCreate,
  oldRequestAdminQuizDeleteQuestion
} from '../testHelper';

import HTTPError from 'http-errors';

const answers = [
  { answer: VALID_QUESTION.ANSWER_1, correct: false },
  { answer: VALID_QUESTION.ANSWER_2, correct: true }
];

let token1: string;
let quizId: number;
let questionId: number;

beforeEach(() => {
  clear();
  token1 = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
  quizId = adminQuizCreate(token1, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
  questionId = adminQuizCreateQuestion(
    token1,
    quizId,
    {
      question: VALID_QUESTION.QUESTION,
      points: VALID_POINTS,
      duration: VALID_DURATION,
      answers,
      thumbnailUrl: validQuestionBody.thumbnailUrl
    }
  ).questionId;
});

describe('Testing adminQuizDeleteQuestion', () => {
  test('Test succesful adminQuizDeleteQuestion', () => {
    const response = adminQuizDeleteQuestion(quizId, questionId, token1);
    expect(response).toStrictEqual(SUCCESSFUL_QUIZ_DELETE_QUESTION);
  });

  test.each([
    ['Test failure (status code: 400): Quiz ID does not refer to valid quiz', [1, 0, 0], HTTPError[FORBIDDEN]],
    ['Test failure (status code: 400): Question ID does not refer to a valid question within this quiz', [0, 1, 0], HTTPError[INPUT_ERROR]],
    ['Test failure (status code: 401): Token is empty or invalid (does not refer to valid logged in user session)', [0, 0, 1], HTTPError[UNAUTHORISED]],
  ])('%s', (testCaseName, params, expected) => {
    expect(() => adminQuizDeleteQuestion((quizId + (params[0] as number)) as number, (questionId + (params[1] as number)) as number, params[2] ? token1 + params[2] : token1)).toThrow(expected);
  });

  test('Test failure (status code: 403): Valid token is provided, but user is not an owner of this quiz', () => {
    const token2 = adminAuthRegister('newuser@gmail.com', VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    expect(() => adminQuizDeleteQuestion(quizId, questionId, token2)).toThrow(HTTPError[FORBIDDEN]);
  });

  test('All Sessions must be in END state', () => {
    adminQuizCreateQuestion(token1, quizId, validQuestionBody);
    requestQuizSessionCreate(token1, quizId, VALID_AUTOSTARTNUM);
    expect(() => adminQuizDeleteQuestion(quizId, questionId, token1)).toThrow(HTTPError[INPUT_ERROR]);
  });
});

describe('Old Testing adminQuizDeleteQuestion', () => {
  test('Test succesful adminQuizDeleteQuestion', () => {
    const response = oldRequestAdminQuizDeleteQuestion(quizId, questionId, token1);
    expect(response).toStrictEqual(SUCCESSFUL_QUIZ_DELETE_QUESTION);
  });

  test.each([
    ['Test failure (status code: 400): Quiz ID does not refer to valid quiz', [1, 0, 0], HTTPError[FORBIDDEN]],
    ['Test failure (status code: 400): Question ID does not refer to a valid question within this quiz', [0, 1, 0], HTTPError[INPUT_ERROR]],
    ['Test failure (status code: 401): Token is empty or invalid (does not refer to valid logged in user session)', [0, 0, 1], HTTPError[UNAUTHORISED]],
  ])('%s', (testCaseName, params, expected) => {
    expect(() => oldRequestAdminQuizDeleteQuestion((quizId + (params[0] as number)) as number, (questionId + (params[1] as number)) as number, params[2] ? token1 + params[2] : token1)).toThrow(expected);
  });

  test('Test failure (status code: 403): Valid token is provided, but user is not an owner of this quiz', () => {
    const token2 = adminAuthRegister('newuser@gmail.com', VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    expect(() => oldRequestAdminQuizDeleteQuestion(quizId, questionId, token2)).toThrow(HTTPError[FORBIDDEN]);
  });
});
