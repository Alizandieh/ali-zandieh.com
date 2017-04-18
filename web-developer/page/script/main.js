
/******************************************************************************/
/*	Image preloader															  */
/******************************************************************************/

$('.image-preloader img').each(function() 
{
	$(this).attr('src',$(this).attr('src') + '?i='+getRandom(1,100000));
	$(this).bind('load',function() 
	{ 
		$(this).parent().first().css('background-image','none'); 
		$(this).animate({opacity:1},1000); 
	});
});

/******************************************************************************/
/*	Nivo slider																  */
/******************************************************************************/

$('#slider').nivoSlider({directionNav:false});

/******************************************************************************/
/*	Fancybox for images														  */
/******************************************************************************/

$('.fancybox-image').fancybox(
{
	'titlePosition'		:	'inside'
});

/******************************************************************************/
/*	Fancybox for youtube videos												  */
/******************************************************************************/

$('.fancybox-video-youtube').bind('click',function() 
{
    $.fancybox(
    {
		'margin'		:	0,
        'padding'		:	10,
        'autoScale'		:	false,
        'transitionIn'	:	'none',
        'transitionOut'	:	'none',
		'titlePosition'	:	'inside',
		'title'			:	this.title,
        'width'			:	'80%',
        'height'		:	'80%',
        'href'			:	this.href,
        'type'			:	'iframe'
    });

    return false;
});

/******************************************************************************/
/*	Fancybox for vimeo videos												  */
/******************************************************************************/

$('.fancybox-video-vimeo').bind('click',function() 
{
	$.fancybox(
	{
		'margin'		:	0,
		'padding'		:	10,
		'autoScale'		:	false,
		'transitionIn'	:	'none',
		'transitionOut'	:	'none',
		'titlePosition'	:	'inside',
		'title'			:	this.title,
		'width'			:	'80%',
		'height'		:	'80%',
		'href'			:	this.href,
		'type'			:	'iframe'
	});
	
	return false;
});

/******************************************************************************/
/*	Captify for portfolio images											  */
/******************************************************************************/

$('.gallery-list img').captify();

/******************************************************************************/
/*	Hover for portfolio images												  */
/******************************************************************************/

$('.gallery-list').hover(

    function() {},
    function()
    {
        $(this).find('li img').animate({opacity:1},250);
    }	

);

$('.gallery-list li').hover(

    function() 
    {
        $(this).siblings('li').find('img').css('opacity',0.5);
        $(this).find('img').animate({opacity:1},250);
    },

    function()
    {
        $(this).find('img').css('opacity',1);	
    }

);
	
/******************************************************************************/
/*	Portfolio filter														  */
/******************************************************************************/

$(window).smartresize(function()
{
	$('.gallery-list').isotope(
	{
		masonry			: {columnWidth:185},
		resizable		: false,
		itemSelector	: 'li',
		animationEngine : 'jquery'
	});
});	

$('.filter-list li a').bind('click',function(e) 
{
	filterGallery(e,this);
});

$('.filter-select-box').bind('change',function(e)
{
	filterGallery(e,this)
});
				
/******************************************************************************/
/*	Skill list animation													  */
/******************************************************************************/

var i=0;
$('.skill-list-item-level span').each(function() 
{
    $(this).delay(((i++)*50)).animate({opacity:1},500);
});

/******************************************************************************/
/*	Google Maps																  */
/******************************************************************************/

try
{
	var coordinate=new google.maps.LatLng(51.359455,-0.192089);

	var mapOptions= 
	{
		zoom:14,
		center:coordinate,
		streetViewControl:false,
		mapTypeControl:false,
		zoomControlOptions: 
		{
			position:google.maps.ControlPosition.RIGHT_CENTER
		},
		panControlOptions: 
		{
			position:google.maps.ControlPosition.LEFT_CENTER
		},
		mapTypeId:google.maps.MapTypeId.ROADMAP
	};

	var googleMap=new google.maps.Map(document.getElementById('map'),mapOptions);

	var markerOptions=
	{
		map:googleMap,
		position:coordinate,
		icon:mainURL+'image/map_marker.png'
	}

	new google.maps.Marker(markerOptions);
	
	$(window).resize(function() 
	{
		try {googleMap.setCenter(coordinate);}
		catch(e) {}
	});	
}
catch(e) {}	

/******************************************************************************/
/*	Contact form															  */
/******************************************************************************/

$('#contact-form').submit(function() 
{
	submitContactForm();
	return(false);
});

$('#contact-form-reset').bind('click',function(e) 
{
	e.preventDefault();
	$('#contact-form').find('input[type="text"],textarea').val('').blur();
});

$('label.infield').inFieldLabels();

/******************************************************************************/
/******************************************************************************/