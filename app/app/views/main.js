var frameModule = require("ui/frame");
var applicationModule = require("application");
var view = require("ui/core/view");
var http = require("http");
var buttonModule = require("ui/button");
var labelModule = require("ui/label");

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

		var viewAccount = function(email) {
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
			{ clicked: function() { viewAccount(email); } },
			{ exposedMethods: { clicked: "v" } }
		)

		if (applicationModule.ios) {
			var NavBarController = frameModule.topmost().ios.controller;
			var NavBar = NavBarController.navigationBar;
			NavBar.hidden = false;
			page.ios.title = "HackFeed";

			page.logOutButtonHandler = RightEventHandler.alloc().init();
			var barLogOutButton = UIBarButtonItem.alloc().initWithTitleStyleTargetAction("Log Out", UIBarButtonItemStyle.UIBarButtonItemStyleBordered, page.logOutButtonHandler, NSSelectorFromString("clicked"));
			page.ios.navigationItem.rightBarButtonItem = barLogOutButton;

			page.accountButtonHandler = LeftEventHandler.alloc().init();
			var barAccountButton = UIBarButtonItem.alloc().initWithTitleStyleTargetAction("Account", UIBarButtonItemStyle.UIBarButtonItemStyleBordered, page.accountButtonHandler, NSSelectorFromString("clicked"));
			page.ios.navigationItem.leftBarButtonItem = barAccountButton;
		}

		var retrieve = function(panel, email) {
			var content = {};
			var headers = { "Content-Type": "application/json" , "auth": /* Authentication Code */ };

			http.request({
				url: "http://" + /* Modulus URL */ + ".onmodulus.net/getteams",
				method: "POST",
				headers: headers,
				content: JSON.stringify(content)
			}).then(function(response) {
				populate(JSON.parse(response.content), panel, email);
			}, function(err) {
				console.log(err);
			});
		}

		var populate = function(data, panel, email) {
			var label = new labelModule.Label();
			label.text = "Click on a team below to see more information. Click on Account to add details about your Hack.";
			label.textWrap = true;
			panel.addChild(label);

			for (var i = 0; i < data.length; i++) {
				var button = new buttonModule.Button();
				button.text = data[i].teamName;
				button.email = data[i].email;
				button.on("click", function(evt) {
					frameModule.topmost().navigate({
						moduleName: "app/views/teaminfo",
						context: { "teamEmail" : evt.object.email, "email" : email },
						animated: false
					});
				});
				panel.addChild(button);
			}
		}

		retrieve(panel, email);
	}
}