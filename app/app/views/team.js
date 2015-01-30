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
		animated: true
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
       		page.ios.title = "Team Info";
       	}

		page.bindingContext = page.navigationContext;
		var email = page.bindingContext;

		var teamText = view.getViewById(page, "message");
		teamText.textWrap = true;

		var teamNameEntry = view.getViewById(page, "teamname");
		var oneEntry = view.getViewById(page, "one");
		var twoEntry = view.getViewById(page, "two");
		var threeEntry = view.getViewById(page, "three");
		var fourEntry = view.getViewById(page, "four");

		var continueButton = view.getViewById(page, "continue");
		continueButton.on("click", function() {
			var teamName = teamNameEntry._nativeView.text.trim();
			var mem1 = oneEntry._nativeView.text.trim();
			var mem2 = twoEntry._nativeView.text.trim();
			var mem3 = threeEntry._nativeView.text.trim();
			var mem4 = fourEntry._nativeView.text.trim();

			verify(email, teamName, mem1, mem2, mem3, mem4);
		});
	}
}

verify = function(email, teamName, mem1, mem2, mem3, mem4) {
	var name_re = regex.name_re();

	team = [];

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

store = function(email, teamName, team) {
	var content = { "email" : email, "teamName" : teamName, "team" : team };
	var headers = { "Content-Type": "application/json" , "auth": /* Authentication Code */ };

	http.request({
		url: "http://" + /* Modulus URL */ + ".onmodulus.net/addteam",
		method: "POST",
		headers: headers,
		content: JSON.stringify(content)
	}).then(function(response) {
		if (response.statusCode === 200) {
			frameModule.topmost().navigate({
				moduleName: "app/views/beacon",
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
	}, function(err) {
		console.log(err);
	});
}