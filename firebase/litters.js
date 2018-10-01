// Get Elements
var table = document.getElementById("tableBody");
var dataTable = '';
var litterRefPath;
var litterKey = ['strain', 'litterNo', 'fatherNo', 'motherNo', 'birthday', 'location', 'weanDate', 'note'];

function litterSearch(snapshot, key, query){return true;}

// Initial Table
function initPage(){
	litterRefPath = 'litters/' + userData.currentFarm + '/';
	console.log(litterRefPath);
	loadTable(litterRefPath, 'litterNo', -1, '', litterSearch, litterKey).then(function(){makeDataTable('#table');});
}

// Clickable Row in DataTable
$('#tableBody').on('click', 'tr', function () {
	var data = dataTable.row( this ).data();
	window.location='sucking.html?litter='+data[1];
});
