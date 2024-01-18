import {
  VALID_QUIZ,
  VALID_QUESTION,
  VALID_USER,
  INVALID_QUESTION,
  adminAuthRegister,
  adminQuizCreate,
  clear,
  SUCCESSFUL_QUIZ_QUESTION_CREATE,
  adminQuizCreateQuestion,
  VALID_POINTS,
  VALID_DURATION,
  FORBIDDEN,
  UNAUTHORISED,
  INPUT_ERROR,
  validQuestionBody,
  oldRequestAdminQuizCreateQuestion
} from '../testHelper';

import HTTPError from 'http-errors';

const answers = [
  { answer: VALID_QUESTION.ANSWER_1, correct: false },
  { answer: VALID_QUESTION.ANSWER_2, correct: true }
];

const duplicateAnswers = [
  { answer: 'Duplicate Answer', correct: false },
  { answer: 'Duplicate Answer', correct: true }
];

const tooManyAnswers = [
  { answer: 'A', correct: true },
  { answer: 'B', correct: false },
  { answer: 'C', correct: false },
  { answer: 'D', correct: false },
  { answer: 'E', correct: false },
  { answer: 'F', correct: false },
  { answer: 'G', correct: false },
];

const tooFewAnswers = [
  { answer: 'A', correct: true }
];

const noCorrectAnswers = [
  { answer: 'A', correct: false },
  { answer: 'B', correct: false }
];

const tooShortAnswers = [
  { answer: '', correct: true },
  { answer: '', correct: false }
];

const tooLongAnswers = [
  { answer: 'THIS STRING IS LONGER THAN 30 CHARACTERS RAAAAAAAAH', correct: true },
  { answer: 'what am i doing here', correct: false }
];

let token1: string;
let quizId: number;

beforeEach(() => {
  clear();
  token1 = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
  quizId = adminQuizCreate(token1, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
});

describe('Testing adminQuizCreateQuestion', () => {
  describe('success case', () => {
    test('success case', () => {
      expect(adminQuizCreateQuestion(
        token1,
        quizId,
        {
          question: VALID_QUESTION.QUESTION,
          duration: VALID_DURATION,
          points: VALID_POINTS,
          answers: answers,
          thumbnailUrl: validQuestionBody.thumbnailUrl
        }))
        .toStrictEqual(SUCCESSFUL_QUIZ_QUESTION_CREATE);
    });
  });

  test.each([
    ['Quiz ID does not refer to a valid quiz', [1, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, answers], HTTPError[FORBIDDEN]],
    ['Question string less than 5 characters', [0, 0, INVALID_QUESTION.QUESTION_1, VALID_POINTS, VALID_DURATION, answers], HTTPError[INPUT_ERROR]],
    ['Question string more than 50 characters', [0, 0, INVALID_QUESTION.QUESTION_2, VALID_POINTS, VALID_DURATION, answers], HTTPError[INPUT_ERROR]],
    ['Question duration negative', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, -1, answers], HTTPError[INPUT_ERROR]],
    ['Sum of question durations exceeds 3 minutes', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, 361, answers], HTTPError[INPUT_ERROR]],
    ['Duplicate answers', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, duplicateAnswers], HTTPError[INPUT_ERROR]],
    ['More than 6 answers', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, tooManyAnswers], HTTPError[INPUT_ERROR]],
    ['Less than 2 answers', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, tooFewAnswers], HTTPError[INPUT_ERROR]],
    ['Answer length too long', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, tooLongAnswers], HTTPError[INPUT_ERROR]],
    ['Answer length too short', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, tooShortAnswers], HTTPError[INPUT_ERROR]],
    ['No correct answers', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, noCorrectAnswers], HTTPError[INPUT_ERROR]],
    ['Points awarded less than 1', [0, 0, VALID_QUESTION.QUESTION, -1, VALID_DURATION, answers], HTTPError[INPUT_ERROR]],
    ['Points awarded more than 10', [0, 0, VALID_QUESTION.QUESTION, 11, VALID_DURATION, answers], HTTPError[INPUT_ERROR]]
  ])('%s', (testCaseName, params, expected) => {
    expect(() => adminQuizCreateQuestion(
      token1,
      quizId + (params[0] as number),
      {
        question: params[2] as string,
        points: params[3] as number,
        duration: params[4] as number,
        answers: params[5] as [],
        thumbnailUrl: validQuestionBody.thumbnailUrl
      }
    ))
      .toThrow(expected);
  });

  test('Valid token but not an owner', () => {
    const token2 = adminAuthRegister('aseconduser@gmail.com', 'aCooLp455w0rd', 'Jenny', 'Doe').token;
    expect(() => adminQuizCreateQuestion(
      token2,
      quizId,
      {
        question: VALID_QUESTION.QUESTION,
        duration: VALID_DURATION,
        points: VALID_POINTS,
        answers: answers,
        thumbnailUrl: validQuestionBody.thumbnailUrl
      }))
      .toThrow(HTTPError[FORBIDDEN]);
  });

  test('Invalid Token', () => {
    expect(() => adminQuizCreateQuestion(token1 + 1, quizId, validQuestionBody)).toThrow(HTTPError[UNAUTHORISED]);
  });

  test('url is empty', () => {
    expect(() => adminQuizCreateQuestion(
      token1,
      quizId,
      {
        question: VALID_QUESTION.QUESTION,
        duration: VALID_DURATION,
        points: VALID_POINTS,
        answers: answers,
        thumbnailUrl: ''
      }))
      .toThrow(HTTPError[INPUT_ERROR]);
  });

  test('url is invalid', () => {
    expect(() => adminQuizCreateQuestion(
      token1,
      quizId,
      {
        question: VALID_QUESTION.QUESTION,
        duration: VALID_DURATION,
        points: VALID_POINTS,
        answers: answers,
        thumbnailUrl: 'https://www.nonexistingwebsitefile.org/'
      }))
      .toThrow(HTTPError[INPUT_ERROR]);
  });

  test('fetched file is not a jpg or png', () => {
    expect(() => adminQuizCreateQuestion(
      token1,
      quizId,
      {
        question: VALID_QUESTION.QUESTION,
        duration: VALID_DURATION,
        points: VALID_POINTS,
        answers: answers,
        thumbnailUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWd5MXB3ZGdpNHNtNGphY21jYWp4anV4dXJndHFxamk2ODl6dTE5MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/iibH5ymW6LFvSIVyUc/giphy.gif'
      }))
      .toThrow(HTTPError[INPUT_ERROR]);
  });
});

