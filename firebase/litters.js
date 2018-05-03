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
function defined(content){
	return content ? content : '';
}
var litterList = document.getElementById("litterList");
var table = document.getElementById("litterTable");
var litterRef = firebase.database().ref('litters/0/').orderByChild("litterNo");
litterRef.once('value').then(function(snapshot){
	snapshot.forEach(function(childSnapshot) {
		entry = childSnapshot.val();
		console.log(childSnapshot.key);
		var row = table.insertRow(-1);
		var cells = [];
		for(i=0;i<9;i++){
			var cell = centerCell(row,i);
			cells.push(cell);
		}
		cells[0].innerHTML = entry.strain;
		cells[1].innerHTML = entry.litterNo;
		cells[2].innerHTML = entry.fatherNo;
		cells[3].innerHTML = entry.motherNo;
		cells[4].innerHTML = entry.birthday;
		cells[5].innerHTML = entry.location;
		cells[6].innerHTML = entry.weanDate;
		cells[7].innerHTML = '<a href="'+'sucking.html?litter='+entry.litterNo+'">查看</a>';
		cells[8].innerHTML = defined(entry.note);
	});
})
