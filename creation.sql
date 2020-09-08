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

CREATE TABLE artists(
	artist_id			INT 				PRIMARY KEY			AUTO_INCREMENT,
    name				VARCHAR(30)			NOT NULL,
    description			VARCHAR(200)		NOT NULL,
    performance_time	TIME				NOT NULL
);

CREATE TABLE artist_event_relation(
	artist_id			INT,
    event_id			INT,
    performance_time	TIME,
    PRIMARY KEY(artist_id, event_id),
    FOREIGN KEY(artist_id) REFERENCES artists(artist_id),
    FOREIGN KEY(event_id) REFERENCES events(event_id)
);

CREATE TABLE full_lineup(
	performer_id		INT				PRIMARY KEY		AUTO_INCREMENT,
    name				VARCHAR(20)		NOT NULL
);

INSERT INTO artists(name, description, performance_time) VALUES("Jamila Williams", "Top 10 singers of USA. Wants to join all of us to promote her new album and have a great time!", "15:30:00");
INSERT INTO artists(name, description, performance_time) VALUES("Sandra Superstar", "Here to perform for the 5th consecutve year on popular demand! Sandra is an absolute superstar when it comes to performing for the crowd.", "18:40:00");
INSERT INTO artists(name, description, performance_time) VALUES("DJ Crazyhead", "As the name suggests, he is here to make our minds go crazy and fill our hearts with his amazing beats", "22:35:00");

-- INSERT INTO artists(name, description, performance_time) VALUES("DJ Snake", "No description needed. DJ Snake loves India and comes to perform in the Sunfest every year. He is our star performer and you have probably heard all his songs", "23:55:00");

INSERT INTO full_lineup(name) VALUES("Vanic");
INSERT INTO full_lineup(name) VALUES("Alan Walker");
INSERT INTO full_lineup(name) VALUES("Afrojack");
INSERT INTO full_lineup(name) VALUES("Dua Lipa");
INSERT INTO full_lineup(name) VALUES("Machine Gun Kelly");
INSERT INTO full_lineup(name) VALUES("The Weeknd");
INSERT INTO full_lineup(name) VALUES("Inna");
INSERT INTO full_lineup(name) VALUES("Tyga");


-- INSERT INTO full_lineup(name) VALUES("Miska Smith");
-- INSERT INTO full_lineup(name) VALUES("Hayley Down");
-- INSERT INTO full_lineup(name) VALUES("DJ Girl");
