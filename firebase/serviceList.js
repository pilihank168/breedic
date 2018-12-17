var row = document.getElementById("inputRow");
var add = document.getElementById("addBtn");
var date = document.getElementById("date");
var table = document.getElementById("tableBody");
var form = document.getElementById("form");
var upload = document.getElementById("upload");
var info = document.getElementById("relatedInfo");
var count = 0;
var countNew = 0;
var promise_array = [];

function initPage(){
	var url_string = window.location.href;
	var url = new URL(url_string);
	date.value = url.searchParams.get("date");
	loadExistedData();
}

function counterDisplay(k){
	var d = new Date(date.value);
	d.setDate(d.getDate()+114);
	info.innerHTML = ("預產期：" + d.getFullYear().toString() + "年" + (d.getMonth()+1).toString() + 
						"月" + d.getDate().toString() + "日，已配種母豬：" + count.toString() );
	countNew += k;
	if(countNew > 0)
		info.innerHTML += "，預計新增" + countNew.toString() + "隻";
}

function loadExistedData(){
	count = 0;
	keyArray = ["sowEarmark", "sowRegisterNo", "sowLocation", "boarEarmark", "boarRegisterNo", "number"];
	var listRef = firebase.database().ref("service/" + userData.currentFarm + "/" + date.value + "/").orderByChild("sowEarmark");
	listRef.once('value').then(function(snapshot){
		snapshot.forEach(function(childSnapshot){
			console.log(0);
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
	serviceRef = firebase.database().ref("service/" + userData.currentFarm + "/" + date.value + "/").push();
	const p = serviceRef.set({
		sowEarmark:row.children[0].innerHTML,
		sowRegisterNo:row.children[1].innerHTML,
		sowLocation:row.children[2].innerHTML,
		boarEarmark:row.children[3].innerHTML,
		boarRegisterNo:row.children[4].innerHTML,
		number:row.children[5].innerHTML,
		parity:''
	});
	promise_array.push(p);
}

date.addEventListener('change', function(){
	loadExistedData();
});

upload.addEventListener("click", ()=>{
	[yStr, mStr, dStr] = date.value.split("-");
	countRef = firebase.database().ref("calendar/" + userData.currentFarm + "/" + yStr + "/" + mStr + "/" + dStr + "/");
	const p0 = countRef.set(count+countNew);
	promise_array.push(p0);
	for(i=0;i<table.children.length-1;i++){
		if(table.children[i].getAttribute('class')=="newRow"){
			servicePromise(table.children[i]);
		}
	}
	Promise.all(promise_array).then( ()=>{
		window.location.replace(location.href)
	});
});

form.addEventListener("submit", (event)=>{
	event.preventDefault();
	console.log(table);
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
