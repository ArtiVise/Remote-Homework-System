//Модуль маршрутизации
"use strict";
const userController = require('../api/controllers/users');
const app = require('../app');
let express = require('express'); //Подключение библиотеки Express

let router = express.Router();

let ind = require('../models/models'); //загрузка модели БД

let fs = require('fs'); //Подключение библиотеки для работы с файлами

const path = require('path');

let formidable = require('formidable');
let util = require('util');
let ProgramCheck = require('../ProgramCheck');
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
            res.render('index', { title: 'Авторизация' ,CorrectPas: 'display: none;'});
        }
    }
});

router.post('/', userController.authenticate);

//Обработка GET запроса на скачивание файла задания
router.get('/taskfile', function(req, res) {
    let filePath =  path.join('./DB', req.query.link);
    // Check if file specified by the filePath exists
    fs.stat(filePath, function(err, stat) {
        if(err === null) {
            res.writeHead(200, {
                "Content-Type": "application/octet-stream",
                "Content-Disposition" : "attachment; filename=" + path.win32.basename(filePath)
            });
            fs.createReadStream(filePath).pipe(res);
        } else {
            res.writeHead(400, {"Content-Type": "text/plain"});
            res.end("ERROR File does NOT Exists", err.code);
        }
    });
});




//Обработка GET запроса на загрузку файла ответа
router.post('/upload', function(req, res){
    ind.AddDecision(req.session.IdTask,req.session.User_ID).then(lastid => {
        let form = new formidable.IncomingForm();
        let fields = [];
        let path1 = '';
        fs.mkdirSync('./DB'+'/'+ lastid[0].lastid);
        form.uploadDir = './DB'+'/'+ lastid[0].lastid;
        form.keepExtensions = true;
        /*
        form.on('file', function(field, file) {
            //rename the incoming file to the file's name
            fs.rename(file.path, form.uploadDir + "/" + file.name);
            path1 = lastid[0].lastid + '/' + file.name;
            ind.AddDecisionFile(lastid[0].lastid,lastid[0].lastid + '/' + file.name);
        });
        */
        form.on('file', function(field, file) {
                //rename the incoming file to the file's name
                fs.rename(file.path, form.uploadDir + "/" + file.name);
                path1 = form.uploadDir + '/' + file.name;
                ind.AddDecisionFile(lastid[0].lastid, lastid[0].lastid + '/' + file.name)
            })
            .on('error', function(err) {
                res.writeHead(200, {'content-type': 'text/plain'});
                res.end('error:\n\n'+util.inspect(err));
            })
            .on('field', function(field, value) {
                console.log(field, value);
                fields.push([field, value]);
            })
            .on('end', function() {
                console.log('-> post done');
                console.log('path'+path1);
                ind.GetStudCheckProgram(req.session.IdTask).then(CheckProgram => {
                    console.log(CheckProgram[0].CheckProgram);
                    console.log(path1);
                    console.log(CheckProgram[0].ParamCheckProgram);
                    ProgramCheck.ProgramCheck(CheckProgram[0].CheckProgram,path1,CheckProgram[0].ParamCheckProgram).then(data => {
                        //console.log("Конечный результат:" + data);
                        let tmp = data.split('\n');
                        if (tmp[0] === 'true') {
                            //console.log('Прошло проверку');
                            ind.ChangeDecisionsStatus(lastid[0].lastid,'2').then(data => {

                            });
                        }else{
                            ind.ChangeDecisionsStatus(lastid[0].lastid,'3').then(data => {

                            });
                            //console.log('Найдены ошибки: ' + tmp[1]);
                            ind.AddComment(lastid[0].lastid,'0',tmp[1]).then(data => {

                            });
                        }
                    });
                });
                //res.writeHead(200, {'content-type': 'text/plain'});
                res.redirect("/task");
                //res.end('received fields:\n\n '+util.inspect(fields));
            });
        form.parse(req);

    });

});

module.exports = router;
