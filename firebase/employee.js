var emails = [];
var table = document.getElementById("tableBody");
var keys = ["name", "email", "phone", "active", "position", "permission", "note"];
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
    document.getElementById("newAdd").checked=false;
    document.getElementById("newModify").checked=false;
    document.getElementById("newReport").checked=false;
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
        role:"employee",
        farm:userData.currentFarm,
        position:document.getElementById("newPosition").value,
        permission:{add:document.getElementById("newAdd").checked, 
                    modify:document.getElementById("newModify").checked,
                    report:document.getElementById("newReport").checked}
    }
    createUser(newUserObj).then(function(result){
        console.log(result);
        newEmployeeRef = firebase.database().ref("employees/" + userData.currentFarm + "/" + result.data.uid);
        newUserObj["password"] = null;
        newUserObj["phone"] = document.getElementById("newPhone").value;
        newUserObj["note"] = document.getElementById("newNote").value;
        return newEmployeeRef.set(newUserObj);
    }).then(function(){
		window.location.replace("employee.html");
    }).catch(function(error){
        console.log(error.code, error.message);
    });
});

// modify existed analyst
function modifyModal(row){
    console.log(row);
    row.getAttribute("data-email");
    document.getElementById("email").innerHTML = row.getAttribute("data-email");
    document.getElementById("password").value = "";
    document.getElementById("name").value = row.getAttribute("data-name");
    document.getElementById("phone").value = row.getAttribute("data-phone");
    document.getElementById("position").value = row.getAttribute("data-position");
    document.getElementById("add").checked = (row.getAttribute("data-add")==="true")
    document.getElementById("modify").checked = (row.getAttribute("data-modify")==="true")
    document.getElementById("report").checked = (row.getAttribute("data-report")==="true")
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
        name:document.getElementById("name").value,
        position:document.getElementById("position").value,
        permission:{add:document.getElementById("add").checked, 
                    modify:document.getElementById("modify").checked,
                    report:document.getElementById("report").checked}
    }
    if(document.getElementById("password").value)
        updateUserObj["password"] = document.getElementById("password").value;
    changeUser = firebase.functions().httpsCallable('changeUser');
    console.log(updateUserObj);
    changeUser(updateUserObj).then(function(result){
        console.log(result);
        updateEmployeeRef = firebase.database().ref("employees/" + userData.currentFarm + "/" + result.data.uid);
        updateUserObj["password"] = null;
        updateUserObj["phone"] = document.getElementById("phone").value;
        updateUserObj["note"] = document.getElementById("note").value;
        return updateEmployeeRef.update(updateUserObj);
    }).then(function(){
		window.location.replace("employee.html");
    }).catch(function(error){
        console.log(error.code, error.message);
    });
});

function check(value){
    console.log(value);
    return value?" checked":"";
}

// load existed analyst
function initPage(){
    employeeRef = firebase.database().ref("employees/"+userData.currentFarm);
    userRef = firebase.database().ref("users/");
    const initP = [employeeRef.once("value"), userRef.once("value")];
    Promise.all(initP).then(function(snapshot){
        console.log(createBtn.disabled);
        snapshot[0].forEach(function(childSnapshot, i){
            entry = childSnapshot.val();
            console.log(entry);
            var row = table.insertRow(-1);
            row.setAttribute("data-key", childSnapshot.key);
            keys.forEach(function(key, index){
                var cell = row.insertCell(index);
                if(key==="permission"){
                    var per = entry[key];
                    console.log(per);
                    cell.innerHTML = '<span class="label">' + 
                    '<input id="add-'+i+'" type="checkbox" name="per-'+i+'" disabled'+(check(per.add))+'><label for="add-'+i+'">新增</label>' + 
                    '<input id="modify-'+i+'" type="checkbox" name="per-'+i+'" disabled'+check(per.modify)+'><label for="modify-'+i+'">修改</label>' + 
                    '<input id="report-'+i+'" type="checkbox" name="per-'+i+'" disabled'+check(per.report)+'><label for="report-'+i+'">報表</label>' +
                    '</span>' ;
                    row.setAttribute("data-add", per.add);
                    row.setAttribute("data-modify", per.modify);
                    row.setAttribute("data-report", per.report);
                }
                else{
                    console.log(key, entry[key]);
                    cell.innerHTML = key!=="active"?entry[key]||"":(entry[key]?"是":"否");
                    row.setAttribute("data-"+key.toLowerCase(), entry[key]||"");
                }
            });
        })
        snapshot[1].forEach(function(childSnapshot){
            emails.push(childSnapshot.child("email").val());
        });
        return true;
    }).then(function(){
        console.log(createBtn.disabled);
        createBtn.disabled=false;
        createUser = firebase.functions().httpsCallable('createUser');
    });
}

// clickable row
$('#tableBody').on('click', 'tr', function () {
    modifyModal(this);
	$("#editModal").modal("toggle");
});
