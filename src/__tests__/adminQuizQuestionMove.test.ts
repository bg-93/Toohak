import {
  VALID_QUIZ,
  VALID_USER,
  SUCCESSFUL_QUIZ_QUESTION_MOVE,
  validQuestionBody,
  adminAuthRegister,
  adminQuizCreate,
  adminQuizCreateQuestion,
  adminQuizInfo,
  adminQuizQuestionMove,
  clear,
  INPUT_ERROR,
  UNAUTHORISED,
  FORBIDDEN,
  oldRequestAdminQuizQuestionMove
} from '../testHelper';

import HTTPError from 'http-errors';

import {
  AdminQuizInfoReturn
} from '../types';

const POS0 = 0;
const POS1 = 1;
const POS_LESS_0 = -1;
const POS_INVALID = 4;
const POS_Q4 = 3;

let token: string;
let quizId: number;
let questionId1: number;
let questionId2: number;
let questionId3: number;
let questionId4: number;

beforeEach(() => {
  clear();
  token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
  quizId = adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
  questionId1 = adminQuizCreateQuestion(token, quizId, validQuestionBody).questionId;
  questionId2 = adminQuizCreateQuestion(token, quizId, validQuestionBody).questionId;
  questionId3 = adminQuizCreateQuestion(token, quizId, validQuestionBody).questionId;
  questionId4 = adminQuizCreateQuestion(token, quizId, validQuestionBody).questionId;
});

describe('HTTP testing for adminQuizQuestionMove', () => {
  test('Testing success case', () => {
    const quiz = adminQuizInfo(token, quizId) as AdminQuizInfoReturn;
    let q2Pos = quiz.questions.findIndex((question) => question.questionId === questionId2);

    expect(q2Pos).toEqual(POS1);
    expect(adminQuizQuestionMove(token, quizId, questionId2, 0)).toStrictEqual(SUCCESSFUL_QUIZ_QUESTION_MOVE);

    const updatedQuiz = adminQuizInfo(token, quizId) as AdminQuizInfoReturn;
    q2Pos = updatedQuiz.questions.findIndex((question) => question.questionId === questionId2);

    expect(q2Pos).toEqual(POS0);
  });

  test('Test failure (status code: 403): Quiz ID does not refer to a valid quiz', () => {
    expect(() => adminQuizQuestionMove(token, quizId + 1, questionId1, POS1)).toThrow(HTTPError[FORBIDDEN]);
  });

  test('Test failure (status code: 400): Question Id does not refer to a valid question within this quiz', () => {
    expect(() => adminQuizQuestionMove(token, quizId, questionId4 + 1, POS1)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): NewPosition is less than 0', () => {
    expect(() => adminQuizQuestionMove(token, quizId, questionId4, POS_LESS_0)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): NewPosition is greater than n-1 where n is the number of questions', () => {
    expect(() => adminQuizQuestionMove(token, quizId, questionId3, POS_INVALID)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): NewPosition is the position of the current question', () => {
    expect(() => adminQuizQuestionMove(token, quizId, questionId4, POS_Q4)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 401): Token is empty', () => {
    expect(() => adminQuizQuestionMove('', quizId, questionId1, POS1)).toThrow(HTTPError[UNAUTHORISED]);
  });

  test('Test failure (status code: 401): Token is invalid (does not refer to valid logged in user session)', () => {
    expect(() => adminQuizQuestionMove(token + 1, quizId, questionId1, POS1)).toThrow(HTTPError[UNAUTHORISED]);
  });

  test('Test failure (status code: 403): Valid token is provided, but user is not an owner of this quiz', () => {
    const token2 = adminAuthRegister('newuser@gmail.com', VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    const quizId2 = adminQuizCreate(token2, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    expect(() => adminQuizQuestionMove(token, quizId2, questionId1, POS1)).toThrow(HTTPError[FORBIDDEN]);
  });
});

describe('Old HTTP testing for adminQuizQuestionMove', () => {
  test('Testing success case', () => {
    const quiz = adminQuizInfo(token, quizId) as AdminQuizInfoReturn;
    let q2Pos = quiz.questions.findIndex((question) => question.questionId === questionId2);

    expect(q2Pos).toEqual(POS1);
    expect(oldRequestAdminQuizQuestionMove(token, quizId, questionId2, 0)).toStrictEqual(SUCCESSFUL_QUIZ_QUESTION_MOVE);

    const updatedQuiz = adminQuizInfo(token, quizId) as AdminQuizInfoReturn;
    q2Pos = updatedQuiz.questions.findIndex((question) => question.questionId === questionId2);

    expect(q2Pos).toEqual(POS0);
  });

  test('Test failure (status code: 403): Quiz ID does not refer to a valid quiz', () => {
    expect(() => oldRequestAdminQuizQuestionMove(token, quizId + 1, questionId1, POS1)).toThrow(HTTPError[FORBIDDEN]);
  });

  test('Test failure (status code: 400): Question Id does not refer to a valid question within this quiz', () => {
    expect(() => oldRequestAdminQuizQuestionMove(token, quizId, questionId4 + 1, POS1)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): NewPosition is less than 0', () => {
    expect(() => oldRequestAdminQuizQuestionMove(token, quizId, questionId4, POS_LESS_0)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): NewPosition is greater than n-1 where n is the number of questions', () => {
    expect(() => oldRequestAdminQuizQuestionMove(token, quizId, questionId3, POS_INVALID)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 400): NewPosition is the position of the current question', () => {
    expect(() => oldRequestAdminQuizQuestionMove(token, quizId, questionId4, POS_Q4)).toThrow(HTTPError[INPUT_ERROR]);
  });

  test('Test failure (status code: 401): Token is empty', () => {
    expect(() => oldRequestAdminQuizQuestionMove('', quizId, questionId1, POS1)).toThrow(HTTPError[UNAUTHORISED]);
  });

  test('Test failure (status code: 401): Token is invalid (does not refer to valid logged in user session)', () => {
    expect(() => oldRequestAdminQuizQuestionMove(token + 1, quizId, questionId1, POS1)).toThrow(HTTPError[UNAUTHORISED]);
  });

  test('Test failure (status code: 403): Valid token is provided, but user is not an owner of this quiz', () => {
    const token2 = adminAuthRegister('newuser@gmail.com', VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    const quizId2 = adminQuizCreate(token2, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
    expect(() => oldRequestAdminQuizQuestionMove(token, quizId2, questionId1, POS1)).toThrow(HTTPError[FORBIDDEN]);
  });
});
