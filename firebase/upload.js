var Dropzone = $(".dropbox");
var DropInput = $(".box_input");
var droppedFiles = false;

Dropzone.on('drag dragstart dragend dragover dragenter dragleave drop', function(e){
   e.preventDefault();
   e.stopPropagation();
}).on('dragover dragenter', function(){
   DropInput.addClass('dragover');
}).on('dragleave dragend drop', function(){
   DropInput.removeClass('dragover');
}).on('drop', function(e){
   droppedFiles = e.originalEvent.dataTransfer.files;
   $("#upload-files-display").empty();
   $("#upload-files-display").append(droppedFiles[0].name+"<br>(<a>取消檔案</a>)");
});

/*Dropzone.on('submit', function(e){
   if(Dropzone.hasClass('box_uploading')) return false;

   Dropzone.addClass('box_uploading').removeClass('box_error');
});*/

$("#file").change(function(){
    var filename = $("#file")[0].files[0].name;
    filePreviewer($("#file")[0].files[0]);
    console.log($("#file")[0].files)
});

function filePreviewer(file){
    $("#upload-files-display").empty();
    $("#upload-files-display").append(file.name);
}
