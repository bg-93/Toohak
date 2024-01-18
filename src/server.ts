import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { clear } from './other';
import { adminAuthRegister, adminAuthLogin, adminUserDetails, adminUserDetailsUpdate, adminAuthLogout, adminUserChangePassword } from './auth';
import { adminQuizCreate, adminQuizCreateQuestion, adminQuizDeleteQuestion, adminQuizDescriptionUpdate, adminQuizInfo, adminQuizList, adminQuizNameUpdate, adminQuizQuestionDuplicate, adminQuizQuestionMove, adminQuizRemove, adminQuizRestore, adminQuizUpdateQuestion, adminQuizTrash, adminQuizTransfer, adminQuizEmptyTrash, createQuizSession, updateSessionState, getQuizSessionResults, playerJoin, playerQuestionAnswer, playerQuestionResults, playerFinalResults, adminQuizUpdateThumbnail, getFinalResultsAsCsv, getSessionStatus, playerCurrentQuestionInfo, playerSendChatMessage, adminQuizViewSessions, playerStatus, playerGetAllMessages } from './quiz';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;

  const ret = adminAuthRegister(email, password, nameFirst, nameLast);
  res.json(ret);
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  const ret = adminAuthLogin(email, password);
  res.json(ret);
});

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;

  const ret = adminAuthLogout(token);
  res.json(ret);
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;

  const ret = adminUserChangePassword(token, oldPassword, newPassword);
  res.json(ret);
});

app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;

  const ret = adminUserDetailsUpdate(token, email, nameFirst, nameLast);
  res.json(ret);
});

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;

  const ret = adminUserDetails(token);
  res.json(ret);
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token as string;

  const ret = adminQuizList(token);
  res.json(ret);
});

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;

  const ret = adminQuizCreate(token, name, description, false);
  res.json(ret);
});

app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.query.token as string;

  const ret = adminQuizTrash(token);
  res.json(ret);
});

app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const quizIdsString = req.query.quizIds as string;
  const token = req.query.token as string;
  const quizIdsArray = JSON.parse(quizIdsString);

  const ret = adminQuizEmptyTrash(token, quizIdsArray);
  res.json(ret);
});

app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const token = req.query.token as string;

  const ret = adminQuizRemove(token, quizId, false);
  res.json(ret);
});

app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const token = req.query.token as string;

  const ret = adminQuizInfo(token, quizId);
  res.json(ret);
});

app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const { token, name } = req.body;

  const ret = adminQuizNameUpdate(token, quizId, name);
  res.json(ret);
});

app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const { token, description } = req.body;

  const ret = adminQuizDescriptionUpdate(token, quizId, description);
  res.json(ret);
});

app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const { token } = req.body;

  const ret = adminQuizRestore(token, quizId);
  res.json(ret);
});

app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const { token, userEmail } = req.body;

  const ret = adminQuizTransfer(token, quizId, userEmail, false);
  res.json(ret);
});

app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const { token, questionBody } = req.body;

  const ret = adminQuizCreateQuestion(token, quizId, questionBody, false);
  res.json(ret);
});

app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);
  const { token, questionBody } = req.body;

  const ret = adminQuizUpdateQuestion(token, quizId, questionId, questionBody, false);
  res.json(ret);
});

app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);
  const token = req.query.token as string;

  const ret = adminQuizDeleteQuestion(token, quizId, questionId, false);
  res.json(ret);
});

app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);
  const { token, newPosition } = req.body;

  const ret = adminQuizQuestionMove(token, quizId, questionId, newPosition);
  res.json(ret);
});

app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);
  const { token } = req.body;

  const ret = adminQuizQuestionDuplicate(token, quizId, questionId);
  res.json(ret);
});

app.delete('/v1/clear', (req: Request, res: Response) => {
  const ret = clear();
  res.json(ret);
});

app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.headers.token as string;

  const ret = adminAuthLogout(token);
  res.json(ret);
});

app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { oldPassword, newPassword } = req.body;

  const ret = adminUserChangePassword(token, oldPassword, newPassword);
  res.json(ret);
});

app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { email, nameFirst, nameLast } = req.body;

  const ret = adminUserDetailsUpdate(token, email, nameFirst, nameLast);
  res.json(ret);
});

app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.headers.token as string;

  const ret = adminUserDetails(token);
  res.json(ret);
});

app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.headers.token as string;

  const ret = adminQuizList(token);
  res.json(ret);
});

app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { name, description } = req.body;

  const ret = adminQuizCreate(token, name, description);
  res.json(ret);
});

app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.headers.token as string;

  const ret = adminQuizTrash(token);
  res.json(ret);
});

app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const quizIdsString = req.query.quizIds as string;
  const token = req.headers.token as string;
  const quizIdsArray = JSON.parse(quizIdsString);

  const ret = adminQuizEmptyTrash(token, quizIdsArray);
  res.json(ret);
});

app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const token = req.headers.token as string;

  const ret = adminQuizRemove(token, quizId);
  res.json(ret);
});

app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const token = req.headers.token as string;

  const ret = adminQuizInfo(token, quizId);
  res.json(ret);
});

