var row = document.getElementById("inputRow");
var add = document.getElementById("addBtn");
var date = document.getElementById("date");
var table = document.getElementById("tableBody");
var form = document.getElementById("form");
var upload = document.getElementById("upload");
var uploaded = false;
var info = document.getElementById("relatedInfo");
var count = 0;
var countNew = 0;
var promise_array = [];
var sync_array = [];

function initPage(){
	var url_string = window.location.href;
	var url = new URL(url_string);
	date.value = url.searchParams.get("date");
	loadExistedData();
}

function counterDisplay(k){
	var d = new Date(date.value);
	d.setDate(d.getDate()+114);
	info.innerHTML = ("，預產期：" + d.getFullYear().toString() + "年" + (d.getMonth()+1).toString() + 
						"月" + d.getDate().toString() + "日，已配種母豬：" + count.toString() );
	countNew += k;
	if(countNew > 0)
		info.innerHTML += "，預計新增" + countNew.toString() + "隻";
}

function loadExistedData(){
	while(table.rows.length>1)
		table.removeChild(table.rows[0]);
	count = 0;
	keyArray = ["sowEar", "sowNo", "serviceLocation", "boarEar", "boarNo", "serviceNumber"];
	var listRef = firebase.database().ref("service/" + userData.currentFarm + "/" + date.value + "/").orderByChild("sowEar");
	listRef.once('value').then(function(snapshot){
		snapshot.forEach(function(childSnapshot){
			count += 1;
			var row = table.insertRow(table.rows.length-1);
			for(i=0;i<keyArray.length;i++){
				var cell = row.insertCell(i);
				cell.innerHTML = childSnapshot.child(keyArray[i]).val()
			}
			row.insertCell(-1);
		});
	}).then(function(){
		counterDisplay(0);
	});
}

function servicePromise(row){
    var serviceDate = date.value;
    var motherEar = row.children[0].innerHTML;
    var fatherEar = row.children[3].innerHTML;
    var productionId = [serviceDate, motherEar, fatherEar].join("-");
	serviceRef = firebase.database().ref("service/" + userData.currentFarm + "/" + serviceDate + "/" + productionId);
	const p = serviceRef.set({
		sowEar:row.children[0].innerHTML,
		sowNo:row.children[1].innerHTML,
		serviceLocation:row.children[2].innerHTML,
		boarEar:row.children[3].innerHTML,
		boarNo:row.children[4].innerHTML,
		serviceNumber:row.children[5].innerHTML,
		parity:''
	});
	promise_array.push(p);
    // logP and sowP
    logRef = firebase.database().ref("log/" + userData.currentFarm + "/" + motherEar).push();
    logP = logRef.set({date:serviceDate, eventName:"service"});
    promise_array.push(logP);
    sowRef = firebase.database().ref("sows/" + userData.currentFarm + "/" + motherEar);
    sowP = sowRef.update({status:"s"+serviceDate, location:row.children[2].innerHTML, lastService:serviceDate});
    promise_array.push(sowP);
    sync_array.push({id:productionId, date:serviceDate});
}

date.addEventListener('change', function(){
	loadExistedData();
});

upload.addEventListener("click", ()=>{
    if(uploaded)
        return
    uploaded = true;
    var newData = false;
    upload.setAttribute("class", "disabled button");
    upload.innerHTML = "上傳中";
	[yStr, mStr, dStr] = date.value.split("-");
	countRef = firebase.database().ref("calendar/" + userData.currentFarm + "/" + yStr + "/" + mStr + "/" + dStr + "/");
	const p0 = countRef.set(count+countNew);
	promise_array.push(p0);
	for(i=0;i<table.children.length-1;i++){
		if(table.children[i].getAttribute('class')=="newRow"){
			servicePromise(table.children[i]);
            newData = true;
		}
	}
    if(newData){
        var d = new Date();
        const timeP = firebase.database().ref("farms/" + userData.currentFarm + "/lastData").set(d.getTime());
        promise_array.push(timeP);
    }
	Promise.all(promise_array).then( ()=>{
        var sync_promise = [];
        newService = firebase.functions().httpsCallable('newService');
        sync_array.forEach((syncObj)=>{
            sync_promise.push(newService(syncObj));
        });
        return Promise.all(sync_promise)
    }).then(()=>{
		window.location.replace(location.href)
	}).catch((error)=>console.log(error));
});

form.addEventListener("submit", (event)=>{
	event.preventDefault();
	var newRow = table.insertRow(table.rows.length-1);
	newRow.setAttribute('class', 'newRow');
	for(i=0;i<row.children.length-1;i++){
		cell = newRow.insertCell(i);
		cell.innerHTML = row.children[i].children[0].value;
		row.children[i].children[0].value='';
	}
	var cell = newRow.insertCell(row.children.length-1);
	var deleteBtn = document.createElement('span');
	deleteBtn.setAttribute("class", "button small alt");
	deleteBtn.innerHTML = "×";
	deleteBtn.addEventListener("click", function(){
		this.closest("tbody").removeChild(this.closest("tr"));
		counterDisplay(-1);
	});
	cell.appendChild(deleteBtn);
	counterDisplay(1);
	row.children[0].children[0].focus();
});
