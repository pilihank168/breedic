var ctx = document.getElementById('ctx').getContext("2d");
var url_string = window.location.href;
var url = new URL(url_string);
var id = url.searchParams.get("id");
var semenTable = document.getElementById("semenTable");
var physicalTable = document.getElementById("physicalTable");
var physicalObj = []
var lineData = {weight:[], fat:[], surface:[], depth:[], week:[]}
var lineChart;
var edit = document.getElementById("edit");
var preview = document.getElementById("upload-files-display");
var fileInput = document.getElementById("file")
var newPhoto;
var Dropzone = $(".dropbox");
var DropInput = $(".box_input");
var droppedFiles = false;

edit.addEventListener("submit", function(e){
    e.preventDefault();
    document.getElementById("submitBtn").disabled=true;
    document.getElementById("submitBtn").value="上傳中";
    newLocation = document.getElementById("location");
    newNote = document.getElementById("note");
    var promise_array = [];
    if(newLocation.value||newNote.value){
        newObj = {}
        if(newLocation.value)
            newObj["location"] = newLocation.value;
        if(newNote.value)
            newObj["note"] = newNote.value;
        editRef = firebase.database().ref("boars/" + userData.currentFarm + "/" + id);
        const p1 = editRef.update(newObj);
        promise_array.push(p1);
    }
    if(newPhoto){
		var photoRef = firebase.storage().ref("boars/" + userData.currentFarm + "/"+id+".png");
		const p2 = photoRef.put(newPhoto);
		promise_array.push(p2)
    }
    console.log(promise_array.length);
    if(promise_array){
        Promise.all(promise_array).then(function(){
            console.log("修改母豬資料成功");
            window.location.replace("boar.html?id="+id);
        }).catch(function(err){
            console.error("修改母豬資料錯誤：",err);
        });
    }
    else{
        ("#editModal").modal("toggle");
    }
});

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
    newPhoto = file
    preview.innerHTML = file.name;
	var imageType = /image.*/;
	if (newPhoto.type.match(imageType)) {
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
                newPhoto = "";
                document.getElementById("fileLabel").style.display = "inherit";
            });
            preview.appendChild(cancel);
            document.getElementById("fileLabel").style.display = "none";
		}
		reader.readAsDataURL(newPhoto);
	} else {
		preview.innerHTML = "檔案格式不符(非圖片)"
	}
}

$('.lineChart').on('click', '', function(){
	$('.lineChart.special').not($(this)).toggleClass("special").toggleClass("alt");
	$(this).toggleClass("special").toggleClass("alt");
	renderLineChart($(this).data("line"), $(this).data("name"));
});

function semenStatus(date, availability){
    if(date){
        if(availability)
            return date+"("+(availability==="pos"?"可用":"不可")+")";
        return date
    }
    return ""
}

function basicData(snapshot){
	entry = snapshot.val()
	detail1.children[0].children[0].innerHTML = "品種：" + (entry.strain||"");
	detail1.children[1].children[0].innerHTML = "耳號：" + (entry.earmark||"");
	detail1.children[2].children[0].innerHTML = "序號：" + (entry.registerNo||"");
	detail1.children[3].children[0].innerHTML = "生日：" + (entry.birthday||"");
	detail1.children[4].children[0].innerHTML = "位置：" + (entry.location||"");
	detail2.children[0].children[0].innerHTML = "父畜序號：" + (entry.fatherNo||"");
	detail2.children[1].children[0].innerHTML = "母畜序號：" + (entry.motherNo||"");
	detail2.children[2].children[0].innerHTML = "前次採精：" + semenStatus(entry.lastSemen, entry.semenAvailability);
	detail2.children[3].children[0].innerHTML = "豬隻來源：" + (entry.source||"");
	detail2.children[4].children[0].innerHTML = "備註：" + (entry.note||"無");
    console.log(entry.lastSemen, entry.semenAvailability,([(entry.lastSemen||""), (entry.semenAvailability||"")].join("，")));
    if(entry.score){
        document.getElementById("score").innerHTML = '分數：'+entry.score+'<a href="#" data-toggle="modal" data-target="#myModal">(檢視詳情)</a>'
        renderGenogramNode(entry.registerNo, entry.source, entry.score, entry.fatherNo, entry.motherNo);
    }
    else
        document.getElementById("score").innerHTML = '分數：未評'
    var photo = document.getElementById("photo");
	var photoRef = firebase.storage().ref("boars/" + userData.currentFarm + "/" + id + ".png");
	photoRef.getDownloadURL().then( (url)=>{photo.src = url}).catch( (error)=>{photo.src="";console.log(error)});
}

