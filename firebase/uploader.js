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
   filePreviewer(droppedFiles[0]);
});

$("#file").change(function(){
    var filename = $("#file")[0].files[0].name;
    filePreviewer($("#file")[0].files[0]);
});
