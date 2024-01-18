import {
  getData,
  setData
} from './dataStore';

import {
  getCurrentTimeInSeconds,
  getUserSessionByToken,
  getUserByEmail,
  getUserById,
  isValidString,
  hashPassword,
  verifyHashedPassword,
  generateUniqueId
} from './helper';

import isEmail from 'validator/lib/isEmail.js';

import {
  v4
} from 'uuid';

import {
  AdminAuthLoginReturn,
  AdminAuthLogoutReturn,
  AdminAuthRegisterReturn,
  AdminUserChangePasswordReturn,
  AdminUserDetailsReturn,
  AdminUserDetailsUpdateReturn,
  DEFAULT_NUM_FAILED_PASSWORDS_SINCE_LAST_LOGIN,
  DEFAULT_NUM_SUCCESSFUL_LOGINS,
  INPUT_ERROR,
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  UserSession,
  UNAUTHORISED,
  User,
  VALID_NAME_REGEX,
  VALID_PASSWORD_REGEX,
} from './types';

import HTTPError from 'http-errors';

/**
 * @description Register a user with an email, password, and names, then returns their authUserId value.
 *
 * @param { string } email - unique user email
 * @param { string } password - user password
 * @param { string } nameFirst - user's first name
 * @param { string } nameLast - user's last name
 *
 * @return { { token: string, status: number } } - on successful registration
*/
export function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string): AdminAuthRegisterReturn {
  const data = getData();

  if (!isEmail(email)) {
    throw HTTPError(INPUT_ERROR, 'Invalid Email');
  }

  if (getUserByEmail(email, data)) {
    throw HTTPError(INPUT_ERROR, 'Email is already in use');
  }

  if (!isValidString(nameFirst, MIN_NAME_LENGTH, MAX_NAME_LENGTH, VALID_NAME_REGEX)) {
    throw HTTPError(INPUT_ERROR, 'Invalid nameFirst');
  }

  if (!isValidString(nameLast, MIN_NAME_LENGTH, MAX_NAME_LENGTH, VALID_NAME_REGEX)) {
    throw HTTPError(INPUT_ERROR, 'Invalid nameLast');
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw HTTPError(INPUT_ERROR, `New pasword is less than ${MIN_PASSWORD_LENGTH} characters`);
  }

  if (!VALID_PASSWORD_REGEX.test(password)) {
    throw HTTPError(INPUT_ERROR, 'New Password does not contain at least one number and at least one letter');
  }

  const id = generateUniqueId(data);
  const user: User = {
    userId: id,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: hashPassword(password),
    oldPasswords: [],
    numSuccessfulLogins: DEFAULT_NUM_SUCCESSFUL_LOGINS,
    numFailedPasswordsSinceLastLogin: DEFAULT_NUM_FAILED_PASSWORDS_SINCE_LAST_LOGIN
  };
  data.users.push(user);

  const token = v4();
  const session: UserSession = {
    token: token,
    authUserId: id,
    timeCreated: getCurrentTimeInSeconds()
  };

  data.userSessions.push(session);
  setData(data);

  return {
    token: token,
  };
}

/**
* @description Given a registered user's email and password returns their authUserId value.
*
* @param { string } email - user email
* @param { string } password - user password
*
* @return { { token: string, status: number } } - on successful registration
*/
export function adminAuthLogin(email: string, password: string): AdminAuthLoginReturn {
  const data = getData();
  const user = getUserByEmail(email, data);
  if (!user) {
    throw HTTPError(INPUT_ERROR, 'Email address does not exist');
  }

  if (!verifyHashedPassword(password, user.password)) {
    user.numFailedPasswordsSinceLastLogin++;
    setData(data);
    throw HTTPError(INPUT_ERROR, 'Password is not correct for the given email');
  }

  user.numSuccessfulLogins++;
  user.numFailedPasswordsSinceLastLogin = 0;

  const token = v4();
  const session: UserSession = {
    token: token,
    authUserId: user.userId,
    timeCreated: getCurrentTimeInSeconds()
  };

  data.userSessions.push(session);
  setData(data);

  return {
    token: token
  };
}

