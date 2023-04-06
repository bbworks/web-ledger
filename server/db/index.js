const mysql = require('mysql2/promise');

const options = {
  connectionLimit: 5,
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  database: process.env.MYSQL_DB,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  multipleStatements: true,
  timezone: 'Z',
};

const pool = mysql.createPool(options);
  
//Make a test connection to the database
(async ()=>{
  try {
    await pool.getConnection();
    console.log(`>[${new Date().toJSON()}] Connected to "mysql://${options.user}:########@${options.host}:${options.port}/${options.database}?connection_limit=${options.connectionLimit}".`)
  }
  catch (err) {
    let host;
    if ((host = err.toString().match("Error: connect ECONNREFUSED (.+)")) && (host = host[1])) {
      /* DEBUG */ console.error(`>[${new Date().toJSON()}] Failed to connnect to "mysql://${options.user}:########@${options.host}:${options.port}/${options.database}?connection_limit=${options.connectionLimit}": Server ${host} is unavailable.`);
      throw err;
    }
    
    /* DEBUG */ console.error(`>[${new Date().toJSON()}] Failed to connnect to "mysql://${options.user}:########@${options.host}:${options.port}/${options.database}?connection_limit=${options.connectionLimit}":`, err);
    throw err;
  }
})();

module.exports = pool;