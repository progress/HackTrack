/*
// register.js
// HackTrack
//
// Copyright 2015 (c) Progress Software
// Author: Akhil Nistala
*/

var view = require("ui/core/view");
var uidialogs = require("ui/dialogs");
var http = require("http");
var frameModule = require("ui/frame");
var applicationModule = require("application");

var regex = require("../resources/regex");
var alerts = require("../resources/alerts");
var strings = require("../resources/strings");

var pageCounter = 1;

var EventHandler = NSObject.extend(
	{ clicked: function() { goBack(); } },
	{ exposedMethods: { clicked: "v" } }
)

goBack = function() {
	frameModule.topmost().navigate({
		moduleName: "app/views/frontpage", 
		animated: false
	});
}

exports.pageLoaded = function(args) {
	pageCounter++;
	if (pageCounter%2 == 0) {
		var page = args.object;

		if (applicationModule.ios) {
	 		var NavBarController = frameModule.topmost().ios.controller;
	        var NavBar = NavBarController.navigationBar;
	        NavBar.hidden = false;
       		page.backButtonHandler = EventHandler.alloc().init();
	        var barBackButton = UIBarButtonItem.alloc().initWithTitleStyleTargetAction("Go Back", UIBarButtonItemStyle.UIBarButtonItemStyleBordered, page.backButtonHandler, NSSelectorFromString("clicked"));
       		page.ios.navigationItem.leftBarButtonItem = barBackButton;
       		page.ios.title = "Registration";
       	}

		var emailField = view.getViewById(page, "email");
		var passwordField = view.getViewById(page, "password");
		var reenterField = view.getViewById(page, "reenter");
		var registerButton = view.getViewById(page, "register");

		registerButton.on("click", function() {
			var email = emailField._nativeView.text;
			var password = passwordField._nativeView.text;
			var reenter = reenterField._nativeView.text;

			validate(email, password, reenter);
		});
	}
}

validate = function(email, password, reenter) {
	var email_re = regex.email_re();
	var pass_re = regex.pass_re();

	if (!email_re.test(email)) {
		uidialogs.alert(alerts.valid_email()).then(function(response) {
			return ;
		}, function(err) {
			console.log(err);
		});
	} else if (!pass_re.test(password)) {
		uidialogs.alert(alerts.secure_password()).then(function(response) {
			return ;
		}, function(err) {
			console.log(err);
		});
	} else if (!(password === reenter)) {
		uidialogs.alert(alerts.matching_passwords()).then(function(response) {
			return ;
		}, function(err) {
			console.log(err);
		});
	} else if (isNewMail(email) == false) {
		uidialogs.alert(alerts.reg_email()).then(function(response) {
			return ;
		}, function(err) {
			console.log(err);
		});
	} else {
		var code = (Math.floor((Math.random()*900) + 100)).toString();
		sendMail(email, password, code);
	}
}

isNewMail = function(email) {
	var content = { "email": email };
	var headers = { "Content-Type": "application/json" , "auth": /* Authentication Code */ };

	http.request({
		url: "http://sandboxdb-42183.onmodulus.net/verifyaccount",
		method: "POST",
		headers: headers,
		content: JSON.stringify(content)
	}).then(function(response) {
		if (response.statusCode === 200) {
			return true;
		} else {
			return false;
		}
	});
}

sendMail = function(email, password, code) {
	http.request({ 
		url: "https://api.postmarkapp.com/email",
		headers: { 
			"Content-Type": "application/json",
			"X-Postmark-Server-Token": strings.postmark_token()
		},
		method: "POST",
		content: JSON.stringify({
			"From": strings.email_sender(),
			"To": email,
			"Subject": strings.email_subject(),
			"HtmlBody": strings.email_content(code)
		})
	}).then(function(response) {
		prompt(email, password, code);
	}, function(err) {
		console.log(err);
	});
}

prompt = function(email, password, code) {
	uidialogs.prompt(strings.email_confirm()).then(function(response) {
		verify(email, password, code, response.text);
	}, function(err) {
		console.log(err);
	});
}

verify = function(email, password, code, response) {
	if (response === code) {
		store(email, password);
	} else if (response.result) {
		uidialogs.alert(alerts.invalid_code()).then(function(response) {
			prompt(email, password, code);
		}, function(err) {
			console.log(err);
		});      
	}
}

store = function(email, password) {
	var content = { "email": email, "password": password, "completed": false };
	var headers = { "Content-Type": "application/json" , "auth": /* Authentication Code */ };

	http.request({
		url: "http://" + /* Modulus URL */ + ".onmodulus.net/adduser",
		method: "POST",
		headers: headers,
		content: JSON.stringify(content)
	}).then(function(response) {
		if (response.statusCode === 200) {
			uidialogs.alert(alerts.success_reg()).then(function(response) {
				var frontPageEntry = { moduleName: "app/views/frontpage", animated: false };
				frameModule.topmost().navigate(frontPageEntry);
			});
		} else {
			uidialogs.alert(alerts.failed_reg()).then(function(response) {
				return ;
			}, function(err) {
				console.log(err);
			});
		}
	}, function(err) {
		console.log(err);
	});
}
