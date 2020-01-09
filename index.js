const db = require('./db');

// // how you would make a query
// db.addActor('test3', 99)
//     .then(() => {
//         return db.getActors();
//     })
//     .then(data => console.log(data));

// db.deleteActors()
//     .then(() => {
//         return db.getActors();
//     })
//     .then(data => console.log(data));

const express = require('express'),
    app = express();

app.get('/', (req, res) => {
    res.send('this is the GET / route');
});
app.post('/', (req, res) => {
    res.send('this is the POST / route');
});
app.get('/thanks', (req, res) => {
    res.send('this is the GET /thanks route');
});
app.get('/signers', (req, res) => {
    res.send('this is the GET /signers route');
});

app.listen(8080, () => console.log('listening...'));
