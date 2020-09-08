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

INSERT INTO artists(name, description, performance_time) VALUES("Jamila Williams", "Top 10 simgers of USA. Wants to join all of us to promote her new album and ahe a great time!", "15:30:00"),
															   ("Sandra Superstar", "Here to perform for the 5th consecutve year on popular demand! Sandra is an absolute su[erstar when it comes to performing for the criwd.", "18:40:00"),
															   ("DJ Crazyhead", "As the name suggests, he is here to make our minds go crazy and fill our hearts with his amazing beats", "22:35:00"),
                                                               ("DJ Snake", "No description needed. DJ Snake loves India and comes to perform in Sunfest every year. He is our star performer and you have probably hear all his songs", "23:55:00");


                             
