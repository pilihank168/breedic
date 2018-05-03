// Initialize Firebase
var config = {
apiKey: "AIzaSyDARFJhNCdtGa3rWyJmE8zGawiwlbNBFpE",
		authDomain: "breedic-ba254.firebaseapp.com",
		databaseURL: "https://breedic-ba254.firebaseio.com",
		projectId: "breedic-ba254",
		storageBucket: "breedic-ba254.appspot.com",
		messagingSenderId: "607804503321"
};
firebase.initializeApp(config);

var earmark = document.getElementById("earmark");
var registerNo = document.getElementById("registerNo");
var strain = document.getElementById("strain");
var birthday = document.getElementById("birthday");
var fatherEar = document.getElementById("fatherEar");
var fatherNo = document.getElementById("fatherNo");
var motherEar = document.getElementById("motherEar");
var motherNo = document.getElementById("motherNo");
var weight = document.getElementById("weight");
var backFat = document.getElementById("backFat");
var position = document.getElementById("position");
var source = document.getElementById("source");
var statuss = document.getElementById("status");
var note = document.getElementById("note");
var sowSmtBtn = document.getElementById("sowSmtBtn");
var photo = '';
var preview = document.getElementById("preview");
var fileInput = document.getElementById('photo');
var img = new Image();
fileInput.addEventListener('change', function(e) {
	var file = fileInput.files[0];
	photo = file;
	var imageType = /image.*/;
	if (file.type.match(imageType)) {
		var reader = new FileReader();
		reader.onload = function(e) {
			img.style.width = "100%";
			img.src = reader.result;
			preview.appendChild(img);
		}
		reader.readAsDataURL(file);	
	} else {
		preview.innerHTML = "File not supported!";
	}
});

var resetPhoto = document.getElementById("resetPhoto");
resetPhoto.addEventListener("click", function(evt){
	evt.preventDefault();
	preview.reset();
	preview.removeChild(img);
	photo = '';
});

var pID = ["parity","serviceDate","boarEar","dueDate","diagnoseDate","parturitionDate",
		"duration","totalPiglet","litterNo","live","mummy","stillborn",
		"lactateLocation","lactateWeight","weanDate","weanNumber","weanWeight","productionNote"]
var pTable = document.getElementById("productionTable");
var pRow = 1;
var addProductBtn = document.getElementById("addProductBtn");
addProductBtn.addEventListener("click", function(){
	var row = pTable.insertRow(pRow+1);
	for(i=0;i<18;i++){
		var cell = row.insertCell(i);
		var input = document.createElement("INPUT");
		if(i==1||i==3||i==4||i==5||i==14)
			input.setAttribute('type','date');
		else
			input.setAttribute('type','text');
		input.setAttribute('id', pID[i]+pRow.toString());
		cell.appendChild(input);
	}
	pRow++;
});

sowSmtBtn.addEventListener("click", function(){

// sow's data
	var sowListRef = firebase.database().ref('/sowList/0/'+earmark.value);
	var sowsRef = firebase.database().ref('/sows/0/'+earmark.value);
	const p1 = sowListRef.set({
			earmark:earmark.value,
			registerNo:registerNo.value,
			strain:strain.value,
			birthday:birthday.value,
			fatherNo:fatherNo.value,
			motherNo:motherNo.value,
			position:position.value,
			statuss:statuss.value,
			note:note.value
		});
	const p2 = sowsRef.set({
			fatherEar:fatherEar.value,
			motherEar:motherEar.value,
			weight:weight.value,
			backFat:backFat.value,
			source:source.value,
	});
	var promise_array = [p1, p2];
	if(photo){
		var photoRef = firebase.storage().ref("0/"+earmark.value+".png");
		const p3 = photoRef.put(photo);
		promise_array.push(p3);
	}

// productions data
	var suffix = '';
	for(i=0;i<pRow;i++){
		if(i>0)
			suffix = i.toString();
		var parity = document.getElementById("parity"+suffix);
		var serviceDate = document.getElementById("serviceDate"+suffix);
		var boarEar = document.getElementById("boarEar"+suffix);
		var dueDate = document.getElementById("dueDate"+suffix);
		var diagnoseDate = document.getElementById("diagnoseDate"+suffix);
		var parturitionDate = document.getElementById("parturitionDate"+suffix);
		var duration = document.getElementById("duration"+suffix);
		var totalPiglet = document.getElementById("totalPiglet"+suffix);
		var litterNo = document.getElementById("litterNo"+suffix);
		var live = document.getElementById("live"+suffix);
		var mummy = document.getElementById("mummy"+suffix);
		var stillborn = document.getElementById("stillborn"+suffix);
		var lactateLocation = document.getElementById("lactateLocation"+suffix);
		var lactateWeight = document.getElementById("lactateWeight"+suffix);
		var weanDate = document.getElementById("weanDate"+suffix);
		var weanNumber = document.getElementById("weanNumber"+suffix);
		var weanWeight = document.getElementById("weanWeight"+suffix);
		var productionNote = document.getElementById("productionNote"+suffix);
		if(parity.value){
			var productionRef = firebase.database().ref('/production/0/'+earmark.value+'/'+parity.value);
			const p = productionRef.set({
				parity:parity.value,
				serviceDate:serviceDate.value,
				boarEar:boarEar.value,
				dueDate:dueDate.value,
				diagnoseDate:diagnoseDate.value,
				parturitionDate:parturitionDate.value,
				duration:duration.value,
				totalPiglet:totalPiglet.value,
				litterNo:litterNo.value,
				live:live.value,
				mummy:mummy.value,
				stillborn:stillborn.value,
				lactateLocation:lactateLocation.value,
				lactateWeight:lactateWeight.value,
				weanDate:weanDate.value,
				weanNumber:weanNumber.value,
				weanWeight:weanWeight.value,
				note:productionNote.value
			});
			promise_array.push(p);
		}
	}
	Promise.all(promise_array).then(function(){
		console.log("新增母豬資料成功");
		window.location.replace("sowdata.html?ear="+earmark.value);
	}).catch(function(err){
			console.error("新增母豬資料錯誤：",err);
	});
});
