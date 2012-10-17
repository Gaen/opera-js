// ==UserScript==
// @name		Textarea drag resizer
// @version		1.0
// @date		2007-09-30
// @author		Jo?o Eiras
// ==/UserScript==

/*
	Copyright ? 2007 by Jo?o Eiras 

	This program is free software; you can redistribute it and/or
	modify it under the terms of the GNU General Public License
	as published by the Free Software Foundation; either version 2
	of the License, or (at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program; if not, write to the Free Software
	Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/

/**

This script is based on a similar one made by Mike Samokhvalov <mikivanch [at] gmail.com>
called Textarea Resizer (by motive of forum.ru-board.com scripts)
downloadble at http://www.puzzleclub.ru/files/textarea_resizer.js

History:
 1.0.2 
	- Override kestrel bug, where computed box-sizing is ''
	
 1.0.1
	- Bug fixes calculating the anchor position
 
 1.0
	- initial version. Drag textarea's or input's lower right corner to resize, and double click it to restore.
**/

(function( opera ){

	function isQuirks(obj, cstyles){
		//kestrel bug: computed box-sizing is an empty string
		if( (/^(content|border)-box$/).test(cstyles.boxSizing) )
			return cstyles.boxSizing == 'border-box';
		return opera.version()<9.5  ||
			document.compatMode == 'BackCompat' ||
			obj instanceof HTMLSelectElement || 
			(obj instanceof HTMLInputElement && obj.type == 'file')
			;
	}
	function get_y(obj){
		var y = 0;
		do{y += obj.offsetTop;
		}while(obj=obj.offsetParent);
		return y;
	}
	function get_x(obj){
		var x = 0;
		do{x += obj.offsetLeft;
		}while(obj=obj.offsetParent);
		return x;
	}
	function get_w(obj){
		var styles=getComputedStyle(obj,'');
		return (isQuirks(obj,styles) ? parseInt(styles.width) :
			(parseInt(styles.borderLeftWidth)+parseInt(styles.paddingLeft)+parseInt(styles.width)+
			parseInt(styles.paddingRight)+parseInt(styles.borderRightWidth)
			));
	}
	function get_h(obj){
		var styles=getComputedStyle(obj,'');
		return (isQuirks(obj,styles) ? parseInt(styles.height) :
			(parseInt(styles.borderTopWidth)+parseInt(styles.paddingTop)+parseInt(styles.height)+
			parseInt(styles.paddingBottom)+parseInt(styles.borderBottomWidth)
			));
	
	}
	function set_w(obj,w){
		var styles=getComputedStyle(obj,'');
		var wc = isQuirks(obj,styles) ? w +'px!important':
			(w - parseInt(styles.borderLeftWidth) - parseInt(styles.paddingLeft) -
			parseInt(styles.paddingRight) - parseInt(styles.borderRightWidth)) + 'px!important';
		obj.style.width = wc;
	}
	function set_h(obj,h){
		var styles=getComputedStyle(obj,'');
		var hc = isQuirks(obj,styles) ? h +'px!important':
			(h - parseInt(styles.borderTopWidth) - parseInt(styles.paddingTop) -
			parseInt(styles.paddingBottom) - parseInt(styles.borderBottomWidth)) + 'px!important';
		obj.style.height = hc;
	
	}

	function isValidTarget(target){
		return ( target instanceof HTMLTextAreaElement ) || 
			( target instanceof HTMLSelectElement ) || 
			( (target instanceof HTMLInputElement) && 
				!(/^(button|reset|submit|radio|checkbox|image)$/i).test(target.type) );
	}
	var imgResizer, canHide = true;
	
	function textareaHover(e){
		var textarea = e.event.target;
		if( !isValidTarget(textarea) && imgResizer && imgResizer != textarea && canHide ){
			imgResizer.style.display='none';
			return;
		}
		if( !isValidTarget(textarea) || !canHide )
			return; 
			
		if(!imgResizer){
			imgResizer = document.createElement('img');
			imgResizer.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs%2B9AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAXklEQVQYlY3OwQmAMBAAwU2sIITUoGAZl2IvkMZEbOH0I%2BJDvOx7HhuMj8xo2gGoIuSSzjiCmnbiCAJe8AdVkRs6KJdEHEFNO9Myry56Hj1URQj7drgol0QwMxc17VzVhljiijeJtgAAAABJRU5ErkJggg%3D%3D';
			imgResizer.setAttribute('style', 'z-index: 9999 !important; position: absolute !important; '+
				'width: 9px! important; height: 9px!important; border: none; cursor: se-resize !important; '+
				' padding: 0 !important; margin: 0 0 0 0 !important');
			imgResizer.title = 'Drag to resize this textarea, double-click to reset dimensions';
			
			function f_onmousemove(e){
				var textarea = imgResizer.resizingtextarea;
				var styles=getComputedStyle(textarea,'');
				
				imgResizer.style.top = (get_y(textarea)+get_h(textarea)-10)+'px !important';
				imgResizer.style.left = (get_x(textarea)+get_w(textarea)-10)+'px !important';
				
				if( !textarea.__origStyles ){
					textarea.__origStyles={width:textarea.style.width,height:textarea.style.height};
				}
				var w = e.clientX - get_x(textarea) + window.pageXOffset + imgResizer.__offsets.width;
				var h = e.clientY - get_y(textarea) + window.pageYOffset + imgResizer.__offsets.height;
				
				if( w > textarea.__minDimensions.width ) set_w(textarea,w);
				if( textarea instanceof HTMLTextAreaElement && 
					h > textarea.__minDimensions.height ) set_h(textarea,h);
		
				return false;
			};
			function f_onmouseup(ev){
				canHide = true;
				document.removeEventListener('mousemove',f_onmousemove,true);
				document.removeEventListener('mouseup',f_onmouseup,true);
			};
				
			imgResizer.onmousedown = function(e){
				canHide = false;
				
				imgResizer.resizingtextarea.__minDimensions = {width:Math.min(50,get_w(textarea)),height:Math.min(50,get_y(textarea))};
				imgResizer.__offsets = {width:this.width-e.offsetX,height:this.height-e.offsetY};
				
				document.addEventListener('mousemove',f_onmousemove,true);
				document.addEventListener('mouseup',f_onmouseup,true);
				return false;
			};
			imgResizer.ondblclick = function(){
				var textarea = imgResizer.resizingtextarea;
				if( textarea.__origStyles ){
					for(var st in textarea.__origStyles )
						textarea.style[st] = textarea.__origStyles[st];
						
					imgResizer.style.top = (get_y(textarea)+get_h(textarea)-10)+'px !important';
					imgResizer.style.left = (get_x(textarea)+get_w(textarea)-10)+'px !important';
				}
				return false;
			};
			
			document.documentElement.appendChild(imgResizer);
		}
		var styles=getComputedStyle(textarea,'');
		imgResizer.style.top = (get_y(textarea)+get_h(textarea)-10)+'px !important';
		imgResizer.style.left = (get_x(textarea)+get_w(textarea)-10)+'px !important';
		imgResizer.style.display = 'block';
		imgResizer.resizingtextarea = textarea;
		
	};
	function textareaOut(e){	
		if(e.event.relatedTarget == imgResizer)
			return;
			
		if( imgResizer && canHide && isValidTarget(e.event.target) ){
			imgResizer.style.display='none';
		}
	};
	opera.addEventListener('BeforeEvent.mouseover',textareaHover,false);
	opera.addEventListener('BeforeEvent.mouseout',textareaOut,false);
	
})( window.opera );		