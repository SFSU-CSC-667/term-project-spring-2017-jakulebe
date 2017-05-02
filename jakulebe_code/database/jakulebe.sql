DROP DATABASE IF EXISTS jakulebe;
CREATE DATABASE jakulebe;

\c jakulebe;

CREATE TABLE registeredUsers (
  playerID SERIAL PRIMARY KEY,
  username VARCHAR(45) UNIQUE NOT NULL,
  password VARCHAR(45) NOT NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  ties INTEGER DEFAULT 0
);

CREATE TABLE Games (
  gameID SERIAL PRIMARY KEY,
  gameRoomName VARCHAR(45) UNIQUE NOT NULL,
  max_players INTEGER,
  current_players INTEGER DEFAULT 0

);
