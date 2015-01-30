/*
// login.js
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
       		page.ios.title = "Login";
       	}

		var emailField = view.getViewById(page, "email");
		var passwordField = view.getViewById(page, "password");
		var loginButton = view.getViewById(page, "login");
		var recoverButton = view.getViewById(page, "recover");

		emailField._nativeView.text = "";
		passwordField._nativeView.text = "";

		loginButton.on("click", function() {
			var email_re = regex.email_re();

			var email = emailField._nativeView.text;
			var password = passwordField._nativeView.text;

			if (!email_re.test(email)) {
				uidialogs.alert(alerts.valid_email());
			} else if (password == "") {
				uidialogs.alert(alerts.both_fields());
			} else {
				login(email, password);
			}
		});

		recoverButton.on("click", function() {
			askMail();
		});
	}
}

login = function(email, password) {
	var content = { "email": email, "password": password };
	var headers = { "Content-Type": "application/json" , "auth": /* Authentication Code */ };

	http.request({
		url: "http://" + /* Modulus URL */ + ".onmodulus.net/login",
		method: "POST",
		headers: headers,
		content: JSON.stringify(content)
	}).then(function(response) {
		if (response.statusCode === 201) {
			frameModule.topmost().navigate({
				moduleName: "app/views/main",
				context: email,
				animated: false
			});
		} else if (response.statusCode === 202) {
			frameModule.topmost().navigate({
				moduleName: "app/views/team",
				context: email,
				animated: false
			});
		} else if (response.statusCode === 500) {
			uidialogs.alert(alerts.unreg_email());
		} else {
			uidialogs.alert(alerts.wrong_password());
		}
	}, function(err) {
		console.log(err);
	});
}

askMail = function() {
	var code = (Math.floor((Math.random()*900) + 100)).toString();
	var email_re = regex.email_re();

	uidialogs.prompt(strings.email_request()).then(function(response) {
		var email = response.text;

		if (email_re.test(email)) {
			var content = { "email": email };
			var headers = { "Content-Type": "application/json" , "auth": /* Authentication Code */ };

			http.request({
				url: "http://" + /* Modulus URL */ + ".onmodulus.net/verifyaccount",
				method: "POST",
				headers: headers,
				content: JSON.stringify(content)
			}).then(function(response) {
				if (response.statusCode === 201) {
					sendMail(email, code);
				} else {
					uidialogs.alert(alerts.unreg_email()).then(function(response) {
						askMail();
					}, function(err) {
						console.log(err);
					});
				}
			}, function(err) {
				console.log(err);
			});
		} else if (response.result) {
			uidialogs.alert(alerts.valid_email()).then(function(response) {
				askMail();
			}, function(err) {
				console.log(err);
			});
		}
	});
}

sendMail = function(email, code) {
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
			"Subject": strings.recovery_subject(),
			"HtmlBody": strings.email_content(code)
		})
	}).then(function(response) {
		prompt(email, code);
	}, function(err) {
		console.log(err);
	});
}

prompt = function(email, code) {
	uidialogs.prompt(strings.email_confirm()).then(function(response) {
		verify(email, code, response);
	}, function(err) {
		console.log(err);
	});
}

verify = function(email, code, response) {
	if (response.text === code) {
		resetPass(email);
	} else if (response.result) {
		uidialogs.alert(alerts.invalid_code()).then(function() {
			prompt(email, code);
		}, function(err) {
			console.log(err);
		});
	}
}

resetPass = function(email) {
	var pass_re = regex.pass_re();

	uidialogs.prompt(strings.password_reset()).then(function(response) {
		if (pass_re.test(response.text)) {
			store(email, response.text);
		} else if (response.result) {
			uidialogs.alert(alerts.secure_password()).then(function() {
				resetPass(email);
			}, function(err) {
				console.log(err);
			});
		}
	}, function(err) {
		console.log(err);
	});
}

store = function(email, password) {
	var content = { "email": email, "password": password };
	var headers = { "Content-Type": "application/json" , "auth": /* Authentication Code */ };

	http.request({
		url: "http://" + /* Modulus URL */ + ".onmodulus.net/resetpassword",
		method: "POST",
		headers: headers,
		content: JSON.stringify(content)
	}).then(function(response) {
		if (response.statusCode === 200) {
			uidialogs.alert(alerts.success_update());
		} else {
			uidialogs.alert(alerts.failed_update());
		}
	}, function(err) {
		console.log(err);
	});
}