export function adminAuthLogout(token: string): AdminAuthLogoutReturn {
  const data = getData();

  const session = getUserSessionByToken(token, data);
  if (!session) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }

  data.userSessions = data.userSessions.filter((session) => session.token !== token);
  setData(data);

  return {};
}

/**
 * @description Given an admin user's authUserId, return details about the user.
 * "name" is the first and last name concatenated with a single space between them.
 *
 * @param { string } token - unique identifier for a user session
 *
 * @return {{
 *   user: {
 *     userId: number,
 *     name: string,
 *     email: string,
 *     numSuccessfulLogins: number,
 *     numFailedPasswordsSinceLastLogin: number
 *   },
 *   status: number
 * }}
 */
export function adminUserDetails(token: string): AdminUserDetailsReturn {
  const data = getData();

  const session = getUserSessionByToken(token, data);
  if (!session) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }

  const user = getUserById(session.authUserId, data);

  return {
    user: {
      userId: user.userId,
      name: `${user.nameFirst} ${user.nameLast}`,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
    }
  };
}

/**
 * @description Given a set of properties, update those properties of this logged in admin user.
 *
 * @param { string } token - unique identifier for a user session
 * @param { string } email - user email
 * @param { string } nameFirst - user first name
 * @param { string } nameLast - user last name
 *
 * @returns { { status: number } }
 */
export function adminUserDetailsUpdate(token: string, email: string, nameFirst: string, nameLast: string): AdminUserDetailsUpdateReturn {
  const data = getData();

  const session = getUserSessionByToken(token, data);
  if (!session) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }

  const userId = session.authUserId;
  const userByEmail = getUserByEmail(email, data);
  if (!isEmail(email)) {
    throw HTTPError(INPUT_ERROR, 'Invalid Email');
  }

  if (userByEmail && userId !== userByEmail.userId) {
    throw HTTPError(INPUT_ERROR, 'Email is already in use by another user');
  }

  if (!isValidString(nameFirst, MIN_NAME_LENGTH, MAX_NAME_LENGTH, VALID_NAME_REGEX)) {
    throw HTTPError(INPUT_ERROR, 'Invalid nameFirst');
  }

  if (!isValidString(nameLast, MIN_NAME_LENGTH, MAX_NAME_LENGTH, VALID_NAME_REGEX)) {
    throw HTTPError(INPUT_ERROR, 'Invalid nameLast');
  }

  const user = getUserById(userId, data);
  user.email = email;
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;

  setData(data);

  return {};
}

/**
 * @description Allows a user to change their password.
 *
 * @param { string} token - unique identifier for a user session
 * @param { string} oldPassword - user's old password
 * @param {string} newPassword - user's new password
 *
 * @return { { status: number } }
 */
export function adminUserChangePassword(token: string, oldPassword: string, newPassword: string): AdminUserChangePasswordReturn {
  const data = getData();
  const session = getUserSessionByToken(token, data);
  if (!session) {
    throw HTTPError(UNAUTHORISED, 'Token is empty or invalid');
  }

  const user = getUserById(session.authUserId, data);
  if (!verifyHashedPassword(oldPassword, user.password)) {
    throw HTTPError(INPUT_ERROR, 'Old Password is not the correct old password');
  }

  if (oldPassword === newPassword) {
    throw HTTPError(INPUT_ERROR, 'Old Password and New Password match exactly');
  }

  if (user.oldPasswords.some(hash => verifyHashedPassword(newPassword, hash))) {
    throw HTTPError(INPUT_ERROR, 'New Password has already been used before by this user');
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw HTTPError(INPUT_ERROR, `New pasword is less than ${MIN_PASSWORD_LENGTH} characters`);
  }

  if (!VALID_PASSWORD_REGEX.test(newPassword)) {
    throw HTTPError(INPUT_ERROR, 'New Password does not contain at least one number and at least one letter');
  }

  user.oldPasswords.push(user.password);
  user.password = hashPassword(newPassword);
  setData(data);

  return {};
}
