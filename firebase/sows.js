var search = document.getElementById("search");
var dateRadio = document.getElementById("dateRadio");
var sowRadio = document.getElementById("boarRadio");
var date1 = document.getElementById("date1");
var date2 = document.getElementById("date2");
var singleDate = document.getElementById("singleDate");
var filter = document.getElementById("filter");
var query = document.getElementById("query");
var sortingKey = document.getElementById("sortingKey");
var keys = ["strain", "earmark", "registerNo", "birthday", "fatherNo", "motherNo", "location", "status", "note"]
var table = document.getElementById("tableBody");
var dataTable = "";
var dataList;
var sowRef;
var preview = document.getElementById("upload-files-display");
var fileInput = document.getElementById("file")
var upload = document.getElementById("upload");
var photo;
var Dropzone = $(".dropbox");
var DropInput = $(".box_input");
var droppedFiles = false;
var addProduction = document.getElementById("addProduction");
var productionTable = document.getElementById("productionTable");

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
    var sowId = document.getElementById("strain").value+document.getElementById("earmark");
	var sowRef = firebase.database().ref('/sows/'+userData.currentFarm+'/'+sowId);
	const p1 = sowRef.set({
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
		var photoRef = firebase.storage().ref(userData.currentFarm + "/sows/"+sowId+".png");
		const p2 = photoRef.put(photo);
		promise_array.push(p2)
	}
    // add production promise
    var productionKeys = ["boarEar", "litterStrain", "litterNo", "litterNote", "serviceDate", "diagnosisDate", "dueDate", 
                            "parturitionDate", "weanDate", "totalPiglet", "live", "mummy", "stillborn", "totalWeight", "weanWeight", "weanNumber"];
    var lastParity = 0
    var lastDate = {serviceDate:"", dueDate:"", parturitionDate:"", weanDate:""}
    for(i=0;i<productionTable.rows.length-1;i++){
        var parity = productionTable.rows[i].getAttribute("data-parity");
        if(parity){
            var productionObj = {}
            for(j=0;j<productionKeys.length;j++)
                productionObj[productionKeys[j]] = productionTable.rows[i].getAttribute("data-"+productionKeys[j]);
            var productionRef = firebase.database().ref("production/" + userData.currentFarm + "/" + sowId + "/" + parity);
            const productionPromise = productionRef.set(productionObj);
            promise_array.push(productionPromise);
            lastParity = Math.max(parseInt(parity), lastParity)
            lastKeys = ["serviceDate", "dueDate", "parturitionDate", "weanDate"];
            for(j=0;j<4;j++)
                if(lastDate[lastKeys[j]].localeComapre(productionObj[lastKeys[j]])<0){
                    lastDate[lastKeys[j]] = productionObj[lastKeys[j]];
                    lastDate["update"] = true;
                }
        }
    }
    if(lastParity){
        const lastP = firebase.database().ref("production/" + userData.currentFarm + "/" + sowId + "/parity").set(lastParity);
        promise_array.push(lastP);
    }
    if(lastDate.update){
        const lastDateP = firebase.database().ref("sows/" + userData.currentFarm + "/" + sowId).update(lastDate);
        promise_array.push(lastDateP);
    }
	Promise.all(promise_array).then(function(){
		console.log("新增母豬資料成功");
		window.location.replace("sow.html?id="+sowId);
	}).catch(function(err){
		console.error("新增母豬資料錯誤：",err);
	});
});

addProduction.addEventListener("click", function(){
    var row = productionTable.insertRow(0);
    var inputNames = [["胎次", "公豬", "品種", "胎號", "備註"], ["配種", "測孕", "預產", "分娩", "離乳"],
                        ["總仔", "活仔", "黑仔", "白仔"], ["出生窩重", "離乳窩重", "離乳仔數"]];
    var inputIds = [["parity", "boarEar", "litterStrain", "litterNo", "litterNote"], 
                    ["serviceDate", "diagnosisDate", "dueDate", "parturitionDate", "weanDate"],
                    ["totalPiglet", "live", "mummy", "stillborn"], ["totalWeight", "weanWeight", "weanNumber"]];
    for(i=0;i<inputNames.length;i++){
        var cell = row.insertCell(i);
        var ul = "<ul class='alt'>";
        for(j=0;j<inputIds[i].length;j++){
            var inputNode = document.getElementById(inputIds[i][j]);
            ul+="<li><span class='label'>"+inputNames[i][j]+"："+inputNode.value+"</span></li>";
            row.setAttribute("data-"+inputIds[i][j], inputNode.value);
            inputNode.value = "";
        }
        ul+="</ul>";
        cell.innerHTML = ul;
    }
    cancelBtn = document.createElement("span");
    cancelBtn.setAttribute("class", "small button alt");
    cancelBtn.innerHTML = "X";
    cancelBtn.addEventListener("click", function(){
        this.closest("tbody").removeChild(this.closest("tr"));
    });
    cancelDiv = document.createElement("div");
    cancelDiv.align = "center";
    cancelDiv.style.margin = "3em 0 0 0"
    cancelDiv.style.padding = "6px 5px 0 0"
    cancelDiv.appendChild(cancelBtn);
    cell.appendChild(cancelDiv);
});

search.addEventListener("submit", function(event){
	console.log(event);
	event.preventDefault();
	if(dateRadio.checked)
		ref = sowRef.orderByChild("birthday").startAt(date1.value).endAt(date2.value);
	else if(sowRadio.checked)
		if(filter.value==="location")
			ref = sowRef.orderByChild("loaction").startAt(query.value).endAt(query.value+"\uf8ff");
		else
			ref = sowRef.orderByChild(filter.value).equalTo(query.value);
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
	sowRef = firebase.database().ref("sows/" + userData.currentFarm);
	var ref = sowRef.orderByChild("unavailability").endAt("");
	getDataList(ref).then(function(){renderTable()});
}

function localDateStr(d){
	str = d.toLocaleDateString().split("/");
	yStr = str[0];
	mStr = ("0" + str[1]).slice(-2);
	dStr = ("0" + str[2]).slice(-2);
	return [yStr, mStr, dStr].join("-");
}

function daysFromNow(date){
    console.log(date);
    d0 = new Date();
    d0 = new Date(localDateStr(d0));
    d1 = new Date(date);
    a = Date.UTC(d0.getFullYear(), d0.getMonth(), d0.getDate())
    b = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate())
    return Math.floor((a-b)/(1000*60*60*24))
}

function getDataList(ref){
	dataList = [];
	return ref.once("value").then(function(snapshot){
		snapshot.forEach(function(childSnapshot){
			var data = [childSnapshot.key];
			for(i=0;i<keys.length;i++)
                if(keys[i]==="status"){
                    var stat = childSnapshot.child(keys[i]).val();
                    if(stat){
                        duration = daysFromNow(stat.slice(1));
                        if(stat[0]==='s')
                            data.push("配種"+duration+"天");
                        else if(stat[0]==='d')
                            data.push("懷孕"+duration+"天");
                        else if(stat[0]==='p')
                            data.push("哺乳"+duration+"天");
                        else if(stat[0]==='w')
                            data.push("空胎"+duration+"天");
                    }
                    else
                        data.push("")
                }
				else
					data.push((childSnapshot.child(keys[i]).val()||""));
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
    makeDataTable("#table");
}

$('#tableBody').on('click', 'tr', function () {
	var data = dataTable.row( this ).data();
	window.location='sow.html?id='+$(this).data("key");
});
