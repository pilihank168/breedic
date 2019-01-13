var date1 = document.getElementById("date1");
var date2 = document.getElementById("date2");
var two_date = document.getElementById("secondDate");

var keys = ["earmark", "volume", "concentration", "activity", "abnormalities", "acrosome", "midpiece", "dilute", "available", "note"];
var dataList = []

date1.addEventListener("change", function(){
	date2.min = date1.value;
	if(two_date.checked||!date2.value)
		date2.value = date1.value
	d1 = new Date(date1.value)
	d2 = new Date(date2.value)
	if(d2<d1)
		date2.value = date1.value
});

two_date.addEventListener("change", function(){
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

function initPage(){
	var semenRef = firebase.database().ref("semen/" + userDate.currentFarm).orderByChild("date").startAt(thresholdDate);

}

//function query()

//var ref = firebase.database().ref("semen/" + userDate.currentFarm).orderByChild(key).startAt().endAt()

function loadDB(ref, sorting){
	dataList = []
	ref.once("value").then((snapshot)=>{
		snapshot.forEach( (childShot)=>{
			var data = []
			for(i=0;i<keys.length;i++){
				data.push(childSnapshot.child(keys[i]).val())
			}
			dataList.push(data);
		});
	});
}

function buildDataTable(){
	//from dataList to table
	//apply dataTable.js
}
