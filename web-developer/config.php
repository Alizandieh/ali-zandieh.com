<?php

	$title='Ali Zandieh - ';

	$options=array
	(
		'openStart'			=>	'',
		'title'				=>	$title . 'The web developer',
		'meta'				=>	array
		(
			'keywords'		=> 'Ali, Zandieh, Ali Zandieh, web developer, creative, curriculum, curriculum vitae, cv, personal, personal profile, personal vcard, portfolio, resume, vcard, virtual card, web designer, php, programmer, php developer, Conceret5 developer',
			'description'	=> 'Ali Zandieh, professional web developer personal homepage. check out his CV and portfolio. He could be helpful for your business development.'
		),
		'twitter'			=>	array
		(
			'name'			=>	'ali_zandieh',
			'count'			=>	5
		)
	);	

    $page=array
    (
        'about'				=>   array
		(
			'js'			=>	'page-1.js',
			'tab'			=>	'tab-1',
			'html'			=>	'page-1.html',
			'main'			=>	1,
			'title'			=>	$title.'About me'
		),
        'portfolio'			=>   array
		(
			'js'			=>	'page-2.js',
			'tab'			=>	'tab-2',
			'html'			=>	'page-2.html',
			'main'			=>	1,
			'title'			=>	$title.'Portfolio'
		),
        'resume'			=>   array
		(
			'js'			=>	'page-3.js',
			'tab'			=>	'tab-3',
			'html'			=>	'page-3.html',
			'main'			=>	1,
			'title'			=>	$title.'Resume'
		),
		'interests'			=>   array
		(
			'js'			=>	'page-4.js',
			'tab'			=>	'tab-4',
			'html'			=>	'page-4.html',
			'main'			=>	1,
			'title'			=>	$title.'Interests'
		),
        'contact'			=>   array
		(
			'js'			=>	'page-5.js',
			'tab'			=>	'tab-5',
			'html'			=>	'page-5.php',
			'main'			=>	1,
			'title'			=>	$title.'Contact'
		)
    );

?>