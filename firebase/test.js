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
var user = firebase.auth().currentUser;
console.log(user);
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
	}).catch(function(err){
			console.error("新增公豬資料錯誤：",err);
	})
})

var boarList = document.getElementById("boarList");
var boarListBtn = document.getElementById("boarListBtn");
var table = document.getElementById("boarTable");
boarListBtn.addEventListener("click", function(){
	//
	var boarsRef = firebase.database().ref('boars/0/').orderByChild("earmark");
	boarsRef.once('value').then(function(snapshot){
				snapshot.forEach(function(childSnapshot) {
			entry = childSnapshot.val();
			console.log(childSnapshot.key);
			var row = table.insertRow(1);
			var cell0 = row.insertCell(0);
			var cell1 = row.insertCell(1);
			var cell2 = row.insertCell(2);
			var cell3 = row.insertCell(3);
			var cell4 = row.insertCell(4);
			var cell5 = row.insertCell(5);
			var cell6 = row.insertCell(6);
			var cell7 = row.insertCell(7);
			cell0.innerHTML = entry.strain;
			cell1.innerHTML = entry.earmark;
			cell2.innerHTML = entry.registerNo;
			cell3.innerHTML = entry.birthday;
			//cell4.innerHTML = x
			//cell5.innerHTML = entry.age
			cell6.innerHTML = 'X';
			//cell7.innerHTML = entry.age
		});
	})
}, false);

//Email/Pwd註冊
var account = document.getElementById("account");
var pwd = document.getElementById("pwd");
var registerSmtBtn = document.getElementById("registerSmtBtn");
registerSmtBtn.addEventListener("click", function(){
		console.log(account.value);
		firebase.auth().createUserWithEmailAndPassword(account.value, pwd.value).catch(function(error) {
				// Handle Errors here.
				var errorCode = error.code;
				var errorMsg = error.message;
				console.log(errorMsg);
				});
		},false);

//登入
var accountL = document.getElementById("accountL");
var pwdL = document.getElementById("pwdL");
var loginSmtBtn = document.getElementById("loginSmtBtn");
loginSmtBtn.addEventListener("click",function(){
		console.log(accountL.value);
		firebase.auth().signInWithEmailAndPassword(accountL.value, pwdL.value).catch(function(error) {
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
				console.log(errorMessage);
				})
		},false);

//登出
var signoutSmtBtn = document.getElementById("signoutSmtBtn");
signoutSmtBtn.addEventListener("click",function(){
		firebase.auth().signOut().then(function() {
				console.log("User sign out!");
				}, function(error) {
				console.log("User sign out error!");
				})
		},false);

//查看目前登入狀況
var user;
firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
		user = user;
		console.log("User is logined", user)
		} else {
		user = null;
		console.log("User is not logined yet.");
		}
		});
