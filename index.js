const db = require('./db');
const functions = require('./functions');

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

//require modules
const express = require('express'),
    app = express(),
    hb = require('express-handlebars');

// this configures express to use express handlebars
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

// serves static files
app.use(express.static(__dirname + '/../'));
app.use(express.static('public'));

//use this middleware to be able to get the data from the form
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    // res.send('this is the GET / route');
    res.render('home', {
        //if it's called 'main' and in /views, you could leave this out
        //set it to 'layout: null' if you dont want to use a layout
        layout: 'main'
        // sending data to the front (home template)
    });
});
app.post('/', (req, res) => {
    // res.send('this is the POST / route');
    const first = req.body.first,
        last = req.body.last,
        sig = req.body.sig;

    db.addSig(first, last, sig)
        .then(() => {
            res.redirect('/thanks');
        })
        .catch(err => {
            res.render('home', {
                err
            });
        });
});

app.get('/thanks', (req, res) => {
    // res.send('this is the GET /thanks route');
    res.render('thanks', {
        layout: 'main'
    });
});
app.get('/signers', (req, res) => {
    // res.send('this is the GET /signers route');
    functions
        .filterResults()
        .then(data => {
            let sigs = data;
            res.render('signers', {
                layout: 'main',
                sigs
            });
        })
        .catch(err => {
            console.log(err);
        });
});

//listen
app.listen(8080, () => console.log('listening...'));

// // db query example
// db.addSig('test first', 'test last', 'test sig')
//     .then(() => {
//         return db.getSigs();
//     })
//     .then(results => console.log(results));
