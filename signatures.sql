DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures
(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    msg VARCHAR,
    sig VARCHAR NOT NULL CHECK (sig != ''),
    time VARCHAR NOT NULL
);
