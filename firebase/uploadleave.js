var inputRow = document.getElementById("inputRow");
var table = document.getElementById("tableBody");
var form = document.getElementById("form");
var upload = document.getElementById("upload");
var d = new Date();
var promise_array=[];
var todayDate;

function localDateStr(d){
	str = d.toLocaleDateString().split("/");
	yStr = str[0];
	mStr = ("0" + str[1]).slice(-2);
	dStr = ("0" + str[2]).slice(-2);
	return [yStr, mStr, dStr].join("-");
}

function initPage(){
	todayDate = localDateStr(d);
    inputRow.children[0].children[0].value=todayDate;
}

upload.addEventListener("click", ()=>{
    var sexRef = firebase.database().ref("sex/" + userData.currentFarm);
    sexRef.once("value").then( (snapshot)=>{
        sexData = snapshot.val();
        for(i=0;i<table.children.length-1;i++){
            if(table.children[i].getAttribute('class')=="newRow"){
                leavePromise(table.children[i], sexData);
            }
        }
        var d = new Date();
        const timeP = firebase.database().ref("farms/" + userData.currentFarm + "/lastData").set(d.getTime());
        promise_array.push(timeP);
        return Promise.all(promise_array);
    }).then( ()=>{
		window.location.replace(location.href)
	});
});

function leavePromise(row, sexData){
	leaveRef = firebase.database().ref("leave/" + userData.currentFarm + "/").push();
    leaveObj = {
		date:row.children[0].innerHTML,
		earmark:row.children[1].innerHTML,
		type:(row.children[2].innerHTML==='死亡'?'dead':'eliminated'),
		note:row.children[3].innerHTML
    };
	const p = leaveRef.set(leaveObj);
	promise_array.push(p);
    if(sexData[leaveObj.earmark]==="boar"){
        var boarRef = firebase.database().ref("boars/" + userData.currentFarm + "/" + leaveObj.earmark + "/unvavailability");
        const boarP = boarRef.set(leaveObj.type);
        promise_array.push(boarP);
    }
    else if(sexData[leaveObj.earmark]==="sow"){
        var sowRef = firebase.database().ref("sows/" + userData.currentFarm + "/" + leaveObj.earmark + "/unvavailability");
        const sowP = sowRef.set(leaveObj.type);
        promise_array.push(sowP);
    }
    else{
        weanerRef = firebase.database().ref("weaners/" + userData.currentFarm + "/" + leaveObj.earmark + "/status");
        weanerP = weanerRef.set(leaveObj.type);
        promise_array.push(weanerP);
    }
    if(sexData[leaveObj.earmark]){
        logRef = firebase.database().ref("log/" + userData.currentFarm + "/" + leaveObj["earmark"]).push();
        logP = logRef.set({date:date.value, eventName:"leave"});
        promise_array.push(logP);
    }
}

form.addEventListener("submit", (event)=>{
	event.preventDefault();
    // insert new row and clear input field
	var newRow = table.insertRow(table.rows.length-1);
	newRow.setAttribute('class', 'newRow');
	for(i=0;i<inputRow.children.length-1;i++){
		var cell = newRow.insertCell(i);
		cell.innerHTML = i!=2?inputRow.children[i].children[0].value:(document.getElementById("dead").checked?"死亡":"淘汰");
	}
    inputRow.children[0].children[0].value=todayDate;
    inputRow.children[1].children[0].value='';
    inputRow.children[3].children[0].value='';
	var cell = newRow.insertCell(inputRow.children.length-1);
    // insert delete button into new row
	var deleteBtn = document.createElement('span');
	deleteBtn.setAttribute("class", "button small alt");
	deleteBtn.innerHTML = "×";
	deleteBtn.addEventListener("click", function(){
		this.closest("tbody").removeChild(this.closest("tr"));
	});
	cell.appendChild(deleteBtn);
    // focus on the beggining of input row
	inputRow.children[0].children[0].focus();
});
