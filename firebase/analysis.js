var table = document.getElementById("tableBody");

function initPage(){
    farmRef = firebase.database().ref("farms/");
    ownerRef = firebase.database().ref("owners/");
    const initP = [farmRef.once("value"), ownerRef.once("value")];
    Promise.all(initP).then(function(snapshot){
        owners = snapshot[1].val();
        snapshot[0].forEach(function(childSnapshot){
            entry = childSnapshot.val();
            var row = table.insertRow(-1);
            row.setAttribute("data-key", childSnapshot.key);
            var cell = row.insertCell(0);
            cell.innerHTML = childSnapshot.key;
            cell = row.insertCell(1);
            cell.innerHTML = entry.name;
            cell = row.insertCell(2);
            cell.innerHTML = owners[entry.owner].name;
            cell = row.insertCell(3);
            if(entry.lastData){
                var d = new Date(entry.lastData)
                cell.innerHTML = d.toLocaleString();
            }
            else
                cell.innerHTML = "無資料";
            cell = row.insertCell(4);
            if(entry.lastAnalysis){
                d = new Date(entry.lastAnalysis);
                cell.innerHTML = d.toLocaleString();
            }
            else
                cell.innerHTML = "無資料";
            row.setAttribute("data-key", childSnapshot.key);
        })
    }).catch((error)=>{console.log(error)});
}


// clickable row
$('#tableBody').on('click', 'tr', function () {
	window.location='analysisfarm.html?farm='+this.getAttribute("data-key");
});
