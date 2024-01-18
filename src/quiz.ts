import {
  getData,
  setData
} from './dataStore';

import {
  arrayMovePositions,
  generateAnswersArray,
  getQuestionById,
  getQuestionPosition,
  getQuizzesByEmail,
  getQuizById,
  getUserSessionByToken,
  getSumOfQuestionDurations,
  getUserByEmail,
  getUserById,
  isDescriptionValid,
  isDuplicateQuizName,
  isOwnedByUser,
  isValidString,
  getCurrentTimeInSeconds,
  getNumActiveSessions,
  getQuizSessionBySessionId,
  changeState,
  isNameUnique,
  generateRandomName,
  getQuizSessionByQuizId,
  isValidAnswerId,
  hasDuplicates,
  generateUniqueId,
  checkValidImage,
  getPlayerSortedScores,
  isEqualArray,
  getPlayerById,
  getQuizSessionByPlayerId
} from './helper';

import {
  ALPHANUMERIC_REGEX,
  AdminQuizAction,
  AdminQuizCreateQuestionReturn,
  AdminQuizCreateReturn,
  AdminQuizDeleteQuestionReturn,
  AdminQuizDescriptionUpdateReturn,
  AdminQuizEmptyTrashReturn,
  AdminQuizInfoReturn,
  AdminQuizListReturn,
  AdminQuizNameUpdateReturn,
  AdminQuizQuestionDuplicateReturn,
  AdminQuizQuestionMoveReturn,
  AdminQuizRemoveReturn,
  AdminQuizRestoreReturn,
  AdminQuizSessionStartReturn,
  AdminQuizTransferReturn,
  AdminQuizTrashReturn,
  AdminQuizUpdateQuestionReturn,
  AdminPlayerJoinReturn,
  AdminQuizUpdateSessionReturn,
  QuestionResult,
  AdminQuizThumbnailUpdateReturn,
  DEFAULT_QUIZ_DURATION,
  DEFAULT_QUIZ_NUM_QUESTIONS,
  FORBIDDEN,
  INPUT_ERROR,
  MAX_ACTIVE_SESSIONS,
  MAX_ANSWER_LENGTH,
  MAX_AUTO_START_NUM,
  MAX_AWARDED_POINTS,
  MAX_QUESTION_ANSWERS,
  MAX_QUESTION_DURATION_SUM,
  MAX_QUESTION_LENGTH,
  MAX_QUIZ_NAME_LENGTH,
  MIN_ANSWER_LENGTH,
  MIN_AWARDED_POINTS,
  MIN_QUESTION_ANSWERS,
  MIN_QUESTION_LENGTH,
  MIN_QUIZ_NAME_LENGTH,
  FinalResults,
  PlayerQuestionAnswerReturn,
  Question,
  QuestionBody,
  Quiz,
  QuizSession,
  QuizSource,
  QuizState,
  Player,
  UNAUTHORISED,
  ChatMessage,
  GetFinalResultsAsCsvReturn,
  GetSessionStatusReturn,
  QuizMetadata,
  PlayerCurrentQuestionInfoReturn,
  MIN_MESSAGE_BODY_LENGTH,
  MAX_MESSAGE_BODY_LENGTH,
  PlayerStatusReturn,
  PlayerGetAllMessagesReturn,
} from './types';

import HTTPError from 'http-errors';
import { convertArrayToCSV } from 'convert-array-to-csv';
import fs from 'fs';
import { url, port } from './config.json';
import { csvResultsPath } from './other';

/**
 * @description Register a user with an email, password, and names, then return their authUserId value.
 *
 * @param { string } token - unique identifier for a user session
 * @param { string } name - user's name
 * @param { string } description - basic details about this new quiz
 *
 * @return { quizId: number }
 */
export function adminQuizCreate(token: string, name: string, description: string, isIteration3 = true): AdminQuizCreateReturn {
  const data = getData();

  const session = getUserSessionByToken(token, data);
  if (!session) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }
  const authUserId = session.authUserId;
  if (!isValidString(name, MIN_QUIZ_NAME_LENGTH, MAX_QUIZ_NAME_LENGTH, ALPHANUMERIC_REGEX)) {
    throw HTTPError(INPUT_ERROR, 'Invalid quiz name');
  }
  if (isDuplicateQuizName(authUserId, name, data, QuizSource.quizzes)) {
    throw HTTPError(INPUT_ERROR, 'Name is already used by the current logged in user for another quiz');
  }
  if (!isDescriptionValid(description)) {
    throw HTTPError(INPUT_ERROR, 'Invalid description');
  }

  const quizId = generateUniqueId(data);
  const quiz: Quiz = {
    quizId: quizId,
    name: name,
    authUserId: authUserId,
    timeCreated: getCurrentTimeInSeconds(),
    timeLastEdited: getCurrentTimeInSeconds(),
    description: description,
    numQuestions: DEFAULT_QUIZ_NUM_QUESTIONS,
    questions: [],
    duration: DEFAULT_QUIZ_DURATION,
  };
  if (isIteration3) quiz.thumbnailUrl = '';

  data.quizzes.push(quiz);
  setData(data);

  return {
    quizId: quizId
  };
}

/**
 * @description Remove's a quiz from the datastore based on its quizId.
 *
 * @param { string } token - unique identifier for a user session
 * @param { number } quizId - unique identifier for a quiz
 *
 * @return {}
 */
export function adminQuizRemove(token: string, quizId: number, isIteration3 = true): AdminQuizRemoveReturn {
  const data = getData();

  const session = getUserSessionByToken(token, data);
  if (!session) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }

  const authUserId = session.authUserId;
  const quiz = getQuizById(quizId, data);
  if (!quiz) {
    throw HTTPError(FORBIDDEN, 'QuizId is not a valid quiz.');
  }
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(FORBIDDEN, 'Quiz is not owned by user');
  }
  if (isIteration3) {
    const quizSessions = getQuizSessionByQuizId(quizId, data);
    if (quizSessions.some((quizSession) => quizSession.state !== QuizState.END)) {
      throw HTTPError(INPUT_ERROR, 'All sessions for this quiz must be in END state');
    }
  }

  quiz.timeLastEdited = getCurrentTimeInSeconds();
  data.trash.push(quiz);
  data.quizzes = data.quizzes.filter((quiz) => quiz.quizId !== quizId);
  setData(data);

  return {};
}

