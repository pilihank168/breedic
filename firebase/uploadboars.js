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
var note = document.getElementById("note");
var boarSmtBtn = document.getElementById("boarSmtBtn");
boarSmtBtn.addEventListener("click", function(){
	var boarRef = firebase.database().ref('/boars/0/'+earmark.value);
	boarRef.set({
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
		note:note.value
	}).then(function(){
		console.log("新增公豬資料成功");
		window.location.replace("boardata.html?ear="+earmark.value);
	}).catch(function(err){
			console.error("新增公豬資料錯誤：",err);
	})
})
