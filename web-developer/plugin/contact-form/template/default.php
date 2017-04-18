<html>

	<head>

	</head>

	<body>

		<div><b>Name</b>: <?php echo $this->data['contact-form-name']; ?></div>
		<div><b>E-mail</b>: <?php echo $this->data['contact-form-mail']; ?></div>
		<div><b>Message</b>: <?php echo nl2br($this->data['contact-form-message']); ?></div>

	</body>

</html>
