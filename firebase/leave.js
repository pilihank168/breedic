var table = document.getElementById("tableBody");
var keys = ["date", "earmark", "type", "note"]

function initPage(){
    var ref = firebase.database().ref("leave/" + userData.currentFarm).orderByChild("date");
    ref.once("value").then( (snapshot)=>{
        snapshot.forEach( (childSnapshot)=>{
            var row = table.insertRow(0);
            for(i=0;i<keys.length;i++){
                var cell = row.insertCell(i);
                value = childSnapshot.child(keys[i]).val();
                cell.innerHTML = i!=2 ? value:( value==="died" ? "死亡" : "淘汰");
            }
        });
    });
}
