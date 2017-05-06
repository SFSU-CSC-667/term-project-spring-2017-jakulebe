const pgp = require( 'pg-promise' )()
const db = pgp( process.env.DATABASE_URL || 'postgres://foxtrot@localhost:5432/jakulebe' )

module.exports = db
