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

var boarList = document.getElementById("boarList");
var boarListBtn = document.getElementById("boarListBtn");
var table = document.getElementById("boarTable");
//boarListBtn.addEventListener("click", function(){
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
			cell1.innerHTML = '<a href="'+'boardata.html?ear='+entry.earmark+'">'+entry.earmark+'</a>';
			cell2.innerHTML = entry.registerNo;
			cell3.innerHTML = entry.birthday;
			//cell4.innerHTML = x
			//cell5.innerHTML = entry.age
			cell6.innerHTML = 'X';
			//cell7.innerHTML = entry.age
		});
	})
//}, false);