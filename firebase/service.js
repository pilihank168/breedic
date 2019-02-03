var d = new Date();
var calendar = document.getElementById('calendar');
var left = document.getElementById('left');
var right = document.getElementById('right');
var text = document.getElementById('month');
var calendarData;
function getDayNumber(){
	var temp = new Date(d.getFullYear(), d.getMonth()+1, 0)
	return temp.getDate();
}

function lastMonth(){
	if(d.getMonth()==0){
		d.setFullYear(d.getFullYear()-1, 11, 1);
	}else{
		d.setMonth(d.getMonth()-1, 1);
	}
}

function nextMonth(){
	if (d.getMonth() == 11) {
		d.setFullYear(d.getFullYear()+1, 0, 1);
	} else {
		d.setMonth(d.getMonth()+1, 1);
	}
}

function mData(year, month){
	monthData = calendarData ? calendarData[year] : calendarData;
	return monthData ? monthData[("0"+(month+1).toString()).slice(-2)] : monthData
}

function makeMonthString(){
	var year = d.getFullYear();
	var month = d.getMonth();
	return year.toString() + '年' + (month+1).toString() + '月';
}

function initPage(){
	var calendarRef = firebase.database().ref('calendar/' + userData.currentFarm);
	calendarRef.once('value').then((snapshot)=>{
		calendarData = snapshot.val();
		text.innerHTML = makeMonthString();
		renderCalendar();
	}).catch((error)=>{console.log(error)});
}

function makeURL(year, month, date, data){
	yStr = year.toString();
	mStr = ('0'+month.toString()).slice(-2);
	dStr = ('0'+date.toString()).slice(-2);
	if(data>0)
		return '<a href="serviceList.html?date=' + [yStr, mStr, dStr].join('-') + '"><h4 style="display:inline">' + dStr + '</h4> (' + data.toString() + ')</a>';
	else
		return '<a href="serviceList.html?date=' + [yStr, mStr, dStr].join('-') + '" style="color:gray">' + dStr + '</a>';
}

left.addEventListener('click', function(){
	lastMonth();
	calendar.innerHTML='';
	text.innerHTML = makeMonthString();
	renderCalendar();
});

right.addEventListener('click', function(){
	nextMonth();
	calendar.innerHTML='';
	text.innerHTML = makeMonthString();
	renderCalendar();
});

function renderCalendar(){
    d.setDate(1);
	week = [];
	weeks = [];
	year = d.getFullYear();
	month = d.getMonth();
	monthData = mData(year, month);
	for(i = 0; i < d.getDay()+getDayNumber(); i++){
		if(i < d.getDay()){week.push('');}
		else{
			date = 1+i-d.getDay();
			data = undefined;
			if(monthData){
				data = monthData[date];
			}
			if(data){week.push(makeURL(year, month+1, date, data));}
			else{week.push(makeURL(year, month+1, date, 0));}
		}
		if((i>0 && i%7==6)||i==d.getDay()+getDayNumber()-1){weeks.push(week); week=[];}
	}
	for(i=0;i<weeks.length;i++){
		var newRow = calendar.insertRow();
		for(j=0;j<7;j++){
			var newCell = newRow.insertCell(j);
			if(j<weeks[i].length){newCell.innerHTML = weeks[i][j];}
			newCell.setAttribute('style','text-align:center;');
		}
	}
	$('#table').css('visibility', 'initial');
	left.style.visibility='initial';
	right.style.visibility='initial';
}
