let express = require('express'); //Подключение библиотеки Express
let router = express.Router();
let ind = require('../models/models');

//Обработка GET запроса к формулировке задачи
router.get('/:idTask', function(req, res) {
    if (req.query.act && req.query.act === 'logout') {
        delete req.session.auth;
        res.redirect("/");
    } else {
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
                    res.render('error', {message: 'Задания не существует'});
                }
            })
        } else {
            res.render('task');
        }
    }
});

module.exports = router;