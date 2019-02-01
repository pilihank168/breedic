var table = document.getElementById("tableBody")
var preview = document.getElementById("upload-files-display");
var newFile = null;
var newFileType = document.getElementById("filters");
var fileCounter = {"service":0, "semen":0, "diagnosis":0, "parturition":0, "wean":0, "physical":0, "export":0, "leave":0};

function initPage(){
    var recordRef = firebase.database().ref("record/" + userData.currentFarm).orderByChild("date");
    recordRef.once("value").then(function(snapshot){
        snapshot.forEach(function(childSnapshot){
            var entry = childSnapshot.val()
            var row = table.insertRow(0);
            cell = row.insertCell(0);
            cell.innerHTML = childSnapshot.child("date").val();
            cell = row.insertCell(1);
            fileType = entry.type;
            fileCounter[fileType] += 1;
            if(fileType==="service")
                cell.innerHTML = "配種記錄";
            else if(fileType==="semen")
                cell.innerHTML = "採精記錄";
            else if(fileType==="diagnosis")
                cell.innerHTML = "測孕記錄";
            else if(fileType==="parturition")
                cell.innerHTML = "分娩記錄";
            else if(fileType==="wean")
                cell.innerHTML = "離乳記錄";
            else if(fileType==="physical")
                cell.innerHTML = "體測記錄";
            else if(fileType==="export")
                cell.innerHTML = "出豬記錄";
            else if(fileType==="leave")
                cell.innerHTML = "離場記錄";
            cell = row.insertCell(2);
            fileRef = entry.ref;
            fileName = entry.fileName;
            cell.innerHTML = '<a download="'+fileName+'">'+fileName+'</a>';
            firebase.storage().ref("record/"+userData.currentFarm+"/"+childSnapshot.key).getDownloadURL().then(function(url){
                cell.children[0].setAttribute("href", url);
            }).catch(error=>console.log(error));
        });
    });
}

function filePreviewer(file){
    newFile = file;
    if(newFile.type==='text/csv'){
        preview.innerHTML = file.name;
        var cancel = document.createElement("a");
        cancel.innerHTML = "取消"
        cancel.addEventListener("click", function(){
            preview.innerHTML = "";
            newFile = null;
            document.getElementById("fileLabel").style.display = "inherit";
        });
        preview.appendChild(cancel);
        document.getElementById("fileLabel").style.display = "none";
    }
    else
		preview.innerHTML = "檔案格式不符(限csv檔)"
}

document.getElementById("fileUploader").addEventListener("submit", function(e){
    e.preventDefault();
    if(newFile){
        var fileType = newFileType.value;
        parseFromCSV(newFile).then((results)=>{
            var promises = [];
            if(fileType==="service")
                promises.push(serviceParser(results.data));
            else if(fileType==="semen")
                promises.push(semenParser(results.data));
            else if(fileType==="diagnosis")
                promises.push(diagnosisParser(results.data));
            else if(fileType==="parturition")
                promises.push(parturitionParser(results.data));
            else if(fileType==="wean")
                promises.push(weanParser(results.data));
            else if(fileType==="physical")
                promises.push(physicalParser(results.data));
            else if(fileType==="export")
                promises.push(exportParser(results.data));
            else if(fileType==="leave")
                promises.push(leaveParser(results.data));
            else
                return
            //decide ref
            var d = new Date();
            todayDate = localDateStr(d);
            var ref = todayDate + "-" + fileType + "-" + (fileCounter[fileType]+1).toString();
            //upload
            promises.push(firebase.storage().ref("record/"+userData.currentFarm+"/"+ref).put(newFile));
            //set db
            promises.push(firebase.database().ref("record/"+userData.currentFarm+"/"+ref).set({date:todayDate, fileName:newFile.name, type:fileType}));
            promises.push(firebase.database().ref("farms/" +userData.currentFarm+"/lastData").set(d.getTime()));
            return Promise.all(promises)
        }).then(()=>{
            window.location.replace(location.href)
            //refresh
        }).catch(error=>console.log(error));
    }
});

