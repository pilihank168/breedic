// Get Elements
var ul = document.getElementById('ul');
var data = ul.childNodes[3];
var gene = ul.childNodes[5];
var contact = ul.childNodes[7];
var member = ul.childNodes[9];
var logInOut = ul.childNodes[11];
console.log(ul.childNodes);
// Logout
function logout(){
	firebase.auth().signOut().then(function() {
		console.log("User sign out!");
		window.location.href = "index.html";
	}, function(error) {
	console.log("User sign out error!");
	})
	return false;
}

function makeFarmList(currentFarm, farms){
	var farmList = '';
	var promiseArray = [];
	for(var i=0; i<farms.length; i++){
		const p = firebase.database().ref('farms/' + farms[i]);
		promiseArray.push(p);
	}
	Promise.all(promiseArray).then((snapshot)=>{
		for(var i=0; i<promiseArray.length; i++){
			if(farms[i]===currentFarm){
				farmList += '<li><a href="#" nam="list"><b>' + snapshot[i].val().name + '</b></a></li>';
			}
			else{
				farmList += '<li><a href="#" nam="list">' + snapshot[i].val().name + '</a></li>';
			}
		}
		return '<li><ul>' + farmList + '</ul></li>';
	}).catch((error)=>{
		console.log(error);
	})
}

// Content Control
firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		var userRef = firebase.database().ref('users/'+user.uid);
		userRef.once('value').then(function(snapshot){
			var userType = snapshot.val().role;
			console.log(userType);
			if (userType=='admin'){
				ul.innerHTML = '<li> <a href="index.html">首頁</a> </li>' + 
				'<li> <a href="#data" class="icon fa-angle-down">數據分析</a>' +
					'<ul id="dataList">' +
						'<li><a href="upload.html" name="list">資料查看</a></li>' +
						'<li><a href="record.html" name="list">資料分析</a></li>' +
					'</ul>' +
				'</li>' +
				'<li> <a href="#gene" class="icon fa-angle-down">基因檢測</a>' +
					'<ul id="geneList">' +
						'<li><a href="#" name="list">訂單管理</a></li>' +
						'<li><a href="#" name="list">檢測結果上傳</a></li>' +
						'<li><a href="#" name="list">歷史訂單</a></li>' +
					'</ul>' +
				'</li>' +
				'<li> <a href="#contact">聯絡我們</a> </li>' +
				'<li> <a href="accountManage.html" name="list">帳號管理 </li>';
			}
			else if (userType=='analyst'){
				ul.innerHTML = '<li> <a href="index.html">首頁</a> </li>' + 
				'<li> <a href="#data" class="icon fa-angle-down">數據分析</a>' +
					'<ul id="dataList">' +
						'<li><a href="upload.html" name="list">資料查看</a></li>' +
						'<li><a href="record.html" name="list">資料分析</a></li>' +
					'</ul>'+
				'</li>' +
				'<li> <a href="#gene" class="icon fa-angle-down">基因檢測</a>' +
					'<ul id="geneList">' +
						'<li><a href="#" name="list">訂單管理</a></li>' +
						'<li><a href="#" name="list">檢測結果上傳</a></li>' +
						'<li><a href="#" name="list">歷史訂單</a></li>' +
					'</ul>' +
				'</li>';
			}
			else if (userType=='owner'){
				ul.innerHTML = '<li> <a href="index.html">首頁</a> </li>' + 
				'<li> <a href="#data" class="icon fa-angle-down">數據分析</a>' +
					'<ul id="dataList">' +
						'<li><a href="upload.html" name="list">豬隻資料</a></li>' +
						'<li><a href="record.html" name="list">工作紀錄</a></li>' +
						'<li><a href="report.html" name="list">查看分析報告</a></li>' +
						'<li><a href="recommend.html" name="list">選拔建議</a></li>' +
					'</ul>' +
				'</li>' +
				'<li> <a href="#gene" class="icon fa-angle-down">基因檢測</a>' +
					'<ul id="geneList">' +
						'<li><a href="#" name="list">訂單管理</a></li>' +
						'<li><a href="#" name="list">檢測結果上傳</a></li>' +
						'<li><a href="#" name="list">歷史訂單</a></li>' +
					'</ul>' +
				'</li>' +
				'<li> <a href="#contact">聯絡我們</a> </li>' +
				'<li> <a href="workerManager.html" class="icon fa-angle-down">設定</a>' + 
					'<ul id="settingList">' +
						'<li><a href="workerManager.html" name="list">員工管理</a></li>' +
						'<li><a href="#plan" name="list">飼養計畫</a></li>' +
						// makeFarmList() +
					'</ul>' +
				'</li>';
			}
			else if (userType=='employee'){
				ul.innerHTML = '<li> <a href="index.html">首頁</a> </li>' + 
				'<li> <a href="#data" class="icon fa-angle-down">數據分析</a>' +
					'<ul id="dataList">' +
						'<li><a href="upload.html" name="list">豬隻資料</a></li>' +
						'<li><a href="record.html" name="list">工作紀錄</a></li>' +
					'</ul>' +
				'</li>' +
				'<li> <a href="#cta">聯絡我們</a> </li>';
			}
			ul.innerHTML+='<li><a href="#" class="button"  onclick="logout()">登出</em></a></li>';
			rander();
		});
		console.log("User is logined", user.uid, member)
	} else {
		ul.innerHTML = '<li> <a href="index.html">首頁</a> </li>' + 
		'<li> <a href="#data">數據分析</a> </li>' +
		'<li> <a href="#gene">基因檢測</a> </li>' +
		'<li> <a href="#cta">聯絡我們</a> </li>' +
		'<li> <a href="login.html" class="button">登入</em></a> </li>';
		console.log("User is not logined yet.");
		rander();
	}
});

