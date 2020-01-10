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
    hb = require('express-handlebars'),
    //we use cookie session for cookies that can't be tampered with
    cookieSession = require('cookie-session');

// this configures express to use express handlebars
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

// serves static files
app.use(express.static(__dirname + '/../'));
app.use(express.static('public'));

//use this middleware to be able to get the data from the form
app.use(express.urlencoded({ extended: true }));

// use cookie session
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 7 * 6
    })
);

app.get('/', (req, res) => {
    // res.send('this is the GET / route');
    //check if the user has an id in the cookies already, if yes, send him to the thanks page
    if (req.session.id) {
        res.redirect('/thanks');
    } else {
        res.render('home', {
            //if it's called 'main' and in /views, you could leave this out
            //set it to 'layout: null' if you dont want to use a layout
            layout: 'main'
            // here you would send data to the front (home template)
        });
    }
});
app.post('/', (req, res) => {
    // res.send('this is the POST / route');
    const first = req.body.first,
        last = req.body.last,
        sig = req.body.sig;

    // add signature from req.body into the db. then add id to a cookie. then redirect. unless there's an error, then, render home again, but with an err=true, so handlebars can render something else
    db.addSig(first, last, sig)
        .then(results => {
            let id = results.rows[0].id;
            req.session.id = id;
        })
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
    functions.filterResults().then(data => {
        let sigCount = data.length;
        console.log(sigCount);

        res.render('thanks', {
            sigCount
        });
    });
});
app.get('/signers', (req, res) => {
    // res.send('this is the GET /signers route');
    //filter results from db down to an array of concatted first and last names
    functions
        .filterResults()
        .then(data => {
            let sigs = data;
            res.render('signers', {
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
