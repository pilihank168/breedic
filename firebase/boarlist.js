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

function loadTable(key){
	table.innerHTML='';
	var boarsRef = firebase.database().ref('boars/0/').orderByChild(key);
	boarsRef.once('value').then(function(snapshot){
		snapshot.forEach(function(childSnapshot) {
			entry = childSnapshot.val();
			var row = table.insertRow(-1);
			var cells = [];
			for(i=0;i<8;i++){
				var cell = centerCell(row,i);
				cells.push(cell);
			}
			cells[0].innerHTML = entry.strain;
			cells[1].innerHTML = '<a href="'+'boardata.html?ear='+entry.earmark+'">'+entry.earmark+'</a>';
			cells[2].innerHTML = entry.registerNo;
			cells[3].innerHTML = entry.birthday;
			cells[4].innerHTML = defined(entry.position);
			//cell5.innerHTML = entry.age
			cells[6].innerHTML = 'X';
			//cell7.innerHTML = entry.age
		});
	}).then(function(){
		dataTable = $('#aboarTable').DataTable({
			searching:false,
			ordering:false,
			lengthChange:false,
			language: {
				'info':'',
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
	});
}

// Get Elements
var boarList = document.getElementById("boarList");
var boarListBtn = document.getElementById("boarListBtn");
var table = document.getElementById("boarTable");
//var table = $('#aboarTable').DataTable();
var tableFilter = document.getElementById('tableFilter');
var dataTable='';

// Initial Table
console.log(tableFilter.value);
loadTable(tableFilter.value);

// Sort Table with Filter
tableFilter.addEventListener('change',function(){
	console.log(tableFilter.value);
	dataTable.destroy();
	loadTable(tableFilter.value);
});


