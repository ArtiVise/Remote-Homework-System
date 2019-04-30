//Модуль маршрутизации
"use strict";

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
                req.session.auth = true;
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

router.post('/', function (req,res) {

});

//Обработка GET запроса к списку задач
router.get('/student', function(req, res) {
    //Проверка - хочет ли пользователь деавторизоваться
    if(req.session.auth === true) {
        if (req.query.act && req.query.act === 'logout') {
            delete req.session.auth;
            res.redirect("/");
        } else {
            if (req.query.act && req.query.act === 'getTask') {
                if (req.query.ActTask !== undefined) req.session.IdTask = req.query.ActTask; else req.session.IdTask = -1;
                res.redirect("/task"); //Рендеринг страницы с формулировкой задания
            } else {
                ind.GetListSubjects().then(subjects => {
                    if (req.query.subjects === undefined) {
                        ind.GetListTask(subjects[0].id, req.session.User_ID).then(tasks => {
                                res.render('student', {
                                    StudentName: req.session.Name,
                                    subjects: subjects,
                                    body: tasks
                                }); //Рендеринг страницы со списком заданий, если предмет не выбран
                            }
                        )
                    } else {
                        ind.GetSubjectID(req.query.subjects).then(id => {
                            ind.GetListTask(id[0].id, req.session.User_ID).then(tasks => {
                                    res.render('student', {
                                        StudentName: req.session.Name,
                                        subjects: subjects,
                                        subjectsName: req.query.subjects,
                                        body: tasks
                                    });//Рендеринг страницы со списком заданий, если предмет выбран
                                }
                            )
                        })
                    }
                })
            }
        }
    }else{
        res.redirect("/");
    }
});

//Обработка GET запроса к формулировке задачи
router.get('/task', function(req, res) {
    if(req.session.auth === true) {
        if (req.query.act && req.query.act === 'logout') {
            delete req.session.auth;
            res.redirect("/");
        } else {
            if (req.session.IdTask !== -1) {
                ind.GetTask(req.session.IdTask).then(tasks => {
                    if (tasks !== '') {
                        ind.GetTaskFiles(req.session.IdTask).then(files => {
                            let filelink = '1';
                            console.log(files.length);
                            if (files.length === 0) {
                                filelink = ''
                            } else {
                                filelink = files[0].FileLink
                            }
                            ind.GetTaskDecisions(req.session.IdTask).then(ListDecisions => {
                                res.render('task', {
                                    StudentName: req.session.Name,
                                    Task_ID: tasks[0].id,
                                    Name: tasks[0].Name,
                                    Text: tasks[0].Text,
                                    Link: filelink,
                                    ListDecisions: ListDecisions
                                });
                            })

                        })
                    } else {
                        res.render('error', {message: 'Задания не существует'});
                    }
                })
            } else {
                res.render('task');
            }
        }
    }else{
        res.redirect("/");
    }
});

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

//Обработка GET запроса к странице управления преподавателя
router.get('/teacher', function(req, res) {
    if(req.session.auth === true) {
        if (req.query.act && req.query.act === 'logout') {
            delete req.session.auth;
            res.redirect("/");
        } else {
            ind.GetListSubjects().then(subjects => {
                if (req.query.subjects === undefined) {
                    ind.GetListDecisions(subjects[0].id, -1).then(tasks => {
                            res.render('Teacher', {
                                TeacherName: req.session.Name,
                                subjects: subjects,
                                body: tasks
                            });
                        }
                    )
                } else {
                    ind.GetSubjectID(req.query.subjects).then(id => {
                        ind.GetListDecisions(id[0].id, -1).then(tasks => {
                                res.render('Teacher', {
                                    TeacherName: req.session.Name,
                                    subjects: subjects,
                                    subjectsName: req.query.subjects,
                                    body: tasks
                                });
                            }
                        )
                    })
                }
            })
        }
    }else{
        res.redirect("/");
    }
});

router.get('/TechSubjects', function(req, res) {
    if (req.query.act && req.query.act === 'logout') {
        delete req.session.auth;
        res.redirect("/");
    }else {
        ind.GetTechSubjects().then(subjects => {
            res.render('TechSubjects', {
                TeacherName: req.session.Name,
                subjects: subjects
            });
        });
    }
});

router.get('/TechTasks', function(req, res) {
    if (req.query.act && req.query.act === 'logout') {
        delete req.session.auth;
        res.redirect("/");
    }else {
        ind.GetListSubjects().then(subjects => {
            if (req.query.subjects === undefined) {
                ind.GetTechTasks(subjects[0].id).then(tasks => {
                        res.render('TechTasks', {TeacherName: req.session.Name,
                            subjects: subjects,
                            tasks: tasks});
                    }
                )
            } else {
                ind.GetSubjectID(req.query.subjects).then(id => {
                    ind.GetTechTasks(id[0].id).then(tasks => {
                            res.render('TechTasks', {
                                TeacherName: req.session.Name,
                                subjects: subjects,
                                subjectsName: req.query.subjects,
                                tasks: tasks
                            });
                        }
                    )
                })
            }
        })
    }
});

router.get('/TechGroups', function(req, res) {
    if (req.query.act && req.query.act === 'logout') {
        delete req.session.auth;
        res.redirect("/");
    }else {
        ind.GetTechGroups().then(Groups => {
            ind.GetTechStudents(1).then(Students => {
                res.render('TechGroups', {
                    TeacherName: req.session.Name,
                    Groups: Groups,
                    Students:Students
                });
            });
        });
    }
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
