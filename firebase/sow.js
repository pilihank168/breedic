var ctx = document.getElementById('ctx').getContext("2d");
var url_string = window.location.href;
var url = new URL(url_string);
var id = url.searchParams.get("id");
var productionTable = document.getElementById("productionTable");
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
        editRef = firebase.database().ref("sows/" + userData.currentFarm + "/" + id);
        const p1 = editRef.update(newObj);
        promise_array.push(p1);
    }
    if(newPhoto){
		var photoRef = firebase.storage().ref(userData.currentFarm + "/sows/"+id+".png");
		const p2 = photoRef.put(newPhoto);
		promise_array.push(p2)
    }
    console.log(promise_array.length);
    if(promise_array){
        Promise.all(promise_array).then(function(){
            console.log("修改母豬資料成功");
            window.location.replace("sow.html?id="+id);
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

function renderProgressBar(currentStep, parturitionStep, weanStep, endStep, text){
    $('#progressBar').stepProgressBar({
        innerText: text,
        currentValue: currentStep,
        steps: [
            { value: 0, topLabel : '配種'}, //nearestService
            { value: currentStep, topLabel: '', bottomLabel:' '},
            { value: parturitionStep, topLabel: '分娩'}, //nearestParturition
            { topLabel: '離乳', value: weanStep,}, //nearestWean
            { value: endStep,  bottomLabel:' ',
            mouseOver: function() { alert('mouseOver'); },
            click: function() { alert('click'); }
            }
        ],
        unit: ''
    });
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
	detail2.children[2].children[0].innerHTML = "目前狀態：" + sowStatus(entry.status, entry.lastService, entry.lastDue, entry.lastParturition, entry.lastWean);
	detail2.children[3].children[0].innerHTML = "豬隻來源：" + (entry.source||"");
	detail2.children[4].children[0].innerHTML = "備註：" + (entry.note||"無");
    if(entry.score){
        document.getElementById("score").innerHTML = '分數：'+entry.score+'<a href="#" data-toggle="modal" data-target="#myModal">(檢視詳情)</a>'
        renderGenogramNode(entry.registerNo, entry.source, entry.score, entry.fatherNo, entry.motherNo);
    }
    else
        document.getElementById("score").innerHTML = '分數：未評'
    var photo = document.getElementById("photo");
	var photoRef = firebase.storage().ref(userData.currentFarm + "/sows/" + id + ".png");
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

function sowStatus(stat, lastService, lastDue, lastParturition, lastWean){
    if(stat){
        d0 = new Date();
        var todayDate = localDateStr(d0);
        var current = dateDistance(lastService, todayDate);
        var parturition = Math.max(dateDistance(lastService, lastParturition), dateDistance(lastService, lastDue), 0)||114;
        var wean = Math.max(dateDistance(lastService, lastWean), 0)||(parturition+21);
        var duration = dateDistance(stat.slice(1), todayDate);
        if(stat[0]==='s')
            statText = "配種"+duration+"天";
        else if(stat[0]==='d')
            statText = "懷孕"+duration+"天";
        else if(stat[0]==='p')
            statText = "哺乳"+duration+"天";
        else if(stat[0]==='w')
            statText = "空胎"+duration+"天";
        if(current)
            renderProgressBar(current, parturition, wean, Math.max(150, current), statText);
        return statText
    }
    else
        return ""
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
            var val = physicalObj[i][physicalKeys[j]];
            cell.innerHTML = val||"";
            if(j>0 && j<5)
                lineData[physicalKeys[j]].push({x:week, y:parseFloat(val)});
        }
	}
    renderLineChart("weight", "體重");
    console.log(lineChart);
}

function productionData(snapshot){
    snapshot.forEach( (childSnapshot)=>{
        //exphead
        expheadKeys = ["parity", "boarEar", "serviceDate", "parturitionDate", "duration", "litterNo",
                        "totalPiglet", "live", "mummy", "stillborn", "totalLitterWeight", "weanNum", "totalWeanWeight"];
        row = productionTable.insertRow(0);
        for(i=0;i<expheadKeys.length;i++){
            var cell = row.insertCell(i);
            if(expheadKeys[i]==="parity")
                cell.innerHTML = childSnapshot.key;
            else if(expheadKeys[i]==="duration"){
                d1 = childSnapshot.child("serviceDate").val();
                d2 = childSnapshot.child("parturitionDate").val();
                cell.innerHTML = (d1&&d2)?dateDistance(d1, d2):"";
            }
            else
                cell.innerHTML = childSnapshot.child(expheadKeys[i]).val()||"";
        }
        //expbody
        expbodyNames = [["測孕日期", "待產日期", "離乳日期"], ["正常", "弱", "小"], ["死總", "死亡", "壓"], ["弱(死)", "小(死)", "淘汰"]];
        expbodyKeys = [["diagnosisDate", "dueDate", "weanDate"], ["normal", "weak", "small"], 
                        ["totalDead", "dead", "lied"], ["weakDead", "smallDead", "eliminated"]];
        row = productionTable.insertRow(1);
        expbody = "<td colspan='13' style='padding:1em 3em!important; text-align:left!important;'><div class='row'>";
        for(i=0;i<expbodyKeys.length;i++){
			expbody += '<div class="3u 6u(narrower)"><ul class="alt" style="margin-left:0!important;">';
            for(j=0;j<expbodyKeys[i].length;j++)
                expbody += "<li>" + expbodyNames[i][j] + "：" + (childSnapshot.child(expbodyKeys[i][j]).val()||"0") + "</li>"
            expbody += '</ul></div>';
        }
        var note = childSnapshot.child("note").val();
        console.log(note||"無")
        expbody += '</div>備註：' + (childSnapshot.child("note").val()||"無") + '</td>';
        row.innerHTML = expbody;
    });
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
        var eventMap = {birth:"出生", weaned:"離乳為保育豬", transfer:"轉種豬", service:"配種", diagnosis:"測孕",
                        parturition:"分娩", wean:"離乳", export:"出豬", eliminate:"淘汰", died:"死亡"};
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
	var sowRef = firebase.database().ref("sows/" + userData.currentFarm + "/" + id);
	const p1 = sowRef.once("value");
	var productionRef = firebase.database().ref("production/" + userData.currentFarm + "/" + id).orderByChild("serviceDate").startAt("");
	const p2 = productionRef.once("value");
	var physicalRef = firebase.database().ref("physical/" + userData.currentFarm).orderByChild("earmark").equalTo(id);
	const p3 = physicalRef.once("value");
	var logRef = firebase.database().ref("log/" + userData.currentFarm + "/" + id).orderByChild("date");
	const p4 = logRef.once("value");
	Promise.all([p1, p2, p3, p4]).then((snapshot)=>{
        if(!snapshot[0].val()){
            window.location.replace("sowlist.html");
            alert("序號不存在！")
        }
		console.log(snapshot[2].val());
		basicData(snapshot[0]);
		productionData(snapshot[1]);
		physicalData(snapshot[2]);
		logData(snapshot[3]);
	}).catch((error)=>{
		console.log(error);
	});
}
