'use strict';
var cluster = require('cluster');//Включаем cluster
var events = require('events');
var os = require('os');
var cpuCount = require('os').cpus().length;//Количество ядер процессора(потоков)

if (cluster.isWorker) {
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
    const rateLimit = require("express-rate-limit");

    const https = require('https');
    const fs = require('fs');

    let worker_id = cluster.worker.id;
    let port = process.argv[2];
    let countUser=0;
    let countConnection=0;
    console.log("Worker id:", worker_id, "pid:", process.pid, "started on port:", port);

    process.on('message', function (msg) {
        // we only want to intercept messages that have a chat property
        server.getConnections(function(error, count) {
            countConnection=count;
        });
        if (msg.type === 'GetServerInfo') {
            process.send({
                type: "answerServerInfo", id: worker_id,
                pid: process.pid,
                port: port,
                useMemory: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
                allocatedMemory: Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100,
                countUser: countUser,
                countConnection:countConnection
            });
        }
    });

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

    const limiter = rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 200, // limit each IP to 100 requests per windowMs
        message:
            "Вы превысили число запросов, отдохните и попробуйте позже"
    });

    const loginLimitRequest = rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 10, // start blocking after 100 requests
        message:
            "Login, От вас слишком много запросов, попробуйте через 5 минут"
    });

    const studentLimitRequest = rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 50, // start blocking after 100 requests
        message:
            "От вас слишком много запросов, попробуйте через 5 минут"
    });

    const teacherLimitRequest = rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 200, // start blocking after 100 requests
        message:
            "От вас слишком много запросов, попробуйте через 5 минут"
    });
//app.use(require('express-promise')());
// Подключение к MongoDB
    mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
    app.use(limiter);
    app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
    app.use(cookieParser());
    app.use(session({ secret: 'secret key', cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true }))
//Маршрутизация
    app.use('/', index);
    app.use('/users', users);
    app.use('/student', validateFunction.logout, validateFunction.statusStudent, validateFunction.validateAccessToken, validateFunction.validateRefreshToken, student);
    app.use('/teacher', validateFunction.logout, validateFunction.statusTeacher, validateFunction.validateAccessToken, validateFunction.validateRefreshToken, teacher);

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

    let server = https.createServer({
        key: fs.readFileSync('./sslcert/key.pem'),
        cert: fs.readFileSync('./sslcert/cert.pem'),
        passphrase: 'qwerty'
    },app).listen(port, function () {
            console.log('Сервер запущен на порту: ' + port);
        });
    var io = require('socket.io')(server);

    io.on('connection', function (socket) {
        console.log("connection");
        countUser = io.engine.clientsCount;
        socket.on('disconnect', function (state) {
            console.log("disconnect");
            countUser = io.engine.clientsCount;
        });
    });

    module.exports = app;
}

