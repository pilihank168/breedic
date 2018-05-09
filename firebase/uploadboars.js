// Initialize Firebase
var config = {
	apiKey: "AIzaSyDARFJhNCdtGa3rWyJmE8zGawiwlbNBFpE",
	authDomain: "breedic-ba254.firebaseapp.com",
	databaseURL: "https://breedic-ba254.firebaseio.com",
	projectId: "breedic-ba254",
	storageBucket: "breedic-ba254.appspot.com",
	messagingSenderId: "607804503321"
};
firebase.initializeApp(config);

var earmark = document.getElementById("earmark");
var registerNo = document.getElementById("registerNo");
var strain = document.getElementById("strain");
var birthday = document.getElementById("birthday");
var fatherEar = document.getElementById("fatherEar");
var fatherNo = document.getElementById("fatherNo");
var motherEar = document.getElementById("motherEar");
var motherNo = document.getElementById("motherNo");
var weight = document.getElementById("weight");
var backFat = document.getElementById("backFat");
var position = document.getElementById("position");
var source = document.getElementById("source");
var note = document.getElementById("note");
var boarSmtBtn = document.getElementById("boarSmtBtn");
var photo = '';
var preview = document.getElementById("preview");
var fileInput = document.getElementById('photo');
var img = new Image();
fileInput.addEventListener('change', function(e) {
	var file = fileInput.files[0];
	photo = file;
	var imageType = /image.*/;
	if (file.type.match(imageType)) {
		var reader = new FileReader();
		reader.onload = function(e) {
			img.style.width = "100%";
			img.src = reader.result;
			preview.appendChild(img);
		}
		reader.readAsDataURL(file);	
		resetPhoto.style.display="inline-block";
	} else {
		preview.innerHTML = "File not supported!"
	}
});

var resetPhoto = document.getElementById("resetPhoto");
resetPhoto.addEventListener("click", function(evt){
	evt.preventDefault();
	resetPhoto.style.display="none";
	preview.reset();
	preview.removeChild(img);
	photo='';
});

boarSmtBtn.addEventListener("click", function(){
	console.log(photo);
	var boarRef = firebase.database().ref('/boars/0/'+earmark.value);
	const p1 = boarRef.set({
		earmark:earmark.value,
		registerNo:registerNo.value,
		strain:strain.value,
		birthday:birthday.value,
		fatherEar:fatherEar.value,
		fatherNo:fatherNo.value,
		motherEar:motherEar.value,
		motherNo:motherNo.value,
		weight:weight.value,
		backFat:backFat.value,
		position:position.value,
		source:source.value,
		note:note.value
	});
	var promise_array = [p1];
	if(photo){
		var photoRef = firebase.storage().ref("0/"+earmark.value+".png");
		const p2 = photoRef.put(photo);
		promise_array.push(p2)
	}
	Promise.all(promise_array).then(function(){
		console.log("新增公豬資料成功");
		window.location.replace("boardata.html?ear="+earmark.value);
	}).catch(function(err){
		console.error("新增公豬資料錯誤：",err);
	});
});
