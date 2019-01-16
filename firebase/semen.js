var search = document.getElementById("search");
var dateRadio = document.getElementById("dateRadio");
var boarRadio = document.getElementById("boarRadio");
var date1 = document.getElementById("date1");
var date2 = document.getElementById("date2");
var singleDate = document.getElementById("singleDate");
var dateType = document.getElementById("dateType");
var filter = document.getElementById("filter");
var query = document.getElementById("query");
var table = document.getElementById("tableBody");
var dataTable = "";
var dataList;
var boarRef;

var keys = ["date", "earmark", "volume", "concentration", "activity", "abnormalities", "acrosome", "midpiece", "dilute", "available", "note"];
var dataList = []

function two_step_query(firstStepRef){
    dataList = [];
    return firstStepRef.once("value").then((snapshot)=>{
        var secondSteps = [];
        snapshot.forEach((childSnapshot)=>{
            // make second steps
            var secondRef = firebase.database().ref("semen/" + userData.currentFarm).orderByChild("earmark").equalTo(childSnapshot.key);
            const secondP = secondRef.once("value");
            secondSteps.push(secondP);
        });
        return Promise.all(secondSteps);
    }).then((snapshots)=>{
        snapshots.forEach((snapshot)=>{
            main_step(snapshot);
        });
    });
}

function one_step_query(ref){
	dataList = [];
	return ref.once("value").then(main_step);//function(snapshot){
//        main_step(snapshot);
//	});
}

function main_step(snapshot){
	snapshot.forEach(function(childSnapshot){
		var data = [childSnapshot.key];
		for(i=0;i<keys.length;i++)
			data.push((childSnapshot.child(keys[i]).val()||""));
		dataList.push(data);
	});
}

search.addEventListener("submit", function(event){
	console.log(event);
	event.preventDefault();
	if(dateRadio.checked)
        if(dataType==="birthday")
            two_step_query(firebase.database("boars/"+userData.currentFarm).ref().orderByChild("birthday").startAt(date1.value).endAt(date2.value)).then(renderTable);
        else
		    ref = boarRef.orderByChild("birthday").startAt(date1.value).endAt(date2.value);
	else if(boarRadio.checked)
        if(filter.value==="earmark")
		else if(filter.value==="location")
			ref = boarRef.orderByChild("loaction").startAt(query.value).endAt(query.value+"\uf8ff");
		else
			ref = boarRef.orderByChild(filter.value).equalTo(query.value);
	getDataList(ref).then(function(){
	    $('#table').css('visibility', 'hidden');
        dataTable.destroy();
        renderTable()
    });
});

function initPage(){
    singleDateEvent(date1, date2, singleDate);
	var semenRef = firebase.database().ref("semen/" + userData.currentFarm).orderByChild("date").startAt(thresholdDate);
}

//function query()

//var ref = firebase.database().ref("semen/" + userDate.currentFarm).orderByChild(key).startAt().endAt()

function loadDB(ref, sorting){
	dataList = []
	ref.once("value").then((snapshot)=>{
		snapshot.forEach( (childShot)=>{
			var data = []
			for(i=0;i<keys.length;i++){
				data.push(childSnapshot.child(keys[i]).val())
			}
			dataList.push(data);
		});
	});
}

function buildDataTable(){
	//from dataList to table
	//apply dataTable.js
}

function initPage(){
	singleDateEvent(date1, date2, singleDate);
	boarRef = firebase.database().ref("boars/" + userData.currentFarm);
	var ref = boarRef.orderByChild("unavailability").endAt("");
	getDataList(ref).then(function(){renderTable();});
}

function renderTable(){
    $('#table').css('visibility', 'hidden');
    if(dataTable)
        dataTable.destroy();
	table.innerHTML = "";
	dataList.sort(function(a,b){
		key = parseInt(sortingKey.value);
		return b["date"].localeCompare(a["date"])
	});
	for(i=0;i<dataList.length;i++){
		var row = table.insertRow(-1);
		row.setAttribute("data-key", dataList[i][0]);
		for(j=0;j<keys.length;j++){
			var cell = row.insertCell(j);
			cell.innerHTML = dataList[i][j+1];
		}
	}
    makeDataTable("table");
}

$('#tableBody').on('click', 'tr', function () {
	var data = dataTable.row( this ).data();
	window.location='boar.html?id='+$(this).data("key");
});
