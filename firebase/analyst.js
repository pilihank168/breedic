var emails = [];
var table = document.getElementById("tableBody");
var keys = ["email", "name", "phone", "active", "note"];
var createBtn = document.getElementById("createUser");
var newAccount = document.getElementById("newAccount");
var checkEmail = document.getElementById("checkEmail");
var checkMessage = document.getElementById("checkMessage");
var functions, createUser;
var update = document.getElementById("update");

// add new analyst
createBtn.addEventListener("click", function(){
    checkMessage.innerHTML = "";
    newAccount.reset();
    $("#myModal").modal("toggle");
});

checkEmail.addEventListener("click", function(){
    console.log(document.getElementById("newEmail").value);
    if(!document.getElementById("newEmail").value)
        checkMessage.innerHTML = "請輸入信箱";
    else if(emails.includes(document.getElementById("newEmail").value))
        checkMessage.innerHTML = "已有人使用";
    else
        checkMessage.innerHTML = "可以使用";
});

newAccount.addEventListener("submit", function(e){
    e.preventDefault();
    newUserObj = {
        email:document.getElementById("newEmail").value,
        password:document.getElementById("newPassword").value,
        name:document.getElementById("newName").value,
        active:document.getElementById("newActiveYes").checked,
        role:"analyst",
        farm:-1,
        permission:{add:true, modify:true, report:true}
    }
    createUser(newUserObj).then(function(result){
        console.log(result);
        newAnalystRef = firebase.database().ref("analysts/" + result.data.uid);
        newUserObj["password"] = null;
        newUserObj["phone"] = document.getElementById("newPhone").value;
        newUserObj["note"] = document.getElementById("newNote").value;
        return newAnalystRef.set(newUserObj);
    }).then(function(){
		window.location.replace("analyst.html");
    }).catch(function(error){
        console.log(error.code, error.message);
    });
});

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
        updateAnalystRef = firebase.database().ref("analysts/" + result.data.uid);
        updateUserObj["password"] = null;
        updateUserObj["phone"] = document.getElementById("phone").value;
        updateUserObj["note"] = document.getElementById("note").value;
        return updateAnalystRef.update(updateUserObj);
    }).then(function(){
		window.location.replace("analyst.html");
    }).catch(function(error){
        console.log(error.code, error.message);
    });
});

// load existed analyst
function initPage(){
    analystRef = firebase.database().ref("analysts/");
    userRef = firebase.database().ref("users/");
    const initP = [analystRef.once("value"), userRef.once("value")];
    Promise.all(initP).then(function(snapshot){
        console.log(createBtn.disabled);
        snapshot[0].forEach(function(childSnapshot){
            entry = childSnapshot.val();
            var row = table.insertRow(-1);
            row.setAttribute("data-key", childSnapshot.key);
            keys.forEach(function(key, index){
                var cell = row.insertCell(index);
                cell.innerHTML = index!==3?entry[key]:(entry[key]?"是":"否");
                row.setAttribute("data-"+key.toLowerCase(), entry[key]);
            });
        })
        snapshot[1].forEach(function(childSnapshot){
            emails.push(childSnapshot.child("email").val());
        });
        return true;
    }).then(function(){
        console.log(createBtn.disabled);
        createBtn.disabled=false;
        functions = firebase.functions();
        createUser = firebase.functions().httpsCallable('createUser');
    });
}

// clickable row
$('#tableBody').on('click', 'tr', function () {
    modifyModal(this);
	$("#editModal").modal("toggle");
});