function serviceParser(data){
    var serviceKeys = ["sowEar", "sowNo", "serviceLocation", "boarEar", "boarNo", "serviceNumber", "note"]
    var updateObj = {};
    var servicePath = "service/"+userData.currentFarm+"/", logPath = "log/"+userData.currentFarm+"/";
    for(i=1;i<data.length;i++){
        id = data[i][0]+'-'+data[i][1]+'-'+data[i][4];
        updateObj[servicePath+data[i][0]+"/"+id] = {};
        serviceKeys.forEach(function(key, j){
            updateObj[servicePath+data[i][0]+"/"+id][key] = data[i][j+1];
        });
        updateObj[logPath+data[i][1]+"/"+id] = {date:data[i][0], eventName:"service"};
        updateObj[logPath+data[i][4]+"/"+id] = {date:data[i][0], eventName:"service"};
    }
    return firebase.database().ref().update(updateObj);
}

function semenParser(data){
    var semenKeys = ["date", "earmark", "registerNo", "volume", "concentration", "activity",
                    "abnormalities", "acrosome","midpiece", "dilute", "available", "note"];
    var updateObj = {};
    var semenPath = "semen/"+userData.currentFarm+"/", logPath = "log/"+userData.currentFarm+"/";
    for(i=1;i<data.length;i++){
        id = data[i][0]+'-'+data[i][1];
        updateObj[semenPath+id] = {};
        semenKeys.forEach(function(key, j){
            updateObj[semenPath+id][key] = data[i][j];
        });
        updateObj[logPath+data[i][1]+"/"+id] = {date:data[i][0], eventName:"semen"};
    }
    return firebase.database().ref().update(updateObj);
}

function diagnosisParser(data){
    var diagKeys = ["diagDate", "sowEar", "diagLocation", "diagResult"];
    var updateObj = {};
    var diagPath = "diagnosisHistory/"+userData.currentFarm+"/", logPath = "log/"+userData.currentFarm+"/";
    for(i=1;i<data.length;i++){
        id = data[i][0]+'-'+data[i][1];
        updateObj[diagPath+id] = {};
        diagKeys.forEach(function(key, j){
            updateObj[diagPath+id][key] = j!==3?data[i][j]:(data[i][j]==="YES"?"p":"n");
        });
        updateObj[logPath+data[i][1]+"/"+id] = {date:data[i][0], eventName:"diagnosis"};
    }
    return firebase.database().ref().update(updateObj);
}

function physicalParser(data){
    var physicalKeys = ["date", "earmark", "sex", "weight", "fat", "depth", "surface", "note"];
    var updateObj = {};
    var physicalPath = "physical/"+userData.currentFarm+"/", logPath = "log/"+userData.currentFarm+"/";
    for(i=1;i<data.length;i++){
        id = data[i][0]+'-'+data[i][1];
        updateObj[physicalPath+id] = {};
        physicalKeys.forEach(function(key, j){
            updateObj[physicalPath+id][key] = data[i][j];
        });
        updateObj[logPath+data[i][1]+"/"+id] = {date:data[i][0], eventName:"physical"};
    }
    return firebase.database().ref().update(updateObj);
}

function leaveParser(data){
    var updateObj = {};
    var leavePath = "leave/"+userData.currentFarm+"/", logPath = "log/"+userData.currentFarm+"/";
    for(i=1;i<data.length;i++){
        id = data[i][0]+'-'+data[i][1];
        updateObj[leavePath+id] = {date:data[i][0], earmark:data[i][1], type:data[i][2]==="死亡"?"dead":"eliminated"}
        if(data[i][2]==="F")
            updateObj["sows/"+userData.currentFarm+"/"+data[i][1]+"/unavailability"] = "leave";
        else if(data[i][2]==="M")
            updateObj["boars/"+userData.currentFarm+"/"+data[i][1]+"/unavailability"] = "leave";
        else
            updateObj["weaners/"+userData.currentFarm+"/"+data[i][1]+"/status"] = "leave";
        updateObj[logPath+data[i][1]+"/"+id] = {date:data[i][0], eventName:"leave"};
    }
    return firebase.database().ref().update(updateObj);
}

