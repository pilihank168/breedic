var row = document.getElementById("inputRow");
var add = document.getElementById("addBtn");
var table = document.getElementById("tableBody");
var date = document.getElementById("date");
var form = document.getElementById("form");
var upload = document.getElementById("upload");
var d = new Date();
var keyArray = ["earmark", "volume", "concentration", "activity", "abnormalities", "acrosome", "midpiece", "dilute", "available", "note"];
var promise_array=[];

function initPage(){
	date.valueAsDate=d;
	loadExistedData();
}

date.addEventListener('change', function(){
	$("#inputandsave").css("visibility", "hidden");
	loadExistedData();
});

function loadExistedData(){
	while(table.rows.length>1)
		table.removeChild(table.rows[0]);
	var listRef = firebase.database().ref("semen/" + userData.currentFarm + "/").orderByChild("date").equalTo(date.value);
	listRef.once('value').then(function(snapshot){
		snapshot.forEach(function(childSnapshot){
			console.log(0);
			var row = table.insertRow(table.rows.length-1);
			for(i=0;i<keyArray.length;i++){
				var cell = row.insertCell(i);
				cell.innerHTML = childSnapshot.child(keyArray[i]).val()
			}
			row.insertCell(-1);
		});
		$("#inputandsave").css("visibility", "visible");
	});
}

upload.addEventListener("click", ()=>{
	for(i=0;i<table.children.length-1;i++){
		if(table.children[i].getAttribute('class')=="newRow"){
			semenPromise(table.children[i]);
		}
	}
	Promise.all(promise_array).then( ()=>{
		window.location.replace("semen.html")//location.href)
	});
});

function semenPromise(row){
	semenObj = {date:date.value};
	for(i=0;i<keyArray.length;i++)
		semenObj[keyArray[i]] = row.children[i].innerHTML;
	semenRef = firebase.database().ref("semen/" + userData.currentFarm + "/" + date.value + "-" + semenObj["earmark"]);
	const p = semenRef.set(semenObj);
	promise_array.push(p);
    boarRef = firebase.database().ref("boars/" + userData.currentFarm + "/" + semenObj["earmark"]);
    boarP = boarRef.update({lastSemen:date.value, semenAvailability:semObj["available"]});
    promise_array.push(boarP);
    logRef = firebase.database().ref("log/" + userData.currentFarm + "/" + semenObj["earmark"]).push();
    logP = logRef.set({date:date.value, eventName:"semen"});
    promise_array.push(logP);
}

form.addEventListener("submit", (event)=>{
	event.preventDefault();
	console.log(table);
	var newRow = table.insertRow(table.rows.length-1);
	newRow.setAttribute('class', 'newRow');
	var cells = [];
	for(i=0;i<row.children.length-1;i++){
		var cell = newRow.insertCell(i);
		cell.innerHTML = row.children[i].children[0].value;
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
