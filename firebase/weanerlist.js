// Get Elements
var search = document.getElementById("search");
var filter = document.getElementById("filter");
var query = document.getElementById("query");
var sortingKey = document.getElementById("sortingKey");
var keys = ['lotNo', 'strain', 'earmark', 'identity', 'sex', 'birthday', 'location', 'status', 'fatherNo', 'motherNo', 'fatherEar', 'motherEar', 
            'weanDate', 'litterWeight', 'weanWeight'];
var table = document.getElementById("tableBody");
var dataTable = "";
var dataList;
var weanerRef;
var currentRow;
var transfer = document.getElementById("transfer");

function localTodayStr(){
    d = new Date();
	str = d.toLocaleDateString().split("/");
	yStr = str[0];
	mStr = ("0" + str[1]).slice(-2);
	dStr = ("0" + str[2]).slice(-2);
	return [yStr, mStr, dStr].join("-");
}

function fromToday(days){
    days = parseInt(days);
    var d = new Date(localTodayStr());
    d.setDate(d.getDate()-days);
    return d.toLocaleDateString().replace(/\//g, '-');
}

function dateDistance(date){
    d0 = new Date(localTodayStr());
    d1 = new Date(date);
    a = Date.UTC(d0.getFullYear(), d0.getMonth(), d0.getDate())
    b = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate())
    return Math.floor((a-b)/(1000*60*60*24))
}

search.addEventListener("submit", function(event){
    if(!query.value){
        $("#table").css('visibility', 'hidden');
        dataTable.destroy();
        initPage();
    }
    else{
        event.preventDefault();
        if(filter.value==="birthday"){
            ageQuery = query.value.split('-')
            if(ageQuery.length>1){
                date1 = fromToday(ageQuery[1])
                date2 = fromToday(ageQuery[0])
            }
            else{
                date1 = fromToday(ageQuery[0])
                date2 = fromToday(ageQuery[0])
            }
            ref = weanerRef.orderByChild("birthday").startAt(date1).endAt(date2);
        }
        else if(filter.value==="earmark")
            ref = weanerRef.orderByKey().equalTo(query.value)
        else
            ref = weanerRef.orderByChild(filter.value).equalTo(query.value);
        getDataList(ref).then(function(){
            $('#table').css('visibility', 'hidden');
            dataTable.destroy();
            renderTable()
        });
    }
});

sortingKey.addEventListener("change", function(){
	$('#table').css('visibility', 'hidden');
    dataTable.destroy();
	renderTable();
});

// Initial Table
function initPage(){
    weanerRef = firebase.database().ref("weaners/" + userData.currentFarm);
    var ref = weanerRef.orderByChild("status").endAt("");
	getDataList(ref).then(function(){renderTable();}).catch((error)=>{console.log(error)});
}

function getDataList(ref){
	dataList = [];
	return ref.once("value").then(function(snapshot){
		snapshot.forEach(function(childSnapshot){
			var data = [childSnapshot.key];
            var birthday;
			for(i=0;i<keys.length;i++)
                if(keys[i]==="status"){
                    var stat = childSnapshot.child(keys[i]).val();
                    if(stat==="transfered")
                        data.push("已轉豬"+childSnapshot.child("transferDate").val());
                    else if(stat==="eliminated")
                        data.push("已淘汰");
                    else
                        data.push("場內");
                }
                else if(keys[i]==="sex"){
                    sex = (childSnapshot.child(keys[i]).val()||"");
                    if(sex)
                        sex = (sex==="F")?"母豬":"公豬";
                    data.push(sex)
                }
                else if(keys[i]==="birthday"){
                    data.push(dateDistance(childSnapshot.child(keys[i]).val()||""));
                    birthday = childSnapshot.child(keys[i]).val()
                }
				else
					data.push((childSnapshot.child(keys[i]).val()||""));
            data.push(birthday);
			dataList.push(data);
		});
	}).catch(error=>console.log(error));
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
            if(j<8){
                var cell = row.insertCell(j);
                cell.innerHTML = (j===3&&dataList[i][j+1]==="meat")?"肉":dataList[i][j+1];
            }
            if(keys[j]==="birthday")
                row.setAttribute("data-birthday", dataList[i][15]);
            else
                row.setAttribute("data-"+keys[j].toLowerCase(), dataList[i][j+1]);
		}
        if(dataList[i][8]==="場內"){
            row.setAttribute("class", "addible");
        }
	}
    makeDataTable("table");
}

$('#tableBody').on('click', 'tr', function () {
    if(this.classList.contains("addible")){
        currentRow = this;
        transfer.reset();
        document.getElementById("transfer-earmark").value = this.getAttribute("data-key");
    	$("#myModal").modal("toggle"); // open modal
    }
})

//event listener :load whole entry then add boar/sow and add log
transfer.addEventListener("submit", function(e){
    e.preventDefault();
    var weanerId = currentRow.getAttribute("data-key");
    var weanerObj = {};
    for(i=0;i<keys.length;i++)
        weanerObj[keys[i]] = currentRow.getAttribute("data-"+keys[i].toLowerCase());
    // boar or sow
    transferObj = {strain:weanerObj.strain, earmark:weanerObj.earmark, identity:weanerObj.identity, lotNo:weanerObj.lotNo,
                    registerNo:document.getElementById("transfer-no").value, birthday:weanerObj.birthday,
                    fatherEar:weanerObj.fatherEar, fatherNo:weanerObj.fatherNo, motherEar:weanerObj.motherEar, motherNo:weanerObj.motherNo,
                    location:document.getElementById("transfer-location").value, source:"自繁", note:document.getElementById("transfer-note").value};
    if(currentRow.getAttribute("data-sex")==="母豬")
        var transferRef = firebase.database().ref("sows/" + userData.currentFarm + "/" + weanerId);
    else
        var transferRef = firebase.database().ref("boars/" + userData.currentFarm + "/" + weanerId);
    const transferP = transferRef.set(transferObj);
    // weaner(record transfer)
    var weanerRef = firebase.database().ref("weaners/" + userData.currentFarm + "/" + weanerId);
    const weanerP = weanerRef.update({status:"transfered", transferDate:document.getElementById("transfer-date").value});
    // log
    var logRef = firebase.database().ref("log/" + userData.currentFarm + "/" + weanerId);
    const logP = logRef.set({"birthLog":{date:weanerObj.birthday, eventName:"birth"},
                                "weanLog":{date:weanerObj.weanDate, eventName:"weaned"},
                            "transferLog":{date:document.getElementById("transfer-date").value, eventName:"transfer"}});
    // physical
    var physicalRef = firebase.database().ref("physical/" + userData.currentFarm);
    const physicalP = physicalRef.set({[weanerId+"-birthLog"]:{earmark:weanerId, date:weanerObj.birthday, weight:weanerObj.litterWeight, note:"出生"},
                                        [weanerId+"-weanLog"]:{earmark:weanerId, date:weanerObj.weanDate, weight:weanerObj.weanWeight, note:"離乳"}});
    var sexRef = firebase.database().ref("sex/" + userData.currentFarm + "/" + weanerId);
    const sexP = sexRef.set(((currentRow.getAttribute("data-sex")==="母豬")?"sow":"boar"));
    var d = new Date();
    const timeP = firebase.database().ref("farms/" + userData.currentFarm + "/lastData").set(d.getTime());
    promise_array = [transferP, weanerP, logP, physicalP, sexP, timeP];
    Promise.all(promise_array).then( ()=>{
        currentRow.children[6].innerHTML = "已轉豬";
        currentRow.classList.remove("addible");
        $("#myModal").modal("toggle");
    });
});
