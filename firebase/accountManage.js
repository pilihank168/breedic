function defined(content) { 
   if(content == 0) return content;
   return content? content:""
}

var farm_total_count;
var farms = {}; //No. > Name > Size > Type > Address > Phone > Owner > Note > OwnerName > OwnerEmail > OwnerActive
var item;
var emails = {};

function initPage(){
   $("#create-user").attr("disabled", true);
   var farmRef = firebase.database().ref("farms");
   farmRef.once("value").then(function(snapshot){
      farm_total_count = snapshot.numChildren();
      $("#create-user").attr("disabled", false);
      snapshot.forEach(function(farm){
         var entry = farm.val();
         
         var farmNo = defined(farm.key);
         var farmName = defined(entry.name);
         var farmSize = defined(entry.size);
         var farmType = defined(entry.type);
         var farmAddress = defined(entry.address);
         var farmPhone = defined(entry.phone);
         var farmOwner = defined(entry.owner);
         var farmNote = defined(entry.note);
         var farmOwnerName;
         var farmOwnerEmail;

         ownerRef = firebase.database().ref("users/" + farmOwner);
         ownerRef.once("value").then(function(snapshot2){
            var entry2 = snapshot2.val();
            farmOwnerName = defined(entry2.name);
            farmOwnerEmail = defined(entry2.email);
            farmOwnerActive = defined(entry2.active);

            item = [];
            item.push(farmNo);
            item.push(farmName);
            item.push(farmSize);
            item.push(farmType);
            item.push(farmAddress);
            item.push(farmPhone);
            item.push(farmOwner);
            item.push(farmNote);
            item.push(farmOwnerName);
            item.push(farmOwnerEmail);
            item.push(farmOwnerActive);
            console.log("Farm" + farmNo + ": " + item);
            
            farms[farmNo] = item;

            var active_string = farmOwnerActive? "是":"否";
            var button_string = "<button class='button' style='background-color:#e89980;' onClick='showFarm(" + farmNo + ")'>查看</button>"

            $("#activeers tr:last").after("<tr id='farm" + farmNo + "'><td>" + farmNo + "</td><td>" + farmName + "</td><td>" + farmOwnerEmail + "</td><td>" + farmOwnerName + "</td><td>" + active_string + "</td><td>" + button_string + "</td></tr>");
         
         }).then(function(){
            //console.log(farms);
         });
         
      });
   });

   var usersRef = firebase.database().ref("users");
   usersRef.once("value").then(function(snapshot){
      snapshot.forEach(function(u){
         if(u.val().role == "owner"){
            var email = defined(u.val().email);
            var uid = u.key;
            emails[email] = uid;
         }
      });
   }).then(function(){
      console.log(emails);
   });
}


function showAddWindow(){
   $("#create-farm-box").slideToggle();
   $("#create-farm-box #farmNo1").text(farm_total_count);
}

function closeWindow(choice){
   if(choice){
      $("#view-farm-box").slideToggle();
   }
   else{
      $("#create-farm-box").slideToggle();
   }
}

function showNewPwdName(){
   $("#form1 #newFarmBtn").attr("onClick", "addFarm(1);");
   $("#form1 #new-password-name").slideToggle();
   $("#form1 #new-user-hint").hide();
}

function hideNewPwdName(){
   $("#form1 #newFarmBtn").attr("onClick", "addFarm(0);");
   $("#form1 #new-password-name").slideToggle();
   $("#form1 #new-user-hint").show();
}

function showFarm(farmNo){
   if($("#view-farm-box").is(':hidden')){
      $("#view-farm-box").slideToggle();
   }
   $("#form2 #farmNo2").text(farms[farmNo][0]);
   $("#form2 input[name='name']").val(farms[farmNo][1]);
   $("#form2 input[name='size']").val(farms[farmNo][2]);
   $("#form2 input[name='type']").val(farms[farmNo][3]);
   $("#form2 input[name='address']").val(farms[farmNo][4]);
   $("#form2 input[name='phone']").val(farms[farmNo][5]);
   $("#form2 input[name='note']").val(farms[farmNo][7]);
   $("#form2 input[name='owner']").val(farms[farmNo][8]);
   $("#form2 input[name='owner-email']").val(farms[farmNo][9]);

   if(farms[farmNo][10] == 1){
      $("#form2 input#active-yes").prop("checked", true); 
      $("#form2 input#active-no").prop("checked", false); 
   }
   else{
      $("#form2 input#active-yes").prop("checked", false); 
      $("#form2 input#active-no").prop("checked", true); 
   }
   $("#form2 button").attr("onClick", "editFarm(" + farmNo + ");");
}

function readData(form){
   var name = $("#form" + form + " input[name='name']").val();
   var size = $("#form" + form + " input[name='size']").val();
   var type = $("#form" + form + " input[name='type']").val();
   var address = $("#form" + form + " input[name='address']").val();
   var phone = $("#form" + form + " input[name='phone']").val();
   var note = $("#form" + form + " input[name='note']").val();
   var ownerEmail = $("#form" + form + " input[name='owner-email']").val();
   var ownerName = $("#form" + form + " input[name='owner']").val();
   var ownerPassword = $("#form" + form + " input[name='owner-password']").val();
   return [name, size, type, address, phone, ownerEmail, ownerPassword, ownerName, note];
}


