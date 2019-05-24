'use strict';

function check(contents) {
    let lines = contents.toString().split(' ').length + contents.toString().split('\n').length - 1;
    let result = {status:false, comment:""};
    if(lines<10){
        result.comment = "Кол-во cлов меньше 10";
    }else{
        result.status = true;
    }
    return result;
}


