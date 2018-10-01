// Get Elements
var table = document.getElementById("tableBody");
var tableFilter = document.getElementById('tableFilter');
var key = document.getElementById('filters');
var query = document.getElementById('search');
var dataTable = '';
var sowRefPath;
var sowKey = ['strain', 'earmark', 'registerNo', 'birthday', 'fatherNo', 'motherNo', 'location', '', 'note'];

function sowSearch(snapshot, key, query){
	return (key==-1 || query=='' || snapshot.child(key).val().includes(query))
}

// Initial Table
function initPage(){
	sowRefPath = 'sowList/' + userData.currentFarm + '/';
	console.log(tableFilter.value, sowRefPath);
	loadTable(sowRefPath, tableFilter.value, -1, '', sowSearch, sowKey).then(function(){makeDataTable('#table');});
}

// Sort Table with Filter
tableFilter.addEventListener('change',function(){
	console.log(tableFilter.value);
	$('#table').css('visibility', 'hidden');
	dataTable.destroy();
	loadTable(sowRefPath, tableFilter.value, key.value, query.value, sowSearch, sowKey).then(function(){makeDataTable('#table');});
});

// Search
$('#searchBtn').click(function(){
	console.log(query.value, key.value);
	$('#table').css('visibility', 'hidden');
	dataTable.destroy();
	loadTable(sowRefPath, tableFilter.value, key.value, query.value, sowSearch, sowKey).then(function(){makeDataTable('#table');});
});

// Clickable Row in DataTable
$('#tableBody').on('click', 'tr', function () {
	var data = dataTable.row( this ).data();
	window.location='sowdata.html?ear='+data[1];
});