function localDateStr(d){
	str = d.toLocaleDateString().split("/");
	yStr = str[0];
	mStr = ("0" + str[1]).slice(-2);
	dStr = ("0" + str[2]).slice(-2);
	return [yStr, mStr, dStr].join("-");
}

function dateDistance(date1, date2){
    d0 = new Date(date1);
    d1 = new Date(date2);
    a = Date.UTC(d0.getFullYear(), d0.getMonth(), d0.getDate())
    b = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate())
    return Math.floor((b-a)/(1000*60*60*24))
}

function physicalData(snapshot){
        console.log(snapshot.val());
	snapshot.forEach( (childSnapshot)=>{
		physicalObj.push(childSnapshot.val())
	});
	physicalObj.sort(function(a,b){
		d_a = new Date(a.date);
		d_b = new Date(b.date);
		return d_a-d_b;
	});
    var physicalKeys = ["date", "weight", "fat", "depth", "surface", "note"];
	for(i=0;i<physicalObj.length;i++){
        var row = physicalTable.insertRow(0);
        var week = weeksFromBirth("2018-10-01", physicalObj[i]["date"]);
        lineData["week"].push(week);
        for(j=0;j<physicalKeys.length;j++){
            var cell = row.insertCell(j);
            var val = parseFloat(physicalObj[i][physicalKeys[j]]);
            cell.innerHTML = val||"";
            if(j>0 && j<5 && val)
                lineData[physicalKeys[j]].push({x:week, y:parseFloat(val)});
                lineData[physicalKeys[j]].push({x:week, y:val});
        }
	}
    renderLineChart("weight", "體重");
    console.log(lineChart);
}

function semenData(snapshot){
    var expheadKeys = ["earmark", "volume", "concentration", "activity", "abnormalities", "acrosome", "midpiece", "dilute", "available", "note"];
    var semenObj = [];
    snapshot.forEach( (childSnapshot)=>{
        semenObj.push(childSnapshot.val());
    });
    semenObj.sort(function(a, b){
        d_a = new Date(a.date);
        d_b = new Date(b.date);
        return d_a-d_b;
    });
    for(i=0;i<semenObj.length;i++){
        //exphead
        row = semenTable.insertRow(0);
        for(j=0;j<expheadKeys.length;j++){
            var cell = row.insertCell(i);
            cell.innerHTML = semenObj[i][expheadKeys[j]]||"";
        }
        //expbody
        row = semenTable.insertRow(1);
        console.log(semenObj[i].sows);
        var sows = Object.keys(semenObj[i].sows);
        row.innerHTML = "<td colspan='13' style='padding:1em 3em!important; text-align:left!important;'>配種母豬："+sows.join("、")+"</td>";
    };
    $('.exptable tbody tr:nth-child(odd)').on('click', '', function () {
        $(".exphead").not($(this)).toggleClass("exphead");
        $(".expbody").not($(this).next()).toggleClass("expbody");
        $(this).toggleClass("exphead");
        $(this).next().toggleClass("expbody");
    });

}

function logData(snapshot){
    console.log(snapshot.val());
    logTable = document.getElementById("log");
    snapshot.forEach( (childSnapshot)=>{
        var entry = childSnapshot.val()
        var row = logTable.insertRow(0)
        var cell = row.insertCell(0)
        var eventMap = {birth:"出生", weaned:"離乳為保育豬", transfer:"轉種豬", physical:"體測", semen:"採精",
                        export:"出豬", eliminate:"淘汰", dead:"死亡"};
        cell.innerHTML = [entry.date, eventMap[entry.eventName]].join(" ");
    });
}

