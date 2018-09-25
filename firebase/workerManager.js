// Initialize Firebase
var config = {
	apiKey: "AIzaSyDARFJhNCdtGa3rWyJmE8zGawiwlbNBFpE",
	authDomain: "breedic-ba254.firebaseapp.com",
	databaseURL: "https://breedic-ba254.firebaseio.com",
	projectId: "breedic-ba254",
	storageBucket: "breedic-ba254.appspot.com",
	messagingSenderId: "607804503321"
};

function defined(content) { return content? content:""}

function permissionMaking(p){
   var view, add, edit, report;
   if(p.search("view") != -1){
      view = "<input type='checkbox' checked><label>檢視</label>";
   }
   else{
      view = "<input type='checkbox' ><label>檢視</label>";
   }
   if(p.search("add") != -1){
      add = "<input type='checkbox' checked><label>新增</label>";
   }
   else{
      add = "<input type='checkbox'><label>新增</label>";
   }

   if(p.search("edit") != -1){
      edit = "<input type='checkbox' checked><label>修改</label>";
   }
   else{
      edit = "<input type='checkbox'><label>修改</label>";
   }

   if(p.search("report") != -1){
      report = "<input type='checkbox' checked disabled='disabled'><label>報表</label>";
   }
   else{
      report = "<input type='checkbox' disabled='disabled'><label>報表</label>";
   }

   return view + add + edit + report;
}

var uid, farmNo;
var employeeRef;
var employees = [];
var item, i;

$(document).ready(function(){
   firebase.initializeApp(config);

   firebase.auth().onAuthStateChanged(function(user){
      if(user){
         uid = user.uid;
         var memberRef = firebase.database().ref("users/" + uid);
         memberRef.once("value").then(function(snapshot){
            entry = snapshot.val();
            farmNo = entry.currentFarm;
            $("#create-user").attr("disabled", false);
         }).then(function(){
            employeeRef = firebase.database().ref("employee/" + farmNo);
            employeeRef.once("value").then(function(snapshot){
               i = 0;
               snapshot.forEach(function(employee){
                  item = [];
                  entry = employee.val();
                  console.log(entry);

                  var account = defined(entry.account);
                  var name = defined(entry.name);
                  var position = defined(entry.position);
                  var permission = defined(entry.permission);
                  var work = defined(entry.work);

                  item.push(account);
                  item.push(defined(entry.password));
                  item.push(name);
                  item.push(position);
                  item.push(defined(entry.email));
                  item.push(defined(entry.number));
                  item.push(work);
                  item.push(permission);
                  item.push(defined(entry.note));

                  permission_string = permissionMaking(permission);
                  work_string = work? "是":"否";
                  var button_string = "<button class='button' style='background-color:#e89980;' onClick='showEmployee(" + i + ")'>查看</button>"
                  $("#workers tr:last").after("<tr id='employee" + i + "'><td>" + account + "</td><td>" + name + "</td><td>" + position + "</td><td>" + permission_string + "</td><td>" + work_string + "</td><td>" + button_string + "</td></tr>");

                  i = i + 1;
                  employees.push(item);
               });
            });
         });
      }
      else{
         console.log("User not login yet.");
      }
   });

});

function showAddWindow(){
   $("#create-user-box").slideToggle();
   console.log(farmNo);
   console.log(employees);
}

function closeWindow(choice){
   if(choice){
      $("#view-user-box").slideToggle();
   }
   else{
      $("#create-user-box").slideToggle();
   }
}

function showEmployee(employeeNo){
   $("#view-user-box").slideToggle();
   $("#form2 input[name='account']").val(employees[employeeNo][0]);
   $("#form2 input[name='password']").val(employees[employeeNo][1]);
   $("#form2 input[name='name']").val(employees[employeeNo][2]);
   $("#form2 input[name='position']").val(employees[employeeNo][3]);
   $("#form2 input[name='email']").val(employees[employeeNo][4]);
   $("#form2 input[name='number']").val(employees[employeeNo][5]);
   if(employees[employeeNo][6]){
      $("#form2 input#work-yes2").prop("checked", true);
      $("#form2 input#work-no2").prop("checked", false);
   }
   else{
      $("#form2 input#work-yes2").prop("checked", false);
      $("#form2 input#work-no2").prop("checked", true);
   }
   var per = employees[employeeNo][7];
   if(per.search("view") != -1){
      $("#form2 input#auth-view2").prop("checked", true);
   }else{
      $("#form2 input#auth-view2").prop("checked", false);
   }
   if(per.search("add") != -1){
      $("#form2 input#auth-add2").prop("checked", true);
   }else{
      $("#form2 input#auth-add2").prop("checked", false);
   }
   if(per.search("edit") != -1){
      $("#form2 input#auth-edit2").prop("checked", true);
   }else{
      $("#form2 input#auth-edit2").prop("checked", false);
   }
   if(per.search("report") != -1){
      $("#form2 input#auth-report2").prop("checked", true);
   }else{
      $("#form2 input#auth-report2").prop("checked", false);
   }
}

function readData(form){
   var account = $("#form"+ form + " input[name='account']").val();
   var password = $("#form"+ form + " input[name='password']").val();
   var name = $("#form" + form + " input[name='name']").val();
   var position = $("#form" + form + " input[name='position']").val();
   var email = $("#form" + form + " input[name='email']").val();
   var number = $("#form" + form + " input[name='number']").val();
   var note = $("#form" + form + " input[name='note']").val();
   var permission;
   var work;
   if($("input#work-yes" + form).is(':checked')){
      work = 1;
   }
   else{
      work = 0;
   }
   if($("input#auth-view" + form).is(':checked')){
      permission = permission + "view";
   }
   if($("input#auth-add" + form).is(':checked')){
      permission = permission + ",add";
   }
   if($("input#auth-edit" + form).is(':checked')){
      permission = permission + ",edit";
   }
   if($("input#auth-report" + form).is(':checked')){
      permission = permission + ",report";
   }
   return [account, password, name, position, email, number, work, permission, note];
}


function addEmployee(){
   var account, password, name, position, email, number, work, permission, note;
   [account, password, name, position, email, number, work, permission, note] = readData(1);
   console.log(email);
   var uid;
   firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user){
      uid = user.uid;
      console.log(uid);
   }).catch(function(error){
      console.log("Fail to create user. Error: " + error.code + ", " + error.message);
   });

   employeeRef.push({
      "account": account,
      "password": password,
      "name": name,
      "position": position,
      "email": email,
      "number": number,
      "work": work,
      "permission": permission,
      "note": note
   });

   userRef = firebase.database().ref("users");
   userRef.push({
      "email": email,
      "password": password,
      "name": name,
      "farmNo": farmNo,
      "role": "employee",
      "privilege": permission, 
      "active": work,
      "currentFarm": farmNo,
      "note": note
   });
}

function EditEmployee(){
   var account, password, name, position, email, number, work, permission, note = readData(2);

}
