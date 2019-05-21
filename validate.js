const jwt = require('jsonwebtoken');

module.exports = {
    newValidateUser: function(req, res, next){
        if (req.query.act && req.query.act === 'logout') {
            if (req.cookies['accessToken'] !== undefined) {
                res.clearCookie("accessToken");
            }
            if (req.cookies['refreshToken'] !== undefined) {
                res.clearCookie("refreshToken");
            }
            res.redirect("/");
        }
        if(req.cookies && req.cookies['accessToken']!==undefined) {
            let tmpCookie = req.cookies['accessToken'];
            jwt.verify(tmpCookie['accessToken'], req.app.get('secretKey'), function (err, decoded) {
                if (err) {
                    //res.render('error', {message: err.message, status: "500"});
                    //res.clearCookie('accessToken');
                    if(req.cookies && req.cookies['refreshToken']!==undefined) {
                        let tmpCookie = req.cookies['refreshToken'];
                        jwt.verify(tmpCookie['refreshToken'], req.app.get('secretKey'), function (err, decoded) {
                            if (err) {
                                //res.json({status: "error", message: err.message, data: null});
                                //res.clearCookie('refreshToken');
                                res.redirect("/");
                            } else {
                                // add user id to request
                                if(decoded.status==="0"){
                                    req.body.userName = decoded.userName;
                                    req.body.status = decoded.status;
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
                    if(decoded.status==="0"){
                        req.body.userName = decoded.userName;
                        req.body.status = decoded.status;
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
                    if(decoded.status==="0"){
                        req.body.userName = decoded.userName;
                        req.body.status = decoded.status;
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

    newValidateTeacher: function(req, res, next) {
        if (req.query.act && req.query.act === 'logout') {
            if (req.cookies['accessToken'] !== undefined) {
                res.clearCookie("accessToken");
            }
            if (req.cookies['refreshToken'] !== undefined) {
                res.clearCookie("refreshToken");
            }
            res.redirect("/");
        }
        if(req.cookies && req.cookies['accessToken']!==undefined) {
            let tmpCookie = req.cookies['accessToken'];
            jwt.verify(tmpCookie['accessToken'], req.app.get('secretKey'), function (err, decoded) {
                if (err) {
                    //res.render('error', {message: err.message, status: "500"});
                    //res.clearCookie('accessToken');
                    if(req.cookies && req.cookies['refreshToken']!==undefined) {
                        let tmpCookie = req.cookies['refreshToken'];
                        jwt.verify(tmpCookie['refreshToken'], req.app.get('secretKey'), function (err, decoded) {
                            if (err) {
                                //res.json({status: "error", message: err.message, data: null});
                                //res.clearCookie('refreshToken');
                                res.redirect("/");
                            } else {
                                // add user id to request
                                if(decoded.status==="1"){
                                    req.body.userName = decoded.userName;
                                    req.body.status = decoded.status;
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
                    if(decoded.status==="1"){
                        req.body.userName = decoded.userName;
                        req.body.status = decoded.status;
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
                    if(decoded.status==="1"){
                        req.body.userName = decoded.userName;
                        req.body.status = decoded.status;
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


