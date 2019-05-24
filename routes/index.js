//Модуль маршрутизации
"use strict";
const userController = require('../api/controllers/users');
const app = require('../app');
let express = require('express'); //Подключение библиотеки Express

let router = express.Router();

let ind = require('../models/models'); //загрузка модели БД

//Обработка GET запроса к странице авторизации
router.get('/', function(req, res) {
    //Авторизация
    if (req.query.act && req.query.act === 'auth') {
        ind.Autorization(req.query.username,req.query.password).then(data => {
            if(data[0].flag === 1){
                //Заполнение данных сессии для студента
                req.session.authorized  = true;
                req.session.Name = data[0].tmp;
                req.session.User_ID = data[0].id;
                res.redirect("/student");
            }else if(data[0].flag === 2){
                //Заполнение данных сессии для преподавателя
                req.session.auth = true;
                req.session.Name = data[0].tmp2;
                req.session.User_ID = data[0].id2;
                res.redirect("/teacher");
            }else{
                res.render('index', { title: 'Авторизация' ,CorrectPas: ''}); //Рендеринг страницы авторизации
            }
        })
    }else{
        if (req.query.act && req.query.act === 'logout') {
            delete req.session.auth;
            res.redirect("/");
        }else{
            res.render('index', { title: 'Авторизация' , CorrectPas: 'display: none;'});
        }
    }
});

router.post('/', userController.authenticateMySQL);

module.exports = router;
