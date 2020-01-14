const spicedPg = require('spiced-pg');

// //     how you'd make a query and exporting it for other files to use
// // spicedPg is just a wrapper for the node module for postgres. It takes a url. Here, the method, the user and the password is 'postgres'. Port is 5432. Name of db is petition.
// const db = spicedPg('postgres:postgres:postgres@localhost:5432/actors');

//         exports.addActor = function(name, age) {
//     return db.query(`INSERT INTO actors (name, age) VALUES($1, $2)`, [
//         name,
//         age
//     ]);
// };

// exports.getActors = function() {
//     return db.query(`SELECT * FROM actors`).then(({ rows }) => rows);
// };

// exports.deleteActors = function() {
//     return db.query(`DELETE FROM actors WHERE age = 99`);
// };

const db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

exports.addSig = (userId, first, last, msg, sig, time) => {
    return db.query(
        `INSERT INTO signatures (userId, first, last, msg, sig, time) VALUES($1, $2, $3, $4, $5, $6) RETURNING id`,
        [userId, first, last, msg, sig, time]
    );
};

exports.getSigs = () => {
    return db.query(`SELECT * FROM signatures`).then(({ rows }) => rows);
};

exports.getThanks = id => {
    return db
        .query(`SELECT sig, first FROM signatures WHERE id = $1`, [id])
        .then(({ rows }) => rows);
};

exports.addUser = (first, last, email, pass) => {
    return db.query(
        `INSERT INTO users (first, last, email, pass) VALUES ($1, $2, $3, $4) RETURNING id`,
        [first, last, email, pass]
    );
};

exports.getUser = email => {
    return db
        .query(`SELECT * FROM users WHERE email = $1`, [email])
        .then(({ rows }) => rows);
};

exports.addProfile = (userId, age, city, url) => {
    return db.query(
        `INSERT INTO user_profiles (userId, age, city, url) VALUES ($1, $2, $3, $4)`,
        [userId, age, city, url]
    );
};
