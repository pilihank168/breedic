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
var accountL = document.getElementById("accountL");
var pwdL = document.getElementById("pwdL");
var loginSmtBtn = document.getElementById("loginSmtBtn");
loginSmtBtn.addEventListener("click",function(){
	console.log(accountL.value);
	firebase.auth().signInWithEmailAndPassword(accountL.value, pwdL.value).then(function(){
		console.log("login");
	})
	.catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log(errorMessage);
	})
},false);
//logout
var signoutBtn = document.getElementById("signoutBtn");
var loginSection = document.getElementById("loginSec");
signoutBtn.addEventListener("click", function(){
	firebase.auth().signOut().then(function() {
		console.log("User sign out!");
	}, function(error) {
	console.log("User sign out error!");
	})
},false);
//content control
var user;
firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		signoutBtn.style.display="block";
		loginSection.style.display="none";
		console.log("User is logined", user)
	} else {
		signoutBtn.style.display="none";
		loginSection.style.display="none";
		console.log("User is not logined yet.");
	}
});
