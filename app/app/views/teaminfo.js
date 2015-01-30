var frameModule = require("ui/frame");
var applicationModule = require("application");
var view = require("ui/core/view");
var http = require("http");
var labelModule = require("ui/label");

var pageCounter = 1;

exports.pageLoaded = function(args) {
	pageCounter++;
	if (pageCounter%2 == 0) {
		var page = args.object;

		page.bindingContext = page.navigationContext;
		var teamEmail = page.bindingContext.teamEmail;
		var email = page.bindingContext.email;
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
			page.ios.title = "Team Info";

			page.logOutButtonHandler = RightEventHandler.alloc().init();
			var barLogOutButton = UIBarButtonItem.alloc().initWithTitleStyleTargetAction("Log Out", UIBarButtonItemStyle.UIBarButtonItemStyleBordered, page.logOutButtonHandler, NSSelectorFromString("clicked"));
			page.ios.navigationItem.rightBarButtonItem = barLogOutButton;

			page.goBackButtonHandler = LeftEventHandler.alloc().init();
			var barGoBackButton = UIBarButtonItem.alloc().initWithTitleStyleTargetAction("Go Back", UIBarButtonItemStyle.UIBarButtonItemStyleBordered, page.goBackButtonHandler, NSSelectorFromString("clicked"));
			page.ios.navigationItem.leftBarButtonItem = barGoBackButton;
		}

		var retrieveTeamData = function(teamEmail) {
			var content = { "email": teamEmail };
			var headers = { "Content-Type": "application/json" , "auth": /* Authentication Code */ };

			http.request({
				url: "http://" + /* Modulus URL */ + ".onmodulus.net/teaminfo",
				method: "POST",
				headers: headers,
				content: JSON.stringify(content)
			}).then(function(response) {
				var data = JSON.parse(response.content)[0];
				populateTeam(data);
			}, function(err) {6
				console.log(err);
			});
		}

		var retrieveHack = function(teamEmail) {
			var content = { "email": teamEmail };
			var headers = { "Content-Type": "application/json" , "auth": /* Authentication Code */ };

			http.request({
				url: "http://" + /* Modulus URL */ + ".onmodulus.net/hackinfo",
				method: "POST",
				headers: headers,
				content: JSON.stringify(content)
			}).then(function(response) {
				if (response.statusCode === 201) {	
					var data = JSON.parse(response.content)[0];
					populateHack(data);
				} else {
					var data = { "hack": "", "description": "" };
					populateHack(data);
				}
			}, function(err) {
				console.log(err);
			});
		}

		var populateTeam = function(teamData, hackData) {
			var team = teamData.team;

			var nameLabel = new labelModule.Label();
			nameLabel.text = "Name:\t\t\t" + teamData.teamName;
			panel.addChild(nameLabel);

			panel.addChild(new labelModule.Label());

			var member1 = new labelModule.Label();
			member1.text = "Members:\t\t" + team[0];
			panel.addChild(member1);

			for (var i = 1; i < team.length; i++) {
				var member = new labelModule.Label();
				member.text = "\t\t\t\t" + team[i];
				panel.addChild(member);
			}

			retrieveHack(teamEmail);
		}

		var populateHack = function(hackData) {
			panel.addChild(new labelModule.Label());

			var hackLabel = new labelModule.Label();
			hackLabel.text = "Hack:\t\t\t" + hackData.hack;
			panel.addChild(hackLabel);

			panel.addChild(new labelModule.Label());

			var descriptionLabel = new labelModule.Label();
			descriptionLabel.text = "Description:";
			panel.addChild(descriptionLabel);

			var contentLabel = new labelModule.Label();
			contentLabel.text = hackData.description;
			contentLabel.textWrap = true;
			panel.addChild(contentLabel);
		}

		retrieveTeamData(teamEmail);
	}
}