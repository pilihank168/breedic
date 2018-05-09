
var ul = document.getElementById('ul');
var logInOut = ul.childNodes[9];

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
