var search = document.getElementById("search");
var dateRadio = document.getElementById("dateRadio");
var boarRadio = document.getElementById("boarRadio");
var date1 = document.getElementById("date1");
var date2 = document.getElementById("date2");
var singleDate = document.getElementById("singleDate");
var filter = document.getElementById("filter");
var query = document.getElementById("query");
var sortingKey = document.getElementById("sortingKey");
var keys = ["strain", "earmark", "registerNo", "birthday", "location", "semenAvailability", "lastSemen", "note"]
var table = document.getElementById("tableBody");
var dataTable = "";
var dataList;
var boarRef;
var preview = document.getElementById("upload-files-display");
var fileInput = document.getElementById("file")
var upload = document.getElementById("upload");
var photo;
var Dropzone = $(".dropbox");
var DropInput = $(".box_input");
var droppedFiles = false;

Dropzone.on('drag dragstart dragend dragover dragenter dragleave drop', function(e){
   e.preventDefault();
   e.stopPropagation();
}).on('dragover dragenter', function(){
   DropInput.addClass('dragover');
}).on('dragleave dragend drop', function(){
   DropInput.removeClass('dragover');
}).on('drop', function(e){
   droppedFiles = e.originalEvent.dataTransfer.files;
   previewPhoto(droppedFiles[0]);
});

fileInput.addEventListener('change', function(e) {
    console.log(document.getElementById("fileLabel").style.display);
	var file = fileInput.files[0];
    previewPhoto(fileInput.files[0]);
});

function previewPhoto(file){
    photo = file
    preview.innerHTML = file.name;
	var imageType = /image.*/;
	if (photo.type.match(imageType)) {
		var reader = new FileReader();
		reader.onload = function(e) {
            var img = new Image();
			img.style.width = "100%";
			img.src = reader.result;
			preview.appendChild(img);
            var cancel = document.createElement("a");
            cancel.innerHTML = "取消"
            cancel.addEventListener("click", function(){
                preview.innerHTML = "";
                photo = "";
                document.getElementById("fileLabel").style.display = "inherit";
            });
            preview.appendChild(cancel);
            document.getElementById("fileLabel").style.display = "none";
		}
		reader.readAsDataURL(photo);
	} else {
		preview.innerHTML = "檔案格式不符(非圖片)"
	}
}

upload.addEventListener("submit", function(e){
    e.preventDefault();
    document.getElementById("submitBtn").disabled=true;
    document.getElementById("submitBtn").value="上傳中";
    var boarId = document.getElementById("strain").value+document.getElementById("earmark");
	var boarRef = firebase.database().ref('boars/'+userData.currentFarm + '/' + boarId);
	const p1 = boarRef.set({
		earmark:document.getElementById("earmark").value,
		strain:document.getElementById("strain").value,
        registerNo:document.getElementById("registerNo").value,
		birthday:document.getElementById("birthday").value,
		fatherEar:document.getElementById("fatherEar").value,
		fatherNo:document.getElementById("fatherNo").value,
		motherEar:document.getElementById("motherEar").value,
		motherNo:document.getElementById("motherNo").value,
		position:document.getElementById("location").value,
		source:document.getElementById("source.value"),
		note:document.getElementById("note").value
	});
	var promise_array = [p1];
	if(photo){
		var photoRef = firebase.storage().ref("boars/" + userData.currentFarm + "/" +boarId+".png");
		const p2 = photoRef.put(photo);
		promise_array.push(p2)
	}
    var sexRef = firebase.database().ref("sex/" + userData.currentFarm + "/" + sowId);
    const sexP = sexRef.set("boar");
    promise_array.push(sexP);
	Promise.all(promise_array).then(function(){
		console.log("新增公豬資料成功");
		window.location.replace("boardata.html?id="+boarId);
	}).catch(function(err){
		console.error("新增公豬資料錯誤：",err);
	});
});

search.addEventListener("submit", function(event){
	console.log(event);
	event.preventDefault();
	if(dateRadio.checked)
		ref = boarRef.orderByChild("birthday").startAt(date1.value).endAt(date2.value);
	else if(boarRadio.checked)
		if(filter.value==="location")
			ref = boarRef.orderByChild("loaction").startAt(query.value).endAt(query.value+"\uf8ff");
		else
			ref = boarRef.orderByChild(filter.value).equalTo(query.value);
	getDataList(ref).then(function(){
	    $('#table').css('visibility', 'hidden');
        dataTable.destroy();
        renderTable()
    });
});

sortingKey.addEventListener("change", function(){
	$('#table').css('visibility', 'hidden');
    dataTable.destroy();
	renderTable();
});

function initPage(){
	singleDateEvent(date1, date2, singleDate);
	boarRef = firebase.database().ref("boars/" + userData.currentFarm);
	var ref = boarRef.orderByChild("unavailability").endAt("");
	getDataList(ref).then(function(){renderTable();});
}

function getDataList(ref){
	dataList = [];
	return ref.once("value").then(function(snapshot){
		snapshot.forEach(function(childSnapshot){
			var data = [childSnapshot.key];
			for(i=0;i<keys.length;i++){
                if(keys[i]==="semenAvailability")
                    data.push(childSnapshot.child(keys[i]).val()?(childSnapshot.child(keys[i]).val()==="pos"?"可用":"不可用"):"");
                else
    				data.push((childSnapshot.child(keys[i]).val()||""));
            }
			dataList.push(data);
		});
	});
}

function renderTable(){
	table.innerHTML = "";
	dataList.sort(function(a,b){
		key = parseInt(sortingKey.value);
		return a[key].localeCompare(b[key])
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
