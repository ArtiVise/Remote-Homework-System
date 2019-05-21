let express = require('express'); //Подключение библиотеки Express
let router = express.Router();
let ind = require('../models/models');

//Обработка GET запроса к списку задач
router.get('/main', function(req, res) {
    if (req.query.act && req.query.act === 'logout') {
        delete req.session.auth;
        res.redirect("/");
    } else {
        if (req.query.act && req.query.act === 'getTask') {
            var IdTask;
            if (req.query.ActTask !== undefined) IdTask = req.query.ActTask; else IdTask = -1;
            res.redirect("/task/"+ IdTask); //Рендеринг страницы с формулировкой задания
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
    }
});

module.exports = router;