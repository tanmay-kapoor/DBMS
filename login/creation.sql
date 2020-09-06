CREATE DATABASE accounts_db;
USE accounts_db;

CREATE TABLE users(
	user_id			INT					PRIMARY KEY			AUTO_INCREMENT,
	email			VARCHAR(50)			NOT NULL,
    username		VARCHAR(50)			NOT NULL,
    password		VARCHAR(50)			NOT NULL
);

CREATE TABLE events(
	event_id		INT					PRIMARY KEY			AUTO_INCREMENT,
    name			VARCHAR(20)			NOT NULL,
    date			DATE				NOT NULL,
    ticket_price	DECIMAL(10,2)		NOT NULL
);

CREATE TABLE user_event_relation(
	user_id			INT,
    event_id		INT,
    PRIMARY KEY(user_id, event_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(event_id) REFERENCES events(event_id)
);

CREATE TABLE performers(
	performer_id	INT 				PRIMARY KEY			AUTO_INCREMENT,
    name			VARCHAR(30)			NOT NULL
);

CREATE TABLE performer_event_relation(
	performer_id		INT,
    event_id			INT,
    performance_time	TIME,
    PRIMARY KEY(performer_id, event_id),
    FOREIGN KEY(performer_id) REFERENCES performers(performer_id),
    FOREIGN KEY(event_id) REFERENCES events(event_id)
);