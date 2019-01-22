var date = document.getElementById("date");
var suckingTable = document.getElementById("suckingTable");
var litterRow = document.getElementById("litterRow");
var partRow = document.getElementById("partRow");
var totalLitterWeight = document.getElementById("totalLitterWeight");
var totalWeight = document.getElementById("totalWeight");
var upload = document.getElementById("upload");
var currentRow;

date.addEventListener("change", function(){
	loadData()
});

function localDateStr(d){
	str = d.toLocaleDateString().split("/");
	yStr = str[0];
	mStr = ("0" + str[1]).slice(-2);
	dStr = ("0" + str[2]).slice(-2);
	return [yStr, mStr, dStr].join("-");
}

function initPage(){
	var d = new Date();
    console.log(localDateStr(d))
	date.value = localDateStr(d);
	console.log(d.toLocaleDateString().split('/'));
	loadData()
}

function loadData(){
	var d = new Date(date.value)
	d.setDate(d.getDate()-21);
	thresholdDate = d.toISOString().slice(0,10)
	console.log(thresholdDate);

	listRef = firebase.database().ref("litters/" + userData.currentFarm);
	listRef.orderByChild("partDate").startAt("").endAt(thresholdDate).once("value").then( (snapshot)=>{
		snapshot.forEach( (childSnapshot)=>{
			if(true||!childSnapshot.child("weanDate").exists()){
				entry = childSnapshot;
				console.log(entry.val())
				var row = table.insertRow(-1);
				var litterKeys = ["strain", "litterNo", "earmark", "partDate", "partLocation"];
				for(i=0;i<litterKeys.length;i++){
					cell = row.insertCell(i)
					cell.innerHTML = entry.child(litterKeys[i]).val();
				}
				var hiddenKeys = ["fatherNo", "motherNo", "fatherEar", "motherEar", "parity", "totalPiglet", "death", "totalDeath", "mummy",
									"stillborn", "lied","weakDeath", "smallDeath", "live", "normal", "weak", "small", "totalLitterWeight"];
				litterKeys = litterKeys.concat(hiddenKeys);
				for(i=0;i<litterKeys.length;i++){
					row.setAttribute("data-"+litterKeys[i].toLowerCase(), entry.child(litterKeys[i]).val());
				}
				row.setAttribute("data-id", entry.key);
			}
		});
	});
}

function litterTable(row){
	var litterKeys = ["strain", "litterno", "fatherno", "motherno", "partdate"]
	for(i=0;i<litterKeys.length;i++){
		value = row.getAttribute("data-" + litterKeys[i]);
		litterRow.children[i].innerHTML = value==="null"?"": value;
	}
	litterRow.children[5].innerHTML = "<input type='text' size='1'>"
}

function partTable(row){
	var partKeys = ["totalpiglet", "death", "totaldeath", "mummy", "stillborn", "lied", "weakdeath", "smalldeath", "live", "normal", "weak", "small"];
	for(i=0;i<partKeys.length;i++){
		value = row.getAttribute("data-" + partKeys[i])
		partRow.children[i].children[0].value = value==="null"?"":value;
	}
}

function deadBtn(){
	var btn = document.createElement('span');
	btn.setAttribute("class", "button small");
	btn.innerHTML = "死亡";
	btn.addEventListener("click", function(){
		this.closest("tr").setAttribute("class", "newRow deadRow");
		this.closest("td").appendChild(aliveBtn());
		this.closest("td").removeChild(this);
		sum_weight();
	});
	return btn
}

function aliveBtn(){
	var btn = document.createElement('span');
	btn.setAttribute("class", "button small alt");
	btn.innerHTML = "取消";
	btn.addEventListener("click", function(){
		this.closest("tr").setAttribute("class", "newRow");
		this.closest("td").appendChild(deadBtn());
		this.closest("td").removeChild(this);
		sum_weight()
	});
	return btn
}

function sum_weight(){
	var total_weight = 0;
	for(i=0;i<suckingTable.children.length;i++){
		if(suckingTable.children[i].getAttribute("class")!="newRow deadRow")
			total_weight += parseFloat(suckingTable.children[i].children[4].children[0].value)||0;
	}
	console.log(total_weight);
	totalWeight.innerHTML = "，離乳窩重合計：" + total_weight;
	return total_weight
}

$('#tableBody').on('click', 'tr', function () {
	var thisRow = this;
    currentRow = this;
	upload.setAttribute("data-id", thisRow.getAttribute("data-id"));
	// load sucking data
	suckingRef = firebase.database().ref('suckings/' + userData.currentFarm + '/' + thisRow.getAttribute("data-litterno")).orderByChild('pigNo');
	suckingRef.once("value").then(function(snapshot){
		litterTable(thisRow);
		partTable(thisRow);	
		totalLitterWeight.innerHTML = "出生窩重合計：" + thisRow.getAttribute("data-totallitterweight");
		suckingTable.innerHTML = "";
		snapshot.forEach(function(childSnapshot){
			var suckingKeys = ["pigNo", "sex", "litterWeight", "nipple"];
			var row = suckingTable.insertRow(-1);
			row.setAttribute("class", "newRow");
			cell = row.insertCell(0)
			cell.innerHTML = childSnapshot.key;
			cell = row.insertCell(1)
			cell.innerHTML = childSnapshot.child("sex").val()==="F"?"母":"公"
			for(i=2;i<suckingKeys.length;i++){
				cell = row.insertCell(i);
				cell.innerHTML = childSnapshot.child(suckingKeys[i]).val();
			}
            if(childSnapshot.child("status")==="dead"){
                row.setAttribute("class", "deadRow");
                row.innerHTML += "<td></td><td></td><td></td><td></td><td>死亡</td>"
            }
            else{
                cell = row.insertCell(4)
                var weight = document.createElement("input");
                weight.setAttribute("type", "number");
                weight.addEventListener("change", function(){
                    sum_weight();
                });
                cell.appendChild(weight);
                cell = row.insertCell(5)
                cell.innerHTML = "<div class='select-wrapper'><select><option value='meat'>肉</option><option value='GGP'>GGP</option>" +
                                    "<option value='GP'>GP</option><option value='PS'>PS</option><option value='eliminated'>淘汰</option>" +
                                    "<option value='other'>其他</option></select></div>";
                cell = row.insertCell(6)
                cell.innerHTML = "<input type='text'>"
                cell = row.insertCell(7)
                cell.innerHTML = "<input type='text'>"
                cell = row.insertCell(8)
                cell.appendChild(deadBtn());
            }
		});
	}).then(()=>{
		$("#myModal").modal("toggle"); // open modal
	}, (error)=>{console.log(error)});
});

