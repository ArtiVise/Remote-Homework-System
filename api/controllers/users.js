const userModel = require('../models/users');
const bcrypt = require('bcrypt');	
const jwt = require('jsonwebtoken');

module.exports = {
    create: function (req, res, next) {
        console.log(req.body);
        userModel.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            status: req.body.status
        }, function (err, result) {
            if (err)
                next(err);
            else
                res.json({status: "success", message: "User added successfully!!!", data: null});

        });
    },

    authenticate: function (req, res, next) {
        console.log(req.body);
        userModel.findOne({email: req.body.email}, function (err, userInfo) {
            if (err) {
                next(err);
            } else {

                if (userInfo != null && bcrypt.compareSync(req.body.password, userInfo.password)) {

                    const refreshToken = jwt.sign({id: userInfo._id, userName: userInfo.name, status: userInfo.status}, req.app.get('secretKey'), {expiresIn: '30d'});
                    const accessToken = jwt.sign({id: userInfo._id, userName: userInfo.name, status: userInfo.status}, req.app.get('secretKey'), {expiresIn: '5m'});
                    res.cookie('cookieName', {userName: userInfo.name,status: userInfo.status, refreshToken: refreshToken, accessToken: accessToken}, {maxAge: 900000, httpOnly: true});
                    //res.json({status: "success", message: "user found!!!", data: {user: userInfo, refreshToken: refreshToken, accessToken: accessToken}});
                    res.redirect("/student/main");

                } else {

                    res.json({status: "error", message: "Invalid email/password!!!", data: null});

                }
            }
        });
    },

};
