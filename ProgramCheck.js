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

function ProgramCheck2(ProgramName,linkCheckFile,Param) {
    return new Promise((resolve, reject) => {
        const {VM, VMScript} = require('vm2');
        const vm = new VM( { timeout : 5000, sandbox: { ProgramName,linkCheckFile,Param} });
        let fs = require('fs'); //Подключение библиотеки для работы с файлами
        fs.readFile("./" + ProgramName + ".js", function(err, scriptFile) {
            if (err) {
                reject(err);
            }
            fs.readFile(linkCheckFile, (err1, checkFile) => {
                if (err1) {
                    reject(err1);
                }
                // use move() function from backend
                let move = {};
                try {
                    move.function = new VMScript(scriptFile + 'check(' + checkFile +')').compile();
                } catch (e) {
                    console.error('Failed to compile script.', e);
                }
                // try execute function
                try {
                    move.result = vm.run(move.function);
                    resolve(move.result);
                } catch (e) {
                    reject({message: e.toString()});
                }
            });
        });
    });
}


exports.ProgramCheck = ProgramCheck;
exports.ProgramCheck2 = ProgramCheck2;