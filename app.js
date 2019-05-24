'use strict';
var cluster = require('cluster');//Включаем cluster
var events = require('events');
var os = require('os');
var cpuCount = require('os').cpus().length;//Количество ядер процессора(потоков)

if (cluster.isWorker) {
    var worker_id = cluster.worker.id;
    var port = process.argv[2];
    let countUser=0;
    console.log("Worker id:", worker_id, "pid:", process.pid, "started on port:", port);

    process.on('message', function (msg) {
        // we only want to intercept messages that have a chat property
        if (msg.type === 'GetServerInfo') {
            process.send({
                type: "answerServerInfo", id: worker_id,
                pid: process.pid,
                port: port,
                useMemory: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
                allocatedMemory: Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100,
                countUser: countUser
            });
        }
    });

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

    app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
    app.use(cookieParser());
    app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true }))
//Маршрутизация
    app.use('/', index);
    app.use('/users', users);
    app.use('/student', validateFunction.logout, validateFunction.newValidateUser, student);
    app.use('/teacher', validateFunction.logout, validateFunction.newValidateTeacher, teacher);

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
    app.use(function (req, res, next) {
        let err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    app.use(function (err, req, res) {
        console.log(err);
        if (err.status === 404) {
            res.status(404).render('error', {message: "Страница не найдена", status: "404"});
        } else {
            res.status(500).render('error', {message: "Неверный запрос", status: "500"});
        }
    });

    app.listen(port, function () {
        console.log('Сервер запущен на порту: ' + port);
    });

    module.exports = app;
}

