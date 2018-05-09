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

// Get Elements
var ul = document.getElementById('ul');
console.log(ul.childNodes);
var logInOut = ul.childNodes[9];
console.log(logInOut);
var login = document.getElementById('login');
//var logInOut = document.getElementById('logInOut');

// Logout
function logout(){
	firebase.auth().signOut().then(function() {
		console.log("User sign out!");
	}, function(error) {
	console.log("User sign out error!");
	})
	return false;
}

// Content Control
firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		logInOut.innerHTML="<a href='#' class='button'  onclick='logout()'>登出</em></a>";
		console.log("User is logined", user)
	} else {
		logInOut.innerHTML = '<a href="login.html" class="button">登入</em></a>';
		console.log("User is not logined yet.", geneList.style.display);
	}
});

//contact form
var contactBtn = document.getElementById("contactBtn");
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha', {
	'size' : 'normal',
	'callback' : function(response){
		contactBtn.classList.remove('disabled');
		contactBtn.setAttribute('type','submit');
		console.log('verified');
	},
	'expired-callback' : function(){
		contactBtn.setAttribute('type','text');
		contactBtn.classList.add('disabled');
	}
});
window.recaptchaVerifier.render().then(function(widgetId){
	window.recaptchaWidgetId = widgetId;
	console.log(widgetId);
});
