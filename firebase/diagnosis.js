var table = document.getElementById("tableBody");
var diagnoKeys = ["diagResult", "diagLocation", "diagNote"]
var serviceKeys = ["sowEar", "sowNo", "serviceDate", "serviceLocation", "boarEar", "boarNo", "parity"]
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
	table.innerHTML = "";
	var d = new Date(date.value);
	d.setDate(d.getDate()-period.value);
	diagDate = date.value;
	thresholdDate = d.toISOString().slice(0,10);
	listRef = firebase.database().ref("diagnosis/" + userData.currentFarm);
	listRef.orderByChild("serviceDate").startAt("").endAt(thresholdDate).once("value").then( (snapshot)=>{
		snapshot.forEach( (childSnapshot)=>{
			if(!childSnapshot.child("result").exists()){
				row = table.insertRow(-1);
				row.setAttribute("data-id", childSnapshot.key);
                row.setAttribute("class", "newRow");
				for(i=0;i<7;i++){
					var cell = row.insertCell(i);
                    cell.innerHTML = i<4? (childSnapshot.child(serviceKeys[i]).val()||""):"";
				}
				makeDiagInput(row);
                for(i=0;i<serviceKeys.length;i++)
                    row.setAttribute("data-"+serviceKeys[i].toLowerCase(), childSnapshot.child(serviceKeys[i]).val());
			}
		});
	}).catch((error)=>{console.log(error)});
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
	});
	return btn;
}

function result(btn, row, text){
	row.setAttribute("class", "doneRow");
	row.setAttribute("data-diagresult", (text=="O"?"p":"n"));
	row.setAttribute("data-diaglocation", row.children[5].children[0].value);
	btn.closest("td").innerHTML = text;
	row.children[5].innerHTML = row.children[5].children[0].value;
	row.setAttribute("data-diagnote", row.children[6].children[0].value);
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
	row.children[4].innerHTML = "";
	row.children[5].innerHTML = "";
	var posBtn = makeBtn("O", result);
	row.children[4].appendChild(posBtn);
	var nbsp = document.createTextNode("\u00A0");
	row.children[4].appendChild(nbsp);
	var negBtn = makeBtn("X", result);
	row.children[4].appendChild(negBtn);

	row.children[5].setAttribute("style", "vertical-align:middle!important; padding:1px!important;");
	var locInput = document.createElement("input");
	locInput.setAttribute("type", "text");
	locInput.setAttribute("size", "1");
	row.children[5].appendChild(locInput);
	row.children[6].setAttribute("style", "vertical-align:middle!important; padding:1px!important;");
	row.children[6].innerHTML = "<input type='text' size='1'>"
}

function diagPromise(diagId, serviceData, diagData){
    // production : diagno
    var productionRef = firebase.database().ref("production/" + userData.currentFarm + "/" + serviceData.sowEar + "/" + serviceData.parity);
    const productionP = productionRef.update(diagData);
    promise_array.push(productionP);
    // diagnosisHistory : diagno & service
    var historyRef = firebase.database().ref("diagnosisHistory/" + userData.currentFarm + "/" + diagId);
    for(key in serviceData)
        diagData[key] = serviceData[key];
    const historyP = historyRef.set(diagData);
    promise_array.push(historyP);
    // parturition : service
    var parturitionRef = firebase.database().ref("parturition/" + userData.currentFarm + "/" + diagId);
    serviceData["sowLocation"] = diagData.diagLocation||serviceData.serviceLocation;
    serviceData["dueDate"] = diagData.dueDate;
    const parturitionP = parturitionRef.set(serviceData);
    promise_array.push(parturitionP);
    // remove : ""
	var diagRef = firebase.database().ref("diagnosis/" + userData.currentFarm + "/" + diagId);
	const p = diagRef.remove();
	promise_array.push(p);
    // log : date
    var logRef = firebase.database().ref("log/" + userData.currentFarm + "/" + serviceData.sowEar).push();
    const logP = logRef.set({date:diagData.diagDate, eventName:"diagnosis"});
    // sows : diagno
    var sowRef = firebase.database().ref("sows/" + userData.currentFarm + "/" + serviceData.sowEar);
    const sowP = sowRef.update({status:"d"+diagData.diagDate, lastDue:diagData.dueDate, location:serviceData.sowLocation});
    promise_array.push(sowP);
}

submitBtn.addEventListener("click", function(){
	for(i=0;i<table.children.length;i++){
		if(table.children[i].getAttribute('class')==="doneRow"){
			var diagId = table.children[i].getAttribute("data-id");
            var serviceObj = {};
            for(j=0;j<serviceKeys.length;j++)
                serviceObj[serviceKeys[j]] = table.children[i].getAttribute("data-"+serviceKeys[j].toLowerCase());
            d = new Date(serviceObj.serviceDate);
            d.setDate(d.getDate()+114);
            dueDate = d.toISOString().slice(0,10);
            var diagObj = {diagnosisDate:diagDate, dueDate:dueDate};
            for(j=0;j<diagnoKeys.length;j++)
                diagObj[diagnoKeys[j]] = table.children[i].getAttribute("data-"+diagnoKeys[j].toLowerCase());
			diagPromise(diagId, serviceObj, diagObj)
		}
	}
    var d = new Date();
    const timeP = firebase.database().ref("farms/" + userData.currentFarm + "/lastData").set(d.getTime());
    promise_array.push(timeP);
	Promise.all(promise_array).then( ()=>{
		window.location.replace(location.href)
	});
});
