// Get Elements
var table = document.getElementById("tableBody");
var dataTable = '';
var litterRefPath;
var litterKeys = ['strain', 'litterNo', 'fatherNo', 'motherNo', 'birthday', 'location', 'weanDate', 'note'];
var suckingKey = ['pigNo', 'gender', 'litterWeight', 'nippleNo', 'note']; 
var litterTable = document.getElementById("litterTable");
var suckingTable = document.getElementById("suckingTable");
var next = document.getElementById("next");
var prev = document.getElementById("previous");

function localDateStr(d){
	str = d.toLocaleDateString().split("/");
	yStr = str[0];
	mStr = ("0" + str[1]).slice(-2);
	dStr = ("0" + str[2]).slice(-2);
	return [yStr, mStr, dStr].join("-");
}

function deadBtn(){
	var btn = document.createElement('span');
	btn.setAttribute("class", "button small alt");
	btn.innerHTML = "死亡";
	btn.addEventListener("click", function(){
		this.closest("tr").setAttribute("class", "deadRow");
		this.closest("td").appendChild(aliveBtn());
		this.closest("td").removeChild(this);
	});
	return btn
}

function aliveBtn(){
	var btn = document.createElement('span');
	btn.setAttribute("class", "button small special");
	btn.innerHTML = "取消";
	btn.addEventListener("click", function(){
		this.closest("tr").setAttribute("class", "");
		this.closest("td").appendChild(deadBtn());
		this.closest("td").removeChild(this);
		sum_weight()
	});
	return btn
}

// Initial Table
function initPage(){
	var litterRef = firebase.database().ref('litters/' + userData.currentFarm).orderByKey();
    litterRef.once("value").then(function(snapshot){
		snapshot.forEach(function(childSnapshot){
            var row = table.insertRow(-1);
            for(i=0;i<litterKeys.length;i++){
                var cell = row.insertCell(i);
                if(litterKeys[i]==="weanDate"){
                    var d = new Date(childSnapshot.child("birthday").val());
                    d.setDate(d.getDate()+21);
                    cell.innerHTML = localDateStr(d);
                }
                else
                    cell.innerHTML = childSnapshot.child(litterKeys[i]).val();
            }
            row.setAttribute("data-key", childSnapshot.key);
            row.setAttribute("data-litterweight", childSnapshot.child("totalLitterWeight").val());
        });
    }).then(function(){makeDataTable("#table");}).catch((err)=>{conosle.log(err)});
}

function loadLitter(dataRow){
    var data = dataRow.data();
    console.log(data)
	// clean modal
	litterTable.innerHTML = '';
	suckingTable.innerHTML = '';

    // load prev-next button
    prev.innerHTML = "";
    next.innerHTML = "";
    rowId = dataTable.row(dataRow).index();
    if(rowId>0){
        prevBtn = document.createElement("span");
        prevBtn.setAttribute("class", "button alt");
        prevBtn.innerHTML = "前一窩(" + dataTable.row(rowId-1).data()[1] + ")"
        prevBtn.addEventListener("click", function(){
            load(dataTable.row(rowId-1));
        });
        prev.appendChild(prevBtn);
    }
    if(rowId<(dataTable.rows().count()-1)){
        nextBtn = document.createElement("span");
        nextBtn.setAttribute("class", "button alt");
        nextBtn.innerHTML = "前一窩(" + dataTable.row(rowId+1).data()[1] + ")"
        nextBtn.addEventListener("click", function(){
            load(dataTable.row(rowId+1));
        });
        next.appendChild(nextBtn);
    }

	// load litter data
	var litterRow = litterTable.insertRow(-1);
	for(i=0;i<data.length-1;i++){
		var cell = litterRow.insertCell(i);
		cell.innerHTML = data[i];
	}

	// load sucking data
	litterNo = dataRow.node().getAttribute("data-key");
	suckingRef = firebase.database().ref('suckings/' + userData.currentFarm + '/' + litterNo).orderByChild('pigNo');
	return suckingRef.once("value").then(function(snapshot){
		snapshot.forEach(function(childSnapshot){
			var suckingRow = suckingTable.insertRow(-1);
			for(i=0;i<suckingKey.length;i++){
				var cell = suckingRow.insertCell(i);
                cell.innerHTML = childSnapshot.child(suckingKey[i]).val();
			}
            var cell = suckingRow.insertCell(-1);
            if(childSnapshot.child("status").val()==="dead"){
                cell.innerHTML = "死亡";
                suckingRow.setAttribute("class", "deadRow oldRow");
            }
            else{
                cell.style.padding = "0.5em 0";
                cell.appendChild(deadBtn());
            }
		});
        var totalWeightRow = suckingTable.insertRow(-1);
        totalWeightRow.innerHTML = "<td>窩重</td><td></td><td>" + dataRow.node().getAttribute("data-litterweight") + "</td><td></td><td></td>";
        var cell = totalWeightRow.insertCell(-1);
        cell.style.padding = "0.5em 0";
        uploadBtn = document.createElement("span");
        uploadBtn.setAttribute("class", "small button");
        uploadBtn.innerHTML = "儲存";
        uploadBtn.addEventListener("click", function(){
            var promise_array = []
            for(i=0;i<suckingTable.rows.length;i++){
                if(suckingTable.rows[i].getAttribute("class")==="deadRow"){
                    pigNo = suckingTable.rows[i].children[0].innerHTML;
                    deadRef = firebase.database().ref("suckings/" + userData.currentFarm + "/" + litterNo + "/" + pigNo + "/status");
                    const p = deadRef.set("dead");
                    promise_array.push(p);
                }
            }
            console.log(promise_array.length);
            Promise.all(promise_array).then( ()=>{
                $("#myModal").modal("toggle");
            });
        });
        cell.appendChild(uploadBtn);
        totalWeightRow.appendChild(cell);
    });
}

// Clickable Row in DataTable
$('#tableBody').on('click', 'tr', function () {
    loadLitter(dataTable.row(this)).then(()=>{
		$("#myModal").modal("toggle"); // open modal
	}, (error)=>{console.log(error)});
});
