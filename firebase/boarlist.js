// Initialize Firebase
var config = {
apiKey: "AIzaSyDARFJhNCdtGa3rWyJmE8zGawiwlbNBFpE",
		authDomain: "breedic-ba254.firebaseapp.com",
		databaseURL: "https://breedic-ba254.firebaseio.com",
		projectId: "breedic-ba254",
		storageBucket: "breedic-ba254.appspot.com",
		messagingSenderId: "607804503321"
};
firebase.initializeApp(config);

function centerCell(row,i){
	cell=row.insertCell(i);
	cell.setAttribute('style','text-align:center;');
	return cell;
}

function defined(content){return content ? content : '';}

function loadTable(order_key, search_key, query){
	console.log(order_key, search_key, query);
	table.innerHTML='';
	var boarsRef = firebase.database().ref('boars/0/').orderByChild(order_key);
	boarsRef.once('value').then(function(snapshot){
		console.log('once');
		snapshot.forEach(function(childSnapshot) {
			entry = childSnapshot.val();
			if(search_key==-1 || query=='' || (search_key==0 && entry.strain.includes(query)) || (search_key==1 && entry.earmark.includes(query)) ||
							 (search_key==2 && entry.registerNo.includes(query)) || (search_key==3 && entry.birthday.includes(query))){
				var row = table.insertRow(-1);
				var cells = [];
				for(i=0;i<8;i++){
					var cell = centerCell(row,i);
					cells.push(cell);
				}
				cells[0].innerHTML = entry.strain;
				cells[1].innerHTML = entry.earmark;
				cells[2].innerHTML = entry.registerNo;
				cells[3].innerHTML = entry.birthday;
				cells[4].innerHTML = defined(entry.position);
				//cell5.innerHTML = entry.age
				cells[6].innerHTML = 'X';
				cells[7].innerHTML = defined(entry.note);
			}
		});
	}).then(function(){makeDataTable('#aboarTable');});
}

function makeDataTable(tableID){
	$(tableID).css('visibility', 'initial');
	dataTable = $(tableID).DataTable({
		searching:false,
		ordering:false,
		order:[1,'asc'],
		lengthChange:false,
		language: {
			//'lengthMenu':'<input type="submit" value="新增公豬" class="button small alt" onclick="window.location="uploadBoar.html";" />',  
			'info':'',
			search:'搜尋:',
			"zeroRecords": "找不到相關豬隻",
			paginate: {
				first:    '«',
				previous: '上一頁',//'‹',
				next:     '下一頁',//'›',
				last:     '»'
			},
			aria: {
				paginate: {
					first:    '第一頁',
					previous: '上一頁',
					next:     '下一頁',
					last:     '最後頁'
				}
			}
		}
	});
}

// Get Elements
var table = document.getElementById("boarTable");
var tableFilter = document.getElementById('tableFilter');
var dataTable='';
var key = document.getElementById('filters');
var query = document.getElementById('search');

// Initial Table
console.log(tableFilter.value);
loadTable(tableFilter.value, -1, '');

// Sort Table with Filter
tableFilter.addEventListener('change',function(){
	console.log(tableFilter.value);
	$('#aboarTable').css('visibility', 'hidden');
	dataTable.destroy();
	loadTable(tableFilter.value, key.value, query.value);
});

// Search
$('#searchBtn').click(function(){
	console.log(query.value, key.value);
	$('#aboarTable').css('visibility', 'hidden');
	dataTable.destroy();
	loadTable(tableFilter.value, key.value, query.value);
});

// Clickable Row in DataTable
$('#aboarTable tbody').on('click', 'tr', function () {
	var data = dataTable.row( this ).data();
	window.location='boardata.html?ear='+data[1];
});
