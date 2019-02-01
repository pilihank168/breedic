// Get Elements
var search = document.getElementById("search");
var dateRadio = document.getElementById("dateRadio");
var pigRadio = document.getElementById("pigRadio");
var date1 = document.getElementById("date1");
var date2 = document.getElementById("date2");
var singleDate = document.getElementById("singleDate");
var dateType = document.getElementById("dateType");
var filter = document.getElementById("filter");
var query = document.getElementById("query");
var table = document.getElementById("tableBody");
var dataTable = "";
var dataList;
var exportRef;
var boarRef, sowRef, weanerRef;

var keys = ["date", "name", "number", "note", "earmarks"];
var dataList = []

function two_step_query(firstStepRef){
    firstSteps = [];
    firstStepRef.forEach((stepRef)=>{
        firstSteps.push(stepRef.once("value"));
    });
    dataList = [];
    return Promise.all(firstSteps).then((snapshots)=>{
        var secondSteps = [];
        var exportIds = []
        snapshots.forEach((snapshot)=>{
            snapshot.forEach((childSnapshot)=>{
                // make second steps
                exportId = childSnapshot.val()["exportId"];
                if(exportId && !exportIds.includes(exportId)){
                    var secondRef = firebase.database().ref("export/" + userData.currentFarm + "/" + exportId);
                    const secondP = secondRef.once("value");
                    exportIds.push(exportId);
                    secondSteps.push(secondP);
                }
            });
        });
        return Promise.all(secondSteps);
    }).then((snapshots)=>{
        main_step(snapshots);
//        snapshots.forEach((snapshot)=>{
//            main_step(snapshot);
//        });
    });
}

function one_step_query(ref){
	dataList = [];
	return ref.once("value").then(main_step);
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
    dataList = []
	if(dateRadio.checked)
        if(dateType.value==="birthday")
            two_step_query([boarRef.orderByChild("birthday").startAt(date1.value).endAt(date2.value), 
                            sowRef.orderByChild("birthday").startAt(date1.value).endAt(date2.value),
                            weanerRef.orderByChild("birthday").startAt(date1.value).endAt(date2.value)]).then(renderTable);
        else
            one_step_query(exportRef.orderByChild("date").startAt(date1.value).endAt(date2.value)).then(renderTable);
	else if(pigRadio.checked)
		if(filter.value==="location")
			two_step_query([boarRef.orderByChild("location").startAt(query.value).endAt(query.value+"\uf8ff"),
                            sowRef.orderByChild("location").startAt(query.value).endAt(query.value+"\uf8ff"),
                            weanerRef.orderByChild("location").startAt(query.value).endAt(query.value+"\uf8ff")]).then(renderTable);
        else if(filter.value==="earmark")
			two_step_query([boarRef.orderByKey().equalTo(query.value), 
                            sowRef.orderByKey().equalTo(query.value),
                            weanerRef.orderByKey().equalTo(query.value)]).then(renderTable);
        else if(filter.value==="registerNo")
			two_step_query([boarRef.orderByChild("registerNo").equalTo(query.value),
                            sowRef.orderByChild("registerNo").equalTo(query.value)]).then(renderTable);
		else
            two_step_query([boarRef.orderByChild(filter.value).equalTo(query.value),
                            sowRef.orderByChild(filter.value).equalTo(query.value),
                            weanerRef.orderByChild(filter.value).equalTo(query.value)]).then(renderTable);
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
    sowRef = firebase.database().ref("sows/" + userData.currentFarm);
    weanerRef = firebase.database().ref("weaners/" + userData.currentFarm);
    exportRef = firebase.database().ref("export/" + userData.currentFarm);
	var d = new Date();
	today = localDateStr(d)
	d.setDate(d.getDate()-7);
	thresholdDate = localDateStr(d);
	one_step_query(exportRef.orderByChild("date").startAt(thresholdDate)).then(renderTable);
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
		for(j=0;j<keys.length-1;j++){
			var cell = row.insertCell(j);
			cell.innerHTML = dataList[i][j+1];
		}
        row.setAttribute('data-earmarks', Object.keys(dataList[i][5]).join());
	}
    makeDataTable("#table");
}

var modal_title = document.getElementById("modal-title");
var content_table = document.getElementById("content-table");

// Clickable Row in DataTable
$('#tableBody').on('click', 'tr', function () {
	var data = this.getAttribute("data-earmarks");
	modal_title.innerHTML = "出豬詳情："+this.children[1].innerHTML+"（"+this.children[0].innerHTML+"）";
	data = data.split(',');
	content_table.innerHTML = "";
	var row;
	for(i=0;i<data.length;i++){
		if(i%5==0)
			row=content_table.insertRow(content_table.rows.length);
		cell = row.insertCell(i%5);
		cell.innerHTML = data[i];
	}
	$("#myModal").modal("toggle"); // open modal
});
