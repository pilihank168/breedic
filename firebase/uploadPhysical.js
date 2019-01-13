var row = document.getElementById("inputRow");
var add = document.getElementById("addBtn");
var table = document.getElementById("tableBody");
var date = document.getElementById("date");
var form = document.getElementById("form");
var upload = document.getElementById("upload");
var d = new Date();
var promise_array=[];

function localDateStr(d){
	str = d.toLocaleDateString().split("/");
	yStr = str[0];
	mStr = ("0" + str[1]).slice(-2);
	dStr = ("0" + str[2]).slice(-2);
	return [yStr, mStr, dStr].join("-");
}
function initPage(){
	date.value = localDateStr(d);
	loadExistedData();
}

date.addEventListener('change', function(){
	loadExistedData();
});

function loadExistedData(){
	while(table.rows.length>1)
		table.removeChild(table.rows[0])
	keyArray = ["earmark", "sex", "weight", "fat", "depth", "surface", "note"];
	var listRef = firebase.database().ref("physical/" + userData.currentFarm + "/").orderByChild("date").equalTo(date.value);
	listRef.once('value').then(function(snapshot){
		snapshot.forEach(function(childSnapshot){
			console.log(0);
			var row = table.insertRow(table.rows.length-1);
			for(i=0;i<keyArray.length;i++){
				var cell = row.insertCell(i);
				data = childSnapshot.child(keyArray[i]).val()
				cell.innerHTML = i!=1 ? data : (data=="sow"?"母豬":"公豬")
			}
			row.insertCell(-1)
		});
	});
}

upload.addEventListener("click", ()=>{
	for(i=0;i<table.children.length-1;i++){
		if(table.children[i].getAttribute('class')=="newRow"){
			physicalPromise(table.children[i]);
		}
	}
	Promise.all(promise_array).then( ()=>{
		window.location.replace(location.href)
	});
});

function physicalPromise(row){
	physicalRef = firebase.database().ref("physical/" + userData.currentFarm + "/").push();
	//keys = ["earmark", "volume", "concentration", "activity", var5, var6, var7, "dilute", "available", "note"]
	const p = physicalRef.set({
		earmark:row.children[0].innerHTML,
		sex:(row.children[1].innerHTML=='母豬'?'sow':'boar'),
		weight:row.children[2].innerHTML,
		fat:row.children[3].innerHTML,
		depth:row.children[4].innerHTML,
		surface:row.children[5].innerHTML,
		note:row.children[6].innerHTML,
		date:date.value
	});
	promise_array.push(p);
}

form.addEventListener("submit", (event)=>{
	event.preventDefault();
	console.log(row.children[1].children[0].children["sex"].value)
	console.log(document.getElementById("form"));
	console.log(table);
	var newRow = table.insertRow(table.rows.length-1);
	newRow.setAttribute('class', 'newRow');
	var cells = [];
	for(i=0;i<row.children.length-1;i++){
		var cell = newRow.insertCell(i);
		console.log(row.children[i]);
		cell.innerHTML = i!=1?row.children[i].children[0].value:(document.getElementById("f").checked?"母豬":"公豬");
		row.children[i].children[0].value='';
	}
	var cell = newRow.insertCell(row.children.length-1);
	var deleteBtn = document.createElement('span');
	deleteBtn.setAttribute("class", "button small alt");
	deleteBtn.innerHTML = "×";
	deleteBtn.addEventListener("click", function(){
		this.closest("tbody").removeChild(this.closest("tr"));
	});
	cell.appendChild(deleteBtn);
	row.children[0].children[0].focus();
});
