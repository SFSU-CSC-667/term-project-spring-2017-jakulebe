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

CREATE TABLE Players (
  gameID INTEGER,
  playerID INTEGER,
  player_number INTEGER
);

CREATE TABLE deck (
    card_id INTEGER PRIMARY KEY,
    card_name VARCHAR(20),
    value INTEGER
);

CREATE TABLE cards_in_play (
    card_id INTEGER,
    card_name VARCHAR(20),
    value INTEGER,
    game_id INTEGER,
    player_id INTEGER
);
insert into deck(card_id, card_name , value) values (1,'1H',1);
insert into deck(card_id, card_name , value) values (2,'2H',2);
insert into deck(card_id, card_name , value) values (3,'3H',3);
insert into deck(card_id, card_name , value) values (4,'4H',4);
insert into deck(card_id, card_name , value) values (5,'5H',5);
insert into deck(card_id, card_name , value) values (6,'6H',6);
insert into deck(card_id, card_name , value) values (7,'7H',7);
insert into deck(card_id, card_name , value) values (8,'8H',8);
insert into deck(card_id, card_name , value) values (9,'9H',9);
insert into deck(card_id, card_name , value) values (10,'10H',10);
insert into deck(card_id, card_name , value) values (11,'JH',11);
insert into deck(card_id, card_name , value) values (12,'QH',12);
insert into deck(card_id, card_name , value) values (13,'KH',13);
insert into deck(card_id, card_name , value) values (14,'1C',1);
insert into deck(card_id, card_name , value) values (15,'2C',2);
insert into deck(card_id, card_name , value) values (16,'3C',3);
insert into deck(card_id, card_name , value) values (17,'4C',4);
insert into deck(card_id, card_name , value) values (18,'5C',5);
insert into deck(card_id, card_name , value) values (19,'6C',6);
insert into deck(card_id, card_name , value) values (20,'7C',7);
insert into deck(card_id, card_name , value) values (21,'8C',8);
insert into deck(card_id, card_name , value) values (22,'9C',9);
insert into deck(card_id, card_name , value) values (23,'10C',10);
insert into deck(card_id, card_name , value) values (24,'JC',11);
insert into deck(card_id, card_name , value) values (25,'QC',12);
insert into deck(card_id, card_name , value) values (26,'KC',13);
insert into deck(card_id, card_name , value) values (27,'1S',1);
insert into deck(card_id, card_name , value) values (28,'2S',2);
insert into deck(card_id, card_name , value) values (29,'3S',3);
insert into deck(card_id, card_name , value) values (30,'4S',4);
insert into deck(card_id, card_name , value) values (31,'5S',5);
insert into deck(card_id, card_name , value) values (32,'6S',6);
insert into deck(card_id, card_name , value) values (33,'7S',7);
insert into deck(card_id, card_name , value) values (34,'8S',8);
insert into deck(card_id, card_name , value) values (35,'9S',9);
insert into deck(card_id, card_name , value) values (36,'10S',10);
insert into deck(card_id, card_name , value) values (37,'JS',11);
insert into deck(card_id, card_name , value) values (38,'QS',12);
insert into deck(card_id, card_name , value) values (39,'KS',13);
insert into deck(card_id, card_name , value) values (40,'1D',1);
insert into deck(card_id, card_name , value) values (41,'2D',2);
insert into deck(card_id, card_name , value) values (42,'3D',3);
insert into deck(card_id, card_name , value) values (43,'4D',4);
insert into deck(card_id, card_name , value) values (44,'5D',5);
insert into deck(card_id, card_name , value) values (45,'6D',6);
insert into deck(card_id, card_name , value) values (46,'7D',7);
insert into deck(card_id, card_name , value) values (47,'8D',8);
insert into deck(card_id, card_name , value) values (48,'9D',9);
insert into deck(card_id, card_name , value) values (49,'10D',10);
insert into deck(card_id, card_name , value) values (50,'JD',11);
insert into deck(card_id, card_name , value) values (51,'QD',12);
insert into deck(card_id, card_name , value) values (52,'KD',13);

insert into games(gameroomname, max_players) values ('test game', 4);
