this.uploadFile =  function(index) {
    //baseClass это this
    var file = baseClass.allFiles[index];

    //Создаем объек FormData
    var data = new FormData();
    //Добавлем туда файл
    data.append('uploadFile', file.file);

    //отсылаем с попощью Ajax
    $.ajax({
        url: '/',
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: function(response) {
            var message = file.element.find('td.message');
            if(response.status === 'ok') {
                message.html(response.text);
                file.element.find('button.uploadButton').remove();
            }
            else {
                message.html(response.errors);
            }
        },
        xhr: function() {
            var xhr = $.ajaxSettings.xhr();

            if ( xhr.upload ) {
                console.log('xhr upload');

                xhr.upload.onprogress = function(e) {
                    file.progressDone = e.position || e.loaded;
                    file.progressTotal = e.totalSize || e.total;
                    //обновляем прогресс для файла
                    baseClass.updateFileProgress(index, file.progressDone, file.progressTotal, file.element);
                    //обновляем общий прогресс
                    baseClass.totalProgressUpdated();
                };
            }

            return xhr;
        }
    });
};