// Get Elements
var nav = document.getElementById('ul');
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

function changeFarm(farmNo){
    console.log(farmNo);
    changeCurrentFarm = firebase.functions().httpsCallable('changeCurrentFarm');
    changeCurrentFarm({farm:farmNo}).then((result)=>{
        console.log(result.data.currentFarm)
        return firebase.auth().currentUser.getIdTokenResult(true);
    }).then((result)=>{
        console.log(result.claims.farm);
		window.location.replace(window.location.href);
	}).catch((error)=>{console.log(error)});
}

function makeFarmList(){
	var currentFarm = userData.currentFarm
	var farms = userData.farmNo
    console.log(userData);
    console.log(farms);
    farms = Object.keys(farms);
	var farmList = '';
	var promiseArray = [];
	for(var i=0; i<farms.length; i++){
        console.log(farms[i]);
		const p = firebase.database().ref('farms/' + farms[i]).once('value');
		promiseArray.push(p);
	}
	return Promise.all(promiseArray).then((snapshot)=>{
		for(var i=0; i<promiseArray.length; i++){
            console.log(snapshot[i].val());
			if(parseInt(farms[i])===currentFarm){
				farmList += '<li><a href="#" name="list"><b>' + snapshot[i].val().name + '</b></a></li>';
			}
			else{
				farmList += '<li><a href="#" name="list" onclick = "changeFarm('+snapshot[i].key+ ')">' + snapshot[i].val().name + '</a></li>';
			}
		}
		return '<li><a href="#" name="list">選擇豬場</a><ul>' + farmList + '</ul></li>';
	}).catch((error)=>{
		console.log(error);
	})
}

function makeNav(role){
    console.log(role);
	if (role=='admin'){
		nav.innerHTML = '<li> <a href="index.html">首頁</a> </li>' + 
		'<li> <a href="#data" class="icon fa-angle-down">數據分析</a>' +
			'<ul id="dataList">' +
				'<li><a href="upload.html" name="list">資料查看</a></li>' +
				'<li><a href="analysis.html" name="list">資料分析</a></li>' +
			'</ul>' +
		'</li>' +
		'<li> <a href="#gene" class="icon fa-angle-down">基因檢測</a>' +
			'<ul id="geneList">' +
				'<li><a href="order.html" name="list">訂單管理</a></li>' +
				'<li><a href="uploadgene.html" name="list">檢測結果上傳</a></li>' +
				'<li><a href="orderhistory.html" name="list">歷史訂單</a></li>' +
			'</ul>' +
		'</li>' +
		'<li> <a href="accountManage.html" class="icon fa-angle-down">帳號管理</a>' +
			'<ul id="accountList">' +
				'<li><a href="farm.html" name="list">豬場管理</a></li>' +
				'<li><a href="owner.html" name="list">場主帳號</a></li>' +
				'<li><a href="analyst.html" name="list">分析師帳號</a></li>' +
			'</ul>' +
        '</li>' +
        '<li><a href="contact.html">檢視訊息</a></li>' + 
		'<li><a href="#" class="button"  onclick="logout()">登出</em></a></li>';
	}
	else if (role=='analyst'){
		nav.innerHTML = '<li> <a href="index.html">首頁</a> </li>' + 
		'<li> <a href="#data" class="icon fa-angle-down">數據分析</a>' +
			'<ul id="dataList">' +
				'<li><a href="upload.html" name="list">資料查看</a></li>' +
				'<li><a href="analysis.html" name="list">資料分析</a></li>' +
			'</ul>'+
		'</li>' +
		'<li> <a href="#gene" class="icon fa-angle-down">基因檢測</a>' +
			'<ul id="geneList">' +
				'<li><a href="order.html" name="list">訂單管理</a></li>' +
				'<li><a href="uploadgene.html" name="list">檢測結果上傳</a></li>' +
				'<li><a href="orderhistory.html" name="list">歷史訂單</a></li>' +
			'</ul>' +
		'</li>' +
		'<li><a href="#" class="button"  onclick="logout()">登出</em></a></li>';
	}
	else if (role=='owner'){
		makeFarmList().then((farmList)=>{
			nav.innerHTML = '<li> <a href="index.html">首頁</a> </li>' + 
			'<li> <a href="#data" class="icon fa-angle-down">數據分析</a>' +
				'<ul id="dataList">' +
					'<li><a href="upload.html" name="list">豬隻資料</a></li>' +
					'<li><a href="record.html" name="list">工作紀錄</a></li>' +
					'<li><a href="report.html" name="list">分析報告</a></li>' +
					'<li><a href="recommend.html" name="list">選拔建議</a></li>' +
				'</ul>' +
			'</li>' +
			'<li> <a href="#gene" class="icon fa-angle-down">基因檢測</a>' +
				'<ul id="geneList">' +
					'<li><a href="order.html" name="list">訂單管理</a></li>' +
					'<li><a href="uploadgene.html" name="list">檢測結果上傳</a></li>' +
					'<li><a href="orderhistory.html" name="list">歷史訂單</a></li>' +
				'</ul>' +
			'</li>' +
			'<li> <a href="workerManager.html" class="icon fa-angle-down">設定</a>' + 
				'<ul id="settingList">' +
					'<li><a href="employee.html" name="list">員工管理</a></li>' +
					'<li><a href="breed.html" name="list">飼養計畫</a></li>' +
					 farmList +
				'</ul>' +
			'</li>' +
			'<li><a href="#" class="button"  onclick="logout()">登出</em></a></li>';
			renderNav();
		});
	}
	else if (role=='employee'){
		nav.innerHTML = '<li> <a href="index.html">首頁</a> </li>' + 
		'<li> <a href="#data" class="icon fa-angle-down">數據分析</a>' +
			'<ul id="dataList">' +
				'<li><a href="upload.html" name="list">豬隻資料</a></li>' +
				'<li><a href="record.html" name="list">工作紀錄</a></li>' +
			'</ul>' +
		'</li>' +
		'<li><a href="#" class="button"  onclick="logout()">登出</em></a></li>';
	}
	else {
		nav.innerHTML = '<li> <a href="index.html">首頁</a> </li>' + 
		'<li> <a href="#data">數據分析</a> </li>' +
		'<li> <a href="#gene">基因檢測</a> </li>' +
		'<li> <a href="#cta">聯絡我們</a> </li>' +
		'<li> <a href="login.html" class="button">登入</em></a> </li>';
	}
	renderNav();
}

var renderNav = function() {
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
