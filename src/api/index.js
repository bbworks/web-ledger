const transactions = require('./transactions.js'); //Node.js "require" allows a total import without the use of "export default"
const budgetsData = require('./budgetsData.js'); //Node.js "require" allows a total import without the use of "export default"
const accountsData = require('./accountsData.js'); //Node.js "require" allows a total import without the use of "export default"
const accountData = require('./accountData.js'); //Node.js "require" allows a total import without the use of "export default"

//Node.js "module.exports" allows the export of a destructurable object,
// unline ES6 "export"
module.exports = {
  ...transactions,
  ...budgetsData,
  ...accountsData,
  ...accountData,
};
