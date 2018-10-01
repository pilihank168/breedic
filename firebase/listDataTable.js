function defined(content){return content ? content : '';}

function centerCell(row,i){
	cell=row.insertCell(i);
	cell.setAttribute('style','text-align:center;');
	return cell;
}

function insertRow(keyArray, snapshot){
	var row = table.insertRow(-1);
	var cells = [];
	for(i=0;i<keyArray.length;i++){
		var cell = centerCell(row,i);
		if(keyArray[i]==='')
			cell.innerHTML = '';
		else
			cell.innerHTML = defined(snapshot.child(keyArray[i]).val())
		cells.push(cell);
	}
}

function loadTable(refPath, order_key, search_key, query, correspondSearch, tableKey){
	table.innerHTML='';
	console.log('order:',order_key);
	var listRef = firebase.database().ref(refPath).orderByChild(order_key);
	return listRef.once('value').then(function(snapshot){
		snapshot.forEach(function(childSnapshot){
			if(correspondSearch(childSnapshot, search_key, query))
				insertRow(tableKey, childSnapshot);
		});
	});
}

function makeDataTable(tableID){
	$(tableID).css('visibility', 'initial');
	dataTable = $(tableID).DataTable({
		searching:false,
		ordering:false,
		order:[1,'asc'],
		lengthChange:false,
		language: {
			'info':'',
			search:'搜尋:',
			"zeroRecords": "找不到相關資料",
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
