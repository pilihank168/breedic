var row = document.getElementById("inputRow");
var add = document.getElementById("addBtn");
var table = document.getElementById("tableBody");
var date = document.getElementById("date");
var form = document.getElementById("form");

var promise_array=[];

function centerCell(row,i){
	cell=row.insertCell(i);
	cell.setAttribute('style','text-align:center;');
	return cell;
}
/*
function sememPromise(row){
	
	const p = sememRef.set({
		name:row.children[0].children[0].value;
		volume:row.children[1].children[0].value;
		concentration:row.children[2].children[0].value;
		activity:row.children[3].children[0].value;
		gg:row.children[4].children[0].value;
		gg:row.children[5].children[0].value;
		gg:row.children[6].children[0].value;
		dilute:row.children[7].children[0].value;
		available:row.children[8].children[0].value;
		note:row.children[9].children[0].value;
	});
	promise_array.push(p);
}
*/
form.addEventListener("submit", (event)=>{
	event.preventDefault();
	console.log(table);
	var newRow = table.insertRow(table.rows.length-1);
	var cells = [];
	for(i=0;i<row.children.length;i++){
		var cell = centerCell(newRow, i);
		cell.innerHTML = row.children[i].children[0].value;
		row.children[i].children[0].value='';
	}
	var cell = centerCell(newRow, row.children.length);
	cell.innerHTML = '<td><button class="button">取消</button></td>'
});