var rander = function() {
console.log(ul);
	skel.breakpoints({
		wide: '(max-width: 1680px)',
		normal: '(max-width: 1280px)',
		narrow: '(max-width: 980px)',
		narrower: '(max-width: 840px)',
		mobile: '(max-width: 736px)',
		mobilep: '(max-width: 480px)'
	});

	$(function() {

		var	$window = $(window),
			$body = $('body'),
			$header = $('#header'),
			$banner = $('#banner');

		// Fix: Placeholder polyfill.
			$('form').placeholder();

		// Prioritize "important" elements on narrower.
			skel.on('+narrower -narrower', function() {
				$.prioritize(
					'.important\\28 narrower\\29',
					skel.breakpoint('narrower').active
				);
			});

		// Dropdowns.
			$('#nav > ul').dropotron({
				alignment: 'right'
			});

		// Off-Canvas Navigation.

			// Navigation Button.
				$(
					'<div id="navButton">' +
						'<a href="#navPanel" class="toggle"></a>' +
					'</div>'
				)
					.appendTo($body);

			// Navigation Panel.
				$(
					'<div id="navPanel">' +
						'<nav>' +
							$('#nav').navList() +
						'</nav>' +
					'</div>'
				)
					.appendTo($body)
					.panel({
						delay: 500,
						hideOnClick: true,
						hideOnSwipe: true,
						resetScroll: true,
						resetForms: true,
						side: 'left',
						target: $body,
						visibleClass: 'navPanel-visible'
					});
			// Fix: Remove navPanel transitions on WP<10 (poor/buggy performance).
				if (skel.vars.os == 'wp' && skel.vars.osVersion < 10)
					$('#navButton, #navPanel, #page-wrapper')
						.css('transition', 'none');

		// Header.
		// If the header is using "alt" styling and #banner is present, use scrollwatch
		// to revert it back to normal styling once the user scrolls past the banner.
		// Note: This is disabled on mobile devices.
			if (!skel.vars.mobile
			&&	$header.hasClass('alt')
			&&	$banner.length > 0) {

				$window.on('load', function() {
					$banner.scrollwatch({
						delay:		0,
						range:		0.5,
						anchor:		'top',
						on:			function() { $header.addClass('alt reveal'); },
						off:		function() { $header.removeClass('alt'); }
					});

				});

			}

	});

};
