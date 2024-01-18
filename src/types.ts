// HTTP Status Codes
export const OK = 200;
export const INPUT_ERROR = 400;
export const UNAUTHORISED = 401;
export const FORBIDDEN = 403;

// User Validations
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 20;
export const MIN_PASSWORD_LENGTH = 8;
export const VALID_NAME_REGEX = /^[a-zA-Z\s'-]+$/;
export const VALID_PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/;

// User Default Values
export const DEFAULT_NUM_SUCCESSFUL_LOGINS = 1;
export const DEFAULT_NUM_FAILED_PASSWORDS_SINCE_LAST_LOGIN = 0;

// Quiz Validations
export const MIN_QUIZ_NAME_LENGTH = 3;
export const MAX_QUIZ_NAME_LENGTH = 30;
export const MAX_DESCRIPTION_LENGTH = 100;

// Quiz Default Values
export const DEFAULT_QUIZ_DURATION = 0;
export const DEFAULT_QUIZ_NUM_QUESTIONS = 0;

// Question Validations
export const MIN_QUESTION_LENGTH = 5;
export const MAX_QUESTION_LENGTH = 50;
export const MIN_QUESTION_ANSWERS = 2;
export const MAX_QUESTION_ANSWERS = 6;
export const MIN_AWARDED_POINTS = 1;
export const MAX_AWARDED_POINTS = 10;
export const MAX_QUESTION_DURATION_SUM = 180;
export const MIN_ANSWER_LENGTH = 1;
export const MAX_ANSWER_LENGTH = 30;

// Quiz Session Validations
export const MAX_AUTO_START_NUM = 50;
export const MAX_ACTIVE_SESSIONS = 10;

// Player chat Validations
export const MIN_MESSAGE_BODY_LENGTH = 1;
export const MAX_MESSAGE_BODY_LENGTH = 100;

// Regex for Validation
export const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9\s]+$/;

export const colours = [
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
  'brown',
  'orange'
];

// see https://miro.com/app/board/uXjVMNVSA6o=/?share_link_id=275801581370
/*
    LOBBY: Players can join in this state, and nothing has started

    QUESTION_COUNTDOWN: This is the question countdown period. It always exists before a question is open and the frontend makes the request to move to the question being open

    QUESTION_OPEN: This is when players can see the question, and the answers, and submit their answers (as many times as they like)

    QUESTION_CLOSE: This is when players can still see the question, and the answers, but can no longer submit answers

    ANSWER_SHOW: This is when players can see the correct answer, as well as everyone playings' performance in that question, whilst they typically wait to go to the next countdown

    FINAL_RESULTS: This is where the final results are displayed for all players and questions

    END: The game is now over and inactive
*/
export enum QuizState {
    LOBBY = 'LOBBY',
    QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
    QUESTION_OPEN = 'QUESTION_OPEN',
    QUESTION_CLOSE = 'QUESTION_CLOSE',
    ANSWER_SHOW = 'ANSWER_SHOW',
    FINAL_RESULTS = 'FINAL_RESULTS',
    END = 'END'
}

/*
    NEXT_QUESTION: Move onto the countdown for the next question

    SKIP_COUNTDOWN: This is how to skip the question countdown period immediately.

    GO_TO_ANSWER: Go straight to the next most immediate answers show state

    GO_TO_FINAL_RESULTS: Go straight to the final results state

    END: Go straight to the END state
*/
export enum AdminQuizAction {
    NEXT_QUESTION = 'NEXT_QUESTION',
    SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
    GO_TO_ANSWER = 'GO_TO_ANSWER',
    GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
    END = 'END',
    CLOSE_QUESTION = 'CLOSE_QUESTION'
}

export interface User {
    userId: number
    nameFirst: string
    nameLast: string
    email: string
    password: string
    oldPasswords: string[]
    numSuccessfulLogins: number
    numFailedPasswordsSinceLastLogin: number
}

export interface Answer {
    answerId: number
    answer: string
    colour: string
    correct: boolean
}

export interface Question {
    questionId: number
    question: string
    duration: number
    points: number
    answers: Answer[]
    thumbnailUrl?: string
}

export interface Quiz {
    quizId: number
    name: string
    authUserId: number
    timeCreated: number
    timeLastEdited: number
    description: string
    numQuestions: number
    questions: Question[]
    duration: number
    thumbnailUrl?: string
}

export interface QuizMetadata {
    quizId: number
    name: string
    timeCreated: number
    timeLastEdited: number
    description: string
    numQuestions: number
    questions: Question[]
    duration: number
    thumbnailUrl?: string
}

export interface UserSession {
    token: string
    authUserId: number
    timeCreated: number
}

