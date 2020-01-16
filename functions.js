exports.capitalizeFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

exports.requireLoggedOutUser = (req, res, next) => {
    if (req.session.userId) {
        res.redirect('/petition');
    } else {
        next();
    }
};

exports.requireLoggedInUser = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/');
    } else {
        next();
    }
};

exports.requireSig = (req, res, next) => {
    if (!req.session.sigId) {
        res.redirect('/petition');
    } else {
        next();
    }
};

exports.requireNoSig = (req, res, next) => {
    if (req.session.sigId) {
        res.redirect('/thanks');
    } else {
        next();
    }
};
