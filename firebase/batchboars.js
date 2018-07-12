// Create a root reference
var storageRef = firebase.storage().ref();

Dropzone.autoDiscover = false;
var dropzone = new Dropzone('#dropzone-test', {
  // previewTemplate: document.querySelector('#preview-template').innerHTML,
  parallelUploads: 2,
  thumbnailHeight: 120,
  thumbnailWidth: 120,
  maxFilesize: 3,
  filesizeBase: 1000,
  autoProcessQueue: false,
  addRemoveLinks: true,
  thumbnail: function(file, dataUrl) {
    if (file.previewElement) {
      file.previewElement.classList.remove("dz-file-preview");
      var images = file.previewElement.querySelectorAll("[data-dz-thumbnail]");
      for (var i = 0; i < images.length; i++) {
        var thumbnailElement = images[i];
        thumbnailElement.alt = file.name;
        thumbnailElement.src = dataUrl;
      }
      setTimeout(function() { file.previewElement.classList.add("dz-image-preview"); }, 1);
    }
  }

});

var uploadBtn = document.getElementById("upload-button");
uploadBtn.addEventListener("click", function(){
  console.log("Hi!");
  dropzone.processQueue();
});

// Now fake the file upload, since GitHub does not handle file uploads
// and returns a 404

var minSteps = 6,
    maxSteps = 60,
    timeBetweenSteps = 100,
    bytesPerStep = 100000;

dropzone.uploadFiles = function(files) {
  var self = this;

  for (var i = 0; i < files.length; i++) {

    var file = files[i];

    var uploadTask = storageRef.child('xls/'+file.name).put(file);
    uploadTask.on('state_changed', function(snapshot){

      // stage changes：progress, pause, and resume
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      self.emit('uploadprogress', file, progress, snapshot.bytesTransferred);
      console.log('Upload is ' + progress + '% done');
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'

          console.log('Upload is paused');
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'

          console.log('Upload is running');
          break;
      }
    }, function(error) {
      // Handle unsuccessful uploads
      self.emit("error", file);
      console.log('error', error);

    }, function() {
      // Handle successful uploads on complete
      file.status = Dropzone.SUCCESS;
      self.emit("success", file, 'success', null);
      self.emit("complete", file);
      self.processQueue();
      var downloadURL = uploadTask.snapshot.downloadURL;
      console.log("Download URL: ", downloadURL);
    });
  }
}
