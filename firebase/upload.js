var table = document.getElementById("tableBody")
var preview = document.getElementById("upload-files-display");
var newFile = null;
var newFileType = document.getElementById("filters");
var fileCounter = {"boar":0, "sow":0, "sucking":0, "weaner":0, "production":0};

function initPage(){
    var uploadRef = firebase.database().ref("upload/" + userData.currentFarm).orderByChild("date");
    uploadRef.once("value").then(function(snapshot){
        snapshot.forEach(function(childSnapshot){
            var entry = childSnapshot.val()
            var row = table.insertRow(0);
            cell = row.insertCell(0);
            cell.innerHTML = childSnapshot.child("date").val();
            cell = row.insertCell(1);
            fileType = entry.type;
            fileCounter[fileType] += 1;
            if(fileType==="production")
                cell.innerHTML = "母豬生產";
            else if(fileType==="sow")
                cell.innerHTML = "母豬資料";
            else if(fileType==="boar")
                cell.innerHTML = "公豬資料";
            else if(fileType==="litter")
                cell.innerHTML = "仔豬資料";
            else if(fileType==="weaner")
                cell.innerHTML = "保育豬資料";
            cell = row.insertCell(2);
            fileRef = entry.ref;
            fileName = entry.fileName;
            cell.innerHTML = '<a download="'+fileName+'">'+fileName+'</a>';
            firebase.storage().ref("upload/"+userData.currentFarm+"/"+childSnapshot.key).getDownloadURL().then(function(url){
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
            if(fileType==="sow")
                promises.push(sowParser(results.data));
            else if(fileType==="boar")
                promises.push(boarParser(results.data));
//            else if(fileType==="litter")
//                promises.push(litterParser(results.data));
            else if(fileType==="weaner")
                promises.push(weanerParser(results.data));
            else if(fileType==="production")
                promises.push(productionParser(results.data));
            else
                return
            //decide ref
            var d = new Date();
            todayDate = localDateStr(d);
            var ref = todayDate + "-" + fileType + "-" + (fileCounter[fileType]+1).toString();
            //upload
            promises.push(firebase.storage().ref("upload/"+userData.currentFarm+"/"+ref).put(newFile));
            //set db
            promises.push(firebase.database().ref("upload/"+userData.currentFarm+"/"+ref).set({date:todayDate, fileName:newFile.name, type:fileType}));
            promises.push(firebase.database().ref("farms/" +userData.currentFarm+"/lastData").set(d.getTime()));
            return Promise.all(promises)
        }).then(()=>{
            window.location.replace(location.href)
            //refresh
        }).catch(error=>console.log(error));
    }
});

function productionParser(data){
    var sowKeys = ["strain", "earmark", "registerNo", "birthday", "fatherEar", "fatherNo", "motherEar", "motherNo"]
    var productionKeys = ["boarNo", "serviceLocation", "partDate", "partLocation", "strain", "litterNo", "totalPiglet", "totalDead", "dead", 
                            "mummy", "stillborn", "lied", "weakDead", "smallDead", "live", "normal", "weak", "small", "fostering", "fosteringPlus",
                            "fosteringMinus", "totalLitterWeight", "live", "weanDate", "weanNumber", "totalWeanWeight", "eliminated", "note"];
    var updateObj = {};
    var sowPath = "sows/"+userData.currentFarm+"/", productionPath = "production/"+userData.currentFarm+"/", 
        sexPath = "sex/"+userData.currentFarm+"/", logPath = "log/"+userData.currentFarm+"/";
    for(i=1;i<data.length;i++){
        if(Number.isInteger(data[i][9])){
            var id = data[i][0]+data[i][1];
            var parity = data[i][9];
            // sow obj
            sowKeys.forEach(function(key, j){
                if(data[i][j])
                    updateObj[sowPath+id+"/"+key] = data[i][j];
            });
            // production obj (set parity var!)
            updateObj[productionPath+id+"/"+parity] = {serviceDate:data[i][8]};
            productionKeys.forEach(function(key, j){
                updateObj[productionPath+id+"/"+parity][key] = data[i][j+10];
            });
            currentParity = updateObj[productionPath+id+"/parity"];
            updateObj[productionPath+id+"/parity"] = Math.max(parity, isNaN(currentParity)?-1:currentParity);
            updateObj[sexPath+id] = "sow";
            // log
            updateObj[logPath+id+"/birthLog"] = {date:data[i][3], eventName:"birth"};
            updateObj[logPath+id+"/service-"+parity] = {date:data[i][8], eventName:"service"};
            updateObj[logPath+id+"/parturition-"+parity] = {date:data[i][13], eventName:"parturition"};
            updateObj[logPath+id+"/wean-"+parity] = {date:data[i][34], eventName:"wean"};
        }
    }
    return firebase.database().ref().update(updateObj);
}

function boarParser(data){
    var boarKeys = ["addDate", "source", "strain", "earmark", "registerNo", "birthday", "fatherEar",
                    "fatherNo", "motherEar", "motherNo", "note", "location", "leaveDate", "leaveNote"];
    updateObj = {};
    var boarPath = "boars/"+userData.currentFarm+"/", logPath = "log/"+userData.currentFarm+"/";
    for(i=1;i<data.length;i++){
        var id = data[i][2]+data[i][3];
        updateObj[boarPath+id] = {}
        boarKeys.forEach(function(key, j){
            updateObj[boarPath+id][key] = data[i][j];
        });
        updateObj["sex/"+userData.currentFarm+"/"+id] = "boar";
        //log
        if(data[i][5])
            updateObj[logPath+id+"/birthLog"] = {date:data[i][5], eventName:"birth"};
        if(data[i][0])
            updateObj[logPath+id+"/addLog"] = {date:data[i][0], eventName:"add"};
        if(data[i][12]){
            updateObj[logPath+id+"/leaveLog"] = {date:data[i][12], eventName:"leave"};
            updateObj[boarPath+id]["unavailability"] = "leave";
        }
    }
    return firebase.database().ref().update(updateObj);
}

function sowParser(data){
    var sowKeys = ["addDate", "source", "identity", "strain", "earmark", "registerNo", "birthday", "fatherEar",
                    "fatherNo", "motherEar", "motherNo", "note", "location", "leaveDate", "leaveNote"];
    updateObj = {};
    var sowPath = "sows/"+userData.currentFarm+"/", logPath = "log/"+userData.currentFarm+"/";
    for(i=1;i<data.length;i++){
        var id = data[i][3]+data[i][4];
        updateObj[sowPath+id] = {};
        sowKeys.forEach(function(key, j){
            updateObj[sowPath+id][key] = data[i][j];
        });
        updateObj["sex/"+userData.currentFarm+"/"+id] = "sow"
        //log
        if(data[i][6])
            updateObj[logPath+id+"/birthLog"] = {date:data[i][5], eventName:"birth"};
        if(data[i][0])
            updateObj[logPath+id+"/addLog"] = {date:data[i][0], eventName:"add"};
        if(data[i][13]){
            updateObj[logPath+id+"/leaveLog"] = {date:data[i][12], eventName:"leave"};
            updateObj[sowPath+id]["unavailability"] = "leave";
        }
    }
    return firebase.database().ref().update(updateObj);
}

function weanerParser(data){
    var weanerKeys = ["lotNo", "location", "sex", "identity", "earmark", "birthday", "note"];
    var updateObj = {};
    var weanerPath = "weaners/"+userData.currentFarm+"/";
    for(i=1;i<data.length;i++){
        var id = data[i][4];
        updateObj[weanerPath+id] = {};
        weanerKeys.forEach(function(key, j){
            updateObj[weanerPath+id][key] = data[i][j];
        });
    }
    return firebase.database().ref().update(updateObj);
}

// this should be only used to add litters which haven't been weaned and need to be modified for this purpose
/*
function litterParser(data){
    var litterKeys = ["birthday", "strain", "litterNo", "fatherEar", "motherEar", "location", "weanDate"]
    var suckingKeys = ["sex", "litterWeight", "nipple", "weanWeight", "identity", "fosteringNote", "note"];
    updateObj = {};
    var litterNo=null, totalLitterWeight=0, totalWeanWeight=0, history=false;
    var litterPath="litters/"+userData.currentFarm, historyPath="littersHistory/"+userData.currentFarm, suckingPath="suckings/"+userData.currentFarm;
    for(i=1;i<data.length;i++){
        // end of litter
        if(data[i][2]){
            // save litter weight
            if(litterNo){
                if(history){
                    updateObj[historyPath+litterNo+"/totalWeanWeight"] = totalWeanWeight;
                    updateObj[historyPath+litterNo+"/totalLitterWeight"] = totalLitterWeight;
                    totalWeanWeight = 0;
                }
                else
                    updateObj[litterPath+litterNo+"/totalLitterWeight"] = totalLitterWeight;
                totalLitterWeight = 0;
            }
            // new litter
            litterNo = data[i][1]+data[i][2];
            if(data[i][6]){
                //litterHistory
                history = true;
                litterKeys.forEach(function(key, j){
                    updateObj[historyPath+litterNo+"/"+key] = data[i][j];
                });
            }
            else{
                //litter
                history = false;
                litterKeys.forEach(function(key, j){
                    updateObj[litterPath+litterNo+"/"+key] = data[i][j];
                });
            }
        }
        //sucking
        pigNo = data[i][7];
        suckingKeys.forEach(function(key, j){
            updateObj[suckingPath+litterNo+"/"+pigNo][key] = data[i][j+8];
        });
        if(history)
            totalWeanWeight += data[i][11];
        totalLitterWeight += data[i][9];
    }
    // save last litter weight
    if(litterNo){
        if(history){
            updateObj[historyPath+litterNo+"/totalWeanWeight"] = totalWeanWeight;
            updateObj[historyPath+litterNo+"/totalLitterWeight"] = totalLitterWeight;
        }
        else
            updateObj[litterPath+litterNo+"/totalLitterWeight"] = totalLitterWeight;
    }
    return firebase.database().ref().update(updateObj);
}
*/
