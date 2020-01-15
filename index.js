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
    //check if the user is logged in and send him to register if not. Check if he's signed the petition, if yes, send him to the thanks page, if not, send him to sign the petition
    if (!req.session.userId) {
        res.redirect('/register');
    } else if (!req.session.sigId) {
        db.getSigCount().then(count => {
            res.render('home', {
                count
            });
        });
    } else {
        res.redirect('/thanks');
    }
});

app.post('/', (req, res) => {
    // console.log('this is the POST / route');
    const msg = req.body.msg,
        sig = req.body.sig,
        time = new Date();

    // Insert the signature into db. then add sigId to cookie and then redirect. unless there's an error, then, render home again, but with an err=true, so handlebars can render something else
    db.addSig(req.session.userId, msg, sig, time)
        .then(() => {
            req.session.sigId = true;
        })
        .then(() => {
            res.redirect('/thanks');
        })
        .catch(err => {
            res.render('home', { err });
        });
});

app.get('/thanks', (req, res) => {
    // console.log('this is the GET /thanks route');
    // render the thanks page with some info from the signature and number of total signatures
    db.getThanks(req.session.userId).then(results => {
        db.getSigCount().then(count => {
            let sig = results[0].sig,
                first = results[0].first;
            // console.log(`count: ${count}, sig: ${sig}, first: ${first}`);

            res.render('thanks', {
                count,
                sig,
                first
            });
        });
    });
});

app.post('/thanks', (req, res) => {
    console.log('this is the POST /thanks route');
    db.deleteSig(req.session.userId).then(() => {
        delete req.session.sigId;
        res.redirect('/');
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

app.get('/signers/:city', (req, res) => {
    // console.log('this is the GET /signers:city route');
    // render signers page for all signatures from one city
    console.log(req.params.city);

    db.getSigsByCity(req.params.city).then(data => {
        // console.log(data);

        res.render('signers', {
            data
        });
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
            // console.log(user[0]);

            bcrypt.compare(req.body.pass, user[0].pass).then(match => {
                if (match) {
                    req.session.userId = user[0].id;
                    console.log(req.session.userId);
                    if (user[0].sig) {
                        console.log('redirect to /thanks');
                        res.redirect('/thanks');
                    } else {
                        console.log('redirect to /');
                        res.redirect('/');
                    }
                } else {
                    res.render('login', { wrongPass: true });
                }
            });
        })
        .catch(err => {
            console.log(err);

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
        city = functions.capitalizeFirstLetter(req.body.city.toLowerCase()),
        url = req.body.url;
    console.log(city);

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

app.get('/edit', (req, res) => {
    // console.log('this is the GET /edit route');

    db.getProfile(req.session.userId).then(data => {
        res.render('edit', {
            data
        });
    });
});

app.post('/edit', (req, res) => {
    // console.log('this is the POST /edit route');
    let user_id = req.session.userId,
        first = functions.capitalizeFirstLetter(req.body.first.toLowerCase()),
        last = functions.capitalizeFirstLetter(req.body.last.toLowerCase()),
        email = req.body.email,
        pass = req.body.pass,
        age = req.body.age,
        city = functions.capitalizeFirstLetter(req.body.city.toLowerCase()),
        url = req.body.url;

    Promise.all([
        db.updateUser(user_id, first, last, email),
        db.updatePass(user_id, pass),
        db.updateProfile(user_id, age, city, url)
    ])
        .then(() => {
            res.redirect('/edit');
        })
        .catch(err => {
            db.getProfile(req.session.userId).then(data => {
                res.render('edit', {
                    data,
                    err
                });
            });
        });
});

//server
app.listen(8080, () => console.log('listening...'));
