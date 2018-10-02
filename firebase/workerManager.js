function defined(content) { 
   if(content == 0) return content;
   return content? content:""
}

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
var emails = [];

function initPage(){
	$('#active-yes2').attr('disabled', true);
	$('#active-no2').attr('disabled', true);
   uid = userData.uid;
   farmNo = userData.currentFarm;
   console.log("uid = " + uid + ", farmNo = " + farmNo);
   $("#create-user").attr("disabled", false);
   employeeRef = firebase.database().ref("employee/" + farmNo);
   employeeRef.once("value").then(function(snapshot){
      i = 0;
      snapshot.forEach(function(employee){
         item = [];
         entry = employee.val();
         //console.log(entry);

         var email = defined(entry.email);
         var name = defined(entry.name);
         var position = defined(entry.position);
         var permission = defined(entry.permission);
         var active = defined(entry.active);

         item.push(email);
         item.push(name);
         item.push(position);
         item.push(defined(entry.phone));
         item.push(active);
         item.push(permission);
         item.push(defined(entry.note));
         item.push(defined(entry.uid));

          permission_string = permissionMaking(permission);
         active_string = active? "是":"否";
         var button_string = "<button class='button' style='background-color:#e89980;' onClick='showEmployee(" + i + ")'>查看</button>"
         $("#activeers tr:last").after("<tr id='employee" + i + "'><td>" + email + "</td><td>" + name + "</td><td>" + position + "</td><td>" + permission_string + "</td><td>" + active_string + "</td><td>" + button_string + "</td></tr>");

         i = i + 1;
         employees.push(item);
      });
   }).then(function(){
      var usersRef = firebase.database().ref("users");
      usersRef.once("value").then(function(snapshot){
         snapshot.forEach(function(u){
            email = defined(u.val().email);
            emails.push(email);
         });
      });
   });
}

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
   if($("#view-user-box").is(':hidden')){
      $("#view-user-box").slideToggle();
   }
   $("#form2 input[name='email']").val(employees[employeeNo][0]);
   $("#form2 input[name='name']").val(employees[employeeNo][1]);
   $("#form2 input[name='position']").val(employees[employeeNo][2]);
   $("#form2 input[name='phone']").val(employees[employeeNo][3]);
   $("#form2 input[name='note']").val(employees[employeeNo][6]);
   if(employees[employeeNo][4]){
      $("#form2 input#active-yes2").prop("checked", true);
      $("#form2 input#active-no2").prop("checked", false);
   }
   else{
      $("#form2 input#active-yes2").prop("checked", false);
      $("#form2 input#active-no2").prop("checked", true);
   }
   var per = employees[employeeNo][5];
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
   $("#form2 button").attr("onClick", "editEmployee(" + employeeNo + ");");
   $("#form2 #changePwdYes").attr("onClick", "changePassword(" + employeeNo + ");");
   $("#form2 #changeActiveYes").attr("onClick", "changeActive(" + employeeNo + ");");
   console.log(employees[employeeNo][7]);
}

