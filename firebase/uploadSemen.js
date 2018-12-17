var row = document.getElementById("inputRow");
var add = document.getElementById("addBtn");
var table = document.getElementById("tableBody");
var date = document.getElementById("date");
var form = document.getElementById("form");
var upload = document.getElementById("upload");
var d = new Date();
var promise_array=[];

function initPage(){
	date.valueAsDate=d;
//	loadExistedData();
}

//date.addEventListener('change', function(){
//	loadExistedData();
//});

function loadExistedData(){
	keyArray = ["earmark", "volume", "concentration", "activity", "var5", "var6", "var7", "dilute", "available", "note"];
	var listRef = firebase.database().ref("semen/" + userData.currentFarm + "/").orderByChild("earmark");
	listRef.once('value').then(function(snapshot){
		snapshot.forEach(function(childSnapshot){
			console.log(0);
			var row = table.insertRow(table.rows.length-1);
			for(i=0;i<keyArray.length;i++){
				var cell = row.insertCell(i);
				cell.innerHTML = childSnapshot.child(keyArray[i]).val()
			}
		});
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
	semenRef = firebase.database().ref("semen/" + userData.currentFarm + "/").push();
	//keys = ["earmark", "volume", "concentration", "activity", var5, var6, var7, "dilute", "available", "note"]
	const p = semenRef.set({
		earmark:row.children[0].innerHTML,
		volume:row.children[1].innerHTML,
		concentration:row.children[2].innerHTML,
		activity:row.children[3].innerHTML,
		var5:row.children[4].innerHTML,
		var6:row.children[5].innerHTML,
		var7:row.children[6].innerHTML,
		dilute:row.children[7].innerHTML,
		available:row.children[8].innerHTML,
		note:row.children[9].innerHTML
	});
	promise_array.push(p);
}

form.addEventListener("submit", (event)=>{
	event.preventDefault();
	console.log(table);
	var newRow = table.insertRow(table.rows.length-1);
	newRow.setAttribute('class', 'newRow');
	var cells = [];
	for(i=0;i<row.children.length;i++){
		var cell = newRow.insertCell(i);
		cell.innerHTML = row.children[i].children[0].value;
		row.children[i].children[0].value='';
	}
	var cell = newRow.insertCell(row.children.length);
	var deleteBtn = document.createElement('span');
	deleteBtn.setAttribute("class", "button small");
	deleteBtn.innerHTML = "×";
	deleteBtn.addEventListener("click", function(){
		this.closest("tbody").removeChild(this.closest("tr"));
	});
	cell.appendChild(deleteBtn);
});
