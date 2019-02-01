// Floating Nav Bar
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

var gResponse;
var contactBtn = document.getElementById("contactBtn");

function localDateStr(d){
	str = d.toLocaleDateString().split("/");
	yStr = str[0];
	mStr = ("0" + str[1]).slice(-2);
	dStr = ("0" + str[2]).slice(-2);
	return [yStr, mStr, dStr].join("-");
}

// Contact Form
function initPage(){
    //firebase.auth().currentUser.getIdTokenResult(true).then((result)=>console.log(result.claims));
    //window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha', {
    grecaptcha.render("recaptcha", {
        'size' : 'normal',
        'sitekey' : '6LfJEosUAAAAADtfLx09HJv3b2ryRK2WpBrggGNl',
        'callback' : function(response){
            gResponse = response;
            contactBtn.classList.remove('disabled');
            contactBtn.setAttribute('type','submit');
        },
        'expired-callback' : function(){
            //contactBtn.setAttribute('type','text');
            contactBtn.classList.add('disabled');
        }
    });
    /*
    window.recaptchaVerifier.render().then(function(widgetId){
        window.recaptchaWidgetId = widgetId;
        console.log(widgetId);
    });
    */
    document.getElementById("contactForm").addEventListener("submit", function(e){
        e.preventDefault();
        d = new Date();
        contactFormObj = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            farm: document.getElementById("farm").value,
            size: document.getElementById("size").value,
            address: document.getElementById("address").value,
            message: document.getElementById("message").value,
            response: gResponse,
            date: localDateStr(d)
        }
        // call oncall
        newContactForm = firebase.functions().httpsCallable('newContactForm');
        newContactForm(contactFormObj).then((result)=>{
            window.location.replace("index.html");
        });
    });
}
