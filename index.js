// require other scripts
const db = require('./db'),
    functions = require('./functions'),
    bcrypt = require('./bcrypt.js');

// require modules
const express = require('express'),
    app = express(),
    hb = require('express-handlebars'),
    // we use cookie session for cookies that can't be tampered with
    cookieSession = require('cookie-session'),
    helmet = require('helmet'),
    csurf = require('csurf');

// this configures express to use express handlebars
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

// serves static files
app.use(express.static(__dirname + '/../'));
app.use(express.static('public'));
// helmet
app.use(helmet());
// this gets the data from the form
app.use(express.urlencoded({ extended: true }));
// cookie session
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 7 * 6
    })
);
//csurf and the csfr token
app.use(csurf());
app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.get('/', (req, res) => {
    // console.log('this is the GET / route');
    //check if the user is logged in and send him to register if not. Check if he's signed the petition, if yes, send him to the thanks page, if not, send him to sign the petition
    if (!req.session.userId) {
        res.redirect('/register');
    } else if (!req.session.sigId) {
        functions.filterResults().then(names => {
            let sigCount = names.length;
            res.render('home', {
                sigCount
            });
        });
    } else {
        res.redirect('/thanks');
    }
});

app.post('/', (req, res) => {
    // console.log('this is the POST / route');
    const first = req.session.first,
        last = req.session.last,
        msg = req.body.msg,
        sig = req.body.sig,
        time = new Date();

    // Insert the signature into db. then add sigId to cookie and then redirect. unless there's an error, then, render home again, but with an err=true, so handlebars can render something else
    db.addSig(req.session.userId, first, last, msg, sig, time)
        .then(results => {
            req.session.sigId = results.rows[0].id;
        })
        .then(() => {
            res.redirect('/thanks');
        })
        .catch(err => {
            console.log(err);

            res.render('home', { err });
        });
});

app.get('/thanks', (req, res) => {
    // console.log('this is the GET /thanks route');
    // render the thanks page with some info from the signature and number of total signatures
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
    // console.log('this is the GET /signers route');
    // render signers page with info from db
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
    //console.log('this is the GET /register route')
    res.render('register');
});

app.post('/register', (req, res) => {
    //console.log('this is the POST /register route')
    // salt, hash and store the password in the db, together with the rest of the inputs. also set a cookie, i.e. log the user in and add first and last to cookie.
    bcrypt.hash(req.body.pass).then(hashedPass => {
        let first = req.body.first,
            last = req.body.last,
            email = req.body.email;

        req.session.first = req.body.first;
        req.session.last = req.body.last;
        db.addUser(first, last, email, hashedPass)
            .then(({ rows }) => {
                req.session.userId = rows[0].id;

                res.redirect('/profile');
            })
            .catch(err =>
                res.render('register', {
                    err
                })
            );
    });
});

app.get('/login', (req, res) => {
    //console.log('this is the GET /login route')
    res.render('login');
});

app.post('/login', (req, res) => {
    //console.log('this is the POST /login route')
    //get information about the email provided from the db and check the password. if it checks out, log the user in by setting a cookie. if it doesnt, show 'wrong password'. if there isn't even a matching email in the db, show 'user doesn't exist'.
    db.getUser(req.body.email)
        .then(user => {
            bcrypt.compare(req.body.pass, user[0].pass).then(match => {
                if (match) {
                    req.session.userId = user[0].id;
                    req.session.first = user[0].first;
                    req.session.last = user[0].last;
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

app.get('/profile', (req, res) => {
    // console.log('this is the GET /profile route');
    res.render('profile');
});

app.post('/profile', (req, res) => {
    // console.log('this is the POST /profile route');
    // add info the user provided in the form to the db. all fields are optional.
    let userId = req.session.userId,
        age = req.body.age,
        city = req.body.city,
        url = req.body.url;
    if (age === '') {
        age = null;
    }

    db.addProfile(userId, age, city, url)
        .then(() => {
            res.redirect('/');
        })
        .catch(err => {
            console.log('err in post /profile:', err);
            res.redirect('/profile');
        });
});

//server
app.listen(8080, () => console.log('listening...'));
