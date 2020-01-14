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

exports.addSig = (user_id, msg, sig, time) => {
    return db.query(
        `INSERT INTO signatures (user_id, msg, sig, time) VALUES($1, $2, $3, $4) RETURNING id`,
        [user_id, msg, sig, time]
    );
};

exports.getSigs = () => {
    return db
        .query(
            `SELECT * FROM signatures JOIN users ON signatures.user_id = users.id JOIN user_profiles ON user_profiles.user_id = users.id`
        )
        .then(({ rows }) => rows);
};

exports.getThanks = id => {
    return db
        .query(
            `SELECT sig, first FROM signatures JOIN users ON signatures.user_id = users.id WHERE user_id = $1`,
            [id]
        )
        .then(({ rows }) => rows);
};

exports.getSigCount = () => {
    return db
        .query(`SELECT sig FROM signatures`)
        .then(({ rows }) => rows.length);
};

exports.addUser = (first, last, email, pass) => {
    return db.query(
        `INSERT INTO users (first, last, email, pass) VALUES ($1, $2, $3, $4) RETURNING id`,
        [first, last, email, pass]
    );
};

exports.getUser = email => {
    return db
        .query(
            `SELECT pass, sig, email, users.id FROM users LEFT JOIN signatures ON users.id = signatures.user_id WHERE email = $1`,
            [email]
        )
        .then(({ rows }) => rows);
};

exports.addProfile = (user_id, age, city, url) => {
    return db.query(
        `INSERT INTO user_profiles (user_id, age, city, url) VALUES ($1, $2, $3, $4)`,
        [user_id, age, city, url]
    );
};
