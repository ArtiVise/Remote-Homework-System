const jwt = require('jsonwebtoken');
const app = require('./app');

module.exports = {
    logout: function(req, res, next) {
        if (req.query.act && req.query.act === 'logout') {
            if (req.cookies['accessToken'] !== undefined) {
                res.clearCookie("accessToken");
            }
            if (req.cookies['refreshToken'] !== undefined) {
                res.clearCookie("refreshToken");
            }
            return res.redirect("/");
        }else {
            next();
        }
    },

    statusStudent: function(req, res, next) {
        req.body.status = 1;
        next();
    },

    statusTeacher: function(req, res, next) {
        req.body.status = 2;
        next();
    },

    validateAccessToken: function(req, res, next){
        if(req.cookies && req.cookies['accessToken']!==undefined) {
            let tmpCookie = req.cookies['accessToken'];
            jwt.verify(tmpCookie['accessToken'], req.app.get('secretKey'), function (err, decoded) {
                if (err) {
                    res.clearCookie('accessToken');
                    res.clearCookie('refreshToken');
                    return res.redirect("/");
                } else {
                    if(decoded.status===req.body.status){
                        req.body.userName = decoded.userName;
                        req.body.status = decoded.status;
                        req.body.userID = decoded.id;
                        req.body.validAccessToken = true;
                        return next();
                    }else{
                        return res.redirect("/");
                    }
                }
            });
        }else {
            req.body.validAccessToken = false;
            next();
        }
    },

    validateRefreshToken: function(req, res, next){
        if(req.body.validAccessToken===false) {
            if (req.cookies && req.cookies['refreshToken'] !== undefined) {
                let tmpCookie = req.cookies['refreshToken'];
                jwt.verify(tmpCookie['refreshToken'], req.app.get('secretKey'), function (err, decoded) {
                    if (err) {
                        res.clearCookie('accessToken');
                        res.clearCookie('refreshToken');
                        return res.redirect("/");
                    } else {
                        if (decoded.status === req.body.status) {
                            req.body.userName = decoded.userName;
                            req.body.status = decoded.status;
                            req.body.userID = decoded.id;
                            next();
                        } else {
                            return res.redirect("/");
                        }
                    }
                });
            }else {
                return res.redirect("/");
            }
        } else {
            next();
        }
    },

    newValidateTeacher: function(req, res, next) {
        if(req.cookies && req.cookies['accessToken']!==undefined) {
            let tmpCookie = req.cookies['accessToken'];
            jwt.verify(tmpCookie['accessToken'], req.app.get('secretKey'), function (err, decoded) {
                if (err) {
                    res.render('error', {message: err.message, status: "500"});
                    res.clearCookie('accessToken');
                    if(req.cookies && req.cookies['refreshToken']!==undefined) {
                        let tmpCookie = req.cookies['refreshToken'];
                        jwt.verify(tmpCookie['refreshToken'], req.app.get('secretKey'), function (err, decoded) {
                            if (err) {
                                res.json({status: "error", message: err.message, data: null});
                                res.clearCookie('refreshToken');
                                res.redirect("/");
                            } else {
                                // add user id to request
                                if(decoded.status===2){
                                    req.body.userName = decoded.userName;
                                    req.body.status = decoded.status;
                                    req.body.userID = decoded.id;
                                    next();
                                }else{
                                    res.redirect("/");
                                }
                            }
                        });
                    }else{
                        res.render('error', {message: err.message, status: "500"});
                    }
                } else {
                    // add user id to request
                    if(decoded.status===2){
                        req.body.userName = decoded.userName;
                        req.body.status = decoded.status;
                        req.body.userID = decoded.id;
                        next();
                    }else{
                        res.redirect("/");
                    }
                }
            });
        }else if(req.cookies && req.cookies['refreshToken']!==undefined) {
            let tmpCookie = req.cookies['refreshToken'];
            jwt.verify(tmpCookie['refreshToken'], req.app.get('secretKey'), function (err, decoded) {
                if (err) {
                    res.render('error', {message: err.message, status: "500"});
                } else {
                    // add user id to request
                    if(decoded.status===2){
                        req.body.userName = decoded.userName;
                        req.body.status = decoded.status;
                        req.body.userID = decoded.id;
                        next();
                    }else{
                        res.redirect("/");
                    }
                }
            });
        }else{
            res.redirect("/");
        }
    },

};


