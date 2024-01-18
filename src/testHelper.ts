import config from './config.json';
import request, { HttpVerb } from 'sync-request-curl';
import { ChatMessage, QuestionBody } from './types';
import HTTPError from 'http-errors';
import { IncomingHttpHeaders } from 'http';

// HTTP Status Codes
export const OK = 200;
export const INPUT_ERROR = 400;
export const UNAUTHORISED = 401;
export const FORBIDDEN = 403;

// User Information
export enum VALID_USER {
  NAME_FIRST = 'John',
  NAME_LAST = 'Doe',
  EMAIL = 'email@gmail.com',
  PASSWORD = '12345Abcde',
}

export enum VALID_USER_2 {
  NAME_FIRST = 'Jenny',
  NAME_LAST = 'Doe',
  EMAIL = 'aseconduser@gmail.com',
  PASSWORD = 'aCooLp455w0rd',
}

export enum VALID_SECOND_USER {
  NAME_FIRST = 'max',
  NAME_LAST = 'Deng',
  EMAIL = 'email1@gmail.com',
  PASSWORD = '12395Abkdf',
}

export enum INVALID_USER {
  NAME_FIRST = 'J',
  NAME_LAST = 'D',
  EMAIL = 'email.gmail.com',
  PASSWORD = '123',
}

// Quiz Information
export enum VALID_QUIZ {
  NAME = 'Quiz1',
  DESCRIPTION = 'Quiz about food',
}

export enum VALID_QUIZ_2 {
  NAME = 'Quiz2',
  DESCRIPTION = 'Quiz about money',
}

export enum INVALID_QUIZ {
  NAME = 'Q',
  DESCRIPTION = 'Quiz 1 is invalid Quiz 1 is invalid Quiz 1 is invalid Quiz 1 is invalid Quiz 1 is invalid Quiz 1 is invalid',
}

// Question Information
export enum VALID_QUESTION {
  QUESTION = 'What is the capital of France?',
  ANSWER_1 = 'Berlin',
  ANSWER_2 = 'Paris',
}

export enum INVALID_QUESTION {
  QUESTION_1 = 'Cat',
  QUESTION_2 = 'Super long question that is more than the specified 50 character limit',
  ANSWER_1 = '',
  ANSWER_2 = 'Super long answer that is more than 30 characters',
}

export const validQuestionBody: QuestionBody = {
  question: '1) Who is the Monarch of England?',
  duration: 3,
  points: 5,
  answers: [
    {
      answer: 'Prince Charles',
      correct: true,
    },
    {
      answer: 'Not Princes Charles',
      correct: false,
    },
  ],
  thumbnailUrl: 'https://prod.scorptec.com.au/18/991/101583/286786_feature.png'
};

export const validQuestionBody2: QuestionBody = {
  question: '2) What is the capital of France?',
  duration: 1,
  points: 7,
  answers: [
    {
      answer: 'Paris',
      correct: true,
    },
    {
      answer: 'Berlin',
      correct: false,
    },
  ],
  thumbnailUrl: 'https://prod.scorptec.com.au/18/991/101583/286786_feature.png'
};

export const validQuestionBody3: QuestionBody = {
  question: '3) What is the capital of France?',
  duration: 7,
  points: 7,
  answers: [
    {
      answer: 'Paris',
      correct: true,
    },
    {
      answer: 'Berlin',
      correct: true,
    },
  ],
  thumbnailUrl: 'https://prod.scorptec.com.au/18/991/101583/286786_feature.png'
};

// API Endpoints and Server Configuration
export const SERVER_URL = `${config.url}:${config.port}`;

// HTTP Response Templates
export const ERROR = { error: expect.any(String) };
export const HTTP_ERROR = { error: expect.any(String), status: expect.any(Number) };

// Success Responses for Auth
export const SUCCESSFUL_REGISTRATION = { token: expect.any(String) };
export const SUCCESSFUL_LOGIN = { token: expect.any(String) };
export const SUCCESSFUL_LOGOUT = { };
export const SUCCESSFUL_PASSWORD_CHANGE = { };
export const SUCCESSFUL_USER_DETAILS_UPDATE = { };