describe('Old Testing adminQuizCreateQuestion', () => {
  describe('success case', () => {
    test('success case', () => {
      expect(oldRequestAdminQuizCreateQuestion(
        token1,
        quizId,
        {
          question: VALID_QUESTION.QUESTION,
          duration: VALID_DURATION,
          points: VALID_POINTS,
          answers: answers
        }))
        .toStrictEqual(SUCCESSFUL_QUIZ_QUESTION_CREATE);
    });
  });

  test.each([
    ['Quiz ID does not refer to a valid quiz', [1, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, answers], HTTPError[FORBIDDEN]],
    ['Question string less than 5 characters', [0, 0, INVALID_QUESTION.QUESTION_1, VALID_POINTS, VALID_DURATION, answers], HTTPError[INPUT_ERROR]],
    ['Question string more than 50 characters', [0, 0, INVALID_QUESTION.QUESTION_2, VALID_POINTS, VALID_DURATION, answers], HTTPError[INPUT_ERROR]],
    ['Question duration negative', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, -1, answers], HTTPError[INPUT_ERROR]],
    ['Sum of question durations exceeds 3 minutes', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, 361, answers], HTTPError[INPUT_ERROR]],
    ['Duplicate answers', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, duplicateAnswers], HTTPError[INPUT_ERROR]],
    ['More than 6 answers', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, tooManyAnswers], HTTPError[INPUT_ERROR]],
    ['Less than 2 answers', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, tooFewAnswers], HTTPError[INPUT_ERROR]],
    ['No correct answers', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, noCorrectAnswers], HTTPError[INPUT_ERROR]],
    ['Points awarded less than 1', [0, 0, VALID_QUESTION.QUESTION, -1, VALID_DURATION, answers], HTTPError[INPUT_ERROR]],
    ['Points awarded more than 10', [0, 0, VALID_QUESTION.QUESTION, 11, VALID_DURATION, answers], HTTPError[INPUT_ERROR]]
  ])('%s', (testCaseName, params, expected) => {
    expect(() => oldRequestAdminQuizCreateQuestion(
      token1,
      quizId + (params[0] as number),
      {
        question: params[2] as string,
        points: params[3] as number,
        duration: params[4] as number,
        answers: params[5] as []
      }
    ))
      .toThrow(expected);
  });

  test('Valid token but not an owner', () => {
    const token2 = adminAuthRegister('aseconduser@gmail.com', 'aCooLp455w0rd', 'Jenny', 'Doe').token;
    expect(() => oldRequestAdminQuizCreateQuestion(
      token2,
      quizId,
      {
        question: VALID_QUESTION.QUESTION,
        duration: VALID_DURATION,
        points: VALID_POINTS,
        answers: answers
      }))
      .toThrow(HTTPError[FORBIDDEN]);
  });

  test('Invalid Token', () => {
    expect(() => oldRequestAdminQuizCreateQuestion(
      token1 + 1,
      quizId,
      {
        question: VALID_QUESTION.QUESTION,
        duration: VALID_DURATION,
        points: VALID_POINTS,
        answers: answers
      }))
      .toThrow(HTTPError[UNAUTHORISED]);
  });
});
