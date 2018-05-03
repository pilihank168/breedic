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
function centerCell(row,i){
	cell=row.insertCell(i);
	cell.setAttribute('style','text-align:center;');
	return cell;
}

function defined(content){return content ? content : '';}

var weanerList = document.getElementById("weanerList");
var table = document.getElementById("weanerTable");
var weanerRef = firebase.database().ref('weanerList/0/').orderByChild("earmark");
weanerRef.once('value').then(function(snapshot){
	snapshot.forEach(function(childSnapshot) {
		entry = childSnapshot.val();
		console.log(childSnapshot.key);
		var row = table.insertRow(-1);
		var cells = [];
		for(i=0;i<6;i++){
			var cell = centerCell(row,i);
			cells.push(cell);
		}
		cells[0].innerHTML = entry.strain;
		cells[1].innerHTML = entry.earmark;
		cells[2].innerHTML = entry.identity;
		cells[3].innerHTML = entry.gender;
		cells[4].innerHTML = entry.age;
		cells[5].innerHTML = defined(entry.location);
	});
})
