CREATE DATABASE accounts_db;
USE accounts_db;

CREATE TABLE users(
	user_id			INT					PRIMARY KEY			AUTO_INCREMENT,
	email			VARCHAR(50)			NOT NULL,
    username		VARCHAR(50)			NOT NULL,
    password		VARCHAR(50)			NOT NULL,
    amount			INT					DEFAULT 0
);

CREATE TABLE tickets(
	ticket_id		INT				PRIMARY KEY		AUTO_INCREMENT,
    name			VARCHAR(50)		NOT NULL,
    description		VARCHAR(50)		NOT NULL,
    price			INT				NOT NULL
);

CREATE TABLE user_ticket_relation(
	user_id		INT,
    ticket_id	INT,
    quantity	INT		NOT NULL,
    PRIMARY KEY(user_id, ticket_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(ticket_id) REFERENCES tickets(ticket_id)
);

CREATE TABLE artists(
	artist_id			INT 				PRIMARY KEY			AUTO_INCREMENT,
    name				VARCHAR(30)			NOT NULL,
    description			VARCHAR(200)		NOT NULL,
    performance_time	TIME				NOT NULL
);

CREATE TABLE full_lineup(
	performer_id		INT				PRIMARY KEY		AUTO_INCREMENT,
    name				VARCHAR(20)		NOT NULL
);

CREATE TABLE reviews(
	review_id		INT 				PRIMARY KEY			AUTO_INCREMENT,
	title			VARCHAR(30),
    description		VARCHAR(100)
);

INSERT INTO tickets(name, description, price) VALUES("Silver Ticket", "Basic Entry", 2999),
											        ("Gold Ticket", "Vip Entry", 3449),
													("Early Bird Ticket", "Basic Entry", 1699),
													("Ticket + Camping", "Vip Entry", 4999),
													("Vip Ticket + Camping", "Vip Entry", 6099);

INSERT INTO artists(name, description, performance_time) VALUES("Jamila Williams", "Top 10 singers of USA. Wants to join all of us to promote her new album and have a great time!", "15:30:00"),
															   ("Sandra Superstar", "Here to perform for the 5th consecutve year on popular demand! Sandra is an absolute superstar when it comes to performing for the crowd.", "18:40:00"),
                                                               ("DJ Crazyhead", "As the name suggests, he is here to make our minds go crazy and fill our hearts with his amazing beats", "22:35:00");

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

INSERT INTO reviews(title, description) VALUES("We love sunfest!", "It's amazing to come here every year and just forget about all the stress for 2 complete days!");
INSERT INTO reviews(title, description) VALUES("My favorite event!", "I enjoy it alot and love to spend time here with my friends listening to the best music.");
