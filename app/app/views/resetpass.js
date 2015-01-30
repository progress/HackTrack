/*
// resetpass.js
// HackTrack
//
// Copyright 2015 (c) Progress Software
// Author: Akhil Nistala
*/

var frameModule = require("ui/frame");
var applicationModule = require("application");
var view = require("ui/core/view");
var uidialogs = require("ui/dialogs");
var http = require("http");
var textModule = require("ui/text-field");
var buttonModule = require("ui/button");
var labelModule = require("ui/label");

var regex = require("../resources/regex");
var alerts = require("../resources/alerts");

var pageCounter = 1;

exports.pageLoaded = function(args) {
	pageCounter++;
	if (pageCounter%2 == 0) {
		var page = args.object;

		page.bindingContext = page.navigationContext;
		var email = page.bindingContext;
		var panel = view.getViewById(page, "stackPanel");

		var logOut = function() {
			frameModule.topmost().navigate({
				moduleName: "app/views/frontpage", 
				animated: false
			});
		}

		var goBack = function(email) {
			frameModule.topmost().navigate({
				moduleName: "app/views/account",
				context: email,
				animated: false
			});
		}

		var RightEventHandler = NSObject.extend(
			{ clicked: function() { logOut(); } },
			{ exposedMethods: { clicked: "v" } }
		)

		var LeftEventHandler = NSObject.extend(
			{ clicked: function() { goBack(email); } },
			{ exposedMethods: { clicked: "v" } }
		)

		if (applicationModule.ios) {
			var NavBarController = frameModule.topmost().ios.controller;
			var NavBar = NavBarController.navigationBar;
			NavBar.hidden = false;
			page.ios.title = "Change Password";

			page.logOutButtonHandler = RightEventHandler.alloc().init();
			var barLogOutButton = UIBarButtonItem.alloc().initWithTitleStyleTargetAction("Log Out", UIBarButtonItemStyle.UIBarButtonItemStyleBordered, page.logOutButtonHandler, NSSelectorFromString("clicked"));
			page.ios.navigationItem.rightBarButtonItem = barLogOutButton;

			page.goBackButtonHandler = LeftEventHandler.alloc().init();
			var barGoBackButton = UIBarButtonItem.alloc().initWithTitleStyleTargetAction("Go Back", UIBarButtonItemStyle.UIBarButtonItemStyleBordered, page.goBackButtonHandler, NSSelectorFromString("clicked"));
			page.ios.navigationItem.leftBarButtonItem = barGoBackButton;
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
					uidialogs.alert(alerts.success_update()).then(function(response) {
						frameModule.topmost().navigate({
							moduleName: "app/views/account",
							context: email,
							animated: false
						});
					}, function(err) {
						console.log(err);
					});
				} else {
					uidialogs.alert(alerts.failed_update()).then(function(response) {
						return ;
					}, function(err) {
						console.log(err);
					});
				}
			}, function(err) {
				console.log(err);
			});
		}

		var validate = function(password, reenter) {
			var pass_re = regex.pass_re();

			if (!pass_re.test(password)) {
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
			} else {
				store(email, password);
			}
		}

		var passField = new textModule.TextField();
		passField.hint = "Enter a new password";
		passField.secure = true;
		panel.addChild(passField);

		var reenterField = new textModule.TextField();
		reenterField.hint = "Reenter password";
		reenterField.secure = true;
		panel.addChild(reenterField);

		var submitButton = new buttonModule.Button();
		submitButton.text = "Submit";
		panel.addChild(submitButton);

		submitButton.on("click", function() {
			var password = passField._nativeView.text;
			var reenter = reenterField._nativeView.text;
			validate(password, reenter);
		});
	}
}