upload.addEventListener("click", function(){
    constKeys = ["partDate", "strain", "fatherNo", "motherNo", "fatherEar", "motherEar", "parity", "totalLitterWeight"];
    for(i=0;i<constKeys.length;i++)
        litterObj[constKeys[i]] = currentRow.getAttribute("data-"+constKeys[i].toLowerCase());
	litterNo = litterRow.children[1].innerHTML;
	weanDate = litterRow.children[4].innerHTML;
	weanLoca = litterRow.children[5].children[0].value;
	partObj = {weanDate:weanDate, weanLocation:weanLoca, totalWeanWeight:sum_weight()};
	partKeys = ["totalPiglet", "totalDead", "dead", "mummy", "stillborn", "lied", "weakDead", "smallDead", "live", "normal", "weak", "small"];
	for(i=0;i<partRow.children.length;i++){
		partObj[partKeys[i]] = partRow.children[i].children[0].value;
	}
    var eliminated=0;
    // sucking & weaners : strain, earmark, identity, father/mother, birthday, location
	suckingObj = {};
    weanerObj = {}
	for(i=0;i<suckingTable.rows.length;i++){
        suckingRow = suckingTable.children[i];
        pigNo = suckingRow.children[0].innerHTML;
		if(suckingRow.getAttribute("class")==="newRow"){
			suckingObj[pigNo] = {
				weanWeight:suckingTable.rows[i].children[4].children[0].value,
				identity:suckingTable.rows[i].children[5].children[0].children[0].value,
				weanLoaction:suckingTable.rows[i].children[6].children[0].value,
				weanNote:suckingTable.rows[i].children[7].children[0].value
            };
            if(suckingRow.children[5].children[0].children[0].value!=="eliminated"){
                weanerObj[litterObj.strain+litterNo+"-"+pigNo] = {
                    strain:litterObj.strain,
                    earmark:litterNo+'-'+pigNo,
                    sex:suckingRow.children[1].innerHTML==="公"?"M":"F",
                    fatherNo:litterObj.fatherNo,
                    motherNo:litterObj.motherNo,
                    fatherEar:litterObj.fatherEar,
                    motherEar:litterObj.motherEar,
                    birthday:litterObj.partDate,
                    weanDate:weanDate,
                    identity:suckingObj[pigNo].identity,
                    litterWeight:suckingRow.children[2].innerHTML,
                    weanWeight:suckingObj[pigNo].weanWeight,
                    location:suckingObj[pigNo].weanLocation
                };
            }
            else
                eliminated += 1;
		}
		else if(suckingROw.getAttribute("class")==="newRow deadRow")
			suckingObj[suckingTable.rows[i].children[0].innerHTML] = {weanNote:suckingTable.rows[i].children[7].children[0].value, stat:"dead"};
	}
	console.log(partObj, suckingObj);
	var suckingRef = firebase.database().ref("suckings/" + userData.currentFarm + "/" + litterNo);
	const suckingP = suckingRef.update(suckingObj);
    var weanerRef = firebase.database().ref("weaners/" + userData.currentFarm);
    const weanerP = weanerRef.set(weanerObj);
    // production : partObj
    partObj["eliminated"]=eliminated;
    eliminated=0;
    var productionRef = firebase.database().ref("production/" + userData.currentFarm + "/" + litterObj.motherEar + "/" + litterObj.parity);
    const productionP = productionRef.update(partObj);
    // litterHistory : litterObj + partObj
    var historyRef = firebase.database().ref("littersHistory/" + userData.currentFarm + "/" + upload.getAttribute("data-id"));
    for (key in litterObj)
        partObj[key] = litterObj[key];
    const historyP = historyRef.set(partObj);
    // remove
	var partRef = firebase.database().ref("litters/" + userData.currentFarm + "/" + upload.getAttribute("data-id"));
    const partP = partRef.remove();
    // log
    var logRef = firebase.database().ref("log/" + userData.currentFarm + "/" + litterObj.motherEar).push();
    const logP = logRef.set({date:partObj.weanDate, eventName:"parturition"});
    // update sows
    var sowRef = firebase.database().ref("sows/" + userData.currentFarm + "/" + litterObj.motherEar);
    const sowP = sowRef.update({status:"w"+partObj.weanDate , location:partObj.weanLocation, lastParturition:partObj.weanDate});
	var promises = [productionP, suckingP, weanerP, historyP, partP, logP, sowP]
	Promise.all(promises).then( ()=>{
		console.log(currentRow);
		currentRow.closest("tbody").removeChild(currentRow.closest("tr"));
		$("#myModal").modal("toggle");
	});
});
