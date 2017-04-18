
jQuery(document).ready(function($) {


/*
 * AJAX Section
 * This function will handle the contact process through AJAX
 */
 $('#slickform').submit(
	function slickcontactparse() {
		

		// EMAIL VALIDATION FUNCTION
		var emailReg = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);

		// PHONE VALIDATION FUNCTION
		var phoneReg = new RegExp(/^\s*\d+\s*$/);
		

		// EDIT THIS SECTION IF DIFFERENT FORM ELEMENTS
		// Values
		var successmessage = "Thank you for email, I will be in contact soon!";
		var failedmessage = "There was a problem, please try again!";
		var usersemail = $('#email');
		var usersname = $('#name');
		var userscomment = $('#comment');
		var isvalid = 1;
		var url = "contact_result.php";
		
		//Checking information is correct before sending data
		
		//CHECKING NAME IS PRESENT
		if (usersname.val() == "" || usersname.val() == "name...") {
			$("#name").attr('class', 'inputsectionerror');
			$('input[type=submit]', $("#slickform")).removeAttr('disabled');
			return false;
		} else $("#name").attr('class', 'inputsection');

		//CHECKING EMAIL IS PRESENT AND IS VALID
		if (usersemail.val() == "" || usersemail.val() == "email...") {
			$("#email").attr('class', 'inputsectionerror');
			$('input[type=submit]', $("#slickform")).removeAttr('disabled');
			return false;
		} else $("#email").attr('class', 'inputsection_right');

		
		//CHECKING COMMENT IS PRESENT
		if (userscomment.val() == "" || userscomment.val() == "Comment...") {
			$("#comment").attr('class', 'inputsectionerror');
			$('input[type=submit]', $("#slickform")).removeAttr('disabled');
			return false;
		}
		
		var valid = emailReg.test(usersemail.val());
		
		if(!valid) {
			$("#email").attr('class', 'inputsectionerror');
			$('input[type=submit]', $("#slickform")).removeAttr('disabled');
			return false;
		}
		//CHECKING EMAIL IS PRESENT AND IS VALID
		
		/* 
		 *
		 * POSTING DATA USING AJAX AND
		 * THEN RETREIVING DATA FROM PHP SCRIPT
		 *
		*/
	
		$.post(url,{ usersname: usersname.val(), usersemail: usersemail.val(),  userscomment: userscomment.val(), isvalid: isvalid } , function(data) {

			if(data == 'success'){
				$("#email").attr('class', 'inputsection');
				$("#comment").attr('class', 'inputsection');
				$("#name").attr('class', 'inputsection');
				$(".emailsuccess").html(successmessage);
				$("#slickform").slideUp(500);
				$('.emailsuccess').delay(500).fadeIn(500);
				$('input[type=submit]', $("#slickform")).removeAttr('disabled');
			
			} else {
				$("#email").attr('class', 'inputsection');
				$("#comment").attr('class', 'inputsection');
				$("#name").attr('class', 'inputsection');
				$(".emailfail").html(failedmessage);
				$('.emailfail').delay(500).fadeIn(500);
				$('input[type=submit]', $("#slickform")).removeAttr('disabled');
				return false;
				
			}
			
		});
		
		/* 
		 *
		 * POSTING DATA USING AJAX AND
		 * THEN RETREIVING DATA FROM PHP SCRIPT
		 *
		*/
		
	}
	
);
/*
 * END OF AJAX Section
 */
 

});

