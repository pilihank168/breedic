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
var previous = document.getElementById("previous");
var next = document.getElementById("next");

// Parse Url
var url_string = window.location.href;
var url = new URL(url_string);
var litter = url.searchParams.get("litter");

var farmId=-1;
var suckingNum=0;

// Execute after getting farm number from auth.js
function main(farmNo){

farmId = farmNo;

var litterRef = firebase.database().ref('litters/'+farmNo+'/'+litter);
var suckingRef = firebase.database().ref('suckings/'+farmNo+'/'+litter).orderByChild('pigNo');
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
		if(entry.weanWeight){
			sCells[4].innerHTML = entry.weanWeight;
		}
		else{
			var input = document.createElement("INPUT");
			input.setAttribute('type','text');
			input.setAttribute('id', 'weanWeight'+entry.pigNo);
			sCells[4].appendChild(input);
			weanWeight -= 1000;
		}
		if(entry.identity){
			sCells[5].innerHTML = entry.identity;
		}
		else{
			var input = document.createElement("INPUT");
			input.setAttribute('type','text');
			input.setAttribute('id', 'identity'+entry.pigNo);
			sCells[5].appendChild(input);
		}
		sCells[6].innerHTML = defined(entry.fostering);
		litterWeight += parseFloat(entry.litterWeight);
		weanWeight += parseFloat(entry.weanWeight);
		suckingNum += 1;
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
		wCells[4].innerHTML = (weanWeight > 0) ? weanWeight.toFixed(1) : '';
	}

	// previous litter and next litter
	if(entry1.previous){
		previous.setAttribute('href','sucking.html?litter='+entry1.previous);
		previous.innerHTML += '('+entry1.previous+')';
	}
	else{
		previous.innerHTML += '(無)';
	}
	if(entry1.next){
		next.setAttribute('href','sucking.html?litter='+entry1.next);
		next.innerHTML += '('+entry1.next+')';
	}
	else{
		next.innerHTML += '(無)';
	}
});

}

var saveBtn = document.getElementById('saveBtn');

saveBtn.addEventListener("click", function(){
	console.log(photo);
	var promise_array = [];
	for(i=1;i<=suckingNum;i++){
		var saveRef = firebase.database().ref('/suckings/'+farmId+'/'+litter+'/'+i);
		var wean = document.getElementById('weanWeight'+i.toString());
		var identity = document.getElementById('identity'+i.toString());
		if(identity.value && wean.value){
			promise_array.push(saveRef.set({weanWeight:wean.value, identity:identity.value}));
		}
		else if(identity.value){
			promise_array.push(saveRef.set({identity:identity.value}));
		}
		else if(identity.value){
			promise_array.push(saveRef.set({weanWeight:wean.value}));
		}
	}
	Promise.all(promise_array).then(function(){
		console.log("增加仔豬資料成功");
		window.location.replace(window.location.href);
	}).catch(function(err){
		console.error("增加仔豬資料錯誤：",err);
	});
});
