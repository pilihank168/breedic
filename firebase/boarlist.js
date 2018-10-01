// Get Elements
var table = document.getElementById("tableBody");
var tableFilter = document.getElementById('tableFilter');
var key = document.getElementById('filters');
var query = document.getElementById('search');
var dataTable = '';
var boarRefPath;
var boarKey = ['strain', 'earmark', 'registerNo', 'birthday', 'location', '', '', 'note'];

function boarSearch(snapshot, key, query){
	return (key==-1 || query=='' || snapshot.child(key).val().includes(query))
}

// Initial Table
function initPage(){
	boarRefPath = 'boars/' + userData.currentFarm + '/';
	console.log(tableFilter.value, boarRefPath);
	loadTable(boarRefPath, tableFilter.value, -1, '', boarSearch, boarKey).then(function(){makeDataTable('#table');});
}

// Sort Table with Filter
tableFilter.addEventListener('change',function(){
	console.log(tableFilter.value);
	$('#table').css('visibility', 'hidden');
	dataTable.destroy();
	loadTable(boarRefPath, tableFilter.value, key.value, query.value, boarSearch, boarKey).then(function(){makeDataTable('#table');});
});

// Search
$('#searchBtn').click(function(){
	console.log(query.value, key.value);
	$('#table').css('visibility', 'hidden');
	dataTable.destroy();
	loadTable(boarRefPath, tableFilter.value, key.value, query.value, boarSearch, boarKey).then(function(){makeDataTable('#table');});
});

// Clickable Row in DataTable
$('#tableBody').on('click', 'tr', function () {
	var data = dataTable.row( this ).data();
	window.location='boardata.html?ear='+data[1];
});
