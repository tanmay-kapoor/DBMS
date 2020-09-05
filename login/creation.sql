CREATE DATABASE accounts_db;
USE accounts_db;

CREATE TABLE users(
	email			VARCHAR(50)			PRIMARY KEY,
    username		VARCHAR(50),
    password		VARCHAR(50)
);
