var table = document.getElementById("tableBody");

function initPage(){
    console.log("init");
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
            row.setAttribute("data-key", childSnapshot.key);
        })
    }).catch((error)=>{console.log(error)});
}


// clickable row
$('#tableBody').on('click', 'tr', function () {
	console.log(this.getAttribute("data-key"));
	window.location='analysisfarm.html?farm='+this.getAttribute("data-key");
});
