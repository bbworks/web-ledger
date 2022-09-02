const {getUserInfo} = require("./../googleApi/gapi");

const getLoggedInUser = async ()=>{
  return await getUserInfo();
};


module.exports = {
  getLoggedInUser,
};
