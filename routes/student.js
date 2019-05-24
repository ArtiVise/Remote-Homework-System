let express = require('express'); //Подключение библиотеки Express
let router = express.Router();
let ind = require('../models/models');
let fs = require('fs'); //Подключение библиотеки для работы с файлами
let formidable = require('formidable');
let util = require('util');
let ProgramCheck = require('../ProgramCheck');

let path = require('path');

//Обработка GET запроса к списку задач
router.get('/main', function(req, res) {
    if (req.query.act && req.query.act === 'getTask') {
        let IdTask;
        if (req.query.ActTask !== undefined) IdTask = req.query.ActTask; else IdTask = -1;
        req.session.IdTask=IdTask;
        res.redirect("/student/task/"+ IdTask); //Рендеринг страницы с формулировкой задания
    } else {
        ind.GetListSubjects().then(subjects => {
            if (req.query.subjects === undefined) {
                ind.GetListTask(subjects[0].id, 0).then(tasks => {
                        res.render('student', {
                            StudentName: req.body.userName,
                            subjects: subjects,
                            body: tasks
                        }); //Рендеринг страницы со списком заданий, если предмет не выбран
                    }
                )
            } else {
                ind.GetSubjectID(req.query.subjects).then(id => {
                    ind.GetListTask(id[0].id, 0).then(tasks => {
                            res.render('student', {
                                StudentName: req.body.userName,
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
});

//Обработка GET запроса к формулировке задачи
router.get('/task/:idTask', function(req, res) {
    if (req.params.idTask !== -1) {
        ind.GetTask(req.params.idTask).then(tasks => {
            if (tasks !== '') {
                ind.GetTaskFiles(req.params.idTask).then(files => {
                    let filelink = '1';
                    console.log(files.length);
                    if (files.length === 0) {
                        filelink = ''
                    } else {
                        filelink = files[0].FileLink
                    }
                    ind.GetTaskDecisions(req.params.idTask).then(ListDecisions => {
                        res.render('task', {
                            StudentName: req.body.userName,
                            Task_ID: tasks[0].id,
                            Name: tasks[0].Name,
                            Text: tasks[0].Text,
                            Link: filelink,
                            ListDecisions: ListDecisions
                        });
                    })

                })
            } else {
                res.render('error', {message: 'Задания не существует', status:"500"});
            }
        })
    } else {
        res.render('task');
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

//Обработка GET запроса на загрузку файла ответа
router.post('/upload', function(req, res){
    ind.AddDecision(req.session.IdTask, req.body.userID).then(lastid => {
        let form = new formidable.IncomingForm();
        let fields = [];
        let path1 = '';
        fs.mkdirSync('./DB'+'/'+ lastid[0].lastid);
        form.uploadDir = './DB'+'/'+ lastid[0].lastid;
        form.keepExtensions = true;
        form.on('file', function(field, file) {
            //rename the incoming file to the file's name
            fs.rename(file.path, form.uploadDir + "/" + file.name, (err) => {
                if (err) throw err;
                console.log('Rename complete!');
                path1 = form.uploadDir + '/' + file.name;
                ind.AddDecisionFile(lastid[0].lastid, lastid[0].lastid + '/' + file.name)
            });
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
                    ProgramCheck.ProgramCheck2(CheckProgram[0].CheckProgram,path1,CheckProgram[0].ParamCheckProgram).then(data => {
                        //console.log("Конечный результат:" + data);
                        //let tmp = data.split('\n');
                        if (data.status === true) {
                            //console.log('Прошло проверку');
                            ind.ChangeDecisionsStatus(lastid[0].lastid,'2').then(data => {

                            });
                        }else{
                            ind.ChangeDecisionsStatus(lastid[0].lastid,'3').then(data => {

                            });
                            //console.log('Найдены ошибки: ' + tmp[1]);
                            ind.AddComment(lastid[0].lastid,'0',data.comment).then(data => {

                            });
                        }
                    });
                   /* ProgramCheck.ProgramCheck2(CheckProgram[0].CheckProgram,path1,CheckProgram[0].ParamCheckProgram).then(data => {
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
                    });*/
                });
                //res.writeHead(200, {'content-type': 'text/plain'});
                res.redirect("/student/task/"+req.session.IdTask);
                //res.end('received fields:\n\n '+util.inspect(fields));
            });
        form.parse(req);
    });
});

module.exports = router;