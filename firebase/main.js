var url_string = window.location.href;
var url = new URL(url_string);
var userData, userRef;

// decide accessibility : 'initialize the page' or 'redirect/login'
firebase.auth().onAuthStateChanged(function(user) {
    var exceptionPages = {admin:[], analyst:["contact.html", "analyst.html", "owner.html", "employee.html"],
                          owner:["analysis.html", "analysisfarm.html", "analyst.html", "contact.html", "farm.html", "owner.html"],
                          employee:["employee.html", "analysis.html", "analysisfarm.html", "analyst.html", "contact.html", "farm.html", "owner.html"]}
    var parser = document.createElement('a');
    parser.href = url;
    var url_path = parser.pathname.split('/');
    var url_page = url_path[url_path.length-1];
    var url_search = parser.search;
	if (user) {
		userRef = firebase.database().ref('users/'+user.uid);
		userRef.once('value').then(function(snapshot){
            // check role and legal page
			userData = snapshot.val();
            if(exceptionPages[userData.role].includes(url_page)||
                (!userData.permission.report && (url_page==="report.html"||url_page==="recommend.html")) ){
                window.location.replace("index.html");
                alert("您的帳號權限不符存取此頁面！")
            }
            else{
			    makeNav(userData.role, user.uid);
		        console.log("User is logined", user.uid)
                initPage();
            }
		}).catch((error)=>{console.log(error)});
	}
	else{
		console.log("User is not logined yet.");
		makeNav('none');
		if(url_page!=='index.html' && url_page!=='login.html' && url_page!==''){
			//console.log('login.html?go='+url_page+url_search);
			window.location.replace('login.html?go='+url_page+url_search);
		}
	}
});
