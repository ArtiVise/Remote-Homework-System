"use strict";
var cluster = require('cluster');//Включаем cluster
var events = require('events');
var os = require('os');
var cpuCount = require('os').cpus().length;//Количество ядер процессора(потоков)
var worker = require('./app.js');

//В мастере создаем worker'ов равное количеству ядер процессоров
if (cluster.isMaster) {
    var workers = [];
    var workersInfo = [];
    var arrayPortWorkers = [];
    var infoCPU = [];
    for (var i = 0; i < cpuCount; i++) {
        cluster.setupMaster({
            args: [(5001+i)]
        });
        workers[i] = cluster.fork();
        arrayPortWorkers.push(':'+(5001+i));
        workers[i].on('message', function(msg) {
            if(msg.type === "answerServerInfo"){
                var flag = 0;
                for(var i=workersInfo.length;i--;){
                    if(workersInfo[i] !== undefined){
                        if(workersInfo[i].id===msg.id){
                            workersInfo[i].pid = msg.pid;
                            workersInfo[i].port = msg.port;
                            workersInfo[i].useMemory = msg.useMemory;
                            workersInfo[i].allocatedMemory = msg.allocatedMemory;
                            workersInfo[i].countUser = msg.countUser;
                            flag=1;
                            break;
                        }
                    }
                }
                if(flag===0) workersInfo.push({id: msg.id,pid: msg.pid,port: msg.port, useMemory: msg.useMemory,allocatedMemory: msg.allocatedMemory, countUser: msg.countUser});
            }

        });
    }
    /**---------Баласер подключений-------**/

    var expressBalancer = require('express');
    var appBalancer = expressBalancer();
    var httpBalancer = require('http').Server(appBalancer);
    var ioBalancer = require('socket.io')(httpBalancer);
    var NumHost = 0;
    appBalancer.get("/", function (request, response) {
        NumHost++;
        if(NumHost===cpuCount) NumHost=0;
        response.redirect("http://" + request.headers.host.split(':')[0] + arrayPortWorkers[NumHost]);
    });
    appBalancer.get("/monitor", function (request, response) {
        response.sendFile(__dirname + '/views/monitorServer.html');
    });

    appBalancer.set('port', (process.env.PORT || 5000));
    httpBalancer.listen(appBalancer.get('port'), function () {
        console.log('Запущен балансер на порту', appBalancer.get('port'));
    });

    ioBalancer.on('connection', function (socket) {
        /** Получение состояние сервера для мониторинга**/
        socket.on('serverInfo', function () {

            var used = process.memoryUsage().heapUsed / 1024 / 1024;
            socket.emit('answerServerInfo', Math.round(used * 100) / 100,0,cpuCount,workersInfo,infoCPU);
        });
    });
    /**-----------------------------------**/
    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.id + ' died');
        for(var i=workers.length;i--;){
            if(workers[i].id===worker.id){
                for(var j=workersInfo.length;j--;) {
                    if (workersInfo[j].id === workers[i].id) {
                        cluster.setupMaster({
                            args: [workersInfo[j].port]
                        });
                        var newWorker = cluster.fork();
                        newWorker.on('message', function(msg) {
                            if(msg.type === "answerServerInfo"){
                                var flag = 0;
                                for(var i=workersInfo.length;i--;){
                                    if(workersInfo[i] !== undefined){
                                        if(workersInfo[i].id===msg.id){
                                            workersInfo[i].pid = msg.pid;
                                            workersInfo[i].port = msg.port;
                                            workersInfo[i].useMemory = msg.useMemory;
                                            workersInfo[i].allocatedMemory = msg.allocatedMemory;
                                            workersInfo[i].countUser = msg.countUser;
                                            flag=1;
                                            break;
                                        }
                                    }
                                }
                                if(flag===0) workersInfo.push({id: msg.id,pid: msg.pid,port: msg.port, useMemory: msg.useMemory,allocatedMemory: msg.allocatedMemory, countUser: msg.countUser});
                            }

                        });
                        workers.push(newWorker);
                        workersInfo.splice(j,1);
                    }
                }
                workers.splice(i,1);
                break;
            }
        }
    });
    var cpus = os.cpus();
    var lastcpus = 0;
    setInterval(function (){
        for (const id in cluster.workers){
            cluster.workers[id].send({ type: 'GetServerInfo' });
        }
        infoCPU.length = 0;
        if(lastcpus!==0) {
            cpus = os.cpus();
            //console.log("freemem",Math.round(os.freemem() / 1024 / 1024 * 100) / 100);
            //console.log("totalmem",Math.round(os.totalmem() / 1024 / 1024 * 100) / 100);

            for (var i = 0, len = cpus.length; i < len; i++) {
                var lcpu = lastcpus[i], cpu = cpus[i], total = 0;
                for (var type in cpu.times) {
                    total += cpu.times[type] - lcpu.times[type];
                }
                infoCPU.push({numberCPU: "CPU"+i, userCPU: Math.round(100 * (cpu.times.user-lcpu.times.user) / total),
                    sysCPU: Math.round(100 * (cpu.times.sys-lcpu.times.sys) / total),
                    idleCPU: Math.round(100 * (cpu.times.idle-lcpu.times.idle) / total)});
            }
        }
        lastcpus=os.cpus();
    },1000);
}