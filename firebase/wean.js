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

	listRef = firebase.database().ref("litter/" + userData.currentFarm);
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
				var hiddenKeys = ["boarRegisterNo", "sowRegisterNo", "totalPiglet", "death", "totalDeath", "mummy", "stillborn",
									"lied","weakDeath", "smallDeath", "live", "normal", "weak", "small", "totalLitterWeight"];
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
	var litterKeys = ["strain", "litterno", "boarregisterno", "sowregisterno", "partdate"]
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
	suckingRef = firebase.database().ref('sucking/' + userData.currentFarm + '/' + thisRow.getAttribute("data-litterno")).orderByChild('pigNo');
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
			cell.innerHTML = childSnapshot.child("sex").val()==="sow"?"母":"公"
			for(i=2;i<suckingKeys.length;i++){
				cell = row.insertCell(i);
				cell.innerHTML = childSnapshot.child(suckingKeys[i]).val();
			}
			cell = row.insertCell(4)
			var weight = document.createElement("input");
			weight.setAttribute("type", "number");
			weight.addEventListener("change", function(){
				sum_weight();
			});
			cell.appendChild(weight);
			cell = row.insertCell(5)
			cell.innerHTML = "<input type='text'>"
			cell = row.insertCell(6)
			cell.innerHTML = "<input type='text'>"
			cell = row.insertCell(7)
			cell.innerHTML = "<input type='text'>"
			cell = row.insertCell(8)
			cell.appendChild(deadBtn());
		});
	}).then(()=>{
		$("#myModal").modal("toggle"); // open modal
	}, (error)=>{console.log(error)});
});

upload.addEventListener("click", function(){
	litterNo = litterRow.children[1].innerHTML;
	weanDate = litterRow.children[4].innerHTML;
	weanLoca = litterRow.children[5].children[0].value;
	partObj = {weanDate:weanDate, weanLocation:weanLoca, totalWeanWeight:sum_weight()};
	partKeys = ["totalPiglet", "totalDeath", "death", "mummy", "stillborn", "lied", "weakDeath", "smallDeath", "live", "normal", "weak", "small"];
	for(i=0;i<partRow.children.length;i++){
		partObj[partKeys[i]] = partRow.children[i].children[0].value;
	}
	var partRef = firebase.database().ref("litter/" + userData.currentFarm + "/" + upload.getAttribute("data-id"));
	const p1 = partRef.update(partObj);
	suckingObj = {};
	for(i=0;i<suckingTable.rows.length;i++){
		if(suckingTable.children[i].getAttribute("class")!="newRow deadRow"){
			suckingObj[suckingTable.rows[i].children[0].innerHTML] = {
				weanWeight:suckingTable.rows[i].children[4].children[0].value,
				identity:suckingTable.rows[i].children[5].children[0].value,
				weanLoaction:suckingTable.rows[i].children[6].children[0].value,
				weanNote:suckingTable.rows[i].children[7].children[0].value};	
		}
		else
			suckingObj[suckingTable.rows[i].children[0].innerHTML] = {weanNote:suckingTable.rows[i].children[7].children[0].value, stat:"dead"};
	}
	console.log(partObj, suckingObj);
	var suckingRef = firebase.database().ref("sucking/" + userData.currentFarm + "/" + litterNo);
	const p2 = suckingRef.update(suckingObj);
	promises = [p1, p2]
	Promise.all(promises).then( ()=>{
		console.log(currentRow);
		currentRow.closest("tbody").removeChild(currentRow.closest("tr"));
		$("#myModal").modal("toggle");
	});
});
