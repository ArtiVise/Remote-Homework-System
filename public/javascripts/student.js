function createXmlHttpRequestObject(){
    let xmlHttp;
    try{
        xmlHttp=new XMLHttpRequest();
    }
    catch(e){
        try{
            xmlHttp=new ActiveXObject("MSXML2.XMLHTTP");
        }
        catch(e){
            try{
                xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch(e){}
        }
    }
    if(!xmlHttp){
        alert("Не удалось создать объект XMLHttpRequest");
    }
    return xmlHttp;
}

//-----------------------------
function getXML(xmlHttp){
// возвращает xml документ, если он пришёл и false в противном случае
    let xmlDoc=false;
// проверка готовности результата
    if(xmlHttp.readyState === 4){
        if (xmlHttp.status === 200){
            // получить XML ответ сервера
            xmlDoc=xmlHttp.responseXML;
        } else {
            if (xmlHttp.status === 404){
                alert("Request URL does not exist");
            } else {
                alert("Error: status code is " + xmlHttp.status);
            }
        }
    }
    return xmlDoc;
}

function getResponseText(xmlHttp){
// возвращает текст отклика сервера на xmlHttpRequest
    let txt=false;
// проверка готовности результата
    if(xmlHttp.readyState === 4){
        if (xmlHttp.status === 200){
            // получить XML ответ сервера
            txt=xmlHttp.responseText;
        } else {
            if (xmlHttp.status === 404){
                alert("Request URL does not exist");
            } else {
                alert("Error: status code is " + xmlHttp.status);
            }
        }
    }
    return txt;
}

function Init(){
    xmlHttp=createXmlHttpRequestObject(); // создаём объект
}
//------------------------------------
function Send(){
    xmlHttp.onreadystatechange=Receive;  // назначаем обработчик ответа сервера
    let fullrequest = new FormData(document.forms.frm);
    xmlHttp.open("POST","GetRes.php",true);
    xmlHttp.send(fullrequest);
    delete fullrequest;
}

function first()
{
    Init();
    Send();
}

function newRequest(){
    var request = new XMLHttpRequest();
// 3. Настройка запроса
    request.open('GET','/',true);
// 4. Подписка на событие onreadystatechange и обработка его с помощью анонимной функции
    request.addEventListener('readystatechange', function() {
        // если состояния запроса 4 и статус запроса 200 (OK)
        if ((request.readyState==4) && (request.status==200)) {
            // например, выведем объект XHR в консоль браузера
            console.log(request);
            // и ответ (текст), пришедший с сервера в окне alert
            console.log(request.responseText);
            // получить элемент c id = welcome
            var welcome = document.getElementById('welcome');
            // заменить содержимое элемента ответом, пришедшим с сервера
            welcome.innerHTML = request.responseText;
        }
    });
// 5. Отправка запроса на сервер
    request.send();
}

//------------------------------------