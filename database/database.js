var connectionString = 'postgres://localhost:5432/jakulebe';
var pgp = require('pg-promise')();
var database = pgp(connectionString);

module.exports={database};
