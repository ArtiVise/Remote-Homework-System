'use strict';

let exec = require('child_process').exec;

//Функция для вызова модуля автоматической проверки

//let ProgramName = 'ProgramCheck/1/ProgramCheck1';
//let File = './DB/40/1(2).txt';
//let Param = '';

//(ProgramName,File,Param);

function ProgramCheck(ProgramName,File,Param){
    return new Promise((resolve, reject) => {
        exec('node ' + ProgramName + ' ' + File + ' ' + Param, (err, stdout, stderr) => {
            let tmp = stdout.split('\n');
            //if(tmp[0]==='true') console.log('Результат:'+stdout); else console.log('Результат1:'+stdout);
            resolve(stdout);//console.log(stdout);
        });
    });
}

exports.ProgramCheck = ProgramCheck;