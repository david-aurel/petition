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
    cookieSession = require('cookie-session'),
    helmet = require('helmet'),
    csurf = require('csurf'),
    bcrypt = require('./bcrypt.js');

// this configures express to use express handlebars
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

// serves static files
app.use(express.static(__dirname + '/../'));
app.use(express.static('public'));
//helmet
app.use(helmet());
//use this middleware to get the data from the form
app.use(express.urlencoded({ extended: true }));
// use cookie session
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 7 * 6
    })
);
//use csurf and set the csfr token
app.use(csurf());
app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.get('/', (req, res) => {
    // res.send('this is the GET / route');
    //check if the user has an id in the cookies already, if yes, send him to the thanks page
    if (req.session.sigId) {
        res.redirect('/thanks');
    } else {
        functions.filterResults().then(names => {
            let sigCount = names.length;
            res.render('home', {
                sigCount
            });
        });
    }
});
app.post('/', (req, res) => {
    // res.send('this is the POST / route');
    const first = req.body.first,
        last = req.body.last,
        msg = req.body.msg,
        sig = req.body.sig,
        time = new Date();
    // add signature from req.body into the db. then add id to a cookie. then redirect. unless there's an error, then, render home again, but with an err=true, so handlebars can render something else
    db.addSig(first, last, msg, sig, time)
        .then(results => {
            let id = results.rows[0].id;

            req.session.sigId = id;
        })
        .then(() => {
            res.redirect('/thanks');
        })
        .catch(err => {
            res.render('home', { err });
        });
});

app.get('/thanks', (req, res) => {
    // res.send('this is the GET /thanks route');
    db.getThanks(req.session.sigId).then(thanksResults => {
        functions.filterResults().then(names => {
            let sigCount = names.length,
                dataUrl = thanksResults[0].sig,
                first = thanksResults[0].first;

            res.render('thanks', {
                sigCount,
                dataUrl,
                first
            });
        });
    });
});
app.get('/signers', (req, res) => {
    // res.send('this is the GET /signers route');
    db.getSigs()
        .then(data => {
            res.render('signers', {
                data
            });
        })
        .catch(err => {
            console.log(err);
        });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    bcrypt.hash(req.body.pass).then(hashedPass => {
        let first = req.body.first,
            last = req.body.last,
            email = req.body.email;
        db.addUser(first, last, email, hashedPass)
            .then(({ rows }) => {
                req.session.userId = rows[0].id;
                res.redirect('/');
            })
            .catch(err =>
                res.render('register', {
                    err
                })
            );
    });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    db.getUser(req.body.email)
        .then(user => {
            bcrypt.compare(req.body.pass, user[0].pass).then(match => {
                if (match) {
                    db.getUser(req.body.email).then(rows => {
                        req.session.userId = rows[0].id;
                        console.log(req.session.userId);
                        console.log(req.session);
                    });
                    res.redirect('/');
                } else {
                    res.render('login', { wrongPass: true });
                }
            });
        })
        .catch(err => {
            res.render('login', { err });
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
