$(document).ready(function() {
	
	// Expand Panel
	$("#open").click(function(){
		$("div#panel").slideDown("slow");
	
	});	
	
	// Collapse Panel
	$(".closepanel").click(function(){
		$("div#panel").slideUp("slow");	
	});		
	
	// Switch buttons from "Log In | Register" to "Close Panel" on click
	$("#copywrite a").click(function () {
		$("#copywrite a").toggle();
	});		

	$("#closebutton").click(function () {
		$("#copywrite a").toggle();
	});			
});