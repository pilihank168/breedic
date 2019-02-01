farmInfo = document.getElementById("farmInfo");
var url_string = window.location.href;
var url = new URL(url_string);
var farmNo = url.searchParams.get("farm");
var table = document.getElementById("tableBody")
var preview = document.getElementById("upload-files-display");
var newFile = null;
var newFileType = document.getElementById("filters");
var fileCounter = {"report":0, "recommend":0, "score":0};

var keys = ["date", "type", "fileName", "availability", "issue", "issueTime", "response", "responseTime"];
var dataList = [];
var date1 = document.getElementById("date1");
var date2 = document.getElementById("date2");
var downloadBtn = document.getElementById("download");

function initPage(){
    farmRef = firebase.database().ref("farms/" + farmNo);
    ownerRef = firebase.database().ref("owners/");
    analysisRef = firebase.database().ref("analysis/" + farmNo);
    const initP = [farmRef.once("value"), ownerRef.once("value"), analysisRef.once("value")];
    Promise.all(initP).then(function(snapshot){
        owners = snapshot[1].val();
        farmInfo.innerHTML = farmNo + "號豬場：" + snapshot[0].child("name").val() + "(負責人-" + owners[snapshot[0].child("owner").val()].name + ")";
        snapshot[2].forEach((childSnapshot)=>{
            data = [childSnapshot.key];
            keys.forEach((key)=>{
                data.push(childSnapshot.child(key).val()||"");
            });
            dataList.push(data);
        });
        renderTable();
    }).catch((error)=>{console.log(error)});
}

function filePreviewer(file){
    newFile = file;
    preview.innerHTML = file.name;
    var cancel = document.createElement("a");
    cancel.innerHTML = "(取消)"
    cancel.addEventListener("click", function(){
        preview.innerHTML = "";
        newFile = null;
        document.getElementById("fileLabel").style.display = "inherit";
    });
    preview.appendChild(cancel);
    document.getElementById("fileLabel").style.display = "none";
}

// upload
document.getElementById("upload").addEventListener("submit", function(e){
    e.preventDefault();
    d = new Date();
    todayDate = localDateStr(d);
    if(newFile){
        document.getElementById("submitBtn").disabled=true;
        document.getElementById("submitBtn").value="上傳中";
        var promise_array = [];
        // decide ref & key
        if(typeReport.checked){
            ref = todayDate + "-report-" + (fileCounter["report"]+1).toString();
            newFileType = "report";
        }
        else if(typeRecommend.checked){
            ref = todayDate + "-recommend-" + (fileCounter["recommend"]+1).toString();
            newFileType = "recommend";
        }
        else{
            ref = todayDate + "-score-" + (fileCounter["score"]+1).toString();
            newFileType = "score";
            parseFromCSV(newFile).then((results)=>{
                var scoreObj = {};
                for(i=1;i<results.data.length;i++){
                    if(results.data[i][1]==="F")
                        scoreObj["sows/" + farmNo + "/" + results.data[i][0] + "/score" ] = results.data[i][2];
                    else
                        scoreObj["boars/" + farmNo + "/" + results.data[i][0] + "/score" ] = results.data[i][2];
                }
                promise_array.push(firebase.database().ref().update(scoreObj));
            }).catch(error=>console.log(error));
        }
        // upload and write db
        const storageP = firebase.storage().ref("analysis/" + farmNo + "/" + ref).put(newFile);
        const databaseP = firebase.database().ref("analysis/" + farmNo + "/" + ref).set({
            date:todayDate,
            type:newFileType,
            fileName:document.getElementById("newFileName").value,
            availability: uploadNo.checked?"none":newFileType
        });
        const timeP = firebase.database().ref("farms/" + farmNo + "/lastAnalysis").set(d.getTime());
        promise_array.push(storageP);
        promise_array.push(databaseP);
        promise_array.push(timeP);
        Promise.all(promise_array).then(()=>{
            newFile = null;
            window.location.replace(location.href)
        });
    }
    else{
        //handle no file
        alert("並未選取檔案");
    }
});

// generate
document.getElementById("downloadModal").addEventListener("click", function(){
    date1.value = "";
    date2.value = "";
    downloadBtn.setAttribute("class", "button disabled");
    $("#myModal1").modal("toggle");
});

var sowFields = ["母豬品種", "母豬耳號", "母豬序號", "出生日期", "父畜耳號", "父畜序號", "母畜耳號", "母畜序號",
                "配種日期", "胎次", "與配公豬序號", "配種位置", "分娩日期", "分娩位置", "仔豬品種", "胎號", "總仔", "死總", "死亡", "黑", "白", "壓", 
        "弱", "小", "活總", "正常", "弱", "小", "代養", "代養(+)", "代養(-)", "出生窩重", "哺乳頭數", "離乳日期", "離乳頭數", "離乳窩重", "淘汰", "備註"];