/**
 * @description Get all of the relevant information about the current quiz.
 *
 * @param { string } token - unique identifier for a user session
 * @param { number } quizId - unique identifier for a quiz
 *
 * @return {{
 *   quizId: number,
 *   name: string,
 *   timeCreated: number,
 *   timeLastEdited: number,
 *   description: string,
 * }}
 */
export function adminQuizInfo(token: string, quizId: number): AdminQuizInfoReturn {
  const data = getData();

  const session = getUserSessionByToken(token, data);
  if (!session) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }

  const authUserId = session.authUserId;
  const quiz = getQuizById(quizId, data);
  if (!quiz) {
    throw HTTPError(FORBIDDEN, 'QuizId is not a valid quiz.');
  }
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(FORBIDDEN, 'Quiz is not owned by user');
  }

  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: quiz.questions,
    duration: quiz.duration,
    thumbnailUrl: quiz.thumbnailUrl
  };
}

/**
 * @description Update the description of the relevant quiz.
 *
 * @param { string } token - unique identifier for a user session
 * @param { string } quizId - unique identifier for a quiz
 * @param { string } description - updated description which contains new details about this existing quiz
 *
 * @return {}
 */
export function adminQuizDescriptionUpdate(token: string, quizId: number, description: string): AdminQuizDescriptionUpdateReturn {
  const data = getData();

  const session = getUserSessionByToken(token, data);
  if (!session) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }

  const authUserId = session.authUserId;
  const quiz = getQuizById(quizId, data);
  if (!quiz) {
    throw HTTPError(FORBIDDEN, 'QuizId is not a valid quiz.');
  }
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(FORBIDDEN, 'Quiz is not owned by user');
  }
  if (!isDescriptionValid(description)) {
    throw HTTPError(INPUT_ERROR, 'Invalid Description');
  }

  quiz.description = description;
  quiz.timeLastEdited = getCurrentTimeInSeconds();
  setData(data);

  return {};
}

/**
 * @description Update the name of the relevant quiz.
 *
 * @param { string } token - unique identifier for a user session
 * @param { number } quizId- unique identifier for a quiz
 * @param { string } name - new name of the quiz
 *
 * @return {}
 */
export function adminQuizNameUpdate(token: string, quizId: number, name: string): AdminQuizNameUpdateReturn {
  const data = getData();

  const session = getUserSessionByToken(token, data);
  if (!session) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }

  const authUserId = session.authUserId;
  const quiz = getQuizById(quizId, data);
  if (!quiz) {
    throw HTTPError(FORBIDDEN, 'QuizId is not a valid quiz.');
  }
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(FORBIDDEN, 'Quiz is not owned by user');
  }
  if (!isValidString(name, MIN_QUIZ_NAME_LENGTH, MAX_QUIZ_NAME_LENGTH, ALPHANUMERIC_REGEX)) {
    throw HTTPError(INPUT_ERROR, 'Invalid quiz name');
  }
  if (isDuplicateQuizName(authUserId, name, data, QuizSource.quizzes)) {
    throw HTTPError(INPUT_ERROR, 'Name is already used by the current logged in user for another quiz');
  }

  quiz.name = name;
  quiz.timeLastEdited = getCurrentTimeInSeconds();
  setData(data);

  return {};
}

/**
 * @description Provide a list of all quizzes that are owned by the
 * currently logged in user.
 *
 * @param { string } token - unique identifier for a user session
 *
 * @return {{
*   quizzes: Array<{
  *     quizId: number,
  *     name: string
  *   }>
  * },
  * }
  */
export function adminQuizList(token: string): AdminQuizListReturn {
  const data = getData();
  const session = getUserSessionByToken(token, data);
  if (!session) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }

  const authUserId = session.authUserId;
  const ownedQuizzes: Quiz[] = data.quizzes.filter(quiz => quiz.authUserId === authUserId);
  const quizzes = ownedQuizzes.map((quiz) => {
    return {
      quizId: quiz.quizId,
      name: quiz.name,
    };
  });

  return {
    quizzes: quizzes
  };
}

/**
 * @description Creates a quiz question.
 *
 * @param { string } token - unique identifier for a user session
 * @param { number } quizId - unique identifier for a quiz
 * @param { QuestionBody } questionBody - An object containing the details of the question
 *
 * @return { questionId: number}
 */
