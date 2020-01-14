DROP TABLE IF EXISTS user_profiles;

CREATE TABLE user_profiles
(
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) NOT NULL UNIQUE,
    age INT,
    city VARCHAR (255),
    url VARCHAR (255)
);