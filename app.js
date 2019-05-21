'use strict';
//Загрузка библиотек
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const express = require('express');
const logger = require('morgan');

const movies = require('./routes/movies') ;
const users = require('./routes/users');
const student = require('./routes/student');
const task = require('./routes/task');

const bodyParser = require('body-parser');
const mongoose = require('./config/database'); //database configuration
const jwt = require('jsonwebtoken');
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

app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(cookieParser());

//Маршрутизация
app.use('/', index);
app.use('/users', users);
app.use('/movies', validateUser, movies);
app.use('/student', newValidateUser, student);
app.use('/task', newValidateUser, task);

//Валидация пользователя
function validateUser(req, res, next) {
    jwt.verify(req.headers['x-access-token'], req.app.get('secretKey'), function(err, decoded) {
        if (err) {
            res.json({status:"error", message: err.message, data:null});
        }else{
            // add user id to request
            req.body.userId = decoded.id;
            next();
        }
    });
}

function newValidateUser(req, res, next) {
    if(req.cookies && req.cookies['cookieName']!==undefined) {
        let tmpCookie = req.cookies['cookieName'];
        jwt.verify(tmpCookie['refreshToken'], req.app.get('secretKey'), function (err, decoded) {
            if (err) {
                res.json({status: "error", message: err.message, data: null});
            } else {
                // add user id to request
                req.body.userName = decoded.userName;
                req.body.status = decoded.status;
                next();
            }
        });
    }else{
        res.redirect("/");
    }
}

// Настройка представлений и шаблонизатора
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', '/images/favicon.ico')));
app.use(logger('dev'));
//app.use(bodyParser.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

//Подключение библиотек Boootstrap и jquery
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
    console.log(err);

    if(err.status === 404)
        res.status(404).json({message: "Not found"});
    else
        res.status(500).json({message: "Something looks wrong :( !!!"});

});
// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, function(){
    console.log('Node server listening on port 3000');
});

module.exports = app;