export function adminQuizCreateQuestion(token: string, quizId: number, questionBody: QuestionBody, isIteration3 = true): AdminQuizCreateQuestionReturn {
  const data = getData();
  const session = getUserSessionByToken(token, data);
  const { answers, duration, question, points, thumbnailUrl } = questionBody;

  if (!session) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }

  const authUserId = session.authUserId;
  const quiz = getQuizById(quizId, data);
  if (!quiz) {
    throw HTTPError(FORBIDDEN, 'Quiz ID does not refer to a valid quiz');
  }
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(FORBIDDEN, 'Quiz is not owned by user');
  }
  if (!isValidString(question, MIN_QUESTION_LENGTH, MAX_QUESTION_LENGTH)) {
    throw HTTPError(INPUT_ERROR, `Question string is less than ${MIN_QUESTION_LENGTH} characters in length or greater than ${MAX_QUESTION_LENGTH} characters in length`);
  }

  const numAnswers = questionBody.answers.length;
  if (numAnswers < MIN_QUESTION_ANSWERS) {
    throw HTTPError(INPUT_ERROR, `The question has less than ${MIN_QUESTION_ANSWERS} answers`);
  }
  if (numAnswers > MAX_QUESTION_ANSWERS) {
    throw HTTPError(INPUT_ERROR, `The question has more than ${MAX_QUESTION_ANSWERS} answers`);
  }
  if (duration <= 0) {
    throw HTTPError(INPUT_ERROR, 'The question duration is not a positive number');
  }

  const quizDuration = getSumOfQuestionDurations(quiz);
  const totalQuizDuration = quizDuration + duration;
  if (totalQuizDuration > MAX_QUESTION_DURATION_SUM) {
    throw HTTPError(INPUT_ERROR, `Total quiz duration is greater than ${MAX_QUESTION_DURATION_SUM} seconds`);
  }
  if (points < MIN_AWARDED_POINTS) {
    throw HTTPError(INPUT_ERROR, `The points awarded is less than ${MIN_AWARDED_POINTS}`);
  }
  if (points > MAX_AWARDED_POINTS) {
    throw HTTPError(INPUT_ERROR, `The points awarded is greater than ${MAX_AWARDED_POINTS}`);
  }

  const invalidAnswerLength = answers.some((answer) => answer.answer.length < MIN_ANSWER_LENGTH || answer.answer.length > MAX_ANSWER_LENGTH);
  if (invalidAnswerLength) {
    throw HTTPError(INPUT_ERROR, `The length of any answer is less than ${MIN_ANSWER_LENGTH} or greater than ${MAX_ANSWER_LENGTH}`);
  }

  const answerStrings = answers.map((a) => a.answer);
  const hasDuplicateAnswers = new Set(answerStrings).size !== answerStrings.length;
  if (hasDuplicateAnswers) {
    throw HTTPError(INPUT_ERROR, 'Any answer strings are duplicates of one another (within the same question)');
  }

  const hasAtLeastOneCorrectAnswer = answers.some((answer) => answer.correct === true);
  if (!hasAtLeastOneCorrectAnswer) {
    throw HTTPError(INPUT_ERROR, 'There are no correct answers');
  }

  const answersArr = generateAnswersArray(questionBody.answers, data);
  const questionId = generateUniqueId(data);
  if (isIteration3) {
    checkValidImage(thumbnailUrl);
  }

  const questionObject: Question = {
    questionId: questionId,
    question: question,
    duration: duration,
    points: points,
    answers: answersArr
  };
  if (isIteration3) questionObject.thumbnailUrl = thumbnailUrl;

  quiz.timeLastEdited = getCurrentTimeInSeconds();
  quiz.questions.push(questionObject);
  quiz.duration = getSumOfQuestionDurations(quiz);
  quiz.numQuestions++;
  setData(data);

  return {
    questionId
  };
}

/**
 * @description Updates the contents of an existing question
 *
 * @param { string } token - unique identifier for a user session
 * @param { number } quizId - unique identifier for a quiz
 * @param { number } questionId - unique identifier for a question
 * @param { QuestionBody } questionBody - An object containing the details of the question
 *
 * @return  {}
 */
export function adminQuizUpdateQuestion(token: string, quizId: number, questionId: number, questionBody: QuestionBody, isIteration3 = true): AdminQuizUpdateQuestionReturn {
  const data = getData();

  const session = getUserSessionByToken(token, data);
  const { answers, duration, question, points, thumbnailUrl } = questionBody;
  if (!session) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }

  const quiz = getQuizById(quizId, data);
  if (!quiz) {
    throw HTTPError(FORBIDDEN, 'Quiz ID does not refer to a valid quiz');
  }

  const authUserId = session.authUserId;
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(FORBIDDEN, 'Quiz is now owned by user');
  }
  if (!isValidString(question, MIN_QUESTION_LENGTH, MAX_QUESTION_LENGTH)) {
    throw HTTPError(INPUT_ERROR, `Question string is less than ${MIN_QUESTION_LENGTH} characters in length or greater than ${MAX_QUESTION_LENGTH} characters in length`);
  }

  const numAnswers = questionBody.answers.length;
  if (numAnswers < MIN_QUESTION_ANSWERS) {
    throw HTTPError(INPUT_ERROR, `The question has less than ${MIN_QUESTION_ANSWERS} answers`);
  }
  if (numAnswers > MAX_QUESTION_ANSWERS) {
    throw HTTPError(INPUT_ERROR, `The question has more than ${MAX_QUESTION_ANSWERS} answers`);
  }
  if (duration <= 0) {
    throw HTTPError(INPUT_ERROR, 'The question duration is not a positive number');
  }

  const quizDuration = getSumOfQuestionDurations(quiz);
  const totalQuizDuration = quizDuration + duration;
  if (totalQuizDuration > MAX_QUESTION_DURATION_SUM) {
    throw HTTPError(INPUT_ERROR, `Total quiz duration is greater than ${MAX_QUESTION_DURATION_SUM} seconds`);
  }
  if (points < MIN_AWARDED_POINTS) {
    throw HTTPError(INPUT_ERROR, `The points awarded is less than ${MIN_AWARDED_POINTS}`);
  }
  if (points > MAX_AWARDED_POINTS) {
    throw HTTPError(INPUT_ERROR, `The points awarded is greater than ${MAX_AWARDED_POINTS}`);
  }

  const invalidAnswerLength = answers.some((answer) => answer.answer.length < MIN_ANSWER_LENGTH || answer.answer.length > MAX_ANSWER_LENGTH);
  if (invalidAnswerLength) {
    throw HTTPError(INPUT_ERROR, `The length of any answer is less than ${MIN_ANSWER_LENGTH} or greater than ${MAX_ANSWER_LENGTH}`);
  }

  const answerStrings = answers.map((a) => a.answer);
  const hasDuplicateAnswers = new Set(answerStrings).size !== answerStrings.length;
  if (hasDuplicateAnswers) {
    throw HTTPError(INPUT_ERROR, 'Any answer strings are duplicates of one another (within the same question)');
  }

  const hasAtLeastOneCorrectAnswer = answers.some((answer) => answer.correct === true);
  if (!hasAtLeastOneCorrectAnswer) {
    throw HTTPError(INPUT_ERROR, 'There are no correct answers');
  }

  const questionObject = getQuestionById(quizId, questionId, data);
  if (!questionObject) {
    throw HTTPError(INPUT_ERROR, 'Question ID does not refer to a valid question within quiz');
  }
  const answersArr = generateAnswersArray(questionBody.answers, data);
  if (isIteration3) {
    checkValidImage(thumbnailUrl);
  }

  questionObject.questionId = questionId;
  questionObject.question = questionBody.question;
  questionObject.duration = questionBody.duration;
  questionObject.points = questionBody.points;
  questionObject.answers = answersArr;
  if (isIteration3) questionObject.thumbnailUrl = thumbnailUrl;

  quiz.timeLastEdited = getCurrentTimeInSeconds();
  quiz.duration = getSumOfQuestionDurations(quiz);
  setData(data);

  return {};
}

