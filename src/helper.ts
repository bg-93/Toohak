import {
  getData, setData
} from './dataStore';

import {
  Answer,
  DataStoreInterface,
  INPUT_ERROR,
  MAX_DESCRIPTION_LENGTH,
  Question,
  QuestionBodyAnswer,
  Quiz,
  QuizSource,
  UserSession,
  User,
  colours,
  QuizState,
  QuizSession,
  AdminQuizAction,
  Player,
  QuestionResult,
  PlayerScore,
} from './types';

import HTTPError from 'http-errors';
import * as crypto from 'crypto';
import { setNewTimeout } from './other';

// Hashing
const hashingConfig = {
  iterations: 10,
  keylen: 64, // in bytes
  digest: 'sha512'
};

/**
 * @description Hashes a password using the PBKDF2 algorithm with a random salt.
 *
 * @param {string} password - The password to be hashed.
 *
 * @returns {string} - The hashed password in the format "salt$derivedKey".
 */
export function hashPassword(password: string): string {
  const iterations = hashingConfig.iterations;
  const keylen = hashingConfig.keylen; // in bytes
  const digest = hashingConfig.digest;

  const salt = crypto.randomBytes(16).toString('hex');

  const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest);
  return `${salt}$${derivedKey.toString('hex')}`;
}

/**
 * @description Verifies if a provided password matches a stored hashed password.
 *
 * @param {string} password - The password to be verified.
 * @param {string} hash - The stored hashed password in the format "salt$derivedKey".
 *
 * @returns {boolean}
 */
export function verifyHashedPassword(password: string, hash: string): boolean {
  const [storedSalt, storedDerivedKey] = hash.split('$');

  const iterations = hashingConfig.iterations;
  const keylen = hashingConfig.keylen; // in bytes
  const digest = hashingConfig.digest;

  const derivedKeyForProvidedPassword = crypto.pbkdf2Sync(
    password,
    storedSalt,
    iterations,
    keylen,
    digest
  );

  return storedDerivedKey === derivedKeyForProvidedPassword.toString('hex');
}

// Getters
/**
 * @description Returns the current time in seconds
 *
 * @returns {number} current time
 */
export function getCurrentTimeInSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * @description Returns the number of active sessions
 *
 * @param {DataStoreInterface}
 *
 * @returns {number}
 */
export function getNumActiveSessions(data: DataStoreInterface): number {
  return data.quizSessions.reduce((accumulator, quizSession) => accumulator + (quizSession.state === QuizState.END ? 0 : 1), 0);
}

/**
 * @description Returns a player object by playerId
 *
 * @param {string} token
 * @param {DataStoreInterface} data
 *
 * @returns {Player}
 */
export function getPlayerById(playerId: number, data: DataStoreInterface): Player {
  const quizSessions = data.quizSessions;

  for (const quizSession of quizSessions) {
    for (const player of quizSession.players) {
      if (player.playerId === playerId) {
        return player;
      }
    }
  }
}

/**
 *
 * @description Gets the sum of a player's scores
 * @param { Player } player
 *
 * @returns { number } player's total score
 */
export function getPlayerTotalScore(player: Player): number {
  return player.pointsAtQuestion.reduce((sum, curr) => sum + curr, 0);
}

/**
 * @description Sort all players in quiz session from highest to lowest score
 *
 * @param {QuizSession} quizSession
 * @param {DataStoreInterface} data
 *
 * @returns {PlayerScore[]}
 */
export function getPlayerSortedScores(quizSession: QuizSession): PlayerScore[] {
  return quizSession.players.map((player) => {
    return {
      name: player.name,
      score: Math.round(getPlayerTotalScore(player) * 10) / 10
    };
  }).sort((a, b) => b.score - a.score);
}

/**
 * @description Returns a quiz session by a sessionId.
 *
 * @param {number} sessionId
 * @param {DataStoreInterface} data
 *
 * @returns {QuizSession}
 */
export function getQuizSessionBySessionId(sessionId: number, data: DataStoreInterface): QuizSession {
  return data.quizSessions.find((session) => session.quizSessionId === sessionId);
}

/**
 * @description Returns quiz session by a quizId
 *
 * @param {number} quizId
 * @param {DataStoreInterface} data
 *
 * @returns {QuizSession[]}
 */
