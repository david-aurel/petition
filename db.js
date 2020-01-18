const spicedPg = require('spiced-pg');
const db = spicedPg(
    process.env.DATABASE_URL ||
        'postgres:postgres:postgres@localhost:5432/petition'
);
const bcrypt = require('./bcrypt.js');

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
exports.getSigsByCity = city => {
    return db
        .query(
            `SELECT * FROM signatures JOIN users ON signatures.user_id = users.id LEFT JOIN user_profiles ON user_profiles.user_id = users.id WHERE city = $1`,
            [city]
        )
        .then(({ rows }) => rows);
};

exports.deleteSig = user_id => {
    return db.query(`DELETE FROM signatures WHERE user_id = $1`, [user_id]);
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

exports.getProfile = user_id => {
    return db
        .query(
            `SELECT * FROM users LEFT JOIN signatures ON users.id = signatures.user_id LEFT JOIN user_profiles ON users.id = user_profiles.user_id WHERE users.id = $1`,
            [user_id]
        )
        .then(({ rows }) => rows);
};

exports.updateUser = (user_id, first, last, email) => {
    return db.query(
        `UPDATE users SET first=$2, last=$3, email=$4 WHERE id = $1`,
        [user_id, first, last, email]
    );
};

exports.updateProfile = (user_id, age, city, url) => {
    return db.query(
        `INSERT INTO user_profiles (user_id, age, city, url) VALUES ($1, $2, $3, $4 ) ON CONFLICT (user_id) DO UPDATE SET age=$2, city=$3, url=$4`,
        [user_id, age, city, url]
    );
};

exports.updatePass = (user_id, pass) => {
    if (pass) {
        bcrypt.hash(pass).then(hashedPass => {
            return db.query(`UPDATE users SET pass=$2 WHERE id=$1`, [
                user_id,
                hashedPass
            ]);
        });
    }
};