/**
 * @description Transfers ownership of a quiz to someone else
 *
 * @param { string } token - unique identifier for a user session
 * @param { number } quizId - unique identifier for a quiz
 * @param { string } userEmail - email of the user to whom ownership of the quiz is transferred
 *
 * @return  {}
 */
export function adminQuizTransfer(token: string, quizId: number, userEmail: string, isIteration3 = true): AdminQuizTransferReturn {
  const data = getData();
  const session = getUserSessionByToken(token, data);
  if (!session) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }

  const authUserId = session.authUserId;
  const oldOwner = getUserById(authUserId, data);
  const newOwner = getUserByEmail(userEmail, data);
  const quiz = getQuizById(quizId, data);

  if (quiz.authUserId !== authUserId) {
    throw HTTPError(FORBIDDEN, 'Quiz is not owned by user');
  }
  if (!newOwner) {
    throw HTTPError(INPUT_ERROR, 'UserEmail does not refer to a valid user');
  }
  if (oldOwner.email === userEmail) {
    throw HTTPError(INPUT_ERROR, 'UserEmail is the current logged-in email');
  }
  const newOwnerQuizList = getQuizzesByEmail(userEmail, data);
  if (newOwnerQuizList.some((q) => q.name === quiz.name)) {
    throw HTTPError(INPUT_ERROR, 'Targeted user already has a quiz with the same name');
  }
  if (isIteration3) {
    const quizSessions = getQuizSessionByQuizId(quizId, data);
    if (quizSessions.some((quizSession) => quizSession.state !== QuizState.END)) {
      throw HTTPError(INPUT_ERROR, 'All sessions for this quiz must be in END state');
    }
  }

  quiz.authUserId = newOwner.userId;
  quiz.timeLastEdited = getCurrentTimeInSeconds();
  setData(data);

  return {};
}

/**
 * @description Permanently remove quizzes from trash
 *
 * @param { string } token - unique identifier for a user session
 * @param { number[] } quizIds - array of unique identifiers for a quizzes
 *
 * @return {}
 */
export function adminQuizEmptyTrash(token: string, quizIds: number[]): AdminQuizEmptyTrashReturn {
  const data = getData();
  const session = getUserSessionByToken(token, data);
  if (!session) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }
  const authUserId = session.authUserId;

  const userOwnsAllQuizzes = quizIds.every((quizId) =>
    isOwnedByUser(authUserId, quizId, QuizSource.trash) || isOwnedByUser(authUserId, quizId, QuizSource.quizzes)
  );
  if (!userOwnsAllQuizzes) {
    throw HTTPError(FORBIDDEN, 'Valid token is provided, but user is not the owner of one or more of the Quiz IDs');
  }

  const invalidQuizIds = quizIds.filter((quizId) => {
    const quiz = getQuizById(quizId, data, true);
    return !quiz || !isOwnedByUser(authUserId, quizId, QuizSource.trash);
  });
  if (invalidQuizIds.length > 0) {
    throw HTTPError(INPUT_ERROR, 'One or more of the Quiz IDs is not currently in the trash');
  }

  data.trash = data.trash.filter((quiz) => !quizIds.includes(quiz.quizId));
  setData(data);

  return {};
}

/**
  * @description View the quizzes that are currently in the trash for the logged in user
  *
  * @param token - unique identifier for a user session
  *
  * @return {{
  *   quizzes: Array<{
  *     quizId: number,
  *     name: string
  *   }>
  * },
  * }
 */
export function adminQuizTrash(token: string): AdminQuizTrashReturn {
  const data = getData();
  const session = getUserSessionByToken(token, data);
  if (!session) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }
  const authUserId = session.authUserId;

  const ownedTrashQuizzes: Quiz[] = data.trash.filter(quiz => quiz.authUserId === authUserId);
  const quizzes = ownedTrashQuizzes.map((quiz) => {
    return {
      quizId: quiz.quizId,
      name: quiz.name,
    };
  });

  return {
    quizzes: quizzes
  };
}

/**
 * @description Restores quiz from trash
 *
 * @param { string } token - unique identifier for a user session
 * @param { number } quizId- unique identifier for a quiz
 *
 * @return {}
 */
export function adminQuizRestore(token: string, quizId: number): AdminQuizRestoreReturn {
  const data = getData();
  const session = getUserSessionByToken(token, data);
  if (!session) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }

  const quiz = getQuizById(quizId, data, true);
  const authUserId = session.authUserId;
  if (!isOwnedByUser(authUserId, quizId, QuizSource.trash) && !isOwnedByUser(authUserId, quizId, QuizSource.quizzes)) {
    throw HTTPError(FORBIDDEN, 'Valid token is provided, but user is not an owner of this quiz or quiz ID does not refer to a valid quiz');
  }
  if (!quiz) {
    throw HTTPError(INPUT_ERROR, 'Quiz ID does not refer to a quiz in the trash');
  }
  if (isDuplicateQuizName(authUserId, quiz.name, data, QuizSource.quizzes)) {
    throw HTTPError(INPUT_ERROR, 'Quiz name is already used by another active quiz');
  }
  data.trash = data.trash.filter((quiz) => quiz.quizId !== quizId);
  quiz.timeLastEdited = getCurrentTimeInSeconds();

  data.quizzes.push(quiz);
  setData(data);

  return {};
}

/**
 * @description Moves quiz question to different position within quiz.
 *
 * @param { string } token - unique identifier for a user session
 * @param { number } quizId - unique identifier for a quiz
 * @param { number } questionId - unique identifier for a question
 * @param { number } newIndex - new position to which the question should be moved
 *
 * @return {}
 */
