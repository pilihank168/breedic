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
//logout
var signoutBtn = document.getElementById("signoutBtn");
signoutBtn.style.display="none";
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
		console.log("User is logined", user)
	} else {
		signoutBtn.style.display="none";
		console.log("User is not logined yet.");
	}
});
//contact form(fail)
var contactName = document.getElementById("name");
var contactFarm = document.getElementById("farm");
var contactSize = document.getElementById("size");
var contactMail = document.getElementById("email");
var contactPhone = document.getElementById("phone");
var contactLocation = document.getElementById("location");
var contactText = document.getElementById("message");
var contactBtn = document.getElementById("contactBtn");
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha', {
	'size' : 'normal',
	'callback' : function(response){
	console.log('verified');
	}
});
window.recaptchaVerifier.render().then(function(widgetId){
	window.recaptchaWidgetId = widgetId;
	console.log(widgetId);});

var contactForm = document.getElementById("contactForm");
contactBtn.addEventListener("click", function(evt){
	evt.preventDefault();
	//contactForm.reset();
	console.log("name:"+contactName.value+"farm:"+contactFarm.value+"size:"+contactSize.value+"email:"+contactMail.value+"phone:"+contactPhone.value+"location:"+contactLocation.value+"message"+contactText.value);
var recaptchaResponse = grecaptcha.getResponse(window.recaptchaWidgetId);
console.log(recaptchaResponse);
	window.location.reload(false);
});
