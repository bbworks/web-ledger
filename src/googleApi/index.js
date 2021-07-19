const utilities = require('./utilities.js'); //Node.js "require" allows a total import without the use of "export default"
const gapi = require('./gapi.js'); //Node.js "require" allows a total import without the use of "export default"
const authentication = require('./authentication.js');//Node.js "require" allows a total import without the use of "export default"

//Node.js "module.exports" allows the export of a destructurable object,
// unline ES6 "export"
module.exports = {
  ...utilities,
  ...gapi,
  ...authentication,
};