// Success Responses for Quiz
export const SUCCESSFUL_QUIZ_CREATION = { quizId: expect.any(Number) };
export const SUCCESSFUL_QUIZ_REMOVE = { };
export const SUCCESSFUL_QUIZ_DELETE_QUESTION = { };
export const SUCCESSFUL_QUIZ_QUESTION_CREATE = { questionId: expect.any(Number) };
export const SUCCESSFUL_QUIZ_QUESTION_UPDATE = { };
export const SUCCESSFUL_QUIZ_QUESTION_MOVE = { };
export const SUCCESSFUL_QUIZ_QUESTION_DUPLICATE = { newQuestionId: expect.any(Number) };
export const SUCCESSFUL_QUIZ_RESTORE = { };
export const SUCCESSFUL_QUIZ_NAME_UPDATE = { };
export const SUCCESSFUL_QUIZ_DESCRIPTION_UPDATE = { };
export const SUCCESSFUL_QUIZ_INFO = {
  quizId: expect.any(Number),
  name: expect.any(String),
  timeCreated: expect.any(Number),
  timeLastEdited: expect.any(Number),
  description: expect.any(String),
  numQuestions: expect.any(Number),
  questions: expect.any(Array),
  duration: expect.any(Number),
  thumbnailUrl: expect.any(String)
};
export const SUCCESSFUL_QUIZ_SESSION_CREATE = { sessionId: expect.any(Number) };
export const SUCCESSFUL_QUIZ_SESSION_UPDATE = { };
export const SUCCESSFUL_QUIZ_SESSION_RESULTS = {
  usersRankedByScore: expect.any(Array),
  questionResults: expect.any(Array)
};
export const SUCCESSFUL_QUESTION_ANSWER = { };
export const SUCCESSFUL_QUIZ_THUMBNAIL = { };
export const SUCCESSFUL_QUIZ_SESSION_RESULTS_CSV = { url: expect.any(String) };

// Success Responses for Trash
export const SUCCESSFUL_TRASH_VIEW = {
  quizzes: expect.arrayContaining([
    expect.objectContaining({
      quizId: expect.any(Number),
      name: expect.any(String),
    }),
  ])
};
export const SUCCESSFUL_TRASH_EMPTY = { };
export const SUCCESSFUL_QUIZ_TRASH = {
  quizzes: expect.any(Array)
};
export const SUCCESSFUL_QUIZ_TRANSFER = { };

// Success Responses for Player
export const SUCCESSFUL_PLAYER_JOIN = { playerId: expect.any(Number) };
export const SUCCESSFUL_SESSION_STATUS = {
  state: expect.any(String),
  atQuestion: expect.any(Number),
  players: expect.any(Array<string>),
  metadata: {
    quizId: expect.any(Number),
    name: expect.any(String),
    timeCreated: expect.any(Number),
    timeLastEdited: expect.any(Number),
    description: expect.any(String),
    numQuestions: expect.any(Number),
    questions: expect.any(Array<[
      {
        questionId: number,
        question: string,
        duration: number,
        thumbnailUrl: string,
        points: number,
        answers: Array<
          {
            answerId: number,
            answer: string,
            colour: string,
            correct: boolean
          }>
      }
    ]>),
    duration: expect.any(Number),
    thumbnailUrl: expect.any(String),
  }
};

export const SUCCESSFUL_PLAYER_CURRENT_QUESTION_INFO = {
  questionId: expect.any(Number),
  question: expect.any(String),
  duration: expect.any(Number),
  thumbnailUrl: expect.any(String),
  points: expect.any(Number),
  answers: expect.any(Array<
    {
      answerId: number,
      answer: string,
      colour: string
    }
  >)
};

export const SUCCESSFUL_QUIZ_VIEW_SESSIONS = {
  activeSessions: expect.any(Array<number>),
  inactiveSessions: expect.any(Array<number>)
};

// Valid Constants
export const VALID_POINTS = 3;
export const VALID_DURATION = 3;
export const VALID_AUTOSTARTNUM = 5;

