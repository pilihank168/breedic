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
var semenRef;
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
	return ref.once("value").then(main_step).catch(error=>console.log(error));
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
	event.preventDefault();
    dataList = [];
	if(dateRadio.checked)
        if(dateType.value==="birthday"){
            two_step_query(boarRef.orderByChild("birthday").startAt(date1.value).endAt(date2.value)).then(renderTable);
        }
        else
            one_step_query(semenRef.orderByChild("date").startAt(date1.value).endAt(date2.value)).then(renderTable);
	else if(boarRadio.checked)
        if(filter.value==="earmark")
            one_step_query(semenRef.orderByChild("earmark").equalTo(query.value)).then(renderTable);
		else if(filter.value==="location")
			two_step_query(boarRef.orderByChild("loaction").startAt(query.value).endAt(query.value+"\uf8ff")).then(renderTable);
		else
            two_step_query(boarRef.orderByChild(filter.value).equalTo(query.value)).then(renderTable);
});

function localDateStr(d){
	str = d.toLocaleDateString().split("/");
	yStr = str[0];
	mStr = ("0" + str[1]).slice(-2);
	dStr = ("0" + str[2]).slice(-2);
	return [yStr, mStr, dStr].join("-");
}

function initPage(){
    singleDateEvent(date1, date2, singleDate);
	boarRef = firebase.database().ref("boars/" + userData.currentFarm);
    semenRef = firebase.database().ref("semen/" + userData.currentFarm);
	var d = new Date();
	today = localDateStr(d)
	d.setDate(d.getDate()-7);
	thresholdDate = localDateStr(d);
	one_step_query(semenRef.orderByChild("date").startAt(thresholdDate)).then(renderTable);
}

function renderTable(){
    $('#table').css('visibility', 'hidden');
    if(dataTable)
        dataTable.destroy();
	table.innerHTML = "";
	dataList.sort(function(a,b){
		return b[1].localeCompare(a[1])
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
