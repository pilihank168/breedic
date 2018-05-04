
var url_string = window.location.href;
var url = new URL(url_string);

firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		console.log("User is logined", user)
	} else {
		console.log("User is not logined yet.");
		var parser = document.createElement('a');
		parser.href = url;
		path = parser.pathname.split('/')
		console.log('login.html?go='+path[path.length-1]+parser.search);
		window.location.replace('login.html?go='+path[path.length-1]+parser.search);
	}
});
