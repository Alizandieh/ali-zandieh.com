<?php

	error_reporting(E_ALL ^ E_NOTICE);

	require_once('config.php');
	require_once('class/Cascade.class.php');
	
	$Cascade=new Cascade($page,$options);

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">

    <head>

        <title><?php $Cascade->_getTitle(); ?></title>
        <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
		
		<meta name="keywords" content="<?php $Cascade->_getMeta('keywords'); ?>"/>
		<meta name="description" content="<?php $Cascade->_getMeta('description'); ?>"/>
        <meta property="og:image" content="http://ali-zandieh.com/web-developer/image/Ali-Zandieh.png"/>
        <meta property="og:url" content="http://www.ali-zandieh.com"/>

        <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
        <link rel="icon" href="favicon.ico" type="image/x-icon" />

        <link rel="stylesheet" type="text/css" href="style/nivo-slider.css"/> 	
        <link rel="stylesheet" type="text/css" href="style/jquery.qtip.css"/> 
        <link rel="stylesheet" type="text/css" href="style/jquery.captify.css"/> 
        <link rel="stylesheet" type="text/css" href="style/jquery.jScrollPane.css"/>
        <link rel="stylesheet" type="text/css" href="style/fancybox/jquery.fancybox.css"/> 			
        <link rel="stylesheet" type="text/css" href="style/base.css"/> 
        <link rel="stylesheet" type="text/css" href="style/page.css"/> 
        <link rel="stylesheet" type="text/css" href="style/slide.css" />
        <link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Open+Sans:400,300"/>
		<link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Share" />

		<link rel="stylesheet" type="text/css" media="screen and (min-width:0px) and (max-width:959px)" href="style/responsive/width-0-959.css"/> 
		<link rel="stylesheet" type="text/css" media="screen and (min-width:0px) and (max-width:767px)" href="style/responsive/width-0-767.css"/> 
		<link rel="stylesheet" type="text/css" media="screen and (min-width:480px) and (max-width:959px)" href="style/responsive/width-480-959.css"/> 
		
		<link rel="stylesheet" type="text/css" media="screen and (min-width:768px) and (max-width:959px)" href="style/responsive/width-768-959.css"/> 
		<link rel="stylesheet" type="text/css" media="screen and (min-width:480px) and (max-width:767px)" href="style/responsive/width-480-767.css"/>
		<link rel="stylesheet" type="text/css" media="screen and (min-width:0px) and (max-width:479px)" href="style/responsive/width-0-479.css"/> 
				
		<script type="text/javascript">
			var mainURL='<?php echo dirname($_SERVER['SCRIPT_NAME']).'/'; ?>';
		</script>
		
        <script type="text/javascript" src="script/linkify.js"></script>
        <script type="text/javascript" src="script/jquery.min.js"></script>
        <script type="text/javascript" src="script/jquery.easing.js"></script>
		<script type="text/javascript" src="script/jquery.isotope.js"></script>
        <script type="text/javascript" src="script/jquery.captify.js"></script>
        <script type="text/javascript" src="script/jquery.blockUI.js"></script>
        <script type="text/javascript" src="script/jquery.qtip.min.js"></script>
        <script type="text/javascript" src="script/jquery.fancybox.js"></script>
        <script type="text/javascript" src="script/jquery.ba-bqq.min.js"></script>
        <script type="text/javascript" src="script/jquery.mousewheel.js"></script>
        <script type="text/javascript" src="script/jquery.jScrollPane.js"></script>
		<script type="text/javascript" src="script/jquery.nivo.slider.pack.js"></script>
		<script type="text/javascript" src="script/jquery.infieldlabel.min.js"></script>
		<script type="text/javascript" src="script/jquery.carouFredSel.packed.js"></script>
        <script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false"></script>   

        <script type="text/javascript" src="script/script.js"></script>
        <script type="text/javascript" src="script/cascade.js"></script>
        <script type="text/javascript" src="plugin/contact-form/contact-form.js"></script>
		<script type="text/javascript" src="script/_style-switcher.js"></script>
        <script type="text/javascript" src="script/slide.js"></script>

<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-39607232-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>

</head>

