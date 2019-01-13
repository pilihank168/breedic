// Get Elements
var table = document.getElementById("tableBody");

var modal_title = document.getElementById("modal-title");
var content_table = document.getElementById("content-table");

function initPage(){
	var exportRef = firebase.database().ref("export/" + userData.currentFarm).orderByChild("date");
	exportRef.once('value').then((snapshot)=>{
		snapshot.forEach((childSnapshot)=>{
			entry = childSnapshot.val();
			data = [entry.date, entry.name, entry.number, entry.note, entry.earmarks];
			var row = table.insertRow(0);
			for(i=0;i<4;i++){
				cell = row.insertCell(i);
				cell.innerHTML = data[i];
			}
			console.log(Object.keys(data[4]).join());
			row.setAttribute("data-earmarks", Object.keys(data[4]).join());
		});
		console.log(snapshot);
	});
}

// Clickable Row in DataTable
$('#tableBody').on('click', 'tr', function () {
	var data = this.getAttribute("data-earmarks");
	console.log(data);
	modal_title.innerHTML = "出豬詳情："+this.children[1].innerHTML+"（"+this.children[0].innerHTML+"）";
	data = data.split(',');
	content_table.innerHTML = "";
	var row;
	for(i=0;i<data.length;i++){
		if(i%5==0)
			row=content_table.insertRow(content_table.rows.length);
		cell = row.insertCell(i%5);
		cell.innerHTML = data[i];
	}
	$("#myModal").modal("toggle"); // open modal
});
