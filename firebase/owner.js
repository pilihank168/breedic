var emails = [];
var table = document.getElementById("tableBody");
var keys = ["email", "name", "phone", "active", "note"];
var functions, createUser;
var update = document.getElementById("update");

// modify existed analyst
function modifyModal(row){
    row.getAttribute("data-email");
    document.getElementById("email").innerHTML = row.getAttribute("data-email");
    document.getElementById("password").value = "";
    document.getElementById("name").value = row.getAttribute("data-name");
    document.getElementById("phone").value = row.getAttribute("data-phone");
    if(row.getAttribute("data-active")==="true")
        document.getElementById("activeYes").checked=true;
    else
        document.getElementById("activeNo").checked=true;
    document.getElementById("note").value = row.getAttribute("data-note");
    update.setAttribute('data-key', row.getAttribute('data-key'));
}

update.addEventListener("submit", function(e){
    e.preventDefault();
    updateUserObj = {
        uid:update.getAttribute("data-key"),
        active:document.getElementById("activeYes").checked,
        name:document.getElementById("name").value
    }
    if(document.getElementById("password").value)
        updateUserObj["password"] = document.getElementById("password").value;
    changeUser = firebase.functions().httpsCallable('changeUser');
    console.log(updateUserObj);
    changeUser(updateUserObj).then(function(result){
        console.log(result);
        updateOwnerRef = firebase.database().ref("owners/" + result.data.uid);
        updateUserObj["password"] = null;
        updateUserObj["phone"] = document.getElementById("phone").value;
        updateUserObj["note"] = document.getElementById("note").value;
        return updateOwnerRef.update(updateUserObj);
    }).then(function(){
		window.location.replace("owner.html");
    }).catch(function(error){
        console.log(error.code, error.message);
    });
});

// load existed analyst
function initPage(){
    ownerRef = firebase.database().ref("owners/");
    userRef = firebase.database().ref("users/");
    const initP = [ownerRef.once("value"), userRef.once("value")];
    Promise.all(initP).then(function(snapshot){
        snapshot[0].forEach(function(childSnapshot){
            entry = childSnapshot.val();
            var row = table.insertRow(-1);
            row.setAttribute("data-key", childSnapshot.key);
            keys.forEach(function(key, index){
                var cell = row.insertCell(index);
                cell.innerHTML = index!==3?entry[key]||"":(entry[key]?"是":"否");
                row.setAttribute("data-"+key.toLowerCase(), (entry[key]||""));
            });
        })
        snapshot[1].forEach(function(childSnapshot){
            emails.push(childSnapshot.child("email").val());
        });
        return true;
    }).then(function(){
        console.log(createBtn.disabled);
        createBtn.disabled=false;
    });
}

// clickable row
$('#tableBody').on('click', 'tr', function () {
    modifyModal(this);
	$("#editModal").modal("toggle");
});