app.put('/v2/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const token = req.headers.token as string;
  const { name } = req.body;

  const ret = adminQuizNameUpdate(token, quizId, name);
  res.json(ret);
});

app.put('/v2/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const token = req.headers.token as string;
  const { description } = req.body;

  const ret = adminQuizDescriptionUpdate(token, quizId, description);
  res.json(ret);
});

app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const token = req.headers.token as string;

  const ret = adminQuizRestore(token, quizId);
  res.json(ret);
});

app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const token = req.headers.token as string;
  const { userEmail } = req.body;

  const ret = adminQuizTransfer(token, quizId, userEmail);
  res.json(ret);
});

app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const token = req.headers.token as string;
  const { questionBody } = req.body;

  const ret = adminQuizCreateQuestion(token, quizId, questionBody);
  res.json(ret);
});

app.put('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);
  const token = req.headers.token as string;
  const { questionBody } = req.body;

  const ret = adminQuizUpdateQuestion(token, quizId, questionId, questionBody);
  res.json(ret);
});

app.delete('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);
  const token = req.headers.token as string;

  const ret = adminQuizDeleteQuestion(token, quizId, questionId);
  res.json(ret);
});

app.put('/v2/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);
  const token = req.headers.token as string;
  const { newPosition } = req.body;

  const ret = adminQuizQuestionMove(token, quizId, questionId, newPosition);
  res.json(ret);
});

app.post('/v2/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);
  const token = req.headers.token as string;

  const ret = adminQuizQuestionDuplicate(token, quizId, questionId);
  res.json(ret);
});

// Iteration 3
// Update the quiz thumbnail
app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const token = req.headers.token as string;
  const { imgUrl } = req.body;

  const ret = adminQuizUpdateThumbnail(token, quizId, imgUrl);
  res.json(ret);
});

// View active and inactive sessions
app.get('/v1/admin/quiz/:quizid/sessions', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid as string);

  const ret = adminQuizViewSessions(token, quizId);
  res.json(ret);
});

// Start a new session for a quiz
app.post('/v1/admin/quiz/:quizid/session/start', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid as string);
  const { autoStartNum } = req.body;

  const ret = createQuizSession(token, quizId, autoStartNum);
  res.json(ret);
});

// Update a session's state
app.put('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid as string);
  const sessionId = parseInt(req.params.sessionid as string);
  const { action } = req.body;

  const ret = updateSessionState(token, quizId, sessionId, action);
  res.json(ret);
});

// Get session status
app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  // TODO: Implement the functionality
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid as string);
  const sessionId = parseInt(req.params.sessionid as string);

  const ret = getSessionStatus(token, quizId, sessionId);
  res.json(ret);
});

// Get quiz session final results
app.get('/v1/admin/quiz/:quizid/session/:sessionid/results', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid as string);
  const sessionId = parseInt(req.params.sessionid as string);

  const ret = getQuizSessionResults(token, quizId, sessionId);
  res.json(ret);
});

// Get quiz session final results in CSV format
app.get('/v1/admin/quiz/:quizid/session/:sessionid/results/csv', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid as string);
  const sessionId = parseInt(req.params.sessionid as string);

  const ret = getFinalResultsAsCsv(token, quizId, sessionId);
  res.json(ret);
});

// Allow a guest player to join a session
app.post('/v1/player/join', (req: Request, res: Response) => {
  const { sessionId, name } = req.body;

  const ret = playerJoin(sessionId, name);
  res.json(ret);
});

// Get status of guest player in session
app.get('/v1/player/:playerid', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid as string);
  const ret = playerStatus(playerId);

  res.json(ret);
});

// Get current question information for a player
app.get('/v1/player/:playerid/question/:questionposition', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid as string);
  const questionposition = parseInt(req.params.questionposition as string);

  const ret = playerCurrentQuestionInfo(playerId, questionposition);
  res.json(ret);
});

// Player submission of answers
app.put('/v1/player/:playerid/question/:questionposition/answer', (req: Request, res: Response) => {
  const { answerIds } = req.body;
  const playerId = parseInt(req.params.playerid as string);
  const questionPosition = parseInt(req.params.questionposition as string);

  const ret = playerQuestionAnswer(answerIds, playerId, questionPosition);
  res.json(ret);
});

// Get results for a question
app.get('/v1/player/:playerid/question/:questionposition/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid as string);
  const questionPosition = parseInt(req.params.questionposition as string);

  const ret = playerQuestionResults(playerId, questionPosition);
  res.json(ret);
});

// Get final results for a session
app.get('/v1/player/:playerid/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid as string);

  const ret = playerFinalResults(playerId);
  res.json(ret);
});

// Get all chat messages in session
app.get('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid as string);
  const ret = playerGetAllMessages(playerId);

  res.json(ret);
});

// Send chat message in session
app.post('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid as string);
  const { message } = req.body;

  const ret = playerSendChatMessage(playerId, message);
  res.json(ret);
});

app.use('/static', express.static(path.join(__dirname, 'public')));

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    404 Not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.status(404).json({ error });
});

// For handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
