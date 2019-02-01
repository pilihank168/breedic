function centerCell(row,i){
	cell=row.insertCell(i);
	cell.setAttribute('style','text-align:center;');
	return cell;
}
var boarList = document.getElementById("boarList");
var boarListBtn = document.getElementById("boarListBtn");
var table = document.getElementById("boarTable");
//boarListBtn.addEventListener("click", function(){
	//
var url_string = window.location.href;
var url = new URL(url_string);
var earmark = url.searchParams.get("ear");
var photo = document.getElementById("photo");
var origin = document.getElementById("origin");
//var earmark = "201-4";
var boarsRef = firebase.database().ref('boars/0/'+earmark);
boarsRef.once('value').then(function(snapshot){
	var photoPath = "gg";
	entry = snapshot.val();
	console.log(snapshot.key, snapshot.val());
	var row = table.insertRow(1);
	var cell0 = centerCell(row,0);
	var cell1 = centerCell(row,1);
	var cell2 = centerCell(row,2);
	var cell3 = centerCell(row,3);
	var cell4 = centerCell(row,4);
	var cell5 = centerCell(row,5);
	var cell6 = centerCell(row,6);
	var cell7 = centerCell(row,7);
	cell0.innerHTML = entry.strain;
	cell1.innerHTML = entry.earmark;
	cell2.innerHTML = entry.registerNo;
	cell3.innerHTML = entry.birthday;
	//cell4.innerHTML = x
	//cell5.innerHTML = entry.age
	cell6.innerHTML = 'X';
	//cell7.innerHTML = entry.age
	weight.innerHTML += "<a href='#' class='button small'>編輯</a></br>體重："+entry.weight+"<br>\背脂："+entry.backFat;
	origin.innerHTML = "豬隻來源："+entry.source;
	photoPath = "0/"+snapshot.key+".png";
	console.log(photoPath);
	var photoRef = firebase.storage().ref(photoPath);
	photoRef.getDownloadURL().then(function(url) {
		photo.src=url;
	});
});
