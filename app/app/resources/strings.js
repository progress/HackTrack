exports.email_confirm = function() {
	var line1 = "A confirmation code has been sent to your email.";
	var line2 = " Please enter it below and hit okay.";
	return line1 + line2;
}

exports.email_sender = function() {
	// Enter an email address here (same one must be registered on PostMark)sii
}

exports.email_subject = function() {
	return "HackTrack Registration Confirmation";
}

exports.email_content = function(code) {
	var line1 = "<p>Hello from HackTrack!</p>";
	var line2 = "<p>Please enter the following code into the confirmation box.</p>";
	var line3 = "<b>" + code + "</b>";
	return line1 + line2 + line3;
}

exports.email_request = function() {
	return "Please enter your email below.";
}

exports.recovery_subject = function() {
	return "HackTrack Account Recovery";
}

exports.password_reset = function() {
	return "Please enter a new password.";
}

exports.uuid_format = function() {
	return "xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx";
}

exports.postmark_token = function() {
	// Enter your PostMark token here
}