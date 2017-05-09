const pgp = require( 'pg-promise' )()
const userName = require( 'userinfo' ).whoami();
const db = pgp( process.env.DATABASE_URL || `postgres://${userName}@localhost:5432/jakulebe` )

module.exports = db