export function adminQuizQuestionMove(token: string, quizId: number, questionId: number, newIndex: number):AdminQuizQuestionMoveReturn {
  const data = getData();
  const session = getUserSessionByToken(token, data);
  if (!session) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }

  const authUserId = session.authUserId;
  const quiz = getQuizById(quizId, data);
  if (!quiz) {
    throw HTTPError(FORBIDDEN, 'Quiz ID does not refer to a valid quiz');
  }
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(FORBIDDEN, 'Quiz is not owned by user');
  }

  const targetQuestion = getQuestionById(quizId, questionId, data);
  if (!targetQuestion) {
    throw HTTPError(INPUT_ERROR, 'Question ID does not refer to a valid question in quiz');
  }
  if (newIndex < 0 || newIndex > (quiz.questions.length - 1)) {
    throw HTTPError(INPUT_ERROR, 'Position does not exist');
  }
  const oldIndex = getQuestionPosition(quizId, questionId, data);
  if (newIndex === oldIndex) {
    throw HTTPError(INPUT_ERROR, 'New Position cannot be the old Position');
  }

  arrayMovePositions(quiz.questions, targetQuestion, oldIndex, newIndex);
  quiz.timeLastEdited = getCurrentTimeInSeconds();

  setData(data);

  return {};
}

/**
 * @description Deletes a question from a quiz
 *
 * @param { string } token - unique identifier for a user session
 * @param { number } quizId - unique identifier for a quiz
 * @param { number } questionId - unique identifier for a question
 *
 * @return {}
 */
export function adminQuizDeleteQuestion(token: string, quizId: number, questionId: number, isIteration3 = true): AdminQuizDeleteQuestionReturn {
  const data = getData();
  const session = getUserSessionByToken(token, data);
  if (!session) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }

  const authUserId = session.authUserId;
  const quiz = getQuizById(quizId, data);
  if (!quiz || quiz.authUserId !== authUserId) {
    throw HTTPError(FORBIDDEN, 'Quiz is not owned by user');
  }

  const question = getQuestionById(quizId, questionId, data);
  if (!question) {
    throw HTTPError(INPUT_ERROR, 'Question ID does not refer to a valid question in this quiz');
  }
  if (isIteration3) {
    const quizSessions = getQuizSessionByQuizId(quizId, data);
    if (quizSessions.some((quizSession) => quizSession.state !== QuizState.END)) {
      throw HTTPError(INPUT_ERROR, 'All sessions for this quiz must be in END state');
    }
  }

  quiz.questions = quiz.questions.filter((question) => question.questionId !== questionId);
  quiz.numQuestions--;
  quiz.timeLastEdited = getCurrentTimeInSeconds();
  setData(data);

  return {};
}

/**
 * @description Duplicates quiz question, by making a copy and placing it next to it.
 *
 * @param { string } token - unique identifier for a user session
 * @param { number } quizId - unique identifier for a quiz
 * @param { number } questionId - unique identifier for a question
 * @return { newquestionId: number }
 */
export function adminQuizQuestionDuplicate(token: string, quizId: number, questionId: number):AdminQuizQuestionDuplicateReturn {
  const data = getData();
  const session = getUserSessionByToken(token, data);
  if (!session) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }

  const authUserId = session.authUserId;
  const quiz = getQuizById(quizId, data);
  if (!quiz) {
    throw HTTPError(FORBIDDEN, 'Quiz ID does not refer to a valid quiz');
  }
  if (quiz.authUserId !== authUserId) {
    throw HTTPError(FORBIDDEN, 'Quiz is not owned by user');
  }

  const targetQuestion = getQuestionById(quizId, questionId, data);
  if (!targetQuestion) {
    throw HTTPError(INPUT_ERROR, 'Question ID does not refer to a valid question in quiz');
  }

  const targetIndex = getQuestionPosition(quizId, questionId, data);
  const duplicateQuestion = { ...targetQuestion };
  duplicateQuestion.answers = generateAnswersArray(duplicateQuestion.answers, data);

  duplicateQuestion.questionId = generateUniqueId(data);
  quiz.timeLastEdited = getCurrentTimeInSeconds();

  quiz.questions.unshift(duplicateQuestion);
  quiz.numQuestions++;
  quiz.duration = getSumOfQuestionDurations(quiz);
  arrayMovePositions(quiz.questions, duplicateQuestion, 0, targetIndex + 1);

  setData(data);

  return {
    newQuestionId: duplicateQuestion.questionId
  };
}

/**
 * @description Create active quiz session
 *
 * @param { string } token - unique identifier for a user session
 * @param { number } quizId - unique identifier for a quiz
 * @param { number } autoStartNum
 * @return { sessionId: number }
 */
export function createQuizSession(token: string, quizId: number, autoStartNum: number): AdminQuizSessionStartReturn {
  const data = getData();
  const userSession = getUserSessionByToken(token, data);
  if (!userSession) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }

  const quiz = getQuizById(quizId, data);
  if (!quiz || quiz.authUserId !== userSession.authUserId) {
    throw HTTPError(FORBIDDEN, 'Valid token is provided but user is not an owner of this quiz');
  }
  if (autoStartNum > MAX_AUTO_START_NUM) {
    throw HTTPError(INPUT_ERROR, 'autoStartNum is a number greater than ');
  }
  if (quiz.numQuestions === 0) {
    throw HTTPError(INPUT_ERROR, 'The quiz does not have any questions in it');
  }
  const numActiveSessions = getNumActiveSessions(data);
  if (numActiveSessions >= MAX_ACTIVE_SESSIONS) {
    throw HTTPError(INPUT_ERROR, `A maximum of ${MAX_ACTIVE_SESSIONS} that are not in END state currently exist`);
  }

  const sessionId = generateUniqueId(data);
  const quizSession: QuizSession = {
    quizSessionId: sessionId,
    state: QuizState.LOBBY,
    atQuestion: 0,
    autoStartNum: autoStartNum,
    players: [],
    metadata: { ...quiz },
    messages: [],
    questionResults: [],
    questionOpenTime: []
  };
  data.quizSessions.push(quizSession);
  setData(data);

  return {
    sessionId: sessionId
  };
}

/**
 * @description Update the state of the session
 *
 * @param { string } token - unique identifier for a user session
 * @param { number } quizId - unique identifier for a quiz
 * @param { number } sessionId - unique identifier for a session
 * @param { string } action - unique identifier for a session
 *
 * @return {}
 */
