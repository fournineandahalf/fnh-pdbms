// Fix iPhone viewport scaling bug on orientation change - By @mathias @cheeaun @jdalton
;if(navigator.userAgent.match(/iPhone/i)){(function(doc){
	var addEvent = 'addEventListener', type = 'gesturestart', qsa = 'querySelectorAll',
	    scales = [1, 1], meta = qsa in doc ? doc[qsa]('meta[name=viewport]') : [];
	function fix() {
		meta.content = 'width=device-width,minimum-scale=' + scales[0] + ',maximum-scale=' + scales[1];
		doc.removeEventListener(type, fix, true); }

	if ((meta = meta[meta.length - 1]) && addEvent in doc) {
		fix(); scales = [.25, 1.6];
		doc[addEvent](type, fix, true);	}
}(document));}

// Themify Lightbox and Fullscreen and Fixed Header /////////////////////////
var ThemifyGallery, FixedHeader;

(function($){
	
// Fixed Header /////////////////////////
FixedHeader = {
	init: function() {
		this.headerHeight = $('#headerwrap').outerHeight();
		$(window).on('scroll', this.activate);
		$(window).on('touchstart.touchScroll', this.activate);
		$(window).on('touchmove.touchScroll', this.activate);
	},

	activate: function() {
		if (($(window).innerHeight() + $(window).scrollTop()) >= $('body').height()) {
			//return true;
		} else {
			var scrollAmount = $(window).scrollTop();
			if(scrollAmount <= FixedHeader.headerHeight){
				FixedHeader.scrollDisabled();
			} else {
				FixedHeader.scrollEnabled();
			}
		}
	},

	scrollDisabled: function() {
		$('#headerwrap').removeClass('fixed-header');
		$('#header').removeClass('header-on-scroll');
		$('#pagewrap').css('padding-top', '');
	},

	scrollEnabled: function() {
		$('#headerwrap').addClass('fixed-header');
		$('#header').addClass('header-on-scroll');
		$('#pagewrap').css('padding-top', FixedHeader.headerHeight);
	}
};

// Test if touch event exists //////////////////////////////
function is_touch_device() {
	try { document.createEvent("TouchEvent"); return true; }
	catch(e) { return false; }
}
	
function infiniteIsotope(containerSelector, itemSelectorIso, itemSelectorInf, containerInfinite, doIso, isoColW){
	
	// Get max pages for regular category pages and home
	var scrollMaxPages = parseInt(themifyScript.maxPages),
		$container = $(containerSelector),
		$containerInfinite = $(containerInfinite);
	// Get max pages for Query Category pages
	if( typeof qp_max_pages != 'undefined')
		scrollMaxPages = qp_max_pages;

	if( (! $('body.list-post').length > 0) && doIso ){
		// isotope init
		$container.isotope({
			masonry: {
				columnWidth: isoColW
			},
			itemSelector : itemSelectorIso,
			transformsEnabled : false,
			animationEngine: 'jquery',
			onLayout: function( $elems, instance){
				
			}
		});
		$(window).resize();
	}

	// infinite scroll
	$containerInfinite.infinitescroll({
		navSelector  : '#load-more a:last', 		// selector for the paged navigation
		nextSelector : '#load-more a:last', 		// selector for the NEXT link (to page 2)
		itemSelector : itemSelectorInf, 	// selector for all items you'll retrieve
		loadingText  : '',
		donetext     : '',
		loading 	 : { img: themifyScript.loadingImg },
		maxPage      : scrollMaxPages,
		behavior	 : 'auto' != themifyScript.autoInfinite? 'twitter' : '',
		pathParse 	 : function (path, nextPage) {
			return path.match(/^(.*?)\b2\b(?!.*\b2\b)(.*?$)/).slice(1);
		}
	}, function(newElements) {
		// call Isotope for new elements
		var $newElems = $(newElements).hide();
		
		// Mark new items: remove newItems from already loaded items and add it to loaded items
		$('.post.newItems').removeClass('newItems');
		$newElems.addClass('newItems');
		
		$newElems.imagesLoaded(function(){
			
			$newElems.fadeIn();

			$('#infscr-loading').fadeOut('normal');
			if( 1 == scrollMaxPages ){
				$('#load-more, #infscr-loading').remove();
			}
			
			// Apply lightbox/fullscreen gallery to new items
			if(typeof ThemifyGallery !== undefined){ ThemifyGallery.init({'context': $newElems}); }
			
			if(typeof (jQuery.fn.carouFredSel) !== 'undefined') {
				// Create carousel on portfolio new items
				createCarousel($('.media-slider.newItems .slideshow'));
			}
			
			if( (! $('body.list-post').length > 0) && doIso ){
				$container.isotope('appended', $newElems );
			}
		});

		scrollMaxPages = scrollMaxPages - 1;
		if( 1 < scrollMaxPages && 'auto' != themifyScript.autoInfinite)
			$('#load-more a').show();
	});
	
	// disable auto infinite scroll based on user selection
	if( 'auto' == themifyScript.autoInfinite ){
		$('#load-more, #load-more a').hide();
	}

}

function createCarousel(obj){
	obj.each(function(){
		$this = $(this);
		$this.carouFredSel({
			responsive: true,
			prev: '#' + $this.data('id') + ' .carousel-prev',
			next: '#' + $this.data('id') + ' .carousel-next',
			pagination: { container: '#' + $this.data('id') + ' .carousel-pager' },
			circular: true,
			infinite: true,
			scroll: {
				items: 1,
				wipe: true,
				fx: $this.data('effect'),
				duration: parseInt($this.data('speed'))
			},
			auto: {
				play: 'off' != $this.data('autoplay')? true: false,
				pauseDuration: 'off' != $this.data('autoplay')? parseInt($this.data('autoplay')): 0
			},
			items: {
				visible: { min: 1, max: 1 },
				width: 222
			},
			onCreate: function(){
				$this.closest('.slideshow-wrap').css({'visibility':'visible', 'height':'auto'});
				$('.carousel-next, .carousel-prev', $this.closest('.slideshow-wrap')).hide();
				$(window).resize();
			}
		});
	});
}

$(document).ready(function(){
	
	// Initialize Fixed Header	///////////////////////
	if(themifyScript.fixedHeader){
		FixedHeader.init();
	}

	// HTML5 placeholder fallback
	$('[placeholder]').focus(function() {
	  var input = $(this);
	  if (input.val() == input.attr('placeholder')) {
	    input.val('');
	    input.removeClass('placeholder');
	  }
	}).blur(function() {
	  var input = $(this);
	  if (input.val() == '' || input.val() == input.attr('placeholder')) {
	    input.addClass('placeholder');
	    input.val(input.attr('placeholder'));
	  }
	}).blur();
	$('[placeholder]').parents('form').submit(function() {
	  $(this).find('[placeholder]').each(function() {
	    var input = $(this);
	    if (input.val() == input.attr('placeholder')) {
		 input.val('');
	    }
	  })
	});
	
	// Show/Hide direction arrows
	$('#body').on('mouseover mouseout', '.slideshow-wrap', function(event) {
		if (event.type == 'mouseover') {
			if( $(window).width() > 600 ){
				$('.carousel-next, .carousel-prev', $(this)).css('display', 'block');
			}
		} else {
			if( $(window).width() > 600 ){
				$('.carousel-next, .carousel-prev', $(this)).css('display', 'none');
			}
		}
	});

	// Scroll to top
	$('.back-top a').click(function () {
		$('body,html').animate({
			scrollTop: 0
		}, 800);
		return false;
	});

	// Toggle main nav on mobile
	$("#menu-icon").click(function(){
		$("#main-nav").fadeToggle();
		$("#headerwrap #top-nav").hide();
		$(this).toggleClass("active");
	});
	
	// If is touch device, add class
	if( is_touch_device() && screen.width < 480 ){ $('body').addClass('is-touch'); }

});

$(window).load(function() {
	// Lightbox / Fullscreen initialization ///////////
	if(typeof ThemifyGallery !== undefined){ ThemifyGallery.init({'context': jQuery(themifyScript.lightboxContext)}); }

	// Carousel initialization //////////////////////////
	if(typeof (jQuery.fn.carouFredSel) !== 'undefined') {
		createCarousel($('.post.media-slider .slideshow'));
	}

	// Check if isotope is enabled ////////////////
	if(typeof (jQuery.fn.isotope) !== 'undefined'){
		
		if($('.post').length > 0){
			// isotope container, isotope item, item fetched by infinite scroll, infinite scroll
			infiniteIsotope('#loops-wrapper', '.post', '#content .post', '#loops-wrapper', true, '');
		}
		
		if($('.portfolio-post').length > 0){
			// isotope container, isotope item, item fetched by infinite scroll, infinite scroll
			infiniteIsotope('.portfolio-wrapper', '.portfolio-post', '.portfolio-post', '.portfolio-wrapper', true, '');
		}
	}
	
});

}(jQuery));