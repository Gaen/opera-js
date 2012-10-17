// ==UserScript==
// @name          Free-lance.ru links fix
// @description   Makes external links direct, as they were
// @author        Gaen
// @include       free-lance.ru*
// @include       *.free-lance.ru*
// ==/UserScript==


(function() {

	function fixLinks(){
		
		var links	=	document.getElementsByTagName('A');
		
		for(var i in links){
			
			var href			=	links[i].href;
			
			if(!href)continue;
			
			href				=	href.replace("http://www.free-lance.ru/a.php?href=", '');
			
			href				=	decodeURIComponent(href);
			
			links[i].href	=	href;
			
		}//for
		
	}//fixLinks
	
	document.addEventListener('DOMContentLoaded', fixLinks, false);

})();