export function updateSessionState(token: string, quizId: number, sessionId: number, action: AdminQuizAction): AdminQuizUpdateSessionReturn {
  const data = getData();
  const userSession = getUserSessionByToken(token, data);
  if (!userSession) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }

  const quizSession = getQuizSessionBySessionId(sessionId, data);
  if (!quizSession || quizSession.metadata.authUserId !== userSession.authUserId) {
    throw HTTPError(FORBIDDEN, 'Valid token is provided but user is not authorised to modify this session');
  }
  if (quizSession.metadata.quizId !== quizId) {
    throw HTTPError(FORBIDDEN, 'Session id does not refer to a valid session within this quiz');
  }
  // add checking for Action provided is not a valid Action enum
  if (!Object.values(AdminQuizAction).includes(action as AdminQuizAction)) {
    throw HTTPError(INPUT_ERROR, 'Action provided is not a valid Action enum');
  }

  changeState(sessionId, action, data);
  setData(data);

  return {};
}

/**
 * @description Get the final results for all players for a completed quiz session
 *
 * @param { string } token - unique identifier for a user session
 * @param { number } quizId - unique identifier for a quiz
 * @param { number } sessionId - unique identifier for a session
 *
 * @return {
 * userRankedByScore: array<{
 *    name: string
 *    score: number}>
 * questionResults: array<{
 *    questionId: number,
 *    playersCorrectList: array<string>,
 *    averageAnswerTime: number,
 *    percentCorrect: number
 *    }>
 * }
 */
export function getQuizSessionResults(token: string, quizId: number, sessionId: number) {
  const data = getData();
  const userSession = getUserSessionByToken(token, data);
  if (!userSession) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }

  const quizSession = getQuizSessionBySessionId(sessionId, data);
  if (!quizSession || quizSession.metadata.authUserId !== userSession.authUserId) {
    throw HTTPError(FORBIDDEN, 'Valid token is provided but user is not authorised to modify this session');
  }

  if (quizSession.metadata.quizId !== quizId) {
    throw HTTPError(INPUT_ERROR, 'Session id does not refer to a valid session within this quiz');
  }

  if (quizSession.state !== QuizState.FINAL_RESULTS) {
    throw HTTPError(INPUT_ERROR, 'Session is not in FINAL_RESULTS state');
  }

  const playerSortedByScore = getPlayerSortedScores(quizSession);
  const questionResults = quizSession.questionResults.filter(results => results !== null);

  return {
    usersRankedByScore: playerSortedByScore,
    questionResults: questionResults
  };
}

/**
 * @description Submits answer to question at questionPosition
 *
 * @param { number[] } answerIds - answer ID's for the question
 * @param { number } playerId - player ID for the quiz session
 * @param { number } questionPosition - question position
 *
 * @return {}
 */
export function playerQuestionAnswer(answerIds: number[], playerId: number, questionPosition: number): PlayerQuestionAnswerReturn {
  const data = getData();
  const quizSession = getQuizSessionByPlayerId(playerId, data);

  if (!quizSession) {
    throw HTTPError(INPUT_ERROR, 'player ID does not exist');
  }
  if (quizSession.metadata.questions.length < questionPosition || questionPosition <= 0) {
    throw HTTPError(INPUT_ERROR, 'question position is not valid for the session this player is in');
  }
  if (quizSession.state !== QuizState.QUESTION_OPEN) {
    throw HTTPError(INPUT_ERROR, 'Session is not in QUESTION_OPEN state');
  }
  if (quizSession.atQuestion !== questionPosition) {
    throw HTTPError(INPUT_ERROR, 'session is not yet up to this question');
  }
  if (hasDuplicates(answerIds)) {
    throw HTTPError(INPUT_ERROR, 'There are duplicate answer IDs provided');
  }
  if (answerIds.length < 1) {
    throw HTTPError(INPUT_ERROR, 'Less than 1 answer ID was submitted');
  }
  if (!isValidAnswerId(quizSession, answerIds, questionPosition)) {
    throw HTTPError(INPUT_ERROR, 'Answer IDs are not valid for this particular question');
  }

  const player = quizSession.players.find((player) => player.playerId === playerId);
  player.answerIds[questionPosition] = answerIds;
  player.questionAnswerTime[questionPosition] = getCurrentTimeInSeconds() - quizSession.questionOpenTime[questionPosition];
  setData(data);

  return {};
}

/**
 * @description Get results of a player for a question
 *
 * @param { number } playerId - unique identifier for a player
 * @param { number } questionPosition - position of question
 *
 * @return {
 *    questionId: number,
 *    playersCorrectList: array<string>,
 *    averageAnswerTime: number,
 *    percentCorrect: number
 * }
 */
export function playerQuestionResults(playerId: number, questionPosition: number): QuestionResult {
  const data = getData();
  const quizSession = getQuizSessionByPlayerId(playerId, data);
  if (!quizSession) {
    throw HTTPError(INPUT_ERROR, 'player ID does not exist');
  }
  // check if question position starts at 0 or 1
  if (quizSession.metadata.questions.length < questionPosition || questionPosition <= 0) {
    throw HTTPError(INPUT_ERROR, 'Question position is not valid for the session this player is in');
  }
  if (quizSession.state !== QuizState.ANSWER_SHOW) {
    throw HTTPError(INPUT_ERROR, 'Session is not in ANSWER_SHOW state');
  }
  if (quizSession.atQuestion < questionPosition) {
    throw HTTPError(INPUT_ERROR, 'If session is not yet up to this question');
  }

  // assuming the question results are in order
  const question = quizSession.questionResults[questionPosition];

  return {
    questionId: question.questionId,
    playersCorrectList: question.playersCorrectList,
    averageAnswerTime: question.averageAnswerTime,
    percentCorrect: question.percentCorrect
  };
}

/**
 * @description Allow a guest player to join a session
 *
 * @param { number } sessionId - unique identifier for a quiz session
 * @param { string } name - name of player
 *
 * @return { playerId: playerId }
 */
