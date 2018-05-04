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
//login
var loginSmtBtn = document.getElementById("loginBtn");
loginSmtBtn.addEventListener("click",function(){
	var accountL = document.getElementById("account");
	var pwdL = document.getElementById("password");
	console.log(accountL.value);
	firebase.auth().signInWithEmailAndPassword(accountL.value, pwdL.value).then(function(){
		console.log("login");
		document.forms["loginForm"].reset();
		var url_string = window.location.href;
		var url = new URL(url_string);
		var path = path ? url.searchParams.get("go") : 'index.html';
		console.log(path);
		window.location.replace(path);
	})
	.catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log(errorMessage);
	})
},false);