export interface Player {
      playerId: number
      name: string
      answerIds: number[][]
      score: number
      questionAnswerTime: number[]
      pointsAtQuestion: number[]
}

export type Messages = {
    messageBody: string
    playerId: number
    playerName: string
    timeSent: number
}

export interface QuizSession {
    quizSessionId: number
    state: QuizState
    atQuestion: number
    autoStartNum: number
    players: Player[]
    metadata: Quiz
    messages: Messages[]
    questionResults: QuestionResult[]
    questionOpenTime: number[]
}

export interface QuestionResult {
  questionId: number
  playersCorrectList: string[]
  averageAnswerTime: number
  percentCorrect: number
}

export interface FinalResults {
  usersRankedByScore: PlayerScore[]
  questionResults: QuestionResult[]
}

export interface PlayerScore {
  name: string
  score: number
}

export interface DataStoreInterface {
    users: User[]
    quizzes: Quiz[]
    trash: Quiz[]
    userSessions: UserSession[]
    quizSessions: QuizSession[]
    maxId: number
}

// iteration 1
export interface AdminAuthRegisterReturn {
    token: string
}

export interface AdminAuthLoginReturn {
    token: string
}

export interface AdminUserDetailsReturn {
    user: {
        userId: number
        name: string
        email: string
        numSuccessfulLogins: number
        numFailedPasswordsSinceLastLogin: number
    },
}

export interface AdminQuizCreateReturn {
    quizId: number
}

export type AdminQuizRemoveReturn = Record<string, never>

export interface AdminQuizInfoReturn {
    quizId: number
    name: string
    timeCreated: number
    timeLastEdited: number
    description: string
    numQuestions: number
    questions: Question[]
    duration: number
    thumbnailUrl: string
}

export type AdminQuizDescriptionUpdateReturn = Record<string, never>

export type AdminQuizNameUpdateReturn = Record<string, never>

export interface AdminQuizListReturn {
    quizzes: {
        quizId: number
        name: string
    }[],
}

// iteration 2
export enum QuizSource {
    quizzes = 'quizzes',
    trash = 'trash'
}

export interface QuestionBodyAnswer {
    answer: string
    correct: boolean
}

export interface QuestionBody {
    question: string
    duration: number
    points: number
    answers: QuestionBodyAnswer[]
    thumbnailUrl?: string
}

export type AdminAuthLogoutReturn = Record<string, never>

export interface AdminQuizCreateQuestionReturn {
    questionId: number
}

export type AdminQuizEmptyTrashReturn = Record<string, never>

export type AdminQuizTransferReturn = Record<string, never>

export interface RemovedQuizzes {
    quizId: number
    name: string
}

export interface AdminQuizTrashReturn {
    quizzes: RemovedQuizzes[],
}

export type AdminQuizQuestionMoveReturn = Record<string, never>

export type AdminQuizQuestionDuplicateReturn = {
    newQuestionId: number
}

export type AdminQuizRestoreReturn = Record<string, never>

export type AdminQuizUpdateQuestionReturn = Record<string, never>

export type AdminUserDetailsUpdateReturn = Record<string, never>

export type AdminQuizDeleteQuestionReturn = Record<string, never>

export type AdminUserChangePasswordReturn = Record<string, never>

export type AdminPlayerJoinReturn = {
  playerId: number
}

export type AdminQuizUpdateSessionReturn = Record<string, never>

// Iteration 3
export type AdminQuizThumbnailUpdateReturn = Record<string, never>

export type AdminQuizSessionStartReturn = {
    sessionId: number
}

export type PlayerCurrentQuestionInfoReturn = { questionId: number } & QuestionBody;

export type ChatMessage = {
    message: {
        messageBody: string
    }
}

export type GetSessionStatusReturn = {
    state: string
    atQuestion: number
    players: Player[]
    metadata: QuizMetadata
}

export interface QuestionCorrectPlayers {
    name: string
}

export type AdminQuizSessionResultsReturn = {
    usersRankedByScore: {
        name: string
        score: number
    }[],
    questionResults: {
        questionId: number
        playersCorrectList: QuestionCorrectPlayers[],
        averageAnswerTime: number
        percentCorrect: number
    }[],
}

export type PlayerQuestionAnswerReturn = Record<string, never>

export type messageInfo = {
    messageBody: string
    playerId: number
    playerName: string
    timeSent: number
}

export type PlayerGetAllMessagesReturn = {
    messages: messageInfo[]
}
export interface GetFinalResultsAsCsvReturn {
    url: string
}
export interface PlayerStatusReturn {
    state: string
    numQuestions: number
    atQuestion: number
}