export function playerJoin(sessionId: number, name: string): AdminPlayerJoinReturn {
  const data = getData();
  const playerId = generateUniqueId(data);

  if (name.trim() === '') {
    name = generateRandomName(sessionId, data);
  }
  if (!isNameUnique(sessionId, name, data)) {
    throw HTTPError(INPUT_ERROR, 'Name of user entered is not unique (compared to other users who have already joined)');
  }

  const quizSession = getQuizSessionBySessionId(sessionId, data);
  if (quizSession.state !== QuizState.LOBBY) {
    throw HTTPError(INPUT_ERROR, 'Session is not in LOBBY state');
  }

  const player: Player = {
    playerId: playerId,
    name: name,
    answerIds: [],
    score: 0,
    questionAnswerTime: [],
    pointsAtQuestion: []
  };
  quizSession.players.push(player);

  if (quizSession.autoStartNum !== 0 && quizSession.players.length >= quizSession.autoStartNum) {
    changeState(sessionId, AdminQuizAction.NEXT_QUESTION, data);
  }

  setData(data);

  return {
    playerId: playerId
  };
}

/**
 * @description Return all messages that are in the same session as the player
 *
 * @param { number } playerId - unique identifier for a player
 * @param { string } message - messageBody that the player wishes to send
 *
 * @returns {}
 */
export function playerSendChatMessage(playerId: number, message: ChatMessage) {
  const data = getData();
  if (message.message.messageBody.length < MIN_MESSAGE_BODY_LENGTH || message.message.messageBody.length > MAX_MESSAGE_BODY_LENGTH) {
    throw HTTPError(INPUT_ERROR, 'Messages cannot be less than 1 character, or more than 100');
  }
  const player = getPlayerById(playerId, data);
  if (!player) {
    throw HTTPError(INPUT_ERROR, 'PlayerId does not exist');
  }

  const quizSession = getQuizSessionByPlayerId(playerId, data);
  quizSession.messages.push({
    messageBody: message.message.messageBody,
    playerId: playerId,
    playerName: player.name,
    timeSent: getCurrentTimeInSeconds(),
  });

  setData(data);

  return {};
}

/**
 * @description Get the final results for a whole session a player is playing in
 *
 * @param { number } playerId - unique identifier for a player
 *
 * @return {
 * userRankedByScore: array<{
 *    name: string
 *    score: number}>
 * questionResults: array<{
 *    questionId: number,
 *    playersCorrectList: array<string>,
 *    averageAnswerTime: number,
 *    percentCorrect: number
 *    }>
 * }
*/
export function playerFinalResults(playerId: number): FinalResults {
  const data = getData();
  const quizSession = getQuizSessionByPlayerId(playerId, data);

  if (!quizSession) {
    throw HTTPError(INPUT_ERROR, 'player ID does not exist');
  }
  if (quizSession.state !== QuizState.FINAL_RESULTS) {
    throw HTTPError(INPUT_ERROR, 'Session is not in FINAL_RESULTS state');
  }

  const playerSortedByScore = getPlayerSortedScores(quizSession);
  const allQuestionResults = quizSession.questionResults.filter(results => results !== null);

  return {
    usersRankedByScore: playerSortedByScore,
    questionResults: allQuestionResults
  };
}

/**
 * @description Update the thumbnailURL of a quiz
 *
 * @param { string } token - unique identifier for a user session
 * @param { number } quizId - unique identifier for a quiz
 * @param { string } imgUrl - URL for thumbnail image
 *
 * @return {}
 */
export function adminQuizUpdateThumbnail(token: string, quizId: number, imgUrl: string): AdminQuizThumbnailUpdateReturn {
  const data = getData();
  const userSession = getUserSessionByToken(token, data);
  if (!userSession) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }

  const quiz = getQuizById(quizId, data);
  if (!quiz || quiz.authUserId !== userSession.authUserId) {
    throw HTTPError(FORBIDDEN, 'Valid token is provided but user is not an owner of this quiz');
  }

  checkValidImage(imgUrl);
  quiz.thumbnailUrl = imgUrl;
  quiz.timeLastEdited = getCurrentTimeInSeconds();
  setData(data);

  return {};
}

/**
 * @description Generates a CSV format for final results of a quiz
 *
 * @param { string } token - unique identifier for a user session
 * @param { number } quizId - unique identifier for a quiz
 * @param { number } sessionId - unique identifier for a quiz
 *
 * @returns { string } url to a locally stored CSV file which stores results for a quiz.
 */
export function getFinalResultsAsCsv(token: string, quizId: number, sessionId: number): GetFinalResultsAsCsvReturn {
  const data = getData();
  const userSession = getUserSessionByToken(token, data);
  if (!userSession) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }

  const quizSession = getQuizSessionBySessionId(sessionId, data);
  if (!quizSession || quizSession.metadata.authUserId !== userSession.authUserId) {
    throw HTTPError(FORBIDDEN, 'Valid token is provided but user is not authorised to view this session');
  }

  if (quizSession.metadata.quizId !== quizId) {
    throw HTTPError(INPUT_ERROR, 'Session id does not refer to a valid session within this quiz');
  }

  if (quizSession.state !== QuizState.FINAL_RESULTS) {
    throw HTTPError(INPUT_ERROR, 'Session is not in FINAL_RESULTS state');
  }

  const metadata = quizSession.metadata;
  const csvArray = [];

  // Header
  const header = ['Player'];
  metadata.questions.forEach((question, index) => {
    header.push(`question${index + 1}score`);
    header.push(`question${index + 1}rank`);
  });
  csvArray.push(header);

  // Left Column // All player names
  const players = quizSession.players.map((p) => {
    const playerArray = [p.name];
    metadata.questions.forEach((q, index) => {
      const questionAnswerIds = q.answers.filter((answer) => answer.correct).map((answer) => answer.answerId);
      if (!p.answerIds[index + 1]) {
        playerArray.push('0'); // score
        playerArray.push('0'); // rank
      } else {
        const sortPlayersByTimeAnswers = quizSession.players.filter((player) => {
          if (!player.answerIds[index + 1]) return false;
          return isEqualArray(player.answerIds[index + 1], questionAnswerIds);
        }).sort((a, b) => {
          return a.questionAnswerTime[index + 1] - b.questionAnswerTime[index + 1];
        });

        const answerTime = p.questionAnswerTime;
        const rank = sortPlayersByTimeAnswers.findIndex((p) => p.questionAnswerTime === answerTime) + 1;
        if (rank) {
          playerArray.push((Math.round((q.points * 1 / rank) * 10) / 10).toString());
          playerArray.push(rank.toString());
        } else {
          playerArray.push('0');
          playerArray.push((sortPlayersByTimeAnswers.length + 1).toString());
        }
      }
    });
    return playerArray;
  }).sort((a, b) => a[0].localeCompare(b[0]));

  players.forEach((p) => {
    csvArray.push(p);
  });

  const csv = convertArrayToCSV(csvArray);

  const csvId = `${Math.floor(Math.random() * Date.now())}.csv`;
  const outputPath = `${csvResultsPath}${csvId}`;
  fs.writeFileSync(outputPath, csv);

  return {
    url: `${url}:${port}/static/csvResults/${csvId}`
  };
}