// Invalid Constants
export const INVALID_QUIZID = -1;
export const INVALID_NAME = '%%%';
export const SHORT_NAME = 'J';
export const LONG_NAME = 'ABCDEFGHJIKLMNOPQRSTUVWXYZ';

// Valid Image URL
export const VALID_IMGURL = 'https://upload.wikimedia.org/wikipedia/en/c/ca/League_of_Legends_Screenshot_2018.png';

// Invalid Image URL
export const INVALID_IMGURL = 'http://google.com/some/image/path.jp';
export const GIF_IMGURL = 'https://media.giphy.com/media/n6MHCDb6N9BdLnOENh/giphy.gif';
export const INVALID_HTTP_URL = 'httt://web.jpg';
/**
 * TAKEN FROM COMP1531 TUT05
 * Sends a request to the given route and return its results
 * Errors will be returned in the form { status: number, error: string }
 */
// const requestHelper = (method: HttpVerb, path: string, payload: object) => {
//   let qs = {};
//   let json = {};
//   if (['GET', 'DELETE'].includes(method)) {
//     qs = payload;
//   } else {
//     // PUT/POST
//     json = payload;
//   }
//   const res = request(method, SERVER_URL + path, { qs, json, timeout: 20000 });
//   const bodyString = res.body.toString();
//   let bodyObject: any;
//   try {
//     // Return if valid JSON
//     bodyObject = JSON.parse(bodyString);
//   } catch (error: any) {
//     bodyObject = {
//       error: `Server responded with ${res.statusCode}, but body is not JSON! Given: ${bodyString}. Reason: ${error.message}. HINT: Did you res.json(undefined)?`
//     };
//   }
//   return { status: res.statusCode, ...bodyObject };
// };

type Payload = Record<string, string | unknown>

const TIMEOUT_MS = 10000;

export const requestHelper = (
  method: HttpVerb,
  path: string,
  payload: Payload,
  headers: IncomingHttpHeaders = {}
) => {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method.toUpperCase())) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }

  const url = SERVER_URL + path;
  const res = request(method, url, { qs, json, headers, timeout: TIMEOUT_MS });

  let responseBody;
  try {
    responseBody = JSON.parse(res.body.toString());
  } catch (err) {
    if (res.statusCode === 200) {
      throw HTTPError(500,
        `Non-jsonifiable body despite code 200: '${res.body}'.\nCheck that you are not doing res.json(undefined) instead of res.json({}), e.g. in '/clear'`
      );
    }
    responseBody = { error: `Failed to parse JSON: '${err.message}'` };
  }

  const errorMessage = `[${res.statusCode}] ` + responseBody?.error || responseBody || 'No message specified!';

  // NOTE: the error is rethrown in the test below. This is useful becasuse the
  // test suite will halt (stop) if there's an error, rather than carry on and
  // potentially failing on a different expect statement without useful outputs
  switch (res.statusCode) {
    case 400: // BAD_REQUEST
    case 401: // UNAUTHORIZED
      throw HTTPError(res.statusCode, errorMessage);
    case 404: // NOT_FOUND
      throw HTTPError(res.statusCode, `Cannot find '${url}' [${method}]\nReason: ${errorMessage}\n\nHint: Check that your server.ts have the correct path AND method`);
    case 500: // INTERNAL_SERVER_ERROR
      throw HTTPError(res.statusCode, errorMessage + '\n\nHint: Your server crashed. Check the server log!\n');
    default:
      if (res.statusCode !== 200) {
        throw HTTPError(res.statusCode, errorMessage + `\n\nSorry, no idea! Look up the status code ${res.statusCode} online!\n`);
      }
  }
  return responseBody;
};

// HTTP Callers
export const adminAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  return requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });
};

export const adminAuthLogin = (email: string, password: string) => {
  return requestHelper('POST', '/v1/admin/auth/login', { email, password });
};

export const adminUserDetails = (token: string) => {
  return requestHelper('GET', '/v2/admin/user/details', {}, { token });
};

export const adminQuizList = (token: string) => {
  return requestHelper('GET', '/v2/admin/quiz/list', {}, { token });
};

