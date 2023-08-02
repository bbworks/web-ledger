const {getUserInfo} = require("../googleApi/gapi");

class AuthService {
    async getLoggedInUser() {
    return await getUserInfo();
  };
}


module.exports = AuthService;
