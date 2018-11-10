var url_string = window.location.href;
var url = new URL(url_string);
var userData, userRef;

firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		userRef = firebase.database().ref('users/'+user.uid);
		userRef.once('value').then(function(snapshot){
			userData = snapshot.val();
			makeNav(userData.role, user.uid);
		   console.log("User is logined", user.uid)
         initPage();
		}).catch((error)=>{console.log(error)});
	}
	else{
		console.log("User is not logined yet.");
		makeNav('none');
		var parser = document.createElement('a');
		parser.href = url;
		path = parser.pathname.split('/');
		page = path[path.length-1];
		search = parser.search;
		if(page!=='index.html' && page!=='login.html'){
			console.log('login.html?go='+page+search);
			window.location.replace('login.html?go='+page+search);
		}
	}
});