<body>
    <img src="http://www.ali-zandieh.com/image/snapshot.jpg" style="display:none;" />
    <!-- Panel -->
    <div id="toppanel">
        <div id="panel">
            <div class="content clearfix">
                <div class="left">
                    <h1>Welcome to Ali Zandieh Homepage</h1>       
                    <p class="grey">
                        Ali Zandieh is a skilful web developer with valuable experience of the implementation and design of web sites. He started his career in 2002 as a Computer Technician and then a web support assistant before beginning his professional career as a web developer in 2010, after he finished his Masters degree in Computer Science.
                    </p>
                </div>
                <div class="left">

                    <h3>How can I help ?</h3>
                    <p>
                        Ali Zandieh is currently working full time at Jellyfish online marketing but he is keen to take on side projects, especially for local businesses. He is eager to obtain creative and challenging projects that enable him to gain more valuable commercial experience.<br/> 
                        As an experienced web developer he is confident in tackling and resolving problems even when faced with tight deadlines. 
                    </p>
                </div>
                <div class="left right">            
                    <h2>
                        If you need a fantastic website for your business, do not hesitate to <a href="#!contact" id="contact-link">Connect me</a>.
                    </h2>
                </div>

                <a id="closebutton" class="closepanel" href="#">Close</a>
            </div>

    </div> <!-- /login -->  

        <!-- The tab on top --> 
        <div class="tab">
        </div> <!-- / top -->

    </div> <!--panel -->	

        <!-- Header -->
		<div class="header-wrapper">
			
			<div class="header main box-center clear-fix">

				<div class="layout-4060 clear-fix">
                    <div id="other_version">Check <a href="../professional-web-developer">The Other version</a> of my site too. </div>
					<div class="layout-4060-left">	
						<h1><a href="<?php $Cascade->_getURL('main'); ?>">Ali Zandieh</a> </h1>
						<h5><a href="<?php $Cascade->_getURL('main'); ?>">Professional Web Developer</a></h5>	

					</div>

					<div class="layout-4060-right">
						<ul class="no-list header-menu clear-fix">
							<li class="header-menu-download"><a href="Ali_Zandieh.vcf">Download my vCard</a></li>
							<li class="header-menu-phone">0741 2627 063</li>
							<li class="header-menu-mail"><a href="mailto:ali.zandieh@gmail.com">ali.zandieh@gmail.com</a></li>
						</ul>
					</div>			

				</div>

			</div>
		</div>
        <!-- /Header -->


        <!-- Content -->
        <div class="content main box-center">

            <!-- Cascade -->
            <div class="cascade preloader">

                <!-- Box menu -->
                <ul class="cascade-menu">
                    <li id="tab-1" class="red-img-1 img-8">
                        <a href="<?php $Cascade->_getURL('about'); ?>">
                            <span class="title">About</span>
                            <span class="subtitle">About Me</span>
                        </a>
                    </li>
                    <li id="tab-2" class="green-img-1 img-7">
                        <a href="<?php $Cascade->_getURL('portfolio'); ?>">
                            <span class="title">Portfolio</span>
                            <span class="subtitle">My Works</span>
                        </a>
                    </li>
                    <li id="tab-3" class="blue-img-1 img-6">		
                        <a href="<?php $Cascade->_getURL('resume'); ?>">
                            <span class="title">Resume</span>
                            <span class="subtitle">Personal Profile</span>
                        </a>
                    </li>
                    <li id="tab-4" class="green-img-1">		
                        <a href="<?php $Cascade->_getURL('interests'); ?>">
                            <span class="title">My Interests</span>
                            <span class="subtitle">Free time</span>
                        </a>
                    </li>
                    <li id="tab-5" class="blue-img-1 img-5">		
                        <a href="<?php $Cascade->_getURL('contact'); ?>">
                            <span class="title">Contact</span>
                            <span class="subtitle">Get In Touch</span>
                        </a>
                    </li>
                </ul>
                <!-- /Box menu -->

                <!-- Window -->
                <div class="cascade-window">

                    <!-- Close bar -->
                    <div class="cascade-window-close-bar">
                        <a href="<?php $Cascade->_getURL('main'); ?>"></a>
                    </div>
                    <!-- /Close bar -->

                    <!-- Page content -->
                    <div class="cascade-window-content">
						<div class="cascade-page clear-fix">
						<?php $Cascade->loadFile(); ?>
						</div>
					</div>
                    <!-- /Page content -->

                    <!-- Footer -->
                    <div class="cascade-window-footer"></div>
                    <!-- /Footer -->

                </div>
                <!-- /Window -->

                <!-- Navigation -->
                <a href="#" class="cascade-navigation cascade-navigation-prev"></a>
                <a href="#" class="cascade-navigation cascade-navigation-next"></a>
				<a href="#" class="cascade-navigation cascade-navigation-slider-prev"></a>
                <a href="#" class="cascade-navigation cascade-navigation-slider-next"></a>
                <!-- /Navigation -->

            </div>
            <!-- /Cascade -->

        </div>
        <!-- /Content -->


        <!-- Footer -->
        <div class="footer">

            <hr class="footer-line" />

            <div class="main box-center layout-7030 clear-fix">

                <!-- Latest tweets -->
                <div class="layout-7030-left latest-tweets">
                    <div id="latest-tweets"></div>
                </div>
                <!-- /Latest tweets -->

                <!-- Social icons -->
                <div class="layout-7030-right">
                    <ul class="no-list social-list-1">
                        <li><a href="#!contact" id="contact-link">Connect</a></li>
                        <li><a href="http://www.facebook.com/ali.zandieh.18" class="social-facebook" target="_blank"></a></li>
                        <li><a href="http://twitter.com/ali_zandieh" class="social-twitter" target="_blank"></a></li>
                        <li><a href="http://plus.google.com/107044658433768921862" class="social-google" target="_blank"></a></li>
                        <li><a href="http://www.linkedin.com/pub/ali-zandieh/3a/9b1/a4" class="social-linkedin" target="_blank"></a></li>
                    </ul>                  
                </div>
                <!-- /Social icons -->
            </div>

            <div id="copywrite">
                <a id="open" class="open" href="#">©2013 Ali Zandieh</a>
                <a id="close" style="display: none;" class="closepanel" href="#">©2013 Ali Zandieh</a>
            </div>
        </div>
        <!-- /Footer -->
		
		<script type="text/javascript">
			
			var page=<?php echo Cascade::encode($page); ?>;
			var options=<?php echo Cascade::encode($options); ?>;
			var request='<?php echo $Cascade->getRequest(); ?>';
			
			$(document).ready(function() 
			{
				$('.cascade').cascade(page,options,request);
			});
			
		</script>

    </body>

</html>
