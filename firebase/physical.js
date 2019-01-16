
var table = document.getElementById("tableBody");
var keyArray = ["date", "earmark", "sex", "weight", "fat", "depth", "surface", "note"];

function initPage(){
	var listRef = firebase.database().ref("physical/" + userData.currentFarm + "/").orderByChild("earmark");
	listRef.once('value').then(function(snapshot){
		snapshot.forEach(function(childSnapshot){
			console.log(0);
			var row = table.insertRow(table.rows.length-1);
			for(i=0;i<keyArray.length;i++){
				var cell = row.insertCell(i);
				data = childSnapshot.child(keyArray[i]).val()
				cell.innerHTML = i!=2 ? data : (data=="F"?"母豬":"公豬")
			}
			row.insertCell(-1)
		});
	});
}

function unique(a){
    return a.filter(function(value, index, self) {return self.indexOf(value) === index;})
}
