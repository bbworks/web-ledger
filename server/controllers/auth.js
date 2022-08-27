//Import modules
const GoogleAPIAuth = require("../googleApi/authorization");


//Define controllers
const post = async (request, response)=>{
  try {
    //Authorize with the Google API
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >POST /api/v1/login`);
    await GoogleAPIAuth.authorize();
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: POST /api/v1/login |\r\n`);

    response.json({results: true});
  }
  catch (err) {
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: POST /api/v1/login |\r\n`, err);
    response.status(500).json({
      error: err,
    });
  }
}

module.exports = {
  post,
}
