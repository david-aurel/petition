// require other scripts
const db = require('./db'),
    functions = require('./functions'),
    { requireLoggedInUser, requireSig, requireNoSig } = require('./functions'),
    bcrypt = require('./bcrypt.js'),
    router = require('./auth');

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
let sessionSecret;
if (process.env.NODE_ENV === 'production') {
    sessionSecret = process.env.COOKIE_SECRET;
} else {
    const secrets = require('./secrets');
    sessionSecret = secrets.COOKIE_SECRET;
}
app.use(
    cookieSession({
        secret: sessionSecret,
        maxAge: 1000 * 60 * 60 * 24 * 7 * 6
    })
);
//csurf and the csfr token
app.use(csurf());
app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(router);

app.get('/petition', requireLoggedInUser, requireNoSig, (req, res) => {
    // console.log('this is the GET /petition route');
    //check if the user is logged in and send him to register if not. Check if he's signed the petition, if yes, send him to the thanks page, if not, send him to sign the petition
    db.getSigCount().then(count => {
        res.render('petition', {
            count
        });
    });
});

app.post('/petition', requireLoggedInUser, requireNoSig, (req, res) => {
    // console.log('this is the POST /petition route');
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
            res.render('petition', { err });
        });
});

app.get('/thanks', requireLoggedInUser, requireSig, (req, res) => {
    // console.log('this is the GET /thanks route');
    // render the thanks page with some info from the signature and number of total signatures
    db.getThanks(req.session.userId).then(results => {
        db.getSigCount().then(count => {
            let sig = results[0].sig,
                first = results[0].first;

            res.render('thanks', {
                count,
                sig,
                first
            });
        });
    });
});

app.post('/sig/delete', requireLoggedInUser, requireSig, (req, res) => {
    // console.log('this is the POST /thanks route');
    db.deleteSig(req.session.userId).then(() => {
        delete req.session.sigId;
        res.redirect('/petition');
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
    db.getSigsByCity(req.params.city).then(data => {
        res.render('signers', {
            data
        });
    });
});

//server
if (require.main == module) {
    app.listen(process.env.PORT || 8080, () => console.log('listening...'));
}
