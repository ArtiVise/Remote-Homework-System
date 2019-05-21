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
                        body: tasks
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
                            body: tasks
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
            subjects: subjects
        });
    });
});

router.get('/tasks', function(req, res) {
    ind.GetListSubjects().then(subjects => {
        if (req.query.subjects === undefined) {
            ind.GetTechTasks(subjects[0].id).then(tasks => {
                    res.render('TechTasks', {TeacherName: req.body.userName,
                        subjects: subjects,
                        tasks: tasks});
                }
            )
        } else {
            ind.GetSubjectID(req.query.subjects).then(id => {
                ind.GetTechTasks(id[0].id).then(tasks => {
                        res.render('TechTasks', {
                            TeacherName: req.body.userName,
                            subjects: subjects,
                            subjectsName: req.query.subjects,
                            tasks: tasks
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
                Students:Students
            });
        });
    });
});

module.exports = router;