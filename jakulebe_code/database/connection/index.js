const pgp = require( 'pg-promise' )()
const db = pgp( process.env.DATABASE_URL || 'postgres://Levi@localhost:5432/jakulebe' )

module.exports = db
