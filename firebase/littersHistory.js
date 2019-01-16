// Get Elements
var table = document.getElementById("tableBody");
var dataTable = '';
var litterRefPath;
var litterKeys = ['strain', 'litterNo', 'fatherNo', 'motherNo', 'birthday', 'weanDate', 'note'];
var suckingKey = ['pigNo', 'gender', 'litterWeight', 'nippleNo', 'weanWeight', 'identity', 'note']; 
var litterTable = document.getElementById("litterTable");
var suckingTable = document.getElementById("suckingTable");
var next = document.getElementById("next");
var prev = document.getElementById("previous");

// Initial Table
function initPage(){
    table.innerHTML = '';
	var litterRef = firebase.database().ref('littersHistory/' + userData.currentFarm).orderByKey();
    litterRef.once("value").then(function(snapshot){
		snapshot.forEach(function(childSnapshot){
            var row = table.insertRow(-1);
            for(i=0;i<litterKeys.length;i++){
                var cell = row.insertCell(i);
                cell.innerHTML = childSnapshot.child(litterKeys[i]).val();
            }
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
            loadLitter(dataTable.row(rowId-1));
        });
        prev.appendChild(prevBtn);
    }
    if(rowId<(dataTable.rows().count()-1)){
        nextBtn = document.createElement("span");
        nextBtn.setAttribute("class", "button alt");
        nextBtn.innerHTML = "後一窩(" + dataTable.row(rowId+1).data()[1] + ")"
        nextBtn.addEventListener("click", function(){
            loadLitter(dataTable.row(rowId+1));
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
	litterNo = data[1];
	litterWeight = 0;
	weanWeight = 0;
	suckingNum = 0;
	suckingRef = firebase.database().ref('suckings/' + userData.currentFarm + '/' + litterNo).orderByChild('pigNo');
	return suckingRef.once("value").then(function(snapshot){
		snapshot.forEach(function(childSnapshot){
			var suckingRow = suckingTable.insertRow(-1);
			for(i=0;i<suckingKey.length;i++){
				var cell = suckingRow.insertCell(i);
				cell.innerHTML = childSnapshot.child(suckingKey[i]).val();
                if(suckingKey[i]==="note"&&childSnapshot.child("status").val()==="dead")
                    cell.innerHTML += "(死亡)";
			}
		});
    });
}

// Clickable Row in DataTable
$('#tableBody').on('click', 'tr', function () {
    loadLitter(dataTable.row(this)).then(()=>{
		$("#myModal").modal("toggle"); // open modal
	}, (error)=>{console.log(error)});
});
