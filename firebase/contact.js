var table = document.getElementById("tableBody");
var keys = ["date", "name", "phone", "email", "farm", "size", "address"]
function initPage(){
    contactRef = firebase.database().ref("contactForm/").orderByChild("date");
    contactRef.once("value").then(function(snapshot){
        snapshot.forEach(function(childSnapshot){
            var row = table.insertRow(0);
            keys.forEach(function(key, index){
                var cell = row.insertCell(index);
                cell.innerHTML = childSnapshot.child(key).val()||"";
            });
            row.setAttribute("data-message", childSnapshot.child("note").val());
        });
    }).catch((error)=>{console.log(error)});
}


// clickable row
$('#tableBody').on('click', 'tr', function () {
    document.getElementById("message").innerHTML = this.getAttribute("data-message");
    $("#myModal").modal("toggle");
});
