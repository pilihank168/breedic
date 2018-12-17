// Get Elements
var table = document.getElementById("tableBody");
var dataTable = '';
var litterRefPath;
var litterKey = ['strain', 'litterNo', 'fatherNo', 'motherNo', 'birthday', 'location', 'weanDate', 'note'];
var suckingKey = ['pigNo', 'gender', 'litterWeight', 'nippleNo', 'weanWeight', 'identity', 'fostering']; 
var litterTable = document.getElementById("litterTable");
var suckingTable = document.getElementById("suckingTable");

function litterSearch(snapshot, key, query){return true;}

// Initial Table
function initPage(){
	litterRefPath = 'litters/' + userData.currentFarm + '/';
	loadTable(litterRefPath, 'litterNo', -1, '', litterSearch, litterKey).then(function(){makeDataTable('#table');});
}

// Clickable Row in DataTable
$('#tableBody').on('click', 'tr', function () {

	// clean modal
	litterTable.innerHTML = '';
	suckingTable.innerHTML = '';
	var data = dataTable.row( this ).data();

	// load litter data
	var row = litterTable.insertRow(-1);
	for(i=0;i<data.length-1;i++){
		var cell = row.insertCell(i);
		cell.innerHTML = data[i];
	}

	// load sucking data
	litterNo = data[1];
	litterWeight = 0;
	weanWeight = 0;
	suckingNum = 0;
	suckingRef = firebase.database().ref('suckings/' + userData.currentFarm + '/' + litterNo).orderByChild('pigNo');
	suckingRef.once("value").then(function(snapshot){
		snapshot.forEach(function(childSnapshot){
			var row = suckingTable.insertRow(-1);
			for(i=0;i<suckingKey.length;i++){
				var cell = row.insertCell(i);
				newData = childSnapshot.child(suckingKey[i]).val();
				if(newData==null){
					if(i===4){
						row.setAttribute("class", "inputRow");
						cell.innerHTML = "<input type='number'/>"
					}
					else if(i===5){
						row.setAttribute("class", "inputRow");
						cell.innerHTML = "<input type='text'/>"
					}
					else
						cell.innerHTML = "";
				}
				else{
					cell.innerHTML = newData;
					if(i===2){
						litterWeight += 1;
						suckingNum += 1;
					}
					else if(i===4)
						weanWeight += 1;
				}
			}
		});
		if(litterWeight>0){
			var row = suckingTable.insertRow(-1);
			cells=[];
			for(i=0;i<suckingKey.length;i++){
				var cell = row.insertCell(i);
				cells.push(cell);
			}
			cells[0].innerHTML = "窩重";
			cells[2].innerHTML = litterWeight/suckingNum;
			cells[4].innerHTML = weanWeight>0 ? weanWeight/suckingNum : "";
		}
	}).then(()=>{
		$("#myModal").modal("toggle"); // open modal
	}, (error)=>{console.log(error)});
	//window.location='sucking.html?litter='+data[1];
});
