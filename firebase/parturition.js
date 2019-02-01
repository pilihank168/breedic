var table = document.getElementById("tableBody");
var suckingTable = document.getElementById("suckingTable");
var litterRow = document.getElementById("litterRow");
var partRow = document.getElementById("partRow");
var totalWeight = document.getElementById("totalWeight");
var upload = document.getElementById("upload");
var currentRow;
var serviceKeys = ["parity", "serviceDate", "sowEar", "boarEar", "sowNo", "boarNo"]
var serviceObj;

function localDateStr(d){
	str = d.toLocaleDateString().split("/");
	yStr = str[0];
	mStr = ("0" + str[1]).slice(-2);
	dStr = ("0" + str[2]).slice(-2);
	return [yStr, mStr, dStr].join("-");
}

function initPage(){
	var d = new Date();
	today = localDateStr(d)
	d.setDate(d.getDate()+700);
	thresholdDate = localDateStr(d);
	
	listRef = firebase.database().ref("parturition/" + userData.currentFarm);
	listRef.orderByChild("dueDate").startAt("").endAt(thresholdDate).once("value").then( (snapshot)=>{
		snapshot.forEach( (childSnapshot)=>{
			if(true||!childSnapshot.child("partDate").exists()){
				var entry = childSnapshot.val();
				var row = table.insertRow(-1);
				row.innerHTML = "<td>" + entry.sowEar + "</td><td>" + entry.dueDate + "</td><td>" + entry.sowLocation + "</td>" + 
				"<td><input type='date' value='" + today + "'></td>" + 
				"<td><input type='text'></td>" + 
				"<td><div class='select-wrapper'><select><option value='L'>L</option><option value='Y'>Y</option>" +
                "<option value='D'>D</option><option value='LY'>LY</option><option value='YL'>YL</option>" +
                "<option value='LYD'>LYD</option><option value='YLD'>YLD</option><option value='B'>B</option></select></div></td>" +
				"<td><input type='number'></td>" + 
				"<td><input type='number'></td>" + 
				"<td><input type='number'></td>" + 
				"<td><input type='number'></td>";
				var cell = row.insertCell(10);
				var btn = document.createElement("span");
				btn.setAttribute("class", "button small");
				btn.innerHTML = "新增";
				btn.addEventListener("click", function(){
					makeInputModal(this);
				});
				cell.appendChild(btn);
				row.setAttribute("class", "newRow");
				row.setAttribute("data-id", childSnapshot.key);
                for(i=0;i<serviceKeys.length;i++)
                    row.setAttribute("data-"+serviceKeys[i].toLowerCase(), entry[serviceKeys[i]])
			}
		});
	});
}

function makeInputModal(btn){
	litterRow.children[6].children[0].value="";
	for(i=0;i<partRow.children.length;i++)
		if(partRow.children[i].getAttribute("class")==="input")
			partRow.children[i].children[0].value="";
	var thisRow = btn.closest("tr");
    currentRow = thisRow;
    serviceObj = {};
    for(i=0;i<serviceKeys.length;i++)
        serviceObj[serviceKeys[i]] = thisRow.getAttribute("data-" + serviceKeys[i].toLowerCase());
	var earmark = thisRow.children[0].innerHTML;
	var partDate = thisRow.children[3].children[0].value;
	var litterNo = thisRow.children[4].children[0].value;
	var strain = thisRow.children[5].children[0].children[0].value;
	var totalPiglet = thisRow.children[6].children[0].value;
	var mummy = thisRow.children[7].children[0].value;
	var stillborn = thisRow.children[8].children[0].value;
	var live = thisRow.children[9].children[0].value;
	var father = serviceObj.boarNo;
	var mother = serviceObj.sowNo;
	d = new Date(partDate);
	d.setDate(d.getDate()+21);
	var weanDate = d.toISOString().slice(0, 10);

	//litter table
	litterRow.children[0].innerHTML = litterNo;
	litterRow.children[1].innerHTML = strain;
	litterRow.children[2].innerHTML = father;
	litterRow.children[3].innerHTML = mother;
	litterRow.children[4].innerHTML = partDate;
	litterRow.children[5].innerHTML = weanDate;
	//parturition table
	partRow.children[0].innerHTML = totalPiglet
	partRow.children[3].innerHTML = mummy
	partRow.children[4].innerHTML = stillborn
	partRow.children[8].innerHTML = live
	//sucking table
	suckingTable.innerHTML = "";
	for(i=0;i<live;i++){
		var newRow = suckingTable.insertRow(i);
		newRow.setAttribute("class", "newRow");
		var newCell = newRow.insertCell(0);
		newCell.innerHTML = "<input type='text' size='1'>";
		newCell = newRow.insertCell(1);
		suckingId = (i+1).toString();
		radioName = "sex" + suckingId;
		newCell.innerHTML = "<span class='label'><input type='radio' name='"+radioName+"' id='F"+suckingId+"' checked><label for='F"+suckingId+"'>F</label>"+ 
		"<input type='radio' name='" + radioName + "' id='M" + suckingId + "'><label for='M" + suckingId + "'>M</label></span>";
		newCell = newRow.insertCell(2);
	//	newCell.innerHTML = "<input type='number'>";
		var weight = document.createElement("input");
		weight.setAttribute("type", "number");
		weight.addEventListener("change", function(){
			sum_weight();
		});
		newCell.appendChild(weight);
		newCell = newRow.insertCell(3);
		newCell.innerHTML = "<input type='text' size='1'>";
		newCell = newRow.insertCell(4);
		newCell.innerHTML = "<input type='text' size='1'>";
	}
	upload.setAttribute("data-id", thisRow.getAttribute("data-id"));
	$("#myModal").modal("toggle"); // open modal
	sum_weight();
}

