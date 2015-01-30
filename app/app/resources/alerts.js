//
// alerts.js
// HackTrack
//
// Copyright 2015 (c) Progress Software
// Author: Akhil Nistala

exports.secure_password = function() {
	var line1 = "Please enter a secure password:          \n";
	var line2 = "- At least 8 characters                  \n";
	var line3 = "- Each is a digit or letter              \n";
	var line4 = "- At least 1 digit                       \n";
	var line5 = "- At least 1 uppercase letter            \n";
	var line6 = "- At least 1 lowercase letter            \n";
	return line1 + line2 + line3 + line4 + line5 + line6;
}

exports.valid_email = function() {
	return "Please enter a valid email.";
}

exports.both_fields = function() {
	return "Please fill in both fields.";
}

exports.matching_passwords = function() {
	return "Passwords don't match!";
}

exports.invalid_code = function() {
	return "Codes don't match! Please try again."
}

exports.success_reg = function() {
	return "You have successfully registered!";
}

exports.failed_reg = function() {
	return "Registration timeout - please try again.";
}

exports.reg_email = function() {
	return "That email has already been registered. Please login or use another email.";
}

exports.unreg_email = function() {
	return "That email is not registered. Please register or try a different account.";
}

exports.wrong_password = function() {
	return "Incorrect password! Please try again.";
}

exports.success_update = function() {
	return "Password successfully updated!";
}

exports.team_update = function() {
	return "Team successfully updated!";
}

exports.failed_update = function() {
	return "Update not successful. Please try again.";
}

exports.invalid_uuid = function() {
	return "Please enter a valid UUID.";
}

exports.invalid_teamname = function() {
	return "Please select a team name with only alphanumeric characters.";
}

exports.invalid_team = function() {
	return "Please enter at least one team member's name.";
}

exports.unknown_failure = function() {
	return "Something went wrong. Please try again.";
}

exports.success_hack = function() {
	return "Hack successfully submitted!";
}
