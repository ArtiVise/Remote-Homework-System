'use strict';
//Загрузка библиотек
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const express = require('express');
const logger = require('morgan');

const users = require('./routes/users');
const student = require('./routes/student');
const teacher = require('./routes/teacher');

const validateFunction = require('./validate');

const bodyParser = require('body-parser');
const mongoose = require('./config/database'); //database configuration
const app = express();

// Инициадизация модели базы данных
const models = require('./models/models');
//Загрузка библиотек для поддержки Сессий
const session = require('express-session');
//Загрузка модулей маршрутизации
const index = require('./routes/index');
//Загрузка каталога программ проверки
const ProgramCheck = require('./ProgramCheck');
//Загрузка каталога с ответами и задачами
const DB = path.join(__dirname, 'DB');

app.set('secretKey', 'nodeRestApi'); // jwt secret token

//app.use(require('express-promise')());
// Подключение к MongoDB
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(cookieParser());

//Маршрутизация
app.use('/', index);
app.use('/users', users);
app.use('/student', validateFunction.newValidateUser, student);
app.use('/teacher', validateFunction.newValidateTeacher, teacher);

// Настройка представлений и шаблонизатора
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', '/images/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

//Подключение библиотек Boootstrap и jquery
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res) {
    console.log(err);
    if(err.status === 404) {
        res.status(404).render('error', {message: "Страница не найдена", status:"404"});
    }else {
        res.status(500).render('error', {message: "Неверный запрос", status:"500"});
    }
});

app.listen(3000, function(){
    console.log('Сервер запущен на порту: 3000');
});

module.exports = app;

