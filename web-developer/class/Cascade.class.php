<?php

	/**************************************************************************/
	/**************************************************************************/

	class Cascade
	{
		
		private $page;
		private $options;
		private $request;
		
		/**********************************************************************/
		
		function __construct($page,$options)
		{
			$this->page=$page;
			$this->request=null;
			$this->options=$options;
			
			$page=array_keys((array)$this->page);
			array_push($page,'main');
			
			$intersect=array_intersect(array(@$_GET['_escaped_fragment_']),$page);
			
			if(@$intersect[0]) $this->request=$intersect[0];
		}
		
		/**********************************************************************/
		
		public function getURL($page)
		{
			return((!is_null($this->request) ? '?_escaped_fragment_=' : '#!').$page);
		}
		
		/**********************************************************************/
		
		public function _getURL($page)
		{
			echo $this->getURL($page);
		}
		
		/**********************************************************************/
		
		public function loadFile()
		{
			if(in_array($this->request,array('main'))) return;
			if(is_null($this->request)) return;
			$file=$this->page[$this->request]['html'];
			require_once('page/'.$file);
		}
		
		/**********************************************************************/
		
		public function getRequest()
		{
			return($this->request);
		}
		
		/**********************************************************************/
		
		public static function encode($value)
		{
			echo json_encode($value);
		}
		
		/**********************************************************************/
		
		public static function isEmpty($value)
		{
			return(!(bool)strlen(trim(strval($value))));
		}
		
		/**********************************************************************/
		
		public function getMeta($name)
		{
			if(!Cascade::isEmpty($this->page[$this->request]['meta'][$name]))
				return($this->page[$this->request]['meta'][$name]);
			
			return($this->options['meta'][$name]);
		}
		
		/**********************************************************************/
		
		public function _getMeta($name)
		{
			echo htmlspecialchars($this->getMeta($name));
		}
		
		/**********************************************************************/
		
		public function getTitle()
		{
			if(!Cascade::isEmpty($this->page[$this->request]['title']))
				return($this->page[$this->request]['title']);

			return($this->options['title']);			
		}
		
		/**********************************************************************/
		
		public function _getTitle()
		{
			echo htmlspecialchars($this->getTitle());
		}
				
		/**********************************************************************/
	}
	
	/**************************************************************************/
	/**************************************************************************/
?>
