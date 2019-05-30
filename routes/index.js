//Модуль маршрутизации
"use strict";
const userController = require('../api/controllers/users');
const app = require('../app');
let express = require('express'); //Подключение библиотеки Express

let router = express.Router();

//Обработка запроса получения страницы авторизации
router.get('/', function(req, res) {
    res.render('index', { title: 'Авторизация' , CorrectPas: 'display: none;'});
});

//Обработка POST запроса к странице авторизации
router.post('/', userController.authenticateMySQL);

module.exports = router;
