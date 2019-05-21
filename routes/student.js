let express = require('express'); //Подключение библиотеки Express
let router = express.Router();
let ind = require('../models/models');

//Обработка GET запроса к списку задач
router.get('/main', function(req, res) {
    if (req.query.act && req.query.act === 'getTask') {
        let IdTask;
        if (req.query.ActTask !== undefined) IdTask = req.query.ActTask; else IdTask = -1;
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

module.exports = router;