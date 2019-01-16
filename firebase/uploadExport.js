var exportName = document.getElementById("name");
var date = document.getElementById("date");
var note = document.getElementById("note");
var number = document.getElementById("number");
var form = document.getElementById("export");
var earmarks = document.getElementById("earmarks");

form.addEventListener("submit", (event)=>{
	event.preventDefault();
	console.log(Math.floor(number.value/5), number.value%5)
	n = Math.floor(number.value/5)
	m = number.value%5;
	earmarksInput(n, m);
});

earmarks.addEventListener("submit", (event)=>{
	event.preventDefault();
    var sexRef = firebase.database().ref("sex/" + userData.currentFarm);
    sexRef.once("value").then( (snapshot)=>{
        sexData = snapshot.val();
        unavailableUpdate = {};
        logUpdate = {};
        earmark = {};
        var exportRef = firebase.database().ref('export/' + userData.currentFarm).push();
        for(i=0;i<number.value;i++){
            var ear = document.getElementById("earmark"+i.toString()).value;
            earmark[ear] = true;
            if(sexData[ear]==="boar"){
                unavailableUpdate["/boars/" + userData.currentFarm + "/" + ear + "/unavailability"] = "exported";
                unavailableUpdate["/boars/" + userData.currentFarm + "/" + ear + "/exportId"] = exportRef.key;
            }
            else if(sexData[ear]==="sow"){
                unavailableUpdate["/sows/" + userData.currentFarm + "/" + ear + "/unavailability"] = "exported";
                unavailableUpdate["/sows/" + userData.currentFarm + "/" + ear + "/exportId"] = exportRef.key;
            }
            else{
                unavailableUpdate["/weaners/" + userData.currentFarm + "/" + ear + "/status"] = "exported";
                unavailableUpdate["/weaners/" + userData.currentFarm + "/" + ear + "/exportId"] = exportRef.key;
            }
            logUpdate[ear + "/exportLog"] = {date:date.value, eventName:"export"};
        }
        var logRef = firebase.database().ref("log/" + userData.currentFarm);
        const logP = logRef.update(logUpdate);
        var unavailableRef = firebase.database().ref();
        const unavailableP = unavailableRef.update(unavailableUpdate);
        console.log(['export', userData.currentFarm, date.value].join('/'));
        console.log(exportRef, exportName.value, date.value, note.value, number.value, earmark)
        const exportP = exportRef.set({name:exportName.value, note:note.value, number:number.value, earmarks:earmark, date:date.value});
        return Promise.all([unavailableP, logP, exportP])
    }).then( ()=>{window.location.replace("export.html")});
});

function earmarksInput(n, m){
	earmarks.innerHTML = "";
	for(i=0;i<n;i++)
		insertFormRow(i, 5)
	if(m>0)
		insertFormRow(n, m);
	earmarks.innerHTML += '<br><div class="row"><div class="12u" align="right"><input type="submit" class="button" value="儲存"></div></div>';
}

function insertFormRow(i, m){
	var row = document.createElement('div');
	row.setAttribute("class", "row");
	for(j=-1;j<m;j++){
		var div = document.createElement('div');
		div.setAttribute("class", "2u");
		id = i*5+j;
		if(j==-1){
			div.setAttribute("align", "right");
			div.innerHTML = i==0?'<span class="label">豬隻耳號：</span>':'<br>';
		}
		else
			div.innerHTML = '<input type="text" required id="earmark' + id.toString() + '">';
		row.appendChild(div);
	}
	earmarks.appendChild(row);
}
