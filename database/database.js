var pgp = require('pg-promise')();
var database = pgp(process.env.DATABASE_URL);

module.exports={database};
