firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		console.log("User is logined", user)
		window.location.replace('index.html');
	}
});

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
		console.log(url.searchParams.get("go"));
		var path = url.searchParams.get("go") ? url.searchParams.get("go") : 'index.html';
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