export const adminQuizCreate = (token: string, name: string, description: string) => {
  return requestHelper('POST', '/v2/admin/quiz', { name, description }, { token });
};

export const adminQuizRemove = (token: string, quizId: number) => {
  return requestHelper('DELETE', `/v2/admin/quiz/${quizId}`, {}, { token });
};

export const adminQuizInfo = (token: string, quizId: number) => {
  return requestHelper('GET', `/v2/admin/quiz/${quizId}`, {}, { token });
};

export const adminQuizNameUpdate = (token: string, quizId: number, name: string) => {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/name`, { name }, { token });
};

export const adminQuizDescriptionUpdate = (token: string, quizId: number, description: string) => {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/description`, { description }, { token });
};

export const clear = () => {
  return requestHelper('DELETE', '/v1/clear', {});
};

// Iteration 2 functions

export const adminAuthLogout = (token: string) => {
  return requestHelper('POST', '/v2/admin/auth/logout', {}, { token });
};

export const adminQuizRestore = (token: string, quizId: number) => {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/restore`, {}, { token });
};

export const adminUserDetailsUpdate = (token: string, email: string, nameFirst: string, nameLast: string) => {
  return requestHelper('PUT', '/v2/admin/user/details', { email, nameFirst, nameLast }, { token });
};

export const adminQuizCreateQuestion = (token: string, quizId: number, questionBody: QuestionBody) => {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/question`, { questionBody }, { token });
};

export const adminQuizEmptyTrash = (token: string, quizIds: number[]) => {
  return requestHelper('DELETE', '/v2/admin/quiz/trash/empty', { quizIds: JSON.stringify(quizIds) }, { token });
};

export const adminQuizUpdateQuestion = (token: string, quizId: number, questionId:number, questionBody:QuestionBody) => {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/question/${questionId}`, { questionBody }, { token });
};

export const adminQuizTrash = (token: string) => {
  return requestHelper('GET', '/v2/admin/quiz/trash', {}, { token });
};

export const adminQuizQuestionMove = (token: string, quizId: number, questionId: number, newPosition: number) => {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/question/${questionId}/move`, { newPosition }, { token });
};

export const adminQuizDeleteQuestion = (quizId: number, questionId: number, token: string) => {
  return requestHelper('DELETE', `/v2/admin/quiz/${quizId}/question/${questionId}`, {}, { token });
};

export const adminQuizTransfer = (token: string, quizId:number, userEmail:string) => {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/transfer`, { userEmail }, { token });
};

export const adminUserPassword = (token: string, oldPassword: string, newPassword: string) => {
  return requestHelper('PUT', '/v2/admin/user/password', { oldPassword, newPassword }, { token });
};

export const adminQuizQuestionDuplicate = (token: string, quizId: number, questionId: number) => {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/question/${questionId}/duplicate`, {}, { token });
};

// Iteration 3 Routes

export const requestAdminQuizThumbnail = (token: string, quizId: number, imgUrl: string) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/thumbnail`, { imgUrl }, { token });
};
export const requestQuizSessionCreate = (token: string, quizId: number, autoStartNum: number) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/session/start`, { autoStartNum }, { token });
};

export const requestQuizSessionUpdate = (token: string, quizId: number, sessionId: number, action: string) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/session/${sessionId}`, { action }, { token });
};

export const requestSendChatMessage = (playerId: number, message: ChatMessage) => {
  return requestHelper('POST', `/v1/player/${playerId}/chat`, { message }, {});
};

export const requestQuizSessionResults = (token: string, quizId: number, sessionId: number) => {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}/session/${sessionId}/results`, {}, { token });
};

export const requestPlayerQuestionAnswer = (answerIds: number[], playerId: number, questionPosition: number) => {
  return requestHelper('PUT', `/v1/player/${playerId}/question/${questionPosition}/answer`, { answerIds }, {});
};

