var emails = [];
var table = document.getElementById("tableBody");
var keys = ["name", "owner", "size", "type", "phone", "address", "note"];
var createBtn = document.getElementById("createUser");
var newFarm = document.getElementById("newFarm");
var functions, createUser;
var update = document.getElementById("update");
var ownerSelect = document.getElementById("farmOwner");
var owners;

// add new analyst
createBtn.addEventListener("click", function(){
    newFarm.reset();
    newOwner.innerHTML = "";
    $("#myModal").modal("toggle");
});

newFarm.addEventListener("submit", function(e){
    e.preventDefault();
    // create new owner if necessary
    var p_array = [];
    var uid;
    if(ownerSelect.value==="newOwner"){
        newUserObj = {
            email:document.getElementById("newEmail").value,
            password:document.getElementById("newPassword").value,
            name:document.getElementById("newName").value,
            active:document.getElementById("newActiveYes").checked,
            role:"owner",
            farm:-1,
            permission:{add:true, modify:true, report:true}
        }
        p_array.push(createUser(newUserObj));
    }
    Promise.all(p_array).then(function(result){
        console.log(result)
        if(result.length)
            uid = result[0].data.uid;
        else
            uid = ownerSelect.value;
        console.log(uid);
        addFarm = firebase.functions().httpsCallable('addFarm');
        return addFarm({uid:uid});
    }).then(function(result){
        farmNo = result.data.farmNo;
        farmObj = {name:document.getElementById("farmName").value,
                    size:document.getElementById("farmSize").value,
                    type:document.getElementById("farmType").value,
                    address:document.getElementById("farmAddress").value,
                    phone:document.getElementById("farmPhone").value,
                    note:document.getElementById("farmNote").value};
        newFarmRef = firebase.database().ref("farms/" + farmNo);
        newFarmP = newFarmRef.update(farmObj);
        promises = [newFarmP]
        if(ownerSelect.value==="newOwner"){
            newOwnerRef = firebase.database().ref("owners/" + uid);
            newUserObj["password"] = null;
            newUserObj["phone"] = document.getElementById("newPhone").value;
            newUserObj["note"] = document.getElementById("newNote").value;
            promises.push(newOwnerRef.set(newUserObj));
        }
        return Promise.all(promises);
    }).then(function(){
		window.location.replace("farm.html");
    }).catch(function(error){
        console.log(error);
    });
});

//TODO modify existed analyst
function modifyModal(row){
    keys.forEach(function(key){
        if(key==="owner")
            document.getElementById(key).innerHTML = row.getAttribute('data-'+key);
        else
            document.getElementById(key).value = row.getAttribute("data-"+key);
    });
    update.setAttribute('data-key', row.getAttribute('data-key'));
}

update.addEventListener("submit", function(e){
    e.preventDefault();
    updateFarmObj = {}
    keys.forEach(function(key){
        if(key!=="owner")
            updateFarmObj[key] = document.getElementById(key).value;
    });
    var updateFarmRef = firebase.database().ref("farms/" + update.getAttribute("data-key"));
    updateFarmRef.update(updateFarmObj).then(function(){
		window.location.replace("farm.html");
    }).catch(function(error){
        console.log(error.code, error.message);
    });
});

// load existed analyst
function initPage(){
    farmRef = firebase.database().ref("farms/");
    ownerRef = firebase.database().ref("owners/");
    userRef = firebase.database().ref("users/");
    const initP = [farmRef.once("value"), userRef.once("value"), ownerRef.once("value")];
    Promise.all(initP).then(function(snapshot){
        console.log(createBtn.disabled);
        owners = snapshot[2].val();
        for(key in owners){
            ownerSelect.innerHTML += '<option value="' + key + '">' + owners[key].name + '</option>';
        };
        ownerSelect.innerHTML += '<option value="newOwner">新增場主帳號</option>';
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

//
ownerSelect.addEventListener("change", function(){
    if(ownerSelect.value==="newOwner"){
        newOwner.innerHTML += '<div class="row" id="newOwner">' + 
        '<div class="3u" align="right"><span class="label">信箱：</span></div>' +
        '<div class="6u" style="padding:0 0 0.5em 0.5em!important">' +
            '<input type="text" id="newEmail" autocomplete="off" required><p id="checkMessage" style="margin:0!important"></p>' +
        '</div>' +
        '<div class="2u" style="padding:0 0 0 0.5em!important">' +
            '<span class="button fit special" style="padding:0 1em!important;margin:0" id="checkEmail">檢查</span>' +
        '</div>' +
        '<div class="3u" align="right"><span class="label">密碼：</span></div>' +
        '<div class="8u" style="padding:0 0 0.5em 0.5em!important"><input type="password" id="newPassword" required>*長度最少為六碼</div>' +
        '<div class="3u" align="right"><span class="label">姓名：</span></div>' +
        '<div class="8u" style="padding:0 0 0.5em 0.5em!important"><input type="text" id="newName" required></div>' +
        '<div class="3u" align="right"><span class="label">電話：</span></div>' +
        '<div class="8u" style="padding:0 0 0.5em 0.5em!important"><input type="text" id="newPhone"></div>' +
        '<div class="3u" align="right"><span class="label">開通：</span></div>' +
        '<div class="8u" style="padding:0 0 0.5em 0.5em!important">' +
            '<span class="label"><input id="newActiveYes" type="radio" value="yes" name="active" checked/><label for="newActiveYes">是</label></span>' +
            '<span class="label"><input id="newActiveNo" type="radio" value="no" name="active"><label for="newActiveNo">否</label></span><br>' +
        '</div>' +
        '<div class="3u" align="right"><span class="label">備註：</span></div>' +
        '<div class="8u" style="padding:0 0 0.5em 0.5em!important"><input type="text" id="newNote"></div>';
        document.getElementById("checkEmail").addEventListener("click", function(){
            var checkMessage = document.getElementById("checkMessage");
            console.log(document.getElementById("newEmail").value);
            if(!document.getElementById("newEmail").value)
                checkMessage.innerHTML = "請輸入信箱";
            else if(emails.includes(document.getElementById("newEmail").value))
                checkMessage.innerHTML = "已有人使用";
            else
                checkMessage.innerHTML = "可以使用";
        });
        document.getElementById("newEmail").value="";
        document.getElementById("newPassword").value="";
    }
    else
        newOwner.innerHTML = ""
});
