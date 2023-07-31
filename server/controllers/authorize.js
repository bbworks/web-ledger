//Import modules
const GoogleAPIAuth = require("../googleApi/authorization");
const AuthApi = require("../api/authorize");


//Define controllers
class AuthController {
  static async login(request, response) {
    try {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >POST /api/v1/authorize/login`);
      const results = await AuthApi.getLoggedInUser();

      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: POST /api/v1/authorize/login |\r\n`, results);
      return response.json(results);
    }
    catch (err) {
      // // If unauthororized, redirect the user to authorize
      // if(
      //   (err.name === "Error" && err.message === "No access, refresh token, API key or refresh handler callback is set.") ||
      //   (err.name === "Error" && err.message === "Request is missing required authentication credential. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project.")
      // ) {
      //   const redirectUrl = `${request.baseUrl}`;
      //   const method = "GET";
      //   const status = 303;
      //   /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: GET /api/v1/authorize/login | ${status} REDIRECT ${method} ${redirectUrl}`);
      //   return response.redirect(status, redirectUrl);
      // }

      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: POST /api/v1/authorize/login |\r\n`, err);
      response.status(500).json({
        error: err,
      });
    }
  };

  static async authorize(request, response) {
    try {
      const {query: code} = request;

      //Authorize with the Google APIs
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >GET /api/v1/authorize`);
      const results = await GoogleAPIAuth.authorize();
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: GET /api/v1/authorize | `, results);

      //If unauthorized, redirect
      if (results.redirectUrl) {
        const redirectUrl = results.redirectUrl;
        const method = "GET";
        const status = 303;
        
        /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: GET /api/v1/authorize | UNAUTHORIZED > 303 REDIRECT GET ${results.redirectUrl} \r\n`);
        return response.status(303).redirect(status, redirectUrl);
      }
    }
    catch (err) {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: GET /api/v1/authorize |\r\n`, err);
      response.status(500).json({
        error: err,
      });
    }
  };

  static async callback(request, response) {
    try {
      const {query: code} = request;

      //Use the provided auth consent code to
      // finish authorizing with the Google API
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >GET /api/v1/authorize/oauth2callback`);
      const results = await GoogleAPIAuth.getOAuth2AuthorizationWithCode(code);

      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: GET /api/v1/authorize/oauth2callback | 301 REDIRECT ${process.env.PUBLIC_URL}`);
      const redirectUrl = process.env.PUBLIC_URL;
      const method = "GET";
      const status = 303;
      return response.redirect(status, redirectUrl);
    }
    catch (err) {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: GET /api/v1/authorize/oauth2callback |\r\n`, err);
      response.status(500).json({
        error: err,
      });
    }
  };
}

module.exports = AuthController;