var productionKeys = ["boarNo", "serviceLocation", "partDate", "partLocation", "strain", "litterNo", "totalPiglet", "totalDead",
                    "dead", "mummy", "stillborn", "lied", "weakDead", "smallDead", "live", "normal", "weak", "small", "fostering", "fosteringPlus",
                    "fosteringMinus", "totalLitterWeight", "litterNumber", "weanDate", "weanNumber", "totalWeanWeight", "eliminated", "note"];
var boarFields = ["公豬品種", "公豬耳號", "公豬序號", "出生日期", "父畜耳號", "父畜序號", "母畜耳號", "母畜序號", "採精次數",
                    "採精日期", "精液量", "精液濃度", "活力", "畸形", "頭頸", "中片", "稀釋數", "可用", "備註"];
var pigKeys = ["strain", "earmark", "registerNo", "birthday", "fatherEar", "fatherNo", "motherEar", "motherNo"];
var semenKeys = ["date", "volume", "concentration", "activity", "abnormalities", "acrosome", "midpiece", "dilute", "available", "note"];
document.getElementById("generate").addEventListener("click", function(){
    // query data
    if(document.getElementById("sow").checked){
        const sowP1 = firebase.database().ref("sows/" + farmNo).orderByChild("birthday").startAt(date1.value).endAt(date2.value).once("value");
        const sowP2 = firebase.database().ref("sows/" + farmNo).orderByChild("birthday").endAt("").once("value");
        var sowData = [];
        var productionPromises = [];
        Promise.all([sowP1, sowP2]).then(function(snapshots){
            snapshots.forEach(function(snapshot){
                snapshot.forEach(function(childSnapshot){
                    //get sow entry
                    var data = [];
                    pigKeys.forEach(function(key){
                        data.push(childSnapshot.child(key).val());
                    });
                    sowData.push(data);
                    //make promise
                    productionPromises.push(firebase.database().ref("production/"+farmNo+"/"+childSnapshot.key).once("value"));
                })
            });
            return Promise.all(productionPromises);
        }).then(function(snapshots){
            var data = [];
            snapshots.forEach(function(snapshot, idx){
                snapshot.forEach(function(childSnapshot){
                    if(childSnapshot.key!=="parity"){
                        //concat sow data [idx] and childsnapshot
                        var productionData = [childSnapshot.child("serviceDate").val(), childSnapshot.key];
                        productionKeys.forEach(function(key){
                            productionData.push(childSnapshot.child(key).val());
                        });
                        data.push(sowData[idx].concat(productionData));
                    }
                })
            });
            // make csv here
            csv = unparseToCSV({fields:sowFields, data:data});
            downloadBtn.href = 'data:text/csv;charset=utf-8,' + csv;
            downloadBtn.target = '_blank';
            downloadBtn.download = farmNo+'號場母豬資料匯出-'+date1.value+'-'+date2.value+'.csv'; // filename XX場-公豬匯出-YYYY-MM-DD-YYYY-MM-DD.csv
            downloadBtn.setAttribute("class", "button");
        });
    }
    else{
        const boarP1 = firebase.database().ref("boars/" + farmNo).orderByChild("birthday").startAt(date1.value).endAt(date2.value).once("value");
        const boarP2 = firebase.database().ref("boars/" + farmNo).orderByChild("birthday").endAt("").once("value");
        var boarData = [];
        var semenPromises = [];
        Promise.all([boarP1, boarP2]).then(function(snapshots){
            snapshots.forEach(function(snapshot){
                snapshot.forEach(function(childSnapshot){
                    //get boar entry
                    var data = [];
                    pigKeys.forEach(function(key){
                        data.push(childSnapshot.child(key).val());
                    });
                    boarData.push(data);
                    //make promise
                    semenPromises.push(firebase.database().ref("semen/"+farmNo).orderByChild("earmark").equalTo(childSnapshot.key).once("value"));
                })
            });
            return Promise.all(semenPromises);
        }).then(function(snapshots){
            var data = [];
            snapshots.forEach(function(snapshot, idx){
                var semenNo = 0
                snapshot.forEach(function(childSnapshot){
                    //concat boar data [idx] and childsnapshot
                    semenNo += 1;
                    var semenData = [semenNo];
                    semenKeys.forEach(function(key){
                        semenData.push(childSnapshot.child(key).val());
                    });
                    data.push(boarData[idx].concat(semenData));
                })
            });
            // make csv here
            csv = unparseToCSV({fields:boarFields, data:data});
            downloadBtn.href = 'data:text/csv;charset=utf-8,' + csv;
            downloadBtn.target = '_blank';
            downloadBtn.download = farmNo+'號場公豬資料匯出-'+date1.value+'-'+date2.value+'.csv'; // filename XX場-公豬匯出-YYYY-MM-DD-YYYY-MM-DD.csv
            downloadBtn.setAttribute("class", "button");
        });
    }
});

// checkbox change => re-render table
document.getElementById("report").addEventListener("change", renderTable);
document.getElementById("recommend").addEventListener("change", renderTable);
document.getElementById("score").addEventListener("change", renderTable);

