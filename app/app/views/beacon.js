/*
// beacon.js
// HackTrack
//
// Copyright 2015 (c) Progress Software
// Author: Akhil Nistala
*/

var view = require("ui/core/view");
var uidialogs = require("ui/dialogs");
var http = require("http");
var applicationModule = require("application");
var frameModule = require("ui/frame");

var strings = require("../resources/strings");
var regex = require("../resources/regex");
var alerts = require("../resources/alerts");

var pageCounter = 1;

var EventHandler = NSObject.extend(
	{ clicked: function() { logOut(); } },
	{ exposedMethods: { clicked: "v" } }
)

logOut = function() {
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
       		page.logOutButtonHandler = EventHandler.alloc().init();
	        var barLogOutButton = UIBarButtonItem.alloc().initWithTitleStyleTargetAction("Log Out", UIBarButtonItemStyle.UIBarButtonItemStyleBordered, page.logOutButtonHandler, NSSelectorFromString("clicked"));
       		page.ios.navigationItem.leftBarButtonItem = barLogOutButton;
       		page.ios.title = "iBeacon Info";
       	}
		
		page.bindingContext = page.navigationContext;
		var email = page.bindingContext;

       	var beaconText = view.getViewById(page, "message");
       	beaconText.textWrap = true;

       	var uuidFormat = view.getViewById(page, "uuidFormat");
       	uuidFormat.text = strings.uuid_format();

       	var uuidEntry = view.getViewById(page, "uuid");

       	var continueButton = view.getViewById(page, "continue");
       	continueButton.on("click", function() {
       		var uuid = uuidEntry._nativeView.text;
       		verify(email, uuid);
       	});
	}
}

verify = function(email, uuid) {
	var uuid_re = regex.uuid_re();
	if (!uuid_re.test(uuid)) {
		uidialogs.alert(alerts.invalid_uuid()).then(function(response) {
			return ;
		}, function(err) {
			console.log(err);
		});
	} else {
		store(email, uuid);
	}
}

store = function(email, uuid) {
	var content = { "email": email, "uuid": uuid };
	var headers = { "Content-Type": "application/json" , "auth": /* Authentication Code */ };

	http.request({
		url: "http://" + /* Modulus URL */ + ".onmodulus.net/addbeacon",
		method: "POST",
		headers: headers,
		content: JSON.stringify(content)
	}).then(function(response) {
		if (response.statusCode === 200) {
			frameModule.topmost().navigate({
				moduleName: "app/views/main",
				context: email,
				animated: false
			});
		} else {
			uidialogs.alert(alerts.unknown_failure()).then(function(response) {
				return ;
			}, function(err) {
				console.log(err);
			});
		}
	});
}