export function getQuizSessionByQuizId(quizId: number, data: DataStoreInterface): QuizSession[] {
  return data.quizSessions.filter((quizSession) => {
    return quizSession.metadata.quizId === quizId;
  });
}

/**
 * @description Returns a quiz session by playerId
 *
 * @param {number} playerId
 * @param {DataStoreInterface} data
 *
 * @return {QuizSession}
 */
export function getQuizSessionByPlayerId(playerId: number, data: DataStoreInterface): QuizSession {
  return data.quizSessions.find((session) => session.players.some(player => player.playerId === playerId));
}

/**
 * @description Returns question by questionId
 *
 * @param {number} quizId
 * @param {number} questionId
 * @param {DataStoreInterface} data
 *
 * @returns {Question}
 */
export function getQuestionById(quizId: number, questionId: number, data: DataStoreInterface): Question {
  const quiz = getQuizById(quizId, data);
  return quiz.questions.find((question) => question.questionId === questionId);
}

/**
 * @description Gets the index of a question in a quiz.
 *
 * @param {number} quizId
 * @param {number} questionId
 * @param {DataStoreInterface} data
 *
 * @returns {number} question position
 */
export function getQuestionPosition(quizId:number, questionId:number, data:DataStoreInterface): number {
  const quiz = getQuizById(quizId, data);
  return quiz.questions.findIndex((question) => question.questionId === questionId);
}

/**
 * @description Returns quizzes owned by a user by email.
 *
 * @param {string} userEmail
 * @param {DataStoreInterface} data
 *
 * @returns {Quiz[]} array of quizzes
 */
export function getQuizzesByEmail(userEmail: string, data: DataStoreInterface): Quiz[] {
  const user = getUserByEmail(userEmail, data);
  const authUserId = user.userId;
  const ownedQuizzes: Quiz[] = data.quizzes.filter(quiz => quiz.authUserId === authUserId);
  return ownedQuizzes;
}

/**
 * @description Returns a quiz in the database given a quizId
 *
 * @param {number} quizId
 * @param {DataStoreInterface} data
 * @param {boolean} [fromTrash = false] - If true, the function looks for the quiz in the trash.
 *
 * @returns {Quiz}
 */
export function getQuizById(quizId: number, data: DataStoreInterface, fromTrash = false): Quiz {
  const source = fromTrash ? data.trash : data.quizzes;
  return source.find((quiz) => quiz.quizId === quizId);
}

/**
 * @description Generates a random colour based on a string of colours
 *
 * @param {string[]} colours
 *
 * @returns {string} colour
 */
function getRandomColour(colours: string[]): string {
  const randomIndex = Math.floor(Math.random() * colours.length);
  return colours[randomIndex];
}

/**
 * @description Calculates a quiz duration by adding durations of all questions
 *
 * @param {Quiz} quiz
 *
 * @returns {number} Quiz Duration
 */
export function getSumOfQuestionDurations(quiz: Quiz): number {
  return quiz.questions.reduce((sum, curr) => sum + curr.duration, 0);
}

/**
 * @description Checks if the authUserId is valid user
 *
 * @param {number} authUserId
 * @param {DataStoreInterface} data
 *
 * @return {User}
 */
export function getUserById(authUserId: number, data: DataStoreInterface): User {
  return data.users.find((user) => user.userId === authUserId);
}

/**
 * @description Returns the user with the associated email.
 *
 * @param {string} email
 * @param {DataStoreInterface} data
 *
 * @return {User}
 */
export function getUserByEmail(email: string, data: DataStoreInterface): User {
  return data.users.find((user) => user.email === email);
}

/**
 * @description Returns a user session object by its token.
 *
 * @param {string} token
 * @param {DataStoreInterface} data
 *
 * @returns {UserSession}
 */
export function getUserSessionByToken(token: string, data: DataStoreInterface): UserSession {
  return data.userSessions.find((session) => session.token === token);
}

// Checkers
/**
 * @description Checks if the description is valid
 *
 * @param {string} description
 * @return {boolean}
 */
export function isDescriptionValid(description: string): boolean {
  return description.length <= MAX_DESCRIPTION_LENGTH;
}

/**
 * @description Checks if the quiz name is being duplicated twice by the same person
 *
 * @param {object} authUserId
 * @param {string} name
 *
 * @return {boolean}
 */
