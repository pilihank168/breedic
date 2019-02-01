var table = document.getElementById("tableBody");
var sendBtn = document.getElementById("send");
var response = document.getElementById("response");
var message = document.getElementById("message");
var responseContent = document.getElementById("responseContent");

function initPage(){
    firebase.database().ref("analysis/" + userData.currentFarm).orderByChild("availability").equalTo("recommend").once("value").then(function(snapshot){
        snapshot.forEach((childSnapshot)=>{
            entry = childSnapshot.val()
            var row = table.insertRow(0);
            var cell = row.insertCell(0);
            row.setAttribute("data-issue", childSnapshot.child("issue").val());
            row.setAttribute("data-issuetime", childSnapshot.child("issueTime").val());
            row.setAttribute("data-response", childSnapshot.child("response").val());
            row.setAttribute("data-responsetime", childSnapshot.child("responseTime").val());
            cell.innerHTML = entry.date;
            var fileCell = row.insertCell(1);
            firebase.storage().ref("analysis/" + userData.currentFarm + "/" + childSnapshot.key).getDownloadURL().then((url)=>{
                fileCell.innerHTML = '<a href="' + url + '" download="' + entry.fileName + '">' + entry.fileName + '</a>';
            });
            cell = row.insertCell(2);
            if(!entry.issue||entry.issue.length===0){
                var anchor = document.createElement("a");
                anchor.setAttribute("class", "small button");
                anchor.style.color = "white";
                anchor.innerHTML = "未提問";
                anchor.addEventListener("click", function(){
                    message.innerHTML = '<textarea type="text" rows="3" id="messageContent"></textarea>';
                    response.style.display = "none";
                    document.getElementById("send").setAttribute("class", "button");
                    document.getElementById("send").setAttribute("data-key", childSnapshot.key);
                    $("#myModal").modal("toggle");
                });
                cell.appendChild(anchor);
            }
            else if(!entry.response||entry.response.length===0){
                var anchor = document.createElement("a");
                anchor.setAttribute("class", "small button");
                anchor.style.color = "white";
                anchor.innerHTML = "未回覆";
                anchor.addEventListener("click", function(){
                    messageTime = new Date(parseInt(this.closest("tr").getAttribute("data-issuetime")));
                    message.innerHTML = "<span class='label'>"+this.closest("tr").getAttribute("data-issue")+"<br>("+messageTime.toLocaleString()+")</span>";
                    response.style.display = "none";
                    document.getElementById("send").setAttribute("class", "button disabled");
                    document.getElementById("send").setAttribute("data-key", "");
                    $("#myModal").modal("toggle");
                });
                cell.appendChild(anchor);
            }
            else{
                var anchor = document.createElement("a");
                anchor.setAttribute("class", "small button");
                anchor.style.color = "white";
                anchor.innerHTML = "已回覆";
                anchor.addEventListener("click", function(){
                    messageTime = new Date(parseInt(this.closest("tr").getAttribute("data-issuetime")));
                    message.innerHTML = "<span class='label'>"+this.closest("tr").getAttribute("data-issue")+"<br>("+messageTime.toLocaleString()+")</span>";
                    response.style.display = "block";
                    responseTime = new Date(parseInt(this.closest("tr").getAttribute("data-responsetime")));
                    responseContent.innerHTML = this.closest("tr").getAttribute("data-response") + "<br>(" + responseTime.toLocaleString() + ")";;
                    document.getElementById("send").setAttribute("class", "button disabled");
                    document.getElementById("send").setAttribute("data-key", "");
                    $("#myModal").modal("toggle");
                });
                cell.appendChild(anchor);
            }
        })
    })
}

document.getElementById("send").addEventListener("click", function(){
    if(this.getAttribute("data-key").length>0){
        var d = new Date();
        var messageRef = firebase.database().ref("analysis/" + userData.currentFarm + "/" + this.getAttribute("data-key"));
        messageRef.update({"issue":document.getElementById("messageContent").value,
                            "issueTime":d.getTime()}).then(()=>{
            window.location.replace(location.href)
        });
    }
});
