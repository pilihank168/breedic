//login
var errMessage = document.getElementById("errMessage");
var loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit",function(event){
	event.preventDefault();
	var accountL = document.getElementById("account");
	var pwdL = document.getElementById("password");
	firebase.auth().signInWithEmailAndPassword(accountL.value, pwdL.value).then(function(){
		$('#errMessage').css('visibility','hidden')
		document.forms["loginForm"].reset();
		var url_string = window.location.href;
		var url = new URL(url_string);
		var path = url.searchParams.get("go") ? url.searchParams.get("go") : 'index.html';
		window.location.replace(path);
	})
	.catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log(errorMessage, error);
		$('#errMessage').css('visibility','visible')
		if(errorCode === 'auth/user-disabled'){ errMessage.innerHTML = '此帳號停用中(已離職)';}
		else if(errorCode ==='auth/wrong-password'){ errMessage.innerHTML = '密碼錯誤';}
		else{ errMessage.innerHTML = '此帳號不存在';}
	})
},false);

var forget = document.getElementById("forget");
var emailAddress = document.getElementById("account");
forget.addEventListener("click", function(){
    if(emailAddress.value.length>0){
        //modal for confrimation
        document.getElementById("modalContent").innerHTML = "發送重設密碼信至" + emailAddress.value + "?";
        document.getElementById("resetMessage").innerHTML = "";
        $("#myModal").modal("toggle");
    }
    else
        alert("如欲重設密碼，請先輸入信箱再按忘記密碼");
});
document.getElementById("resetConfirm").addEventListener("click", function(){
    firebase.auth().sendPasswordResetEmail(emailAddress.value).then(function() {
    // Email sent.
        document.getElementById("resetMessage").innerHTML = "重設密碼信已寄至輸入之信箱";
    }).catch(function(error) {
    // An error happened.
        if(error.code==="auth/invalid-email" || error.code==="auth/user-not-found")
            document.getElementById("resetMessage").innerHTML = "無效的email";
        else
            document.getElementById("resetMessage").innerHTML = "發生錯誤，請稍候再重試";
    });
});
