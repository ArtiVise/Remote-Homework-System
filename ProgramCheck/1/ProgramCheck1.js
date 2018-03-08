'use strict';

let fs = require('fs');
let file = process.argv[2];

fs.readFile(file, function (err, contents) {
    let lines = contents.toString().split(' ').length + contents.toString().split('\n').length - 1;
    if(lines<10){
        console.log("false");
        console.log("Кол-во cлов меньше 10");
    }else{
        console.log("true");
    }
});
