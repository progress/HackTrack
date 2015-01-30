/*
// frontpage.js
// HackTrack
//
// Copyright 2015 (c) Progress Software
// Author: Akhil Nistala
*/

var frameModule = require("ui/frame");
var applicationModule = require("application");

exports.pageLoaded = function() {
	if (applicationModule.ios) {
		var NavBarController = frameModule.topmost().ios.controller;
		var NavBar = NavBarController.navigationBar;
		NavBar.hidden = true;
	}
}

exports.login = function() {
	var loginEntry = { moduleName: "app/views/login", animated: false };
	frameModule.topmost().navigate(loginEntry);
}

exports.register = function() {
	var regEntry = { moduleName: "app/views/register", animated: false };
	frameModule.topmost().navigate(regEntry);
}
