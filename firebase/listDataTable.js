function defined(content){return content ? content : '';}

function centerCell(row,i){
	cell=row.insertCell(i);
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

function singleDateEvent(date1, date2, checkbox){
    date1.value = '';
    date2.value = '';
    checkbox.checked=false;
	date1.addEventListener("change", function(){
		date2.min = date1.value;
		if(checkbox.checked||!date2.value)
			date2.value = date1.value
		d1 = new Date(date1.value)
		d2 = new Date(date2.value)
		if(d2<d1)
			date2.value = date1.value
	});
	checkbox.addEventListener("change", function(){
		if(this.checked){
			$(date2).addClass("disabled");
			date2.readOnly = true;
			date2.value = date1.value
		}
		else{
			$(date2).removeClass("disabled");
			date2.readOnly = false;
		}
	})
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
			"emptyTable": "找不到相關資料",
            "infoEmpty":"",
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
