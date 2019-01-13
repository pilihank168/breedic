// Get Elements
var search = document.getElementById("search");
var filter = document.getElementById("filter");
var query = document.getElementById("query");
var sortingKey = document.getElementById("sortingKey");
var keys = ['strain', 'earmark', 'identity', 'sex', 'birthday', 'location', 'status', 'fatherNo', 'motherNo', 'fatherEar', 'motherEar'];
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
            if(j<7){
                var cell = row.insertCell(j);
                cell.innerHTML = dataList[i][j+1];
            }
            else
                row.setAttribute("data-"+keys[j].toLowerCase(), dataList[i][j+1]);
		}
        if(dataList[i][7]==="場內"){
            console.log(i)
            row.setAttribute("class", "addible");
        }
	}
    makeDataTable("table");
}

$('#tableBody').on('click', 'tr', function () {
    if(this.classList.contains("addible")){
        console.log(this)
        currentRow = this;
        transfer.reset();
        document.getElementById("transfer-earmark").value = this.getAttribute("data-key");
    	$("#myModal").modal("toggle"); // open modal
    }
})

//event listener :load whole entry then add boar/sow and add log
transfer.addEventListener("submit", function(e){
    e.preventDefault();
    // boar or sow
    // weaner
    // log
    currentRow.children[6].innerHTML = "已轉豬";
    currentRow.classList.remove("addible");
    console.log(table);
    $("#myModal").modal("toggle");
});
