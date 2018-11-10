// Get Elements
var table = document.getElementById("tableBody");
var key = document.getElementById('filters');
var query = document.getElementById('search');
var dataTable = '';
var weanerRefPath;
var weanerKey = ['strain', 'earmark', 'identity', 'gender', 'age', 'location'];

function weanerSearch(snapshot, key, query){
	return (key==-1 || query=='' || snapshot.child(key).val().includes(query))
}

// Initial Table
function initPage(){
	weanerRefPath = 'weanerList/' + userData.currentFarm + '/';
	loadTable(weanerRefPath, 'strain', -1, '', weanerSearch, weanerKey).then(function(){makeDataTable('#table');});
}

// Search
$('#searchBtn').click(function(){
	console.log(query.value, key.value);
	$('#table').css('visibility', 'hidden');
	console.log(dataTable);
	dataTable.destroy();
	loadTable(weanerRefPath, 'strain', key.value, query.value, weanerSearch, weanerKey).then(function(){makeDataTable('#table');});
});