function exportParser(data){
    return firebase.database().ref("sex/"+userData.currentFarm).once("value").then(function(snapshot){
        sexData = snapshot.val();
        var updateObj = {};
        var exportPath = "export/"+userData.currentFarm+"/", logPath = "log/"+userData.currentFarm+"/";
        var sowPath = "sows/"+userData.currentFarm+"/", boarPath = "boars/"+userData.currentFarm+"/", weanerPath = "weaners/"+userData.currentFarm+"/";
        id = data[1][0]+data[1][1];
        updateObj[exportPath+id] = {date:data[1][0], name:data[1][1], number:data[1][2], note:data[1][4], earmarks:{}}
        for(i=1;i<data.length;i++){
            updateObj[exportPath+id]["earmarks"][data[i][3]] = true;
            updateObj[logPath+data[i][3]+"/exportLog"] = {date:data[1][0], eventName:"export"};
            if(sexData[data[i][3]]==="sow"){
                updateObj[sowPath+data[i][3]+"/unavailability"] = "exported";
                updateObj[sowPath+data[i][3]+"/exportId"] = id;
            }
            else if(sexData[data[i][3]]==="boar"){
                updateObj[boarPath+data[i][3]+"/unavailability"] = "exported";
                updateObj[boarPath+data[i][3]+"/exportId"] = id;
            }
            else{
                updateObj[weanerPath+data[i][3]+"/status"] = "exported";
                updateObj[weanerPath+data[i][3]+"/exportId"] = id;
            }
        }
        return firebase.database().ref().update(updateObj);
    });
}

// parturition & wean : both for parturitionHistory & litters

function parturitionParser(data){
    var parturitionKeys = ["partDate", "sowEar", "partLocation", "parity", "strain", "litterNo", "totalPiglet", "totalDead", "dead",
                            "mummy", "stillborn", "lied", "weakDead", "smallDead", "live", "normal", "weak", "small", "fostering", 
                            "fosteringPlus", "fosteringMinus", "totalLitterWeight", "litterNumber", "note"];
    var updateObj = {};
    var historyPath = "parturitionHistory/" + userData.currentFarm + "/", logPath = "log/" + userData.currentFarm + "/";
    for(i=1;i<data.length;i++){
        id = data[i][4]+data[i][5]; // need to change
        updateObj[historyPath+id] = {};
        parturitionKeys.forEach(function(key, j){
            updateObj[historyPath+id][key] = data[i][j];
        })
        updateObj[logPath+data[i][1]+"/"+id] = {date:data[i][0], eventName:"parturition"};
    }
    return firebase.database().ref().update(updateObj);
}

function weanParser(data){
    var litterKeys = ["partDate", "strain", "litterNo", "fatherEar", "motherEar", "partLocation", "weanLocation", "weanDate", "weanNumber", "totalWeanWeight", "lotNo"]
    var suckingKeys = ["sex", "litterWeight", "nipple", "weanWeight", "identity", "fosteringNote", "weanLocation", "note"];
    updateObj = {};
    var litterNo=null, totalLitterWeight=0;
    var historyPath="littersHistory/"+userData.currentFarm+"/", suckingPath="suckings/"+userData.currentFarm+"/";
    for(i=1;i<data.length;i++){
        // end of litter
        if(data[i][2]){
            // save litter weight
            if(litterNo){
                updateObj[historyPath+litterNo+"/totalLitterWeight"] = totalLitterWeight;
                totalLitterWeight = 0;
            }
            // new litter
            litterNo = data[i][1]+data[i][2];
            //litterHistory
            litterKeys.forEach(function(key, j){
                updateObj[historyPath+litterNo+"/"+key] = data[i][j];
            });
        }
        //sucking
        pigNo = data[i][11];
        updateObj[suckingPath+litterNo+"/"+pigNo] = {};
        suckingKeys.forEach(function(key, j){
            updateObj[suckingPath+litterNo+"/"+pigNo][key] = data[i][j+12];
        });
        totalLitterWeight += data[i][13];
    }
    // save last litter weight
    if(litterNo)
            updateObj[historyPath+litterNo+"/totalLitterWeight"] = totalLitterWeight;
    return firebase.database().ref().update(updateObj);
}
