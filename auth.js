const express = require('express'),
    db = require('./db'),
    {
        requireLoggedOutUser,
        requireLoggedInUser,
        capitalizeFirstLetter
    } = require('./functions'),
    bcrypt = require('./bcrypt.js'),
    router = express.Router();

router.get('/', requireLoggedOutUser, (req, res) => {
    // console.log('this is the GET / route')
    db.getSigCount().then(count => {
        res.render('home', {
            count
        });
    });
});

router.get('/register', requireLoggedOutUser, (req, res) => {
    //console.log('this is the GET /register route')
    res.render('register');
});

router.post('/register', requireLoggedOutUser, (req, res) => {
    //console.log('this is the POST /register route')
    // salt, hash and store the password in the db, together with the rest of the inputs. also set a cookie, i.e. log the user in.
    bcrypt.hash(req.body.pass).then(hashedPass => {
        let first = req.body.first,
            last = req.body.last,
            email = req.body.email;
        db.addUser(first, last, email, hashedPass)
            .then(({ rows }) => {
                req.session.userId = rows[0].id;
                req.session.sigId = false;
                res.redirect('/profile');
            })
            .catch(err =>
                res.render('register', {
                    err
                })
            );
    });
});

router.get('/login', requireLoggedOutUser, (req, res) => {
    //console.log('this is the GET /login route')
    res.render('login');
});

router.post('/login', requireLoggedOutUser, (req, res) => {
    // console.log('this is the POST /login route');
    //get information about the email provided from the db and check the password. if it checks out, log the user in by setting a cookie and redirect him either to sign the petition or to the thanks route, depending if he's already signed or not. if it doesnt, show 'wrong password'. if there isn't even a matching email in the db, show 'user doesn't exist'.
    db.getUser(req.body.email)
        .then(user => {
            bcrypt.compare(req.body.pass, user[0].pass).then(match => {
                if (match) {
                    req.session.userId = user[0].id;
                    if (user[0].sig) {
                        req.session.sigId = true;
                        res.redirect('/thanks');
                    } else {
                        res.redirect('/petition');
                    }
                } else {
                    res.render('login', { wrongPass: true });
                }
            });
        })
        .catch(err => {
            res.render('login', { err });
        });
});

router.post('/logout', requireLoggedInUser, (req, res) => {
    delete req.session.userId;
    delete req.session.sigId;
    res.redirect('/');
});

router.get('/profile', requireLoggedInUser, (req, res) => {
    // console.log('this is the GET /profile route');
    res.render('profile');
});

router.post('/profile', requireLoggedInUser, (req, res) => {
    // console.log('this is the POST /profile route');
    // add info the user provided in the form to the db. all fields are optional.
    let userId = req.session.userId,
        age = req.body.age,
        city = capitalizeFirstLetter(req.body.city.toLowerCase()),
        url = req.body.url;

    if (age === '') {
        age = null;
    }

    db.addProfile(userId, age, city, url)
        .then(() => {
            res.redirect('/petition');
        })
        .catch(err => {
            console.log('err in post /profile:', err);
            res.redirect('/profile');
        });
});

router.get('/edit', requireLoggedInUser, (req, res) => {
    // console.log('this is the GET /edit route');
    // get info from db about the user and populate the form
    db.getProfile(req.session.userId).then(data => {
        res.render('edit', {
            data
        });
    });
});

router.post('/edit', requireLoggedInUser, (req, res) => {
    // console.log('this is the POST /edit route');
    // take the info from the form and update the users, the user_profiles, -and the signatures table. this is done in three queries: one for first, last and email, one for the password, and one for the age, city and url. the password query only updates, if the password provided is not empty to prevent changing the password to an empty string accidentally. if there's an error, tell the user the input provided was not valid.
    let user_id = req.session.userId,
        first = capitalizeFirstLetter(req.body.first.toLowerCase()),
        last = capitalizeFirstLetter(req.body.last.toLowerCase()),
        email = req.body.email,
        pass = req.body.pass,
        age = req.body.age,
        city = capitalizeFirstLetter(req.body.city.toLowerCase()),
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

module.exports = router;