export const requestQuizViewSessions = (token: string, quizId: number) => {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}/sessions`, {}, { token });
};

export const requestPlayerStatus = (playerId: number) => {
  return requestHelper('GET', `/v1/player/${playerId}`, {}, {});
};

export const requestPlayerJoin = (sessionId: number, name: string) => {
  return requestHelper('POST', '/v1/player/join', { sessionId, name }, {});
};

export const requestSessionStatus = (token: string, quizId: number, sessionId: number) => {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}/session/${sessionId}`, {}, { token });
};

export const requestPlayerQuestionResults = (playerId: number, questionPosition: number) => {
  return requestHelper('GET', `/v1/player/${playerId}/question/${questionPosition}/results`, {}, {});
};

export const requestPlayerGetAllMessages = (playerId: number) => {
  return requestHelper('GET', `/v1/player/${playerId}/chat`, {}, {});
};

export const requestPlayerFinalResults = (playerId: number) => {
  return requestHelper('GET', `/v1/player/${playerId}/results`, {}, {});
};

export const requestQuizSessionResultsCsv = (token: string, quizId: number, sessionId: number) => {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}/session/${sessionId}/results/csv`, {}, { token });
};

// Old Routes
export const oldRequestAdminUserDetails = (token: string) => {
  return requestHelper('GET', '/v1/admin/user/details', { token });
};

export const oldRequestAdminQuizList = (token: string) => {
  return requestHelper('GET', '/v1/admin/quiz/list', { token });
};

export const oldRequestAdminQuizCreate = (token: string, name: string, description: string) => {
  return requestHelper('POST', '/v1/admin/quiz', { token, name, description });
};

export const oldRequestAdminQuizRemove = (token: string, quizId: number) => {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}`, { token });
};

export const oldRequestAdminQuizInfo = (token: string, quizId: number) => {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}`, { token });
};

export const oldRequestAdminQuizNameUpdate = (token: string, quizId: number, name: string) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/name`, { token, name });
};

export const oldRequestAdminQuizDescriptionUpdate = (token: string, quizId: number, description: string) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/description`, { token, description });
};

// Iteration 2 functions

export const oldRequestAdminAuthLogout = (token: string) => {
  return requestHelper('POST', '/v1/admin/auth/logout', { token });
};

export const oldRequestAdminQuizRestore = (token: string, quizId: number) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/restore`, { token });
};

export const oldRequestAdminUserDetailsUpdate = (token: string, email: string, nameFirst: string, nameLast: string) => {
  return requestHelper('PUT', '/v1/admin/user/details', { token, email, nameFirst, nameLast });
};

export const oldRequestAdminQuizCreateQuestion = (token: string, quizId: number, questionBody: QuestionBody) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/question`, { token, questionBody });
};

export const oldRequestAdminQuizEmptyTrash = (token: string, quizIds: number[]) => {
  return requestHelper('DELETE', '/v1/admin/quiz/trash/empty', { token, quizIds: JSON.stringify(quizIds) });
};

export const oldRequestAdminQuizUpdateQuestion = (token: string, quizId: number, questionId:number, questionBody:QuestionBody) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}`, { token, questionBody });
};

export const oldRequestAdminQuizTrash = (token: string) => {
  return requestHelper('GET', '/v1/admin/quiz/trash', { token });
};

export const oldRequestAdminQuizQuestionMove = (token: string, quizId: number, questionId: number, newPosition: number) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}/move`, { token, newPosition });
};

export const oldRequestAdminQuizDeleteQuestion = (quizId: number, questionId: number, token: string) => {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}/question/${questionId}`, { token });
};

export const oldRequestAdminQuizTransfer = (token: string, quizId:number, userEmail:string) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/transfer`, { token, userEmail });
};

export const oldRequestAdminUserPassword = (token: string, oldPassword: string, newPassword: string) => {
  return requestHelper('PUT', '/v1/admin/user/password', { token, oldPassword, newPassword });
};

export const oldRequestAdminQuizQuestionDuplicate = (token: string, quizId: number, questionId: number) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`, { token });
};

export const requestPlayerCurrentQuestionInfo = (playerId: number, questionPosition: number) => {
  return requestHelper('GET', `/v1/player/${playerId}/question/${questionPosition}`, { }, { });
};