function renderTable(){
    table.innerHTML="";
    dataList.forEach(function(data){
        if(document.getElementById(data[2]).checked){
            firebase.storage().ref("analysis/"+farmNo+"/"+data[0]).getDownloadURL().then((url)=>{
                var row = table.insertRow(0);
                var cell = row.insertCell(0);
                cell.innerHTML = data[1];
                cell = row.insertCell(1);
                if(data[2]==="recommend")
                    cell.innerHTML = "選拔建議";
                else if(data[2]==="report")
                    cell.innerHTML = "分析報告";
                else
                    cell.innerHTML = "豬隻評分";
                cell = row.insertCell(2);
                cell.innerHTML = '<a href="' + url + '" download="' + data[3] + '">' + data[3] + '</a>';
                cell = row.insertCell(3);
                if(data[4]==="none"){
                    cell.appendChild(openBtn());
                }
                else{
                    cell.appendChild(closeBtn());
                }
                // message
                cell = row.insertCell(4);
                if(data[5].length===0)
                    cell.innerHTML = "無訊息";
                else if(data[7].length===0){
                    var anchor = document.createElement('a');
                    anchor.innerHTML = "未回覆";
                    anchor.setAttribute("class", "small button");
                    anchor.style.color = "white";
                    anchor.addEventListener("click", function(){
                        message = this.closest("tr").getAttribute("data-issue");
                        messageTime = new Date(parseInt(this.closest("tr").getAttribute("data-issuetime")));
                        document.getElementById("message").innerHTML = message + "<br>(" + messageTime.toLocaleString() + ")";
                        document.getElementById("response").innerHTML = '<textarea type="text" rows="3" id="responseContent"></textarea>';
                        document.getElementById("send").setAttribute("class", "button");
                        document.getElementById("send").setAttribute("data-key", this.closest("tr").getAttribute("data-key"));
                        $("#myModal3").modal("toggle");
                    });
                    cell.appendChild(anchor);
                }
                else{
                    var anchor = document.createElement("a");
                    anchor.innerHTML = "已回覆";
                    anchor.setAttribute("class", "small button");
                    anchor.style.color = "white";
                    anchor.addEventListener("click", function(){
                        message = this.closest("tr").getAttribute("data-issue");
                        messageTime = new Date(parseInt(this.closest("tr").getAttribute("data-issuetime")));
                        document.getElementById("message").innerHTML = message + "<br>(" + messageTime.toLocaleString() + ")";
                        responseTime = new Date(parseInt(this.closest("tr").getAttribute("data-responsetime")));
                        document.getElementById("response").innerHTML = "<span class='label'>"+this.closest("tr").getAttribute("data-response")+
                                                                            "<br>(" + responseTime.toLocaleString() + ")</span>";
                        document.getElementById("send").setAttribute("class", "button disabled");
                        document.getElementById("send").setAttribute("data-key", "");
                        $("#myModal3").modal("toggle");
                    });
                    cell.appendChild(anchor);
                }
                keys.forEach(function(key, idx){
                    row.setAttribute("data-" + key.toLowerCase(), data[idx+1]);
                })
                row.setAttribute("data-key", data[0]);
            });
        }
    })
}

function openBtn(){
	var btn = document.createElement("span");
	btn.setAttribute("class", "alt button small");
	btn.innerHTML = "否(開放)";
	btn.addEventListener("click", function(){
		var thisBtn = this;
        thisBtn.setAttribute("class", "button small disabled");
        var thisCell = this.closest("td");
		var thisRow = thisBtn.closest("tr");
		openRef = firebase.database().ref("analysis/" + farmNo + "/" + thisRow.getAttribute("data-key") + "/availability")
        openRef.set(thisRow.getAttribute('data-type')).then(()=>{
            thisCell.innerHTML = "";
            thisCell.appendChild(closeBtn());
        });
	});
	return btn;
}

function closeBtn(){
	var btn = document.createElement("span");
	btn.setAttribute("class", "alt button small");
	btn.innerHTML = "是(關閉)";
	btn.addEventListener("click", function(){
		var thisBtn = this;
        thisBtn.setAttribute("class", "button small disabled");
        var thisCell = this.closest("td");
		var thisRow = thisBtn.closest("tr");
		openRef = firebase.database().ref("analysis/" + farmNo + "/" + thisRow.getAttribute("data-key") + "/availability")
        openRef.set("none").then(()=>{
            thisCell.innerHTML = "";
            thisCell.appendChild(openBtn());
        });
	});
	return btn;
}

document.getElementById("send").addEventListener("click", function(){
    if(document.getElementById("responseContent")){
        var d = new Date();
        var responseRef = firebase.database().ref("analysis/"+farmNo+"/"+this.getAttribute("data-key"))
        responseRef.update({response:document.getElementById("responseContent").value, responseTime:d.getTime()}).then(()=>{
            window.location.replace(location.href)
        });
    }
})
