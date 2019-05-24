let express = require('express'); //Подключение библиотеки Express
let router = express.Router();
let ind = require('../models/models');

//Обработка GET запроса к странице управления преподавателя
router.get('/main', function(req, res) {
    ind.GetListSubjects().then(subjects => {
        if (req.query.subjects === undefined) {
            ind.GetListDecisions(subjects[0].id, -1).then(tasks => {
                    res.render('Teacher', {
                        TeacherName: req.body.userName,
                        subjects: subjects,
                        body: tasks,
                        authenticated: 0
                    });
                }
            )
        } else {
            ind.GetSubjectID(req.query.subjects).then(id => {
                ind.GetListDecisions(id[0].id, -1).then(tasks => {
                        res.render('Teacher', {
                            TeacherName: req.body.userName,
                            subjects: subjects,
                            subjectsName: req.query.subjects,
                            body: tasks,
                            authenticated: 0
                        });
                    }
                )
            })
        }
    })
});

router.get('/subjects', function(req, res) {
    ind.GetTechSubjects().then(subjects => {
        res.render('TechSubjects', {
            TeacherName: req.body.userName,
            subjects: subjects,
            authenticated: 1
        });
    });
});

router.get('/tasks', function(req, res) {
    ind.GetListSubjects().then(subjects => {
        if (req.query.subjects === undefined) {
            ind.GetTechTasks(subjects[0].id).then(tasks => {
                    res.render('TechTasks', {TeacherName: req.body.userName,
                        subjects: subjects,
                        tasks: tasks,
                        authenticated: 2
                    });
                }
            )
        } else {
            ind.GetSubjectID(req.query.subjects).then(id => {
                ind.GetTechTasks(id[0].id).then(tasks => {
                        res.render('TechTasks', {
                            TeacherName: req.body.userName,
                            subjects: subjects,
                            subjectsName: req.query.subjects,
                            tasks: tasks,
                            authenticated: 2
                        });
                    }
                )
            })
        }
    })
});

router.get('/groups', function(req, res) {
    ind.GetTechGroups().then(Groups => {
        ind.GetTechStudents(1).then(Students => {
            res.render('TechGroups', {
                TeacherName: req.body.userName,
                Groups: Groups,
                Students:Students,
                authenticated: 3
            });
        });
    });
});

module.exports = router;