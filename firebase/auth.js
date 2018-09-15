
var url_string = window.location.href;
var url = new URL(url_string);

var uid, farmNo;

firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		uid = user.uid;
		console.log("User is logined", uid)
		var memberRef = firebase.database().ref('members/'+uid);
		memberRef.once('value').then(function(snapshot){
			entry = snapshot.val();
			farmNo = entry.currentFarm;
			console.log(entry.farm);
			main(farmNo);
		});
	} else {
		console.log("User is not logined yet.");
		var parser = document.createElement('a');
		parser.href = url;
		path = parser.pathname.split('/')
		console.log('login.html?go='+path[path.length-1]+parser.search);
		window.location.replace('login.html?go='+path[path.length-1]+parser.search);
	}
});