export function isDuplicateQuizName(authUserId: number, name: string, data: DataStoreInterface, source: QuizSource): boolean {
  return data[source].some((quiz) => quiz.name === name && quiz.authUserId === authUserId);
}

/**
 * @description Checks if two arrays of numbers are equal
 *
 * @param {number[]} arr1 - The first array of numbers for comparison.
 * @param {number[]} arr2 - The second array of numbers for comparison.
 *
 * @returns {boolean} - True if the arrays are equal, false otherwise.
 */
export function isEqualArray(arr1: number[], arr2: number[]): boolean {
  if (!arr1 || !arr2) return false;
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

/**
 * @description Checks if the name is unique in the current active quiz session
 *
 * @param {number} sessionId
 * @param {string} name
 * @param {DataStoreInterface} data
 *
 * @returns {boolean}
 */
export function isNameUnique(sessionId: number, name: string, data: DataStoreInterface): boolean {
  const quizSession = data.quizSessions.find((session) => session.quizSessionId === sessionId);
  return !quizSession.players.some((player) => player.name === name);
}

/**
 * @description Checks to see if a quiz is owned by an user
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @param {QuizSource} data
 *
 * @returns {boolean}
 */
export function isOwnedByUser(authUserId: number, quizId: number, source: QuizSource): boolean {
  const data = getData();
  return data[source].some((quiz) => quiz.quizId === quizId && quiz.authUserId === authUserId);
}

/**
 * @description Checks answerId is valid for particular question
 *
 * @param {string} string
 * @param {number} minLength
 * @param {number} maxLength
 * @param {RegExp} regex
 *
 * @returns {boolean}
 */
export function isValidAnswerId(quizSession: QuizSession, answerIds: number[], questionPosition: number) {
  for (const answerId of answerIds) {
    if (quizSession.metadata.questions[questionPosition - 1].answers.find((answer) => answer.answerId === answerId)) {
      return true;
    }
  }
  return false;
}

/**
 * @description Checks if a string is valid based on its length and regex.
 *
 * @param {string} string
 * @param {number} minLength
 * @param {number} maxLength
 * @param {RegExp} regex
 *
 * @returns {boolean}
 */
export function isValidString(string: string, minLength: number, maxLength: number, regex?: RegExp): boolean {
  const length = string.length;
  if (length < minLength || length > maxLength) {
    return false;
  }
  if (regex) return regex.test(string);
  return true;
}

/**
 * @description Checks the validity of a thumbnail URL based on certain criteria.
 *
 * @param {string} thumbnailUrl - The URL of the thumbnail image.
 *
 * @throws {HTTPError} - Throws an error if the thumbnail URL does not meet specified criteria.
 * @returns {void}
 */
export function checkValidImage(thumbnailUrl: string): void {
  if (/^$/.test(thumbnailUrl)) {
    throw HTTPError(INPUT_ERROR, 'url is an empty string');
  }

  if (/^(?!.*\.(jpg|jpeg|png)$).+/.test(thumbnailUrl.toLocaleLowerCase())) {
    throw HTTPError(INPUT_ERROR, 'The thumbnailUrl does not end with one of the following filetypes (case insensitive): jpg, jpeg, png');
  }

  if (/^(?!https?:\/\/).+/.test(thumbnailUrl)) {
    throw HTTPError(INPUT_ERROR, "The thumbnailUrl does not begin with 'http://' or 'https://'");
  }
  // try {
  //   if (thumbnailUrl === undefined || thumbnailUrl === '') {
  //     throw HTTPError(INPUT_ERROR, 'url is an empty string');
  //   }
  //   const response = fetch(thumbnailUrl);

  //   const contentType = response.headers.get('content-type');
  //   // console.log(response.headers)
  //   if (contentType !== 'image/png' && contentType !== 'image/jpg' && contentType !== 'image/jpeg') {
  //     throw HTTPError(INPUT_ERROR, 'fetched file is not a png or jpg');
  //   }

  //   return true;
  // } catch (e) {
  //   throw HTTPError(INPUT_ERROR, 'The thumbnailUrl does not return to a valid file');
  // }
}

/**
 * @description Checks if an array contains duplicate values.
 *
 * @param {number[]} array
 *
 * @returns {boolean}
 */
export function hasDuplicates(array: number[]): boolean {
  return new Set(array).size !== array.length;
}

// Generators
/**
 * @description Based on an array of answers, generate uniqueIds and add random colours
 *
 * @param {QuestionBodyAnswer[]} answers
 * @param {DataStoreInterface} data
 *
 * @returns {Answer[]} array of answers
 */
export function generateAnswersArray(answers: QuestionBodyAnswer[], data: DataStoreInterface): Answer[] {
  return answers.map((answer, index) => {
    return {
      answerId: index + 1 + generateUniqueId(data),
      answer: answer.answer,
      colour: getRandomColour(colours),
      correct: answer.correct
    };
  });
}

/**
 * @description Generates a unique name in the format [5 letters][3 numbers] without repeated numbers or letters
 *
 * @param {number} sessionId
 * @param {DataStoreInterface} data
 *
 * @returns {string} - randomised player name
 */
export function generateRandomName(sessionId: number, data: DataStoreInterface) {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  let randomName;

  do {
    randomName = '';
    // Randomising letters and numbers
    const shuffledLetters = shuffleString(letters);
    const shuffledNumbers = shuffleString(numbers);

    randomName = shuffledLetters.slice(0, 5) + shuffledNumbers.slice(0, 3);
  } while (!isNameUnique(sessionId, randomName, data));

  return randomName;
}

/**
 * @description Randomises given string
 *
 * @param {string} str
 *
 * @returns {string} - randomised string
 */
function shuffleString(str: string) {
  const array = str.split('');
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join('');
}

/**
 * @description Generates a globally unique id
 *
 * @param { DataStoreInterface } data
 *
 * @returns { number } unique id
 */
export function generateUniqueId(data: DataStoreInterface): number {
  data.maxId++;
  return data.maxId;
}

// Other functions
/**
 * @description Calculates and records the result of a specific question within a quiz session.
 *
 * @param {DataStoreInterface} data
 * @param {number} sessionId
 *
 * @returns {void}
 */
function calculateQuestionResult(data: DataStoreInterface, sessionId: number): void {
  const session = getQuizSessionBySessionId(sessionId, data);
  const question = session.metadata.questions[session.atQuestion - 1];

  // Find out who answered correctly
  const questionAnswerIds = question.answers.filter((answer) => answer.correct).map((answer) => answer.answerId);
  const correctPlayers = session.players.filter((player) => {
    // if (!player.answerIds[session.atQuestion]) return false;
    return isEqualArray(player.answerIds[session.atQuestion], questionAnswerIds);
  }).map(player => player.name);

  // Find the average answer time across all players
  const sumOfAnswerTimes = session.players.reduce((sum, curr) => {
    return sum + curr.questionAnswerTime[session.atQuestion];
  }, 0);

  const averageAnswerTime = Math.round(sumOfAnswerTimes / session.players.length);
  const percentCorrect = correctPlayers.length / session.players.length * 100;

  const questionResult: QuestionResult = {
    questionId: question.questionId,
    playersCorrectList: correctPlayers,
    averageAnswerTime: averageAnswerTime || 0,
    percentCorrect: percentCorrect
  };

  session.questionResults[session.atQuestion] = questionResult;

  // Sort players who answered correctly by answer time
  const sortPlayersByTimeAnswers = session.players.filter((player) => {
    if (!player.answerIds[session.atQuestion]) return false;
    return isEqualArray(player.answerIds[session.atQuestion], questionAnswerIds);
  }).sort((a, b) => {
    return a.questionAnswerTime[session.atQuestion] - b.questionAnswerTime[session.atQuestion];
  });

  // Allocate points to player based on answer time
  sortPlayersByTimeAnswers.forEach((player, index) => {
    const scalingFactor = index + 1;
    player.pointsAtQuestion[session.atQuestion] = question.points * (1 / scalingFactor);
  });
}

export const onStateChange = {
  END: (sessionId: number, data: DataStoreInterface) => {
    const session = getQuizSessionBySessionId(sessionId, data);
    const currentState = session.state;
    if (currentState === QuizState.END) {
      throw HTTPError(INPUT_ERROR, 'Action enum cannot be applied in the current state');
    }

    session.state = QuizState.END;
  },
  NEXT_QUESTION: (sessionId: number, data: DataStoreInterface) => {
    let session = getQuizSessionBySessionId(sessionId, data);
    const currentState = session.state;

    if (currentState !== QuizState.QUESTION_CLOSE && currentState !== QuizState.LOBBY && currentState !== QuizState.ANSWER_SHOW) {
      throw HTTPError(INPUT_ERROR, 'Action enum cannot be applied in the current state');
    }

    // If currently at the last question then automatically go to final results.
    if (session.atQuestion + 1 > session.metadata.numQuestions) {
      return;
    }

    // Transition to the QUESTION_COUNTDOWN state immediately.
    session.state = QuizState.QUESTION_COUNTDOWN;
    session.atQuestion++;

    setNewTimeout(() => {
      // Only change the state if it's still QUESTION_COUNTDOWN after the timeout.
      data = getData();
      session = getQuizSessionBySessionId(sessionId, data);
      if (session.state === QuizState.QUESTION_COUNTDOWN) {
        changeState(sessionId, AdminQuizAction.SKIP_COUNTDOWN, data);
      }
    }, 3 * 1000);
  },
  SKIP_COUNTDOWN: (sessionId: number, data: DataStoreInterface) => {
    let session = getQuizSessionBySessionId(sessionId, data);
    const currentState = session.state;

    if (currentState !== QuizState.QUESTION_COUNTDOWN) {
      throw HTTPError(INPUT_ERROR, 'Action enum cannot be applied in the current state');
    }

    // Transition to the QUESTION_OPEN state immediately.
    session.state = QuizState.QUESTION_OPEN;
    session.questionOpenTime[session.atQuestion] = getCurrentTimeInSeconds();

    setNewTimeout(() => {
      // Only change the state if it's still QUESTION_OPEN after the timeout.
      data = getData();
      session = getQuizSessionBySessionId(sessionId, data);
      if (session.state === QuizState.QUESTION_OPEN) {
        changeState(sessionId, AdminQuizAction.CLOSE_QUESTION, data);
      }
    }, session.metadata.questions[session.atQuestion - 1].duration * 1000);
  },
  GO_TO_ANSWER: (sessionId: number, data: DataStoreInterface) => {
    const session = getQuizSessionBySessionId(sessionId, data);
    const currentState = session.state;
    if (currentState !== QuizState.QUESTION_OPEN && currentState !== QuizState.QUESTION_CLOSE) {
      throw HTTPError(INPUT_ERROR, 'Action enum cannot be applied in the current state');
    }

    calculateQuestionResult(data, sessionId);
    session.state = QuizState.ANSWER_SHOW;
  },
  GO_TO_FINAL_RESULTS: (sessionId: number, data: DataStoreInterface) => {
    const session = getQuizSessionBySessionId(sessionId, data);
    const currentState = session.state;
    if (currentState !== QuizState.QUESTION_CLOSE && currentState !== QuizState.ANSWER_SHOW) {
      throw HTTPError(INPUT_ERROR, 'Action enum cannot be applied in the current state');
    }

    calculateQuestionResult(data, sessionId);
    session.state = QuizState.FINAL_RESULTS;
  },
  CLOSE_QUESTION: (sessionId: number, data: DataStoreInterface) => {
    const session = getQuizSessionBySessionId(sessionId, data);

    calculateQuestionResult(data, sessionId);
    session.state = QuizState.QUESTION_CLOSE;
  }
};

/**
 * @description Initiates a state change in a quiz session based on the specified admin quiz action.
 *
 * @param {number} sessionId
 * @param {AdminQuizAction} action - The admin quiz action to perform.
 * @param {DataStoreInterface} data
 *
 * @returns {void}
 */
export function changeState(sessionId: number, action: AdminQuizAction, data: DataStoreInterface): void {
  onStateChange[action](sessionId, data);
  setData(data);
}

/**
 * @description Moves a question from one index to another.
 *
 * @param {Question[]} array
 * @param {Question} targetQuestion
 * @param {number} oldIndex
 * @param {number} newIndex
 *
 * @returns {void}
 */
export function arrayMovePositions(array: Question[], targetQuestion: Question, oldIndex: number, newIndex: number): void {
  array.splice(oldIndex, 1); // delete the item at the oldIndex
  array.splice(newIndex, 0, targetQuestion); // inserting the item at the new position
}