function readData(form){
   var email = $("#form" + form + " input[name='email']").val();
   var password = $("#form"+ form + " input[name='password']").val();
   var name = $("#form" + form + " input[name='name']").val();
   var position = $("#form" + form + " input[name='position']").val();
   var phone = $("#form" + form + " input[name='phone']").val();
   var note = $("#form" + form + " input[name='note']").val();
   var permission;
   var active;
   if($("input#active-yes" + form).is(':checked')){
      active = 1;
   }
   else{
      active = 0;
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
   return [email, password, name, position, phone, active, permission, note];
}


function addEmployee(){
   var email, password, name, position, phone, active, permission, note;
   [email, password, name, position, phone, active, permission, note] = readData(1);
   console.log(email);
   toBeCreated = firebase.database().ref("employeeToBeCreated/" + farmNo);
   const p1 = toBeCreated.push({
   		 "type": 'create',
		 "email": email,
		 "password": password,
		 "name": name,
		 "position": position,
         "phone": phone,
         "active": active,
         "permission": permission,
         "note": note,
         "farmNo": farmNo,
         "role": "employee",
         "currentFarm": farmNo
	});
	// insert row to table 'creating'
   // refresh page
   Promise.all([p1]).then(function(){
      console.log("Finish adding member!");
      location.reload();
   });

}

function editEmployee(employeeNo){
   var email, password, name, position, phone, active, permission, note, uid;
   [email, password, name, position, phone, active, permission, note] = readData(2);
   uid = employees[employeeNo][7];
   console.log("employee number is " + employeeNo);
   console.log("uid = " + uid);
   employee = firebase.database().ref("employee/"+ farmNo + "/" + uid);
   const p1 = employee.set({
         "email": email,
         "name": name,
         "position": position,
         "phone": phone,
         "active": active,
         "permission": permission,
         "note": note,
         "uid": uid
   });
   edituser = firebase.database().ref("users/" + uid);
   const p2 = edituser.set({
         "email": email,
         "name": name,
         "farmNo": farmNo,
         "role": "employee",
         "privilege": permission, 
         "active": active,
         "currentFarm": farmNo,
         "note": note,
         "uid": uid
   });

   Promise.all([p1, p2]).then(function(){
      console.log("Finish!");
      location.reload();
   });
}

//Change Password
var canSetPwd1 = 0;
var canSetPwd2 = 0;

function pwdFunction1(){
   if($("#form2 input[name=password]").val().length < 6){
      $("#form2 #alarm-zone").text("密碼長度不得短於6碼");
   }
   else{
      $("#form2 #alarm-zone").text("");
      canSetPwd1 = 1;
   }
}

function pwdFunction2(){
   if($("#form2 input[name=password]").val() == $("#form2 input[name=password2]").val()){
      $("#form2 #alarm-zone").text("");
      canSetPwd2 = 1;
   }
   else{
      $("#form2 #alarm-zone").text("二次密碼輸入錯誤");
   }
}


function changePwdWin(){
   $("#changePwdBtn").hide();
   $("#form2 input[name=password]").val("");
   $("#form2 input[name=password2]").val("");
   $("#form2 #alarm-zone").text("");
   $("#changePwdWin").slideToggle();
}
function closePwdWin(){
   $("#changePwdWin").slideToggle(function(){
      $("#changePwdBtn").show();
   });
}
function changePassword(employeeNo){
   var toBeCreated = firebase.database().ref("employeeToBeCreated/" + farmNo);
   var uid = employees[employeeNo][7];
   var password = $("#form2 input[name=password]").val();
   if(canSetPwd1 && canSetPwd2){
      const p1 = toBeCreated.push({
        "type": "changePwd",
          "uid": uid,
          "password": password,
      });
      Promise.all([p1]).then(function(){
         console.log("Finish! Change Pwd.");
         location.reload();
      });
   }
}

//Change Active

function changeActiveWin(){
   $("#changeActiveBtn").hide();
   $("#changeActiveWin").show();
   if($("input#active-yes2").is(':checked')){
      $("#changeActiveWin").attr("original", 1)
   }
   else{
      $("#changeActiveWin").attr("original", 0)
   }
   $("#active-yes2").attr("disabled", false);
   $("#active-no2").attr("disabled", false);
}
function closeActiveWin(){
   if($("#changeActiveWin").attr("original") == 1){
      $("#active-yes2").prop("checked", true);
      $("#active-no2").prop("checked", false);
   }
   else{
      $("#active-yes2").prop("checked", false);
      $("#active-no2").prop("checked", true);
   }
 
   $("#changeActiveWin").hide();
   $("#changeActiveBtn").show();
   $("#active-yes2").attr("disabled", true);
   $("#active-no2").attr("disabled", true);
}

function changeActive(employeeNo){
   var uid = employees[employeeNo][7];
   var changeActive = firebase.database().ref("users/" + uid + "/active");
   var changeActive2 = firebase.database().ref("employee/" + farmNo + '/' + uid + "/active");
   var active;
   var original = $("#changeActiveWin").attr("original");
   if($("input#active-yes2").is(':checked')){
      active = 1;
   }
   else{
      active = 0;
   }
   console.log("active is " + active + ", original is " + original);
   if(original != active){
      const p1 = changeActive.set(active)
      const p2 = changeActive2.set(active)
	  Promise.all([p1, p2]).then(function(){
         console.log("Finish! Change Active.");
         location.reload();
      });
   }
   else{
      closeActiveWin();
   }
}

//Check email

function checkEmailRepeat(){
   var email = $("#form1 input[name=email]").val();
   if(email){
      if($.inArray(email, emails) != -1){
         $("#msg-zone").text("該信箱已有人使用。");
      }  
      else{
         $("#msg-zone").text("恭喜！您可以使用該信箱。");
      }
   }
   else{
      $("#msg-zone").text("您還未輸入信箱。")
   }
}
