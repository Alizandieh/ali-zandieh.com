<?
	/*****************************************************************/
	/*****************************************************************/
	
	error_reporting(E_ALL ^ E_NOTICE);

	require_once('config.php');
	require_once('../functions.php');
	require_once('../phpMailer/class.phpmailer.php');
	
	require_once('../../class/Template.class.php');
	
	/*****************************************************************/
	
	$response=array('error'=>0,'info'=>null);

	$values=array
	(
		'contact-form-name'						=> 'Your site' /* $_POST['contact-form-name'] */,
		'contact-form-mail'						=> 'admin@ali-zandieh.com' /* $_POST['contact-form-mail'] */,
		'contact-form-message'					=> $_POST['contact-form-message']
	);
	
	/*****************************************************************/
	
	if(isEmpty($values['contact-form-name']) || strcmp($values['contact-form-name'],CONTACT_FORM_LABEL_DATA_NAME)==0)
	{
		$response['error']=1;
		$response['info'][]=array('fieldId'=>'contact-form-name','message'=>CONTACT_FORM_MSG_INVALID_DATA_NAME);
	}
	
	if(!validateEmail($values['contact-form-mail']) || strcmp($values['contact-form-mail'],CONTACT_FORM_LABEL_DATA_MAIL)==0)
	{
 		$response['error']=1;	
		$response['info'][]=array('fieldId'=>'contact-form-mail','message'=>CONTACT_FORM_MSG_INVALID_DATA_MAIL);
	}
	
	if(isEmpty($values['contact-form-message']) || strcmp($values['contact-form-message'],CONTACT_FORM_LABEL_DATA_MESSAGE)==0)
	{
		$response['error']=1;
		$response['info'][]=array('fieldId'=>'contact-form-message','message'=>CONTACT_FORM_MSG_INVALID_DATA_MESSAGE);
	}	
	
	if($response['error']==1) createResponse($response);
	
	/*****************************************************************/

	if(isGPC()) $values=array_map('stripslashes',$values);
	
	$values=array_map('htmlspecialchars',$values);
	
	$Template=new Template($values,'template/default.php');
	$body=$Template->output();
	
	$mail=new PHPMailer();
	
	$mail->CharSet='UTF-8';
	
	$mail->SetFrom($values['contact-form-mail'],$values['contact-form-name']); 
	$mail->AddReplyTo($values['contact-form-mail'],$values['contact-form-name']);
	
	$mail->AddAddress(CONTACT_FORM_TO_EMAIL,CONTACT_FORM_TO_NAME);

	$smtp=CONTACT_FORM_SMTP_HOST;
	if(!empty($smtp))
	{
		$mail->IsSMTP();
		$mail->SMTPAuth=true; 
		$mail->Port=CONTACT_FORM_SMTP_PORT;
		$mail->Host=CONTACT_FORM_SMTP_HOST;
		$mail->Username=CONTACT_FORM_SMTP_USER;
		$mail->Password=CONTACT_FORM_SMTP_PASSWORD;
		$mail->SMTPSecure=CONTACT_FORM_SMTP_SECURE;
	}
	
	$mail->Subject=CONTACT_FORM_SUBJECT;
	$mail->MsgHTML($body);

	if(!$mail->Send())
	{
 		$response['error']=1;	
		$response['info'][]=array('fieldId'=>'contact-form-send','message'=>CONTACT_FORM_SEND_MSG_ERROR);
		createResponse($response);		
	}

	$response['error']=0;
	$response['info'][]=array('fieldId'=>'contact-form-send','message'=>CONTACT_FORM_SEND_MSG_OK);
	
	createResponse($response);		
	
	/*****************************************************************/
	/*****************************************************************/
?>