function addFarm(newuser){ 
   var name, size, type, address, phone, ownerEmail, note, ownerName, ownerPassword;
   [name, size, type, address, phone, ownerEmail, ownerPassword, ownerName, note] = readData(1);
   console.log([name, size, type, address, phone, ownerEmail, ownerPassword, ownerName, note]);

   var farmRef = firebase.database().ref("farms/" + farm_total_count);

   if(newuser){
      toBeCreated = firebase.database().ref("ownerToBeCreated").push();
      const p1 = toBeCreated.set({
         "type": 'create',
         "email": ownerEmail,
         "password": ownerPassword,
         "name": ownerName,
         "active": 1,
         "farmNo": farm_total_count,
         "role": "owner",
         "currentFarm": farm_total_count,
         "farmname": name,
         "farmsize": size,
         "farmtype": type,
         "farmaddr": address,
         "farmphone": phone,
         "farmnote": note
	   });
      // insert row to table 'creating'
      // refresh page
      Promise.all([p1]).then(function(){
         console.log("Finish adding member!");
         location.reload();
      });
   }
   else{
      if(checkEmail(ownerEmail)){
         var uid = emails[ownerEmail];
         farmNoRef = firebase.database().ref("users/" + uid + "/farmNo/" + farm_total_count);
         farmNoRef.set(farm_total_count);

         var farmRef = firebase.database().ref("farms/" + farm_total_count);
         const p1 = farmRef.set({
            "farmNo":farm_total_count,
            "name":name,
            "size":size,
            "type":type,
            "address":address,
            "phone":phone,
            "owner":uid,
            "note":note
         });
         
         Promise.all([p1]).then(function(){
            console.log("Finish!");
            location.reload();
         });
      }
      else{
         $("#form1 #new-user-alarm").show(); 
      }
   }
}

function checkEmail(e){
   var allEmails = Object.keys(emails);
   if($.inArray(e, allEmails) != -1){
      return true;
   }
   return false;
}

function showEmailList(){
   $("#form1 .email-list").show();
   $("#form1 .email-list").empty();
   $.each(emails, function(index, value){
      if($("#form1 input[name='owner-email']").val() == ''){
         $("#form1 .email-list").append("<div class='email-item' onMouseDown='addEmail(this);'>" + index + "</div>");
      }
      else{
         if(index.search($("#form1 input[name='owner-email']").val()) != -1){
            $("#form1 .email-list").append("<div class='email-item' onMouseDown='addEmail(this);'>" + index + "</div>");
         }
      }
   });
}

var setEmail = false;
function hideEmailList(){
   if(!setEmail){
      $("#form1 .email-list").empty();
      $("#form1 .email-list").hide();
   }
   else{
      console.log("setting email.");
   }
}

function addEmail(obj){
   setEmail = true;
   console.log($(obj).text());
   $("#form1 input[name='owner-email']").val($(obj).text());
   setEmail = false;
}

function editFarm(farmNo){
   var name, size, type, address, phone, ownerEmail, note, ownerName, ownerPassword;
   [name, size, type, address, phone, ownerEmail, ownerPassword, ownerName, note] = readData(2);
   console.log([name, size, type, address, phone, ownerEmail, ownerPassword, ownerName, note]);

   farmNameRef = firebase.database().ref("farms/" + farmNo + "/name");
   const p1 = farmNameRef.set(name);
   farmSizeRef = firebase.database().ref("farms/" + farmNo + "/size");
   const p2 = farmSizeRef.set(size);
   farmTypeRef = firebase.database().ref("farms/" + farmNo + "/type");
   const p3 = farmTypeRef.set(type);
   farmAddrRef = firebase.database().ref("farms/" + farmNo + "/address");
   const p4 = farmAddrRef.set(address);
   farmPhoneRef = firebase.database().ref("farms/" + farmNo + "/phone");
   const p5 = farmPhoneRef.set(phone);
   farmNoteRef = firebase.database().ref("farms/" + farmNo + "/note");
   const p6 = farmNoteRef.set(note);
   
   Promise.all([p1, p2, p3, p4, p5, p6]).then(function(){
      console.log("Finish!");
      location.reload();
   });
}

function searchData(){
   $("#activeers tr").not(":first").remove();
   var text = $("#search-bar input[name='search']").val();
   $.each(farms, function(index, value){
      var flag = false;
      $.each(value, function(index2, value2){
         if($.isNumeric(value2)){
            value2 = value2.toString();
         }
         if(value2.search(text) != -1){
            flag = true;
         }
      }); 
      if(flag){
         var active_string = value[10]? "是":"否";
         var button_string = "<button class='button' style='background-color:#e89980;' onClick='showFarm(" + value[0] + ")'>查看</button>"

         $("#activeers tr:last").after("<tr id='farm" + value[0] + "'><td>" + value[0] + "</td><td>" + value[1] + "</td><td>" + value[9] + "</td><td>" + value[8] + "</td><td>" + active_string + "</td><td>" + button_string + "</td></tr>");
      }
   });
}