function sum_weight(){
	var total_weight = 0;
	for(i=0;i<suckingTable.children.length;i++){
		total_weight += parseFloat(suckingTable.children[i].children[2].children[0].value)||0;
	}
	totalWeight.innerHTML = "出生窩重合計：" + total_weight;
	return total_weight
}

upload.addEventListener("click", function(){
	litterNo = litterRow.children[0].innerHTML;
	strain = litterRow.children[1].innerHTML;
	partDate = litterRow.children[4].innerHTML;
	partLoca = litterRow.children[6].children[0].value;
    // production : partObj
	partObj = {litterNo:litterNo, strain:strain, partDate:partDate, partLocation:partLoca, totalLitterWeight:sum_weight()};
	partKeys = ["totalPiglet", "totalDead", "dead", "mummy", "stillborn", "lied", "weakDead", "smallDead", "live", "normal", "weak", "small"];
	for(i=0;i<partRow.children.length;i++){
		if(partRow.children[i].getAttribute("class")==="input")
			partObj[partKeys[i]] = partRow.children[i].children[0].value;
		else
			partObj[partKeys[i]] = partRow.children[i].innerHTML;
	}
	var partRef = firebase.database().ref("parturition/" + userData.currentFarm + "/" + upload.getAttribute("data-id"));
    var productionRef = firebase.database().ref("production/" + userData.currentFarm + "/" + serviceObj.sowEar + "/" + serviceObj.parity);
    const productionP = productionRef.update(partObj);
    var promise_array = [productionP]
    // litters : partObj + service(father, mother)
    var litterRef = firebase.database().ref("litters/" + userData.currentFarm + "/" + upload.getAttribute("data-id"));
    var litterObj = {fatherNo:serviceObj.boarNo, motherNo:serviceObj.sowNo, fatherEar:serviceObj.boarEar, motherEar:serviceObj.sowEar, birthday:partDate, location:partLoca, parity:serviceObj.parity};
    for (key in partObj)
        litterObj[key] = partObj[key];
    const litterP = litterRef.set(litterObj);
    promise_array.push(litterP);
    // suckings
	suckingObj = {};
	for(i=0;i<suckingTable.rows.length;i++){
		suckingObj[suckingTable.rows[i].children[0].children[0].value] = {
			sex:(suckingTable.rows[i].children[1].children[0].children[0].checked)?"F":"M",
			litterWeight:suckingTable.rows[i].children[2].children[0].value,
			nipple:suckingTable.rows[i].children[3].children[0].value,
			note:suckingTable.rows[i].children[4].children[0].value};		
	}
	var suckingRef = firebase.database().ref("suckings/" + userData.currentFarm + "/" + strain + litterNo);
	const suckingP = suckingRef.set(suckingObj);
    promise_array.push(suckingP);
    // parturitionHistory : partObj + service
    var historyRef = firebase.database().ref("parturitionHistory/" + userData.currentFarm + "/" + upload.getAttribute("data-id"));
    for (key in serviceObj)
        partObj[key] = serviceObj[key]
    const historyP = historyRef.set(partObj);
    promise_array.push(historyP);
    // remove
	var partRef = firebase.database().ref("parturition/" + userData.currentFarm + "/" + upload.getAttribute("data-id"));
    const partP = partRef.remove();
    promise_array.push(partP);
    // log : partDate
    var logRef = firebase.database().ref("log/" + userData.currentFarm + "/" + serviceObj.sowEar).push();
    const logP = logRef.set({date:partObj.partDate, eventName:"parturition"});
    promise_array.push(logP);
    // sows :
    var sowRef = firebase.database().ref("sows/" + userData.currentFarm + "/" + serviceObj.sowEar);
    const sowP = sowRef.update({status:"p"+partObj.partDate , location:partObj.partLocation, lastParturition:partObj.partDate});
    promise_array.push(sowP);
    var d = new Date();
    const timeP = firebase.database().ref("farms/" + userData.currentFarm + "/lastData").set(d.getTime());
    promise_array.push(timeP);
	Promise.all(promise_array).then( ()=>{
        promise_array = [];
		currentRow.closest("tbody").removeChild(currentRow.closest("tr"));
		$("#myModal").modal("toggle");
	});
});
