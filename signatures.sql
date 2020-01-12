DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures
(
    id SERIAL PRIMARY KEY,
    first VARCHAR NOT NULL CHECK (first != ''),
    last VARCHAR NOT NULL CHECK (last != ''),
    msg VARCHAR NOT NULL,
    sig VARCHAR NOT NULL CHECK (sig != ''),
    time VARCHAR
);
