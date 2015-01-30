/*
// hack.js
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
var textViewModule = require("ui/text-view");
var buttonModule = require("ui/button");
var labelModule = require("ui/label");

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
			page.ios.title = "Add/Edit Hack";

			page.logOutButtonHandler = RightEventHandler.alloc().init();
			var barLogOutButton = UIBarButtonItem.alloc().initWithTitleStyleTargetAction("Log Out", UIBarButtonItemStyle.UIBarButtonItemStyleBordered, page.logOutButtonHandler, NSSelectorFromString("clicked"));
			page.ios.navigationItem.rightBarButtonItem = barLogOutButton;

			page.goBackButtonHandler = LeftEventHandler.alloc().init();
			var barGoBackButton = UIBarButtonItem.alloc().initWithTitleStyleTargetAction("Go Back", UIBarButtonItemStyle.UIBarButtonItemStyleBordered, page.goBackButtonHandler, NSSelectorFromString("clicked"));
			page.ios.navigationItem.leftBarButtonItem = barGoBackButton;
		}

		var store = function(email, hack, description) {
			var content = { "email": email, "hack": hack, "description": description };
			var headers = { "Content-Type": "application/json" , "auth": /* Authentication Code */ };

			http.request({
				url: "http://" + /* Modulus URL */ + ".onmodulus.net/addhack",
				method: "POST",
				headers: headers,
				content: JSON.stringify(content)
			}).then(function(response) {
				if (response.statusCode === 200) {
					uidialogs.alert(alerts.success_hack()).then(function(response) {
						frameModule.topmost().navigate({
							moduleName: "app/views/account",
							context: email,
							animated: false
						});
					}, function(err) {
						console.log(err);
					});
				} else {
					uidialogs.alert(alerts.unknown_failure()).then(function(response) {
						return ;
					}, function(err) {
						console.log(err);
					});
				}
			}, function(err) {
				console.log(err);
			});
		}

		var getHack = function(email) {
			var content = { "email": email };
			var headers = { "Content-Type": "application/json" , "auth": /* Authentication Code */ };

			http.request({
				url: "http://" + /* Modulus URL */ + ".onmodulus.net/hackinfo",
				method: "POST",
				headers: headers,
				content: JSON.stringify(content)
			}).then(function(response) {
				if (response.statusCode === 200) {
					var nameLabel = new labelModule.Label();
					nameLabel.text = "Hack Name:";
					panel.addChild(nameLabel);

					var nameField = new textModule.TextField();
					nameField.hint = "Enter your hack's name";
					panel.addChild(nameField);

					var descriptionLabel = new labelModule.Label();
					descriptionLabel.text = "Description:"
					panel.addChild(descriptionLabel);

					var descriptionField = new textViewModule.TextView();
					panel.addChild(descriptionField);

					var submitButton = new buttonModule.Button();
					submitButton.text = "Submit";
					panel.addChild(submitButton);

					submitButton.on("click", function() {
						var hack = nameField._nativeView.text;
						var description = descriptionField._nativeView.text;
						store(email, hack, description);
					});
				} else if (response.statusCode === 201) {
					var data = JSON.parse(response.content)[0];

					var nameLabel = new labelModule.Label();
					nameLabel.text = "Hack Name:";
					panel.addChild(nameLabel);

					var nameField = new textModule.TextField();
					nameField.hint = "Enter your hack's name";
					nameField.text = data.hack;
					panel.addChild(nameField);

					var descriptionLabel = new labelModule.Label();
					descriptionLabel.text = "Description:"
					panel.addChild(descriptionLabel);

					var descriptionField = new textViewModule.TextView();
					descriptionField.text = data.description;
					panel.addChild(descriptionField);

					var submitButton = new buttonModule.Button();
					submitButton.text = "Submit";
					panel.addChild(submitButton);

					submitButton.on("click", function() {
						var hack = nameField._nativeView.text;
						var description = descriptionField._nativeView.text;
						store(email, hack, description);
					});
				}
			}, function(err) {
				console.log(err);
			});
		}

		getHack(email);
	}
}
