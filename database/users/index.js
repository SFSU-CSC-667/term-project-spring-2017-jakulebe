const db = require('../connection');
const ALL = `SELECT * FROM registeredusers`;
const WINS_DESC = ALL + " ORDER BY wins DESC, losses ASC"

module.exports = {
  all: () => db.any(ALL),
  wins_desc: () => db.any(WINS_DESC)
}
