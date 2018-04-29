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

function definedContent(content){return content ? content : '';}

var sowList = document.getElementById("sowList");
var table = document.getElementById("sowTable");
var pTable = document.getElementById("productionTable");
var url_string = window.location.href;
var url = new URL(url_string);
var earmark = url.searchParams.get("ear");
var photo = document.getElementById("photo");
var origin = document.getElementById("origin");
var sowListRef = firebase.database().ref('sowList/0/'+earmark);
var sowsRef = firebase.database().ref('sows/0/'+earmark);
var productionRef = firebase.database().ref('production/0/'+earmark).orderByChild('parity');
const p1 = sowListRef.once('value');
const p2 = sowsRef.once('value');
const p3 = productionRef.once('value');
Promise.all([p1, p2, p3]).then(function(snapshot){
	console.log(snapshot);
	entry1 = snapshot[0].val();
	entry2 = snapshot[1].val();
	var row = table.insertRow(1);
	var cells = [];
	for(i=0;i<9;i++){
		var cell = centerCell(row,i);
		cells.push(cell);
	}
	cells[0].innerHTML = entry1.strain;
	cells[1].innerHTML = entry1.earmark;
	cells[2].innerHTML = entry1.registerNo;
	cells[3].innerHTML = entry1.birthday;
	cells[4].innerHTML = entry1.fatherNo;
	cells[5].innerHTML = entry1.motherNo;
	cells[6].innerHTML = definedContent(entry1.position);
	cells[7].innerHTML = entry1.statuss;
	cells[8].innerHTML = entry1.note;
	weight.innerHTML = "體重："+entry2.weight+" kg <br>\背脂："+entry2.backFat+" cm";
	origin.innerHTML = "豬隻來源："+definedContent(entry2.source);
	photoPath = "0/"+entry1.earmark+".png";
	console.log(photoPath);
	var photoRef = firebase.storage().ref(photoPath);
	photoRef.getDownloadURL().then(function(url) {
		photo.src=url;});
	$('#progressBar').stepProgressBar({
	  currentValue: 100,
	  steps: [
		{ value: 0, bottomLabel : '0 day'},
		{ value: 100, topLabel: '', bottomLabel:' '},
		{ value: 114, topLabel: '分娩'},
		{ topLabel: '離乳', value: 135,},
		{ value: 150, 
		  mouseOver: function() { alert('mouseOver'); },
		  click: function() { alert('click'); }
		}
	  ],
	  unit: ''
	});
	snapshot[2].forEach(function(childSnapshot) {
		entry = childSnapshot.val();
		console.log(childSnapshot.key);
		var row = pTable.insertRow(-1);
		var pCells = [];
		for(i=0;i<18;i++){
			var cell = centerCell(row,-1);
			pCells.push(cell);
		}
		pCells[0].innerHTML = entry.parity;
		pCells[1].innerHTML = entry.serviceDate;
		pCells[2].innerHTML = entry.boarEar;
		pCells[3].innerHTML = entry.dueDate;
		pCells[4].innerHTML = entry.diagnoseDate;
		pCells[5].innerHTML = entry.parturitionDate;
		pCells[6].innerHTML = entry.duration;
		pCells[7].innerHTML = entry.totalPiglet;
		pCells[8].innerHTML = entry.litterNo;
		pCells[9].innerHTML = entry.live;
		pCells[10].innerHTML = entry.mummy;
		pCells[11].innerHTML = entry.stillborn;
		pCells[12].innerHTML = entry.lactateLocation;
		pCells[13].innerHTML = entry.lactateWeight;
		pCells[14].innerHTML = entry.weanDate;
		pCells[15].innerHTML = entry.weanNumber;
		pCells[16].innerHTML = entry.weanWeight;
		pCells[17].innerHTML = entry.note;
	});
});
