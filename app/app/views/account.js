var frameModule = require("ui/frame");
var applicationModule = require("application");
var view = require("ui/core/view");

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
				moduleName: "app/views/main",
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
			page.ios.title = "Account";

			page.logOutButtonHandler = RightEventHandler.alloc().init();
			var barLogOutButton = UIBarButtonItem.alloc().initWithTitleStyleTargetAction("Log Out", UIBarButtonItemStyle.UIBarButtonItemStyleBordered, page.logOutButtonHandler, NSSelectorFromString("clicked"));
			page.ios.navigationItem.rightBarButtonItem = barLogOutButton;

			page.goBackButtonHandler = LeftEventHandler.alloc().init();
			var barGoBackButton = UIBarButtonItem.alloc().initWithTitleStyleTargetAction("Go Back", UIBarButtonItemStyle.UIBarButtonItemStyleBordered, page.goBackButtonHandler, NSSelectorFromString("clicked"));
			page.ios.navigationItem.leftBarButtonItem = barGoBackButton;
		}

		var editHackButton = view.getViewById(page, "editHack");
		editHackButton.on("click", function() {
			frameModule.topmost().navigate({
				moduleName: "app/views/hack",
				context: email,
				animated: false
			});
		});

		var editTeamButton = view.getViewById(page, "editTeam");
		editTeamButton.on("click", function() {
			frameModule.topmost().navigate({
				moduleName: "app/views/editteam",
				context: email,
				animated: false
			});
		});

		var changePassButton = view.getViewById(page, "changePass");
		changePassButton.on("click", function() {
			frameModule.topmost().navigate({
				moduleName: "app/views/resetpass",
				context: email,
				animated: false
			});
		});
	}
}