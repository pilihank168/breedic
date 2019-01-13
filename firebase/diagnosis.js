var table = document.getElementById("tableBody");
var diagnoKeys = ["strain", "sowEarmark", "sowRegisterNo", "serviceDate", "sowLocation", "result", "diagLocation", "diagNote"]
var date = document.getElementById("date");
var period = document.getElementById("period");
var submitBtn = document.getElementById("submitBtn");
var queryBtn = document.getElementById("query");
var promise_array = [];
var diagDate = ""

function localDateStr(d){
	str = d.toLocaleDateString().split("/");
	yStr = str[0];
	mStr = ("0" + str[1]).slice(-2);
	dStr = ("0" + str[2]).slice(-2);
	return [yStr, mStr, dStr].join("-");
}

queryBtn.addEventListener("click", function(){
	loadExistedData();
});

function initPage(){
	var d = new Date();
	date.value = localDateStr(d);
	loadExistedData();
}

function loadExistedData(){
    console.log(date.value);
	table.innerHTML = "";
	var d = new Date(date.value);
	d.setDate(d.getDate()-period.value);
	diagDate = date.value;
	thresholdDate = d.toISOString().slice(0,10);
	console.log(thresholdDate);
	listRef = firebase.database().ref("diagnosis/" + userData.currentFarm);
	listRef.orderByChild("serviceDate").startAt("").endAt(thresholdDate).once("value").then( (snapshot)=>{
		snapshot.forEach( (childSnapshot)=>{
			if(!childSnapshot.child("result").exists()){
				row = table.insertRow(-1);
				row.setAttribute("data-id", childSnapshot.key);
				for(i=0;i<diagnoKeys.length;i++){
					var cell = row.insertCell(i);
					data = childSnapshot.child(diagnoKeys[i]).val()
					if(data==null){
						if(i===5)
							row.setAttribute("class", "newRow");
						cell.innerHTML = "";
					}
					else
						cell.innerHTML = data;
				}
				if(row.getAttribute("class")==="newRow")
					makeDiagInput(row);
			}
		});
	});
}

function makeBtn(text, eventListener){
	var btn = document.createElement("span");
	btn.setAttribute("class", "button small");
	btn.innerHTML = text;
	btn.addEventListener("click", function(){
		var thisBtn = this;
		var thisRow = thisBtn.closest("tr");
		var earmark = thisRow.children[1].innerHTML;
		eventListener(thisBtn, thisRow, text);
		console.log(earmark);
	});
	return btn;
}

function result(btn, row, text){
	row.setAttribute("class", "doneRow");
	row.setAttribute("data-result", (text=="O"?"p":"n"));
	row.setAttribute("data-location", row.children[6].children[0].value);
	btn.closest("td").innerHTML = text;
	row.children[6].innerHTML = row.children[6].children[0].value;
	var cell = row.insertCell(row.children.length);
	deleteBtn = makeBtn("取消", cancel);
	cell.append(deleteBtn);
}

function cancel(btn, row, text){
	row.setAttribute("class", "newRow");
	makeDiagInput(row);
	row.removeChild(btn.closest("td"));
}

function makeDiagInput(row){
	row.children[5].innerHTML = "";
	row.children[6].innerHTML = "";
	var posBtn = makeBtn("O", result);
	row.children[5].appendChild(posBtn);
	var nbsp = document.createTextNode("\u00A0");
	row.children[5].appendChild(nbsp);
	var negBtn = makeBtn("X", result);
	row.children[5].appendChild(negBtn);

	row.children[6].setAttribute("style", "vertical-align:middle!important; padding:1px!important;");
	var locInput = document.createElement("input");
	locInput.setAttribute("type", "text");
	locInput.setAttribute("size", "1");
	row.children[6].appendChild(locInput);
	row.children[7].setAttribute("style", "vertical-align:middle!important; padding:1px!important;");
	row.children[7].innerHTML = "<input type='text' size='1'>"
}

function diagPromise(diagId, result, newLocation, note){
	var diagRef = firebase.database().ref("diagnosis/" + userData.currentFarm + "/" + diagId);
	const p = diagRef.update({result:result, diagLocation:newLocation, diagNote:note, diagDate:diagDate});
	promise_array.push(p);
}

submitBtn.addEventListener("click", function(){
	for(i=0;i<table.children.length;i++){
		if(table.children[i].getAttribute('class')=="doneRow"){
			console.log(table.children[i]);
			var newLocation = table.children[i].getAttribute("data-location");
			var result = table.children[i].getAttribute("data-result");
			var diagId = table.children[i].getAttribute("data-id");
			diagPromise(diagId, result, newLocation, "")
		}
	}
	Promise.all(promise_array).then( ()=>{
		console.log('re')
		window.location.replace(location.href)
	});
});
