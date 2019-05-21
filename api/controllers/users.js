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
                if (userInfo !== null && bcrypt.compareSync(req.body.password, userInfo.password)) {
                    const refreshToken = jwt.sign({id: userInfo._id, userName: userInfo.name, status: userInfo.status}, req.app.get('secretKey'), {expiresIn: '2d'});
                    const accessToken = jwt.sign({id: userInfo._id, userName: userInfo.name, status: userInfo.status}, req.app.get('secretKey'), {expiresIn: '10m'});
                    res.cookie('accessToken', {userName: userInfo.name,status: userInfo.status, accessToken: accessToken}, {maxAge: 600000, httpOnly: true});
                    res.cookie('refreshToken', {userName: userInfo.name,status: userInfo.status, refreshToken: refreshToken}, {maxAge: 172800000, httpOnly: true});
                    if(userInfo.status==="0"){
                        res.redirect("/student/main");
                    }else if(userInfo.status==="1"){
                        res.redirect("/teacher/main");
                    }else{
                        res.render('error', {message: "Неверный тип пользователя", status: "500"});
                    }
                } else {
                    res.json({status: "error", message: "Invalid email/password!!!", data: null});
                }
            }
        });
    },

    authenticateOnRefreshToken: function (req, res, next) {
        console.log(req.body);
        userModel.findOne({email: req.body.email}, function (err, userInfo) {
            if (err) {
                next(err);
            } else {
                if (userInfo !== null && bcrypt.compareSync(req.body.password, userInfo.password)) {
                    const refreshToken = jwt.sign({id: userInfo._id, userName: userInfo.name, status: userInfo.status}, req.app.get('secretKey'), {expiresIn: '2d'});
                    const accessToken = jwt.sign({id: userInfo._id, userName: userInfo.name, status: userInfo.status}, req.app.get('secretKey'), {expiresIn: '10m'});
                    res.cookie('accessToken', {userName: userInfo.name,status: userInfo.status, accessToken: accessToken}, {maxAge: 600000, httpOnly: true});
                    res.cookie('refreshToken', {userName: userInfo.name,status: userInfo.status, refreshToken: refreshToken}, {maxAge: 172800000, httpOnly: true});
                    res.redirect("/student/main");
                } else {
                    res.json({status: "error", message: "Invalid email/password!!!", data: null});
                }
            }
        });
    },

};
