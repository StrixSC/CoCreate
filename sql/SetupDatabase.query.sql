CREATE DATABASE api;

CREATE TABLE users (
    ID SERIAL PRIMARY KEY,
    username VARCHAR(30)
);

INSERT INTO users (username)
VALUES ('System');


