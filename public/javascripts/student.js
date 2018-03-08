/**
 * Created by Артём on 18.06.2017.
 */


//------------------------------------
function createXmlHttpRequestObject(){
    var xmlHttp;
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
    var xmlDoc=false;
// проверка готовности результата
    if(xmlHttp.readyState == 4){
        if (xmlHttp.status == 200){
            // получить XML ответ сервера
            xmlDoc=xmlHttp.responseXML;
        } else {
            if (xmlHttp.status == 404){
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
    var txt=false;
// проверка готовности результата
    if(xmlHttp.readyState == 4){
        if (xmlHttp.status == 200){
            // получить XML ответ сервера
            txt=xmlHttp.responseText;
        } else {
            if (xmlHttp.status == 404){
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
    var fullrequest = new FormData(document.forms.frm);
    xmlHttp.open("POST","GetRes.php",true);
    xmlHttp.send(fullrequest);
    delete fullrequest;
}

function first()
{
    Init();
    Send();
}

//------------------------------------