function renderLineChart(dataKey, name){
    console.log(lineData[dataKey], dataKey);
    if(lineChart)
        lineChart.destroy();
    lineChart = renderChart(ctx, lineData["week"], lineData[dataKey], name);
}

function renderGenogramNode(registerNo, source, score, fatherNo, motherNo){
    fillNode("self", registerNo, source, score, '');
    var parentP = [];
    var parentNode = [];
    var gparentNode = [];
    if(fatherNo){
        fatherRef = firebase.database().ref("boars/" + userData.currentFarm).orderByChild("registerNo").equalTo(fatherNo).limitToFirst(1);
        const fatherP = fatherRef.once("value");
        parentP.push(fatherP);
       parentNode.push("father");
    }
    if(motherNo){
        motherRef = firebase.database().ref("sows/" + userData.currentFarm).orderByChild("registerNo").equalTo(motherNo).limitToFirst(1);
        const motherP = motherRef.once("value");
        parentP.push(motherP);
        parentNode.push("mother");
    }
    Promise.all(parentP).then( (snapshot)=>{
        gparentsP = [];
        for(i=0;i<parentNode.length;i++){
            var entry;
            var parentId;
            snapshot[i].forEach( (childSnapshot)=>{
                entry = childSnapshot.val();
                parentId = childSnapshot.key;
                return true;
            });
            if(entry){
                fillNode(parentNode[i], entry.registerNo, entry.source, entry.score, parentNode[i]==="father"?"boar":"sow", parentId);
                if(entry.fatherNo){
                    gfatherRef = firebase.database().ref("boars/"+userData.currentFarm).orderByChild("registerNo").equalTo(entry.fatherNo).limitToFirst(1)
                    const gfatherP = gfatherRef.once("value");
                    gparentsP.push(gfatherP);
                    gparentNode.push((parentNode[i]==="father"?"fgfather":"mgfather"));
                }
                if(entry.motherNo){
                    gmotherRef = firebase.database().ref("sows/"+userData.currentFarm).orderByChild("registerNo").equalTo(entry.motherNo).limitToFirst(1)
                    const gmotherP = gmotherRef.once("value");
                    gparentsP.push(gmotherP);
                    gparentNode.push((parentNode[i]==="father"?"fgmother":"mgmother"));
                }
            }
        }
        return Promise.all(gparentsP);
    }).then( (snapshot)=>{
        for(i=0;i<gparentNode.length;i++){
            snapshot[i].forEach( (childSnapshot)=>{
                entry = childSnapshot.val();
                fillNode(gparentNode[i], entry.registerNo, entry.source, entry.score, gparentNode[i].slice(2)==="father"?"boar":"sow", childSnapshot.key);
            });
        }
    });
}

function weeksFromBirth(birthDate, date){
    d0 = new Date(birthDate);
    d1 = new Date(date);
    a = Date.UTC(d0.getFullYear(), d0.getMonth(), d0.getDate())
    b = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate())
    return Math.floor((b-a)/(1000*60*60*24*7))
}

function initPage(){
	var boarRef = firebase.database().ref("boars/" + userData.currentFarm + "/" + id);
	const p1 = boarRef.once("value");
	var semenRef = firebase.database().ref("semen/" + userData.currentFarm).orderByChild("earmark").equalTo(id);
	const p2 = semenRef.once("value");
	var physicalRef = firebase.database().ref("physical/" + userData.currentFarm).orderByChild("earmark").equalTo(id);
	const p3 = physicalRef.once("value");
	var logRef = firebase.database().ref("log/" + userData.currentFarm + "/" + id).orderByChild("date");
	const p4 = logRef.once("value");
	Promise.all([p1, p2, p3, p4]).then((snapshot)=>{
        if(!snapshot[0].val()){
            window.location.replace("boarlist.html");
            alert("序號不存在！")
        }
		console.log(snapshot[2].val());
		basicData(snapshot[0]);
		semenData(snapshot[1]);
		physicalData(snapshot[2]);
		logData(snapshot[3]);
	}).catch((error)=>{
		console.log(error);
	});
}
