
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

// Get Elements
var ul = document.getElementById('ul');
var data = ul.childNodes[3];
var gene = ul.childNodes[5];
var logInOut = ul.childNodes[9];

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

// Content Control
firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		logInOut.innerHTML='<a href="#" class="button"  onclick="logout()">登出</em></a>';
		data.innerHTML = '<a href="#data" class="icon fa-angle-down">數據分析</a>' +
			'<ul id="dataList">' +
				'<li><a href="upload.html" name="list">豬隻資料</a></li>' +
				'<li><a href="record.html" name="list">上傳紀錄</a></li>' +
				'<li><a href="report.html" name="list">查看分析報告</a></li>' +
				'<li><a href="recommend.html" name="list">選拔建議</a></li>' +
			'</ul>';
		gene.innerHTML += 
			'<ul id="geneList">' +
				'<li><a href="service.html" name="list">服務說明</a></li>' +
				'<li><a href="application.html" name="list">提出申請</a></li>' +
				'<li><a href="progress.html" name="list">進度查詢</a></li>' +
				'<li><a href="diagnose.html" name="list">查看檢測報告</a></li>' +
			'</ul>';
		console.log("User is logined", user)
	} else {
		logInOut.innerHTML = '<a href="login.html" class="button">登入</em></a>';
		data.innerHTML = '<a href="#data">數據分析</a>'
		gene.innerHTML = '<a href="#gene">基因檢測</a>'
		console.log("User is not logined yet.");
	}

(function($) {

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

})(jQuery);});
(function($) {
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

})(jQuery);

// Contact Form
var contactBtn = document.getElementById("contactBtn");
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha', {
	'size' : 'normal',
	'callback' : function(response){
		contactBtn.classList.remove('disabled');
		contactBtn.setAttribute('type','submit');
		console.log('verified');
	},
	'expired-callback' : function(){
		//contactBtn.setAttribute('type','text');
		contactBtn.classList.add('disabled');
	}
});
window.recaptchaVerifier.render().then(function(widgetId){
	window.recaptchaWidgetId = widgetId;
	console.log(widgetId);
});
