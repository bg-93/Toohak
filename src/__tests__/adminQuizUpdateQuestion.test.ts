import {
  VALID_QUIZ,
  VALID_QUESTION,
  VALID_USER,
  INVALID_QUESTION,
  adminAuthRegister,
  adminQuizCreate,
  clear,
  adminQuizCreateQuestion,
  adminQuizUpdateQuestion,
  SUCCESSFUL_QUIZ_QUESTION_UPDATE,
  FORBIDDEN,
  UNAUTHORISED,
  INPUT_ERROR,
  adminQuizInfo,
  VALID_POINTS,
  VALID_DURATION,
  validQuestionBody,
  oldRequestAdminQuizUpdateQuestion,
  adminQuizDeleteQuestion,
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

const tooLongAnswers = [
  { answer: 'Duplicate Answer this answer is far more than thirty characters', correct: false },
  { answer: 'Duplicate Answer this answer is also far more than thirty characters', correct: true }
];
const tooShortAnswers = [
  { answer: '', correct: false },
  { answer: 'Duplicate Answer this answer is also far more than thirty characters', correct: true }
];

let token: string;
let quizId: number;
let questionId: number;

const NEW_QUESTION_BODY = {
  question: 'How heavy is 50 kgs?',
  duration: VALID_DURATION,
  points: VALID_POINTS,
  answers: [
    { answer: '50 kgs', correct: true },
    { answer: '45 kgs', correct: false }
  ],
  thumbnailUrl: validQuestionBody.thumbnailUrl
};

const OLD_QUESTION_BODY = {
  question: 'How heavy is 50 kgs?',
  duration: VALID_DURATION,
  points: VALID_POINTS,
  answers: [
    { answer: '50 kgs', correct: true },
    { answer: '45 kgs', correct: false }
  ]
};

beforeEach(() => {
  clear();
  token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
  quizId = adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
  questionId = adminQuizCreateQuestion(token, quizId, {
    question: VALID_QUESTION.QUESTION,
    duration: VALID_DURATION,
    points: VALID_POINTS,
    answers: answers,
    thumbnailUrl: validQuestionBody.thumbnailUrl
  }).questionId;
});

describe('Testing adminQuizUpdateQuestion', () => {
  describe('Success Expected', () => {
    test('Expected Return', () => {
      expect(adminQuizUpdateQuestion(token, quizId, questionId, NEW_QUESTION_BODY)).toStrictEqual(SUCCESSFUL_QUIZ_QUESTION_UPDATE);
    });

    test('(integration) expected change to quiz object', () => {
      adminQuizUpdateQuestion(token, quizId, questionId, NEW_QUESTION_BODY);
      expect(adminQuizInfo(token, quizId).questions).toStrictEqual(
        [
          {
            questionId: expect.any(Number),
            question: 'How heavy is 50 kgs?',
            duration: expect.any(Number),
            points: expect.any(Number),
            answers: expect.any(Array),
            thumbnailUrl: expect.any(String)
          }
        ]
      );
    });
  });

  describe('Failure Expected', () => {
    test.each([
      ['(403) Quiz ID does not refer to a valid quiz', [1, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, answers], HTTPError[FORBIDDEN]],
      ['(400) Question ID does not refer to a valid question within quiz', [0, 1, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, answers], HTTPError[INPUT_ERROR]],
      ['(400) Question string less than 5 characters', [0, 0, INVALID_QUESTION.QUESTION_1, VALID_POINTS, VALID_DURATION, answers], HTTPError[INPUT_ERROR]],
      ['(400) Question string more than 50 characters', [0, 0, INVALID_QUESTION.QUESTION_2, VALID_POINTS, VALID_DURATION, answers], HTTPError[INPUT_ERROR]],
      ['(400) Question duration negative', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, -1, answers], HTTPError[INPUT_ERROR]],
      ['(400) Sum of question durations exceeds 3 minutes', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, 361, answers], HTTPError[INPUT_ERROR]],
      ['(400) Duplicate answers', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, duplicateAnswers], HTTPError[INPUT_ERROR]],
      ['(400) More than 6 answers', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, tooManyAnswers], HTTPError[INPUT_ERROR]],
      ['(400) Less than 2 answers', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, tooFewAnswers], HTTPError[INPUT_ERROR]],
      ['(400) less than 1 character in answers', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, tooShortAnswers], HTTPError[INPUT_ERROR]],
      ['(400) more than 30 characters in answers', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, tooLongAnswers], HTTPError[INPUT_ERROR]],
      ['(400) No correct answers', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, noCorrectAnswers], HTTPError[INPUT_ERROR]],
      ['(400) Points awarded less than 1', [0, 0, VALID_QUESTION.QUESTION, -1, VALID_DURATION, answers], HTTPError[INPUT_ERROR]],
      ['(400) Points awarded more than 10', [0, 0, VALID_QUESTION.QUESTION, 11, VALID_DURATION, answers], HTTPError[INPUT_ERROR]]
    ])('%s', (testCaseName, params, expected) => {
      expect(() => adminQuizUpdateQuestion(
        token,
        quizId + (params[0] as number),
        questionId + (params[1] as number),
        {
          question: params[2] as string,
          points: params[3] as number,
          duration: params[4] as number,
          answers: params[5] as [],
          thumbnailUrl: validQuestionBody.thumbnailUrl
        }
      )).toThrow(expected);
    });

    test('(403) Valid Token but not an owner', () => {
      const token2 = adminAuthRegister('aseconduser@gmail.com', 'aCooLp455w0rd', 'Jenny', 'Doe').token;
      expect(() => adminQuizUpdateQuestion(
        token2,
        quizId,
        questionId,
        NEW_QUESTION_BODY
      )).toThrow(HTTPError[FORBIDDEN]);
    });

    test('(401) Invalid Token', () => {
      expect(() => adminQuizUpdateQuestion(
        token + 1,
        quizId,
        questionId,
        {
          question: VALID_QUESTION.QUESTION,
          duration: VALID_DURATION,
          points: VALID_POINTS,
          answers: answers,
          thumbnailUrl: validQuestionBody.thumbnailUrl
        }
      )).toThrow(HTTPError[UNAUTHORISED]);
    });

    test('(401) Empty Token ', () => {
      expect(() => adminQuizUpdateQuestion(
        '',
        quizId,
        questionId,
        {
          question: VALID_QUESTION.QUESTION,
          duration: VALID_DURATION,
          points: VALID_POINTS,
          answers: answers,
          thumbnailUrl: validQuestionBody.thumbnailUrl
        }
      )).toThrow(HTTPError[UNAUTHORISED]);
    });

    test('url is empty', () => {
      expect(() => adminQuizUpdateQuestion(
        token,
        quizId,
        questionId,
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
      expect(() => adminQuizUpdateQuestion(
        token,
        quizId,
        questionId,
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
      expect(() => adminQuizUpdateQuestion(
        token,
        quizId,
        questionId,
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
});

describe('Old Testing adminQuizUpdateQuestion', () => {
  let questionId2: number;
  beforeEach(() => {
    adminQuizDeleteQuestion(quizId, questionId, token);
    questionId2 = oldRequestAdminQuizCreateQuestion(token, quizId, {
      question: VALID_QUESTION.QUESTION,
      duration: VALID_DURATION,
      points: VALID_POINTS,
      answers: answers
    }).questionId;
  });
  describe('Success Expected', () => {
    test('Expected Return', () => {
      expect(oldRequestAdminQuizUpdateQuestion(token, quizId, questionId2, OLD_QUESTION_BODY)).toStrictEqual(SUCCESSFUL_QUIZ_QUESTION_UPDATE);
    });

    test('(integration) expected change to quiz object', () => {
      oldRequestAdminQuizUpdateQuestion(token, quizId, questionId2, OLD_QUESTION_BODY);
      expect(adminQuizInfo(token, quizId).questions).toStrictEqual(
        [
          {
            questionId: expect.any(Number),
            question: 'How heavy is 50 kgs?',
            duration: expect.any(Number),
            points: expect.any(Number),
            answers: expect.any(Array)
          }
        ]
      );
    });
  });

  describe('Failure Expected', () => {
    test.each([
      ['(403) Quiz ID does not refer to a valid quiz', [1, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, answers], HTTPError[FORBIDDEN]],
      ['(400) Question ID does not refer to a valid question within quiz', [0, 1, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, answers], HTTPError[INPUT_ERROR]],
      ['(400) Question string less than 5 characters', [0, 0, INVALID_QUESTION.QUESTION_1, VALID_POINTS, VALID_DURATION, answers], HTTPError[INPUT_ERROR]],
      ['(400) Question string more than 50 characters', [0, 0, INVALID_QUESTION.QUESTION_2, VALID_POINTS, VALID_DURATION, answers], HTTPError[INPUT_ERROR]],
      ['(400) Question duration negative', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, -1, answers], HTTPError[INPUT_ERROR]],
      ['(400) Sum of question durations exceeds 3 minutes', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, 361, answers], HTTPError[INPUT_ERROR]],
      ['(400) Duplicate answers', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, duplicateAnswers], HTTPError[INPUT_ERROR]],
      ['(400) More than 6 answers', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, tooManyAnswers], HTTPError[INPUT_ERROR]],
      ['(400) Less than 2 answers', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, tooFewAnswers], HTTPError[INPUT_ERROR]],
      ['(400) less than 1 character in answers', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, tooShortAnswers], HTTPError[INPUT_ERROR]],
      ['(400) more than 30 characters in answers', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, tooLongAnswers], HTTPError[INPUT_ERROR]],
      ['(400) No correct answers', [0, 0, VALID_QUESTION.QUESTION, VALID_POINTS, VALID_DURATION, noCorrectAnswers], HTTPError[INPUT_ERROR]],
      ['(400) Points awarded less than 1', [0, 0, VALID_QUESTION.QUESTION, -1, VALID_DURATION, answers], HTTPError[INPUT_ERROR]],
      ['(400) Points awarded more than 10', [0, 0, VALID_QUESTION.QUESTION, 11, VALID_DURATION, answers], HTTPError[INPUT_ERROR]]
    ])('%s', (testCaseName, params, expected) => {
      expect(() => oldRequestAdminQuizUpdateQuestion(
        token,
        quizId + (params[0] as number),
        questionId2 + (params[1] as number),
        {
          question: params[2] as string,
          points: params[3] as number,
          duration: params[4] as number,
          answers: params[5] as []
        }
      )).toThrow(expected);
    });

    test('(403) Valid Token but not an owner', () => {
      const token2 = adminAuthRegister('aseconduser@gmail.com', 'aCooLp455w0rd', 'Jenny', 'Doe').token;
      expect(() => oldRequestAdminQuizUpdateQuestion(
        token2,
        quizId,
        questionId2,
        OLD_QUESTION_BODY
      )).toThrow(HTTPError[FORBIDDEN]);
    });

    test('(401) Invalid Token', () => {
      expect(() => oldRequestAdminQuizUpdateQuestion(
        token + 1,
        quizId,
        questionId2,
        {
          question: VALID_QUESTION.QUESTION,
          duration: VALID_DURATION,
          points: VALID_POINTS,
          answers: answers
        }
      )).toThrow(HTTPError[UNAUTHORISED]);
    });

    test('(401) Empty Token ', () => {
      expect(() => oldRequestAdminQuizUpdateQuestion(
        '',
        quizId,
        questionId2,
        {
          question: VALID_QUESTION.QUESTION,
          duration: VALID_DURATION,
          points: VALID_POINTS,
          answers: answers
        }
      )).toThrow(HTTPError[UNAUTHORISED]);
    });
  });
});
