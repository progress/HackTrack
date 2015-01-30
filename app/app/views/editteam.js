/*
// editteam.js
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
			page.ios.title = "Edit Team Info";

			page.logOutButtonHandler = RightEventHandler.alloc().init();
			var barLogOutButton = UIBarButtonItem.alloc().initWithTitleStyleTargetAction("Log Out", UIBarButtonItemStyle.UIBarButtonItemStyleBordered, page.logOutButtonHandler, NSSelectorFromString("clicked"));
			page.ios.navigationItem.rightBarButtonItem = barLogOutButton;

			page.goBackButtonHandler = LeftEventHandler.alloc().init();
			var barGoBackButton = UIBarButtonItem.alloc().initWithTitleStyleTargetAction("Go Back", UIBarButtonItemStyle.UIBarButtonItemStyleBordered, page.goBackButtonHandler, NSSelectorFromString("clicked"));
			page.ios.navigationItem.leftBarButtonItem = barGoBackButton;
		}

		var store = function(email, teamName, team) {
			var content = { "email" : email, "teamName" : teamName, "team" : team };
			var headers = { "Content-Type": "application/json" , "auth": /* Authentication Code */ };

			http.request({
				url: "http://" + /* Modulus URL */ + ".onmodulus.net/addteam",
				method: "POST",
				headers: headers,
				content: JSON.stringify(content)
			}).then(function(response) {
				if (response.statusCode === 200) {
					uidialogs.alert(alerts.team_update()).then(function(response) {
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

		var getInfo = function(email) {
			var content = { "email": email };
			var headers = { "Content-Type": "application/json" , "auth": /* Authentication Code */ };

			http.request({
				url: "http://" + /* Modulus URL */ + ".onmodulus.net/teaminfo",
				method: "POST",
				headers: headers,
				content: JSON.stringify(content)
			}).then(function(response) {

				var verify = function(email, teamName, mem1, mem2, mem3, mem4) {
					var name_re = regex.name_re();

					team = []

					if (name_re.test(mem1))
						team.push(mem1);
					if (name_re.test(mem2))
						team.push(mem2);
					if (name_re.test(mem3))
						team.push(mem3);
					if (name_re.test(mem4))
						team.push(mem4);

					if (!name_re.test(teamName)) {
						uidialogs.alert(alerts.invalid_teamname()).then(function(response) {
							return ;
						}, function(err) {
							console.log(err);
						});
					} else if (team.length == 0) {
						uidialogs.alert(alerts.invalid_team()).then(function(response) {
							return ;
						}, function(err) {
							console.log(err);
						});
					} else {
						store(email, teamName, team);
					}
				}

				var data = JSON.parse(response.content)[0];
				var team = data.team;

				var label = new labelModule.Label();
				label.text = "Click a field to edit";
				panel.addChild(label);

				var teamField = new textModule.TextField();
				teamField.hint = "Team Name";
				teamField.text = data.teamName;
				panel.addChild(teamField);

				var memField1 = new textModule.TextField();
				memField1.hint = "Team Member 1";
				memField1.text = team[0];
				panel.addChild(memField1);

				var memField2 = new textModule.TextField();
				memField2.hint = "Team Member 2";
				if (team[1])
					memField2.text = team[1];
				panel.addChild(memField2);

				var memField3 = new textModule.TextField();
				memField3.hint = "Team Member 3";
				if (team[2])
					memField3.text = team[2];
				panel.addChild(memField3);

				var memField4 = new textModule.TextField();
				memField4.hint = "Team Member 4";
				if (team[3])
					memField4.text = team[3];
				panel.addChild(memField4);

				var submitButton = new buttonModule.Button();
				submitButton.text = "Submit";
				panel.addChild(submitButton);

				submitButton.on("click", function() {
					var teamName = teamField._nativeView.text;
					var mem1 = memField1._nativeView.text;
					var mem2 = memField2._nativeView.text;
					var mem3 = memField3._nativeView.text;
					var mem4 = memField4._nativeView.text;

					verify(email, teamName, mem1, mem2, mem3, mem4);
				});

			}, function(err) {
				console.log(err);
			});
		}

		getInfo(email);
	}
}
