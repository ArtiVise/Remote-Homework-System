'use strict';

let Sequelize = require('sequelize'); //Подключение библиотеки ORM
let mysql = require('mysql'); //Подключение библиотеки для работы с базой данных на MySQL

//Создание подключения к базе данных
let sequelize = new Sequelize('new_schema', 'root','123456',{
    host: 'localhost',
    dialect: 'mysql',

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

//Описание структуры таблицы студентов
let Students = sequelize.define('Students', {
    Name: Sequelize.STRING,
    Login: Sequelize.STRING,
    Password: Sequelize.STRING,
    Group_ID: Sequelize.INTEGER
});

//Описание структуры таблицы групп
let Groups = sequelize.define('Groups', {
    Name: Sequelize.STRING,
    Year_ID: Sequelize.INTEGER
});

let Years = sequelize.define('Years', {
    YearName: Sequelize.STRING
});

//Описание структуры таблицы предметов
let Subjects = sequelize.define('Subjects', {
    Name: Sequelize.STRING,
    Visible: Sequelize.BOOLEAN
});

//Описание структуры таблицы, которая назачает предмет группе
let SubjectsGroups = sequelize.define('SubjectsGroups', {
    Subject_ID: Sequelize.INTEGER,
    Group_ID: Sequelize.INTEGER
});

//Описание структуры таблицы комментариев
let Comments = sequelize.define('Comments', {
    Decision_ID: Sequelize.INTEGER,
    TimeComment: Sequelize.DATE,
    Text: Sequelize.TEXT,
    Who: Sequelize.BOOLEAN
});

//Описание структуры таблицы с ссылками на файлы заданий
let TasksFiles = sequelize.define('TasksFiles', {
    Task_ID: Sequelize.INTEGER,
    FileLink: Sequelize.STRING
});

//Описание структуры таблицы заданий
let Tasks = sequelize.define('Tasks', {
    Name: Sequelize.STRING,
    Number: Sequelize.INTEGER,
    Text: Sequelize.STRING,
    Subject_ID: Sequelize.INTEGER,
    Visible: Sequelize.BOOLEAN,
    CheckProgram:Sequelize.STRING,
    ParamCheckProgram:Sequelize.STRING
});

//Описание структуры таблицы решений
let Decisions = sequelize.define('Decisions', {
    Task_ID: Sequelize.INTEGER,
    Student_ID: Sequelize.INTEGER,
    TimeAnswer: Sequelize.DATE,
    Status_ID: Sequelize.INTEGER,
    Teacher_ID: Sequelize.INTEGER
});

//Описание структуры таблицы с ссылками на файлы решений
let DecisionsFiles = sequelize.define('DecisionsFiles', {
    Decision_ID: Sequelize.INTEGER,
    DecisionLink: Sequelize.STRING
});

//Описание структуры таблицы преподавателей
let Teachers = sequelize.define('Teachers', {
    Login: Sequelize.STRING,
    Password: Sequelize.STRING,
    Name: Sequelize.STRING
});

//Описание структуры таблицы статусов решений
let Status = sequelize.define('Status', {
    Name: Sequelize.STRING
});

//Указание связей между таблицами
Years.hasMany(Groups, {foreignKey: 'Year_ID'});

Groups.hasMany(SubjectsGroups, {foreignKey: 'Group_ID'});
Groups.hasMany(Students, {foreignKey: 'Group_ID'});

Subjects.hasMany(SubjectsGroups, {foreignKey: 'Subject_ID'});
Subjects.hasMany(Tasks, {foreignKey: 'Subject_ID'});
//Tasks.belongsTo(Subjects ,{foreignKey: 'Subject_ID'});

Students.hasMany(Decisions, {foreignKey: 'Student_ID'});

Tasks.hasMany(Decisions, {foreignKey: 'Task_ID'});
Tasks.hasMany(TasksFiles, {foreignKey: 'Task_ID'});

Decisions.hasMany(DecisionsFiles, {foreignKey: 'Decision_ID'});
Decisions.hasMany(Comments, {foreignKey: 'Decision_ID'});

Status.hasMany(Decisions, {foreignKey: 'Status_ID'});

Teachers.hasMany(Decisions, {foreignKey: 'Teacher_ID'});

/*Функции для работы с хранимыми процедурами*/
module.exports = {
    qwer: function ()
    {
        return Students.findAll({attributes: ['id', 'Name']}).then(data => {
            return data;
        });

    },

    //Функция авторизации(логин, пароль)
    Autorization: function (login, pass) {
        return sequelize.query('CALL Autorization (:login, :pass);',
            {replacements: {login: login, pass: pass}}).then(data => {
            return data;
        });
    },

    //Функция получения списка предметов
    GetListSubjects: function () {
        return sequelize.query('CALL GetListSubjects ()',
            {replacements: {}}).then(data => {
            return data;
        });
    },

    //Функция получения id предмета по названию
    GetSubjectID: function(Name) {
        return sequelize.query('CALL GetSubjectID (:Name)',
            {replacements: {Name: Name}}).then(data => {
            return data;
        });
    },

    //Функция получения списка заданий(id предмета, id студента)
    GetListTask: function(id, Stud_ID) {
        return sequelize.query('CALL GetListTasks (:id,:Stud_ID)',
            {replacements: {id: id, Stud_ID: Stud_ID}}).then(data => {
            return data;
        });
    },

    //Функция получения формулировки задания(id задания)
    GetTask:function(id) {
        return sequelize.query('CALL GetTasks (:id)',
            {replacements: {id: id}}).then(data => {
            return data;
        });
    },

    //Функция получения ссылок на файлы задания(id задания)
    GetTaskFiles:function(id) {
        return sequelize.query('CALL GetTaskFiles (:id)',
            {replacements: {id: id}}).then(data => {
            return data;
        });
    },

    //Функция добавления решения (id задания, id студента)
    AddDecision:function(TaskID, StudentID) {
        return sequelize.query('CALL AddDecision (:TaskID,:StudentID)',
            {replacements: {TaskID: TaskID, StudentID: StudentID}}).then(data => {
            return data;
        });
    },

    //Функция добавления файла решения (id решения, ссылка на файл)
    AddDecisionFile:function(Decision_ID, DecisionLink) {
        return sequelize.query('CALL AddDecisionFile (:Decision_ID,:DecisionLink)',
            {replacements: {Decision_ID: Decision_ID, DecisionLink: DecisionLink}}).then(data => {
            return data;
        });
    },

    //Функция получения ответов по определенному зданию (id задания)
    GetTaskDecisions:function(id1) {
        return sequelize.query('CALL GetTaskDecisions (:id1)',
            {replacements: {id1: id1}}).then(data => {
            return data;
        });
    },

    //Функция получения списка ответов по определенному предмету и группе (id предмета, id группы)
    GetListDecisions:function(Subj_ID, Group_ID) {
        return sequelize.query('CALL GetListDecisions (:Subj_ID,:Group_ID)',
            {replacements: {Subj_ID: Subj_ID, Group_ID: Group_ID}}).then(data => {
            return data;
        });
    },

    GetTechSubjects:function() {
        return sequelize.query('CALL GetTechSubjects ()',
            {replacements: {}}).then(data => {
            return data;
        });
    },


    GetTechTasks:function(Subj_ID) {
        return sequelize.query('CALL GetTechTasks (:Subj_ID)',
            {replacements: {Subj_ID: Subj_ID}}).then(data => {
            return data;
        });
    },

    GetTechGroups:function() {
        return sequelize.query('CALL GetTechGroups ()',
            {replacements: {}}).then(data => {
            return data;
        });
    },

    GetTechStudents:function(Groups_ID) {
        return sequelize.query('CALL GetTechStudents (:Groups_ID)',
            {replacements: {Groups_ID: Groups_ID}}).then(data => {
            return data;
        });
    },

    GetStudCheckProgram:function(Task_ID) {
        return sequelize.query('CALL GetStudCheckProgram (:Task_ID)',
            {replacements: {Task_ID: Task_ID}}).then(data => {
            return data;
        });
    },

    ChangeDecisionsStatus: function(Des_ID, Status_ID) {
        return sequelize.query('CALL ChangeDecisionsStatus (:Des_ID,:Status_ID)',
            {replacements: {Des_ID: Des_ID, Status_ID: Status_ID}}).then(data => {
            return data;
        });
    },

    AddComment: function(Decision_ID, Who, TXT) {
        return sequelize.query('CALL AddComment (:Decision_ID,:Who,:TXT)',
            {replacements: {Decision_ID: Decision_ID, Who: Who, TXT: TXT}}).then(data => {
            return data;
        });
    }
};

//Пример заполнения базы данных
//sync3();

function sync1(){
    sequelize.sync().then(function() {
        Status.create({
            Name: 'Не проверено',
        });
        Status.create({
            Name: 'Прошло предварительную проверку',
        });
        Status.create({
            Name: 'Не прошло предварительную проверку',
        });
        Status.create({
            Name: 'Зачтено',
        });
        Status.create({
            Name: 'Оценка 5',
        });
        Status.create({
            Name: 'Оценка 4',
        });
        Status.create({
            Name: 'Оценка 3',
        });
        Status.create({
            Name: 'Найдены ошибки',
        });
        return Status.create({
            Name: 'Оценка 2',
        });
    }).then(function(jane) {
         console.log(jane.get({
             plain: true
         }));
     });

    sequelize.sync().then(function() {
        return Years.create({
            YearName: '2016/2017'
        });
    }).then(function(jane) {
        console.log(jane.get({
            plain: true
        }));
    });

     sequelize.sync().then(function() {
     return Teachers.create({
     Name: 'Катаргин Михаил Юрьевич',
     Login: 'tech2',
     Password: '2'
     });
     }).then(function(jane) {
     console.log(jane.get({
     plain: true
     }));
     });

     sequelize.sync().then(function() {
     return Teachers.create({
     Name: 'Система',
     Login: 'tech1',
     Password: '1'
     });
     }).then(function(jane) {
     console.log(jane.get({
     plain: true
     }));
     });

    sequelize.sync().then(function() {
        Subjects.create({
            Name: 'Веб-программирование',
            Visible: 'true'
        });
        return Subjects.create({
            Name: 'Базы данных',
            Visible: 'true'
        });
    }).then(function(jane) {
        console.log(jane.get({
            plain: true
        }));
    });
}

function sync2() {
    sequelize.sync().then(function () {
        Groups.create({
            Name: 'ЕТ-484',
            Year_ID: '1'
        });
        return Groups.create({
            Name: 'ЕТ-483',
            Year_ID: '1'
        });
    }).then(function (jane) {
        console.log(jane.get({
            plain: true
        }));
    });

    sequelize.sync().then(function () {
        Tasks.create({
            Name: 'HTML',
            Number: '1',
            Visible: 'true',
            Subject_ID: "1",
            Text: 'Текст задания "HTML"',
            CheckProgram: 'ProgramCheck/1/ProgramCheck1',
            ParamCheckProgram: ''
        });
        return Tasks.create({
            Name: 'CSS',
            Number: '2',
            Visible: 'true',
            Subject_ID: "1",
            Text: 'Текст задания "CSS"',
            CheckProgram: 'ProgramCheck/1/ProgramCheck1',
            ParamCheckProgram: ''
        });
    }).then(function (jane) {
        console.log(jane.get({
            plain: true
        }));
    });

    sequelize.sync().then(function () {
        Tasks.create({
            Name: 'Решение задач на "SELECT"',
            Number: '1',
            Visible: 'true',
            Subject_ID: "2",
            Text: 'Текст задания "Решение задач на "SELECT"',
            CheckProgram: 'ProgramCheck/1/ProgramCheck1',
            ParamCheckProgram: ''
        });
        return Tasks.create({
            Name: 'Семестровая работа',
            Number: '2',
            Visible: 'true',
            Subject_ID: "2",
            Text: 'Текст задания "Семестровая работа"',
            CheckProgram: 'ProgramCheck/1/ProgramCheck1',
            ParamCheckProgram: ''
        });
    }).then(function (jane) {
        console.log(jane.get({
            plain: true
        }));
    });
}

function sync3(){
    sequelize.sync().then(function () {
        return Students.create({
            Name: 'Жалий Артём',
            Login: 'user1',
            Password: '1',
            Group_ID: '1'
        });
    }).then(function (jane) {
        console.log(jane.get({
            plain: true
        }));
    });

    sequelize.sync().then(function () {
        return Students.create({
            Name: 'Вачков Иван',
            Login: 'user2',
            Password: '2',
            Group_ID: '1'
        });
    }).then(function (jane) {
        console.log(jane.get({
            plain: true
        }));
    });

    sequelize.sync().then(function () {
        return TasksFiles.create({
            Task_ID: '1',
            FileLink: 'Task/1/TaskFiles.zip'
        });
    }).then(function (jane) {
        console.log(jane.get({
            plain: true
        }));
    });
}
