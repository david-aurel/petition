const spicedPg = require('spiced-pg');

// spicedPg is just a wrapper for the node module for postgres. It takes a url. Here, the method, the user and the password is 'postgres'. Port is 5432. Name of db is petition.
const db = spicedPg('postgres:postgres:postgres@localhost:5432/actors');

// // how you'd make a query and exporting it for other files to use
// exports.addActor = function(name, age) {
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