/**
 * @description Gets the status of the current status
 *
 * @param { string} token
 * @param { number } quizId
 * @param { number } sessionId
 *
 * @returns {
 *    state: string,
 *    atQuestion: number,
 *    players: Player[],
 *    metadata: QuizMetadata,
 * }
 */
export function getSessionStatus(token: string, quizId: number, sessionId: number): GetSessionStatusReturn {
  const data = getData();
  const userSession = getUserSessionByToken(token, data);
  if (!userSession) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid.');
  }

  const quizSession = getQuizSessionBySessionId(sessionId, data);
  if (!quizSession) {
    throw HTTPError(FORBIDDEN, 'Session Id is invalid.');
  }

  const metadata = quizSession.metadata;
  const authUserId = userSession.authUserId;

  if (authUserId !== metadata.authUserId) {
    throw HTTPError(FORBIDDEN, 'Valid token is provided, but user is not authorized to view this session');
  }

  if (metadata.quizId !== quizId) {
    throw HTTPError(INPUT_ERROR, 'Session Id does not refer to a valid session within this quiz.');
  }

  const quizInfo: QuizMetadata = {
    quizId: metadata.quizId,
    name: metadata.name,
    timeCreated: metadata.timeCreated,
    timeLastEdited: metadata.timeLastEdited,
    description: metadata.description,
    numQuestions: metadata.numQuestions,
    questions: metadata.questions,
    duration: metadata.duration,
    thumbnailUrl: metadata.thumbnailUrl,
  };

  return {
    state: quizSession.state,
    atQuestion: quizSession.atQuestion,
    players: quizSession.players,
    metadata: quizInfo,
  };
}

/**
 * @description Get the information about a question that the guest player is on
 *
 * @param { number } playerId - unique identifier for a player
 * @param { number } questionPosition - position of the question
 *
 * @returns {
 *    questionId: number,
 *    question: string,
 *    duration: number,
 *    thumbnailUrl: string,
 *    points: number,
 *    answers: QuestionBodyAnswer[],
 * }
 */
export function playerCurrentQuestionInfo(playerId: number, questionPosition: number): PlayerCurrentQuestionInfoReturn {
  const data = getData();
  const player = getPlayerById(playerId, data);
  if (!player) {
    throw HTTPError(INPUT_ERROR, 'Player Id does not exist.');
  }

  const quizSession = getQuizSessionByPlayerId(playerId, data);
  if (quizSession.state === QuizState.LOBBY || quizSession.state === QuizState.END) {
    throw HTTPError(INPUT_ERROR, 'Session cannot be in Lobby or End State.');
  }

  if (questionPosition < 1 || questionPosition > quizSession.metadata.questions.length) {
    throw HTTPError(INPUT_ERROR, 'Question Position is not valid for the session this player is in.');
  }

  if (questionPosition !== quizSession.atQuestion) {
    throw HTTPError(INPUT_ERROR, 'Session is not on this question yet.');
  }

  const question = quizSession.metadata.questions[questionPosition - 1];
  return {
    questionId: question.questionId,
    question: question.question,
    duration: question.duration,
    thumbnailUrl: question.thumbnailUrl,
    points: question.points,
    answers: question.answers,
  };
}

/**
 * @description View inactive and active sessions
 *
 * @param { string } token - unique identifier for a user session
 * @param { number } quizId - unique identifier for a quiz
 *
 * @return {
 *    activeSessions: number[],
 *    inactiveSessions: number[],
 * }
 */
export function adminQuizViewSessions(token: string, quizId: number) {
  const data = getData();
  const userSession = getUserSessionByToken(token, data);
  if (!userSession) {
    throw HTTPError(UNAUTHORISED, 'token is empty or invalid');
  }
  if (!isOwnedByUser(userSession.authUserId, quizId, QuizSource.quizzes)) {
    throw HTTPError(FORBIDDEN, 'valid token is not owner of this quiz');
  }

  const activeSessionIds = data.quizSessions
    .filter(quizSession => quizSession.state !== QuizState.END)
    .map(session => session.quizSessionId)
    .sort((a, b) => a - b);

  const inactiveSessionIds = data.quizSessions
    .filter(quizSession => quizSession.state === QuizState.END)
    .map(session => session.quizSessionId)
    .sort((a, b) => a - b);

  return {
    activeSessions: activeSessionIds,
    inactiveSessions: inactiveSessionIds
  };
}

/**
 * @description Provides the status of a player within aquiz session
 *
 * @param { number } playerId - unique identifier for a session
 *
 * @return { PlayerStatusReturn }
 */
export function playerStatus(playerId: number): PlayerStatusReturn {
  const data = getData();
  const playerSession = getQuizSessionByPlayerId(playerId, data);
  if (!playerSession) {
    throw HTTPError(INPUT_ERROR, 'Player ID does not exist');
  }

  return {
    state: playerSession.state,
    numQuestions: playerSession.metadata.numQuestions,
    atQuestion: playerSession.atQuestion
  };
}

/**
 * @description Returns all messages of the session the player is in
 *
 * @param { number } playerId
 *
 * @returns { [] } array of all messages
 */
export function playerGetAllMessages(playerId: number): PlayerGetAllMessagesReturn {
  const data = getData();
  const currentSession = getQuizSessionByPlayerId(playerId, data);
  if (!currentSession) {
    throw HTTPError(INPUT_ERROR, 'Player ID does not exist');
  }

  const playerMessages = currentSession.messages;
  return {
    messages: playerMessages
  };
}
