const GAME_FULL_QUERY = `SELECT * FROM Games WHERE game_id = $1`;

const GET_PLAYER_CARDS_BY_PLAYER_ID_QUERY = `SELECT * FROM cards_in_play WHERE game_id = $1 AND player_id = $2`;

const GO_FISH_QUERY = `UPDATE cards_in_play SET player_id = $1 WHERE card_id IN
                      (SELECT card_id FROM cards_in_play WHERE game_id = $2
                      AND player_id = -1 ORDER BY random() LIMIT 1)`;

const GET_CARDS_LEFT_IN_DECK_QUERY = `SELECT count(*) FROM cards_in_play WHERE game_id = $1 AND player_id = -1`;

//checks to see if 4 of kind exist in hand, returns value
const FIND_BOOKS_IN_HAND_QUERY = `SELECT value, count(value) FROM cards_in_play WHERE game_id = $1
                                  AND player_id = $2 GROUP BY value HAVING count(value) = 4`;

//if books are found, set player_id of books to -2;
const MOVE_BOOK_OUT_OF_HAND_QUERY = `UPDATE cards_in_play SET player_id = -2 WHERE card_id IN
                                    (SELECT card_id FROM cards_in_play WHERE game_id = $1
                                    AND player_id = $2 AND value = $3)`;

//Query to see if target player has desired cards
const CHECK_FOR_REQUESTED_CARDS_QUERY = `SELECT * FROM cards_in_play WHERE player_id = $1
                                        AND game_id = $2 AND value = $3`;

//move cards from $3's hand to $1's hand
const MOVE_CARDS_TO_REQUESTING_PLAYER_QUERY = `UPDATE cards_in_play SET player_id = $1 WHERE
                                              card_id IN (SELECT card_id from cards_in_play WHERE
                                              game_id = $2 AND player_id = $3 AND value = $4)`;

module.exports = {GAME_FULL_QUERY,
                  GET_PLAYER_CARDS_BY_PLAYER_ID_QUERY,
                  GO_FISH_QUERY,
                  GET_CARDS_LEFT_IN_DECK_QUERY,
                  FIND_BOOKS_IN_HAND_QUERY,
                  MOVE_BOOK_OUT_OF_HAND_QUERY,
                  CHECK_FOR_REQUESTED_CARDS_QUERY,
                  MOVE_CARDS_TO_REQUESTING_PLAYER_QUERY}
