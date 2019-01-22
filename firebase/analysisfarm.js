farmInfo = document.getElementById("farmInfo");
var url_string = window.location.href;
var url = new URL(url_string);
var farmNo = url.searchParams.get("farm");

var keys = ["date", "type", "filename", "accessible", "reply"];

function initPage(){
    console.log("init");
    farmRef = firebase.database().ref("farms/" + farmNo);
    ownerRef = firebase.database().ref("owners/");
    const initP = [farmRef.once("value"), ownerRef.once("value")];
    Promise.all(initP).then(function(snapshot){
        owners = snapshot[1].val();
        farmInfo.innerHTML = farmNo + "號豬場：" + snapshot[0].child("name").val() + "(負責人-" + owners[snapshot[0].child("owner").val()].name + ")";
    }).catch((error)=>{console.log(error)});
}
