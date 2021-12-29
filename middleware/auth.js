const jwt = require("jsonwebtoken");

const requireauth = (req, res, next) => {
    const token = req.cookies.login;
    if (token) {
        jwt.verify(token, "ankitgarg", (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect("/login");
            }
            else {
                console.log(decodedToken);
                next();
            }
        }
        )
    }
    else {
        res.redirect("/login");
    }
};



module.exports = { requireauth };