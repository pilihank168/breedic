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

$(document).ready(function(){
   firebase.initializeApp(config);

   firebase.auth().onAuthStateChanged(function(user){
      if(user){
         uid = user.uid;
         var memberRef = firebase.database().ref("users/" + uid);
         memberRef.once("value").then(function(snapshot){
            entry = snapshot.val();
            farmNo = entry.currentFarm;
            console.log(farmNo);
         }).then(function(){
            employeeRef = firebase.database().ref("employee/" + farmNo);
            employeeRef.once("value").then(function(snapshot){
               snapshot.forEach(function(employee){
                  entry = employee.val();
                  console.log(entry);
                  var account = defined(entry.account);
                  var name = defined(entry.name);
                  var position = defined(entry.position);
                  var permission = defined(entry.permission);
                  var work = defined(entry.work);
                  permission_string = permissionMaking(permission);
                  work_string = work? "是":"否";
                  $("#workers tr:last").after("<tr><td>" + account + "</td><td>" + name + "</td><td>" + position + "</td><td>" + permission_string + "</td><td>" + work_string + "</td><td></td></tr>");
               }); 
            });
         });
      }
      else{
         console.log("User not login yet.");
      }
   });

});

function AddUser(){
   console.log("clicked!");
   $("#create-user-box").slideToggle();
}

function closeAlert(){
   $("#create-user-box").slideToggle();
}

function AddEmployee(){
   var account = $("form input[name='account']").val();
   var password = $("form input[name='password']").val();
   var name = $("form input[name='name']").val();
   var position = $("form input[name='position']").val();
   var email = $("form input[name='email']").val();
   var number = $("form input[name='number']").val();
   var permission;
   var work;
   if($("input#work-yes").is(':checked')){
      work = 1;
   }
   else{
      work = 0;
   }
   if($("input#auth-view").is(':checked')){
      permission = permission + "view";
   }
   if($("input#auth-add").is(':checked')){
      permission = permission + ",add";
   }
   if($("input#auth-edit").is(':checked')){
      permission = permission + ",edit";
   }
   if($("input#auth-report").is(':checked')){
      permission = permission + ",report";
   }
   
   employeeRef.push({
      "account": account,
      "password": password,
      "name": name,
      "position": position,
      "email": email,
      "number": number,
      "work": work,
      "permission": permission
   });
}
