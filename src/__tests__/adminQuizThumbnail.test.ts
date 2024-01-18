import { FORBIDDEN, INPUT_ERROR, UNAUTHORISED, VALID_QUIZ, VALID_USER, VALID_USER_2, adminAuthRegister, adminQuizCreate, clear, VALID_IMGURL, INVALID_IMGURL, requestAdminQuizThumbnail, GIF_IMGURL, adminQuizInfo, SUCCESSFUL_QUIZ_THUMBNAIL, INVALID_HTTP_URL } from '../testHelper';
import HTTPError from 'http-errors';
beforeEach(() => {
  clear();
});

describe('GET /v1/admin/quiz/:quizid/thumbnail', () => {
  let token: string;
  let quizId: number;

  beforeEach(() => {
    token = adminAuthRegister(VALID_USER.EMAIL, VALID_USER.PASSWORD, VALID_USER.NAME_FIRST, VALID_USER.NAME_LAST).token;
    quizId = adminQuizCreate(token, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
  });

  describe('success case', () => {
    test('valid inputs', () => {
      expect(adminQuizInfo(token, quizId).thumbnailUrl).toStrictEqual('');
      expect(requestAdminQuizThumbnail(token, quizId, VALID_IMGURL)).toStrictEqual(SUCCESSFUL_QUIZ_THUMBNAIL);
      expect(adminQuizInfo(token, quizId).thumbnailUrl).toStrictEqual(VALID_IMGURL);
    });
  });

  describe('error cases', () => {
    describe('400', () => {
      test('imgURL when fetched does not return a valid file', () => {
        expect(() => requestAdminQuizThumbnail(token, quizId, INVALID_IMGURL)).toThrow(HTTPError[INPUT_ERROR]);
      });

      test('imgURL when fetch is not a JPG or PNG image', () => {
        expect(() => requestAdminQuizThumbnail(token, quizId, GIF_IMGURL)).toThrow(HTTPError[INPUT_ERROR]);
      });

      test('imgURL does not start with http or https', () => {
        expect(() => requestAdminQuizThumbnail(token, quizId, INVALID_HTTP_URL)).toThrow(HTTPError[INPUT_ERROR]);
      });
    });

    describe('401', () => {
      test('Token is empty or invalid (does not refer to valid logged in user session', () => {
        expect(() => requestAdminQuizThumbnail(token + 1, quizId, VALID_IMGURL)).toThrow(HTTPError[UNAUTHORISED]);
      });
    });

    describe('403', () => {
      test('Valid token is provided but user is not an owner of this quiz', () => {
        const token2 = adminAuthRegister(VALID_USER_2.EMAIL, VALID_USER_2.PASSWORD, VALID_USER_2.NAME_FIRST, VALID_USER_2.NAME_LAST).token;
        expect(() => requestAdminQuizThumbnail(token2, quizId, VALID_IMGURL)).toThrow(HTTPError[FORBIDDEN]);
      });
    });
  });
});
