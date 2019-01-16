function unique(a){
    return a.filter(function(value, index, self) {return self.indexOf(value) === index;})
}

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
var physicalRef;
var boarRef, sowRef, weanerRef;

var keys = ["date", "earmark", "sex", "weight", "fat", "depth", "surface", "note"];
var dataList = []

function two_step_query(firstStepRef){
    firstSteps = [];
    firstStepRef.forEach((stepRef)=>{
        firstSteps.push(stepRef.once("value"));
    });
    dataList = [];
    return firstSteps.once("value").then((snapshots)=>{
        var secondSteps = [];
        var exportIds = []
        snapshots.forEach((snapshot)=>{
            snapshot.forEach((childSnapshot)=>{
                // make second steps
                var secondRef = firebase.database().ref("semen/" + userData.currentFarm).orderByChild("earmark").equalTo(childSnapshot.key);
                const secondP = secondRef.once("value");
                secondSteps.push(secondP);
            });
        });
        return Promise.all(secondSteps);
    }).then((snapshots)=>{
        main_step(snapshots);
        snapshots.forEach((snapshot)=>{
            main_step(snapshot);
        });
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
	console.log(event);
	event.preventDefault();
    dataList = [];
	if(dateRadio.checked)
        if(dateType==="birthday")
            two_step_query([boarRef.orderByChild("birthday").startAt(date1.value).endAt(date2.value), 
                            sowRef.orderByChild("birthday").startAt(date1.value).endAt(date2.value)]).then(renderTable);
        else
            one_step_query(physicalRef.orderByChild("date").startAt(date1.value).endAt(date2.value)).then(renderTable);
	else if(pigRadio.checked)
		if(filter.value==="location")
			two_step_query([boarRef.orderByChild("loaction").startAt(query.value).endAt(query.value+"\uf8ff"),
                            sowRef.orderByChild("loaction").startAt(query.value).endAt(query.value+"\uf8ff")]).then(renderTable);
        else if(filter.value==="earmark")
            one_step_query(physicalRef.orderByChild("earmark").equalTo(query.value)).then(renderTable);
		else
            two_step_query([boarRef.orderByChild(filter.value).equalTo(query.value),
                            sowRef.orderByChild(filter.value).equalTo(query.value)]).then(renderTable);
});

function initPage(){
    singleDateEvent(date1, date2, singleDate);
	boarRef = firebase.database().ref("boars/" + userData.currentFarm);
    sowRef = firebase.database().ref("sows/" + userData.currentFarm);
    weanerRef = firebase.database().ref("weaners/" + userData.currentFarm);
    physicalRef = firebase.database().ref("physical/" + userData.currentFarm);
	one_step_query(physicalRef).then(renderTable);
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
			cell.innerHTML = j!==2 ? dataList[i][j+1] : (dataList[i][j+1]==="F"?"母豬":"公豬")
		}
	}
    makeDataTable("#table");
}
