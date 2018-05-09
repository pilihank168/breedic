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

// Get Element
var litterList = document.getElementById("litterList");
var table = document.getElementById("litterTable");
var suckingTable = document.getElementById("suckingTable");

// Parse Url
var url_string = window.location.href;
var url = new URL(url_string);
var litter = url.searchParams.get("litter");

var litterRef = firebase.database().ref('litters/0/'+litter);
var suckingRef = firebase.database().ref('suckings/0/'+litter).orderByChild('pigNo');
const p1 = litterRef.once('value');
const p2 = suckingRef.once('value');

Promise.all([p1, p2]).then(function(snapshot){
	console.log(snapshot);
	entry1 = snapshot[0].val();
	var row = table.insertRow(1);
	var cells = [];
	for(i=0;i<7;i++){
		var cell = centerCell(row,i);
		cells.push(cell);
	}
	cells[0].innerHTML = entry1.strain;
	cells[1].innerHTML = entry1.litterNo;
	cells[2].innerHTML = entry1.fatherNo;
	cells[3].innerHTML = entry1.motherNo;
	cells[4].innerHTML = entry1.birthday;
	cells[5].innerHTML = entry1.location;
	cells[6].innerHTML = entry1.weanDate;
	var litterWeight = 0;
	var weanWeight = 0;
	snapshot[1].forEach(function(childSnapshot) {
		entry = childSnapshot.val();
		var row = suckingTable.insertRow(-1);
		var sCells = [];
		for(i=0;i<7;i++){
			var cell = centerCell(row,-1);
			sCells.push(cell);
		}
		sCells[0].innerHTML = entry.pigNo;
		sCells[1].innerHTML = entry.gender;
		sCells[2].innerHTML = entry.litterWeight;
		sCells[3].innerHTML = entry.nippleNo;
		sCells[4].innerHTML = entry.weanWeight;
		sCells[5].innerHTML = entry.identity;
		sCells[6].innerHTML = defined(entry.fostering);
		litterWeight += parseFloat(entry.litterWeight);
		weanWeight += parseFloat(entry.weanWeight);
	});
	if(litterWeight){
		var row = suckingTable.insertRow(-1);
		var wCells = [];
		for(i=0;i<7;i++){
			var cell = centerCell(row,-1);
			wCells.push(cell);
		}
		wCells[0].innerHTML = '窩重';
		wCells[2].innerHTML = litterWeight.toFixed(1);
		wCells[4].innerHTML = weanWeight.toFixed(1);
	}
});
