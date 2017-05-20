const pgp = require( 'pg-promise' )()
//const userName = require( 'userinfo' ).whoami();
const db = pgp( process.env.DATABASE_URL || `postgres://$lgemmell@mail.sfsu.edu:jakulebe1@localhost:5432/jakulebe` )

module.exports = db
