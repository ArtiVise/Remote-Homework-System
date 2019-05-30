const userModel = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
let ind = require('../../models/models'); //загрузка модели БД

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
                    res.render('index', { title: 'Авторизация' ,CorrectPas: '',errorText:"Неверный логин или пароль"});
                }
            }
        });
    },

    authenticateMySQL: function (req, res) {
        ind.Autorization(req.body.email,req.body.password).then(data => {
            if(data[0].flag === 1){
                //Заполнение данных сессии для студента
                const refreshToken = jwt.sign({id: data[0].id, userName: data[0].tmp, status: data[0].flag}, req.app.get('secretKey'), {expiresIn: '300000'});
                const accessToken = jwt.sign({id: data[0].id, userName: data[0].tmp, status: data[0].flag}, req.app.get('secretKey'), {expiresIn: '172800000'});
                res.cookie('accessToken', {accessToken: accessToken}, {maxAge: 300000, httpOnly: true});
                res.cookie('refreshToken', {refreshToken: refreshToken}, {maxAge: 172800000, httpOnly: true});
                return res.redirect("/student/main");
            }else if(data[0].flag === 2){
                //Заполнение данных сессии для преподавателя
                const refreshToken = jwt.sign({id: data[0].id2, userName: data[0].tmp2, status: data[0].flag}, req.app.get('secretKey'), {expiresIn: '300000'});
                const accessToken = jwt.sign({id: data[0].id2, userName: data[0].tmp2, status: data[0].flag}, req.app.get('secretKey'), {expiresIn: '172800000'});
                res.cookie('accessToken', {accessToken: accessToken}, {maxAge: 300000, httpOnly: true});
                res.cookie('refreshToken', {refreshToken: refreshToken}, {maxAge: 172800000, httpOnly: true});
                return res.redirect("/teacher/main");
            }else{
                return res.render('index', { title: 'Авторизация' ,CorrectPas: '',errorText:"Неверный логин или пароль"}); //Рендеринг страницы авторизации
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
