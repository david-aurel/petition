DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures
(
    id SERIAL PRIMARY KEY,
    userId INT NOT NULL,
    first VARCHAR NOT NULL CHECK (first != ''),
    last VARCHAR NOT NULL CHECK (last != ''),
    msg VARCHAR,
    sig VARCHAR NOT NULL CHECK (sig != ''),
    time VARCHAR NOT NULL
);
