var table = document.getElementById("tableBody");
var keys = ["name", "owner", "size", "type", "phone", "address", "note"];
var owners;

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
            cell.innerHTML = owners[entry.owner].email;
            cell = row.insertCell(4);
            cell.innerHTML = entry.note;
            keys.forEach(function(key, index){
                if(key==="owner")
                    row.setAttribute("data-owner", owners[entry[key]].name);
                else
                    row.setAttribute("data-"+key.toLowerCase(), entry[key]);
            });
        })
    }).catch((error)=>console.log(error));
}

// clickable row
$('#tableBody').on('click', 'tr', function () {
    var farmNo = parseInt(this.getAttribute("data-key"));
    changeCurrentFarm = firebase.functions().httpsCallable('changeCurrentFarm');
    changeCurrentFarm({farm:farmNo}).then((result)=>{
        return firebase.auth().currentUser.getIdTokenResult(true);
    }).then((result)=>{
		window.location = "upload.html";
	}).catch((error)=>{console.log(error)});
});
