DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures
(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    first VARCHAR NOT NULL CHECK (first != ''),
    last VARCHAR NOT NULL CHECK (last != ''),
    msg VARCHAR,
    sig VARCHAR NOT NULL CHECK (sig != ''),
    time VARCHAR NOT NULL
);
