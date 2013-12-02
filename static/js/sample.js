aRCDescript = [ {
	srcString : '#layouts .story',
	fitting : resizeables.fillModes.NONE,
	multiLayout : true
},  {
	srcString : '#scaling .story',
	fitting : resizeables.fillModes.FIT_PARENT,
}];


/* */

var optimizationSlide = {
	pause : function() {
			$("#optimization .fastLayer").stop(true,false);
	},
	resume : function() {

		$("#optimization .fastLayer").animate({
			'margin-top' : '500px'
		}, 400, 'easeInOutCubic').animate({
			'margin-top' : '0px'
		}, 400, 'easeOutCubic', optimizationSlide.resume);
	}
}

function createLayers(){

	for(var i=0; i<30; i++){

		var layer = $("<div class='fastLayer'><div><div></div></div></div>");

		layer.css({
			left: Math.random()*1750-350,
			top: Math.random()*860-200
		});
		
		var q = Math.random();
		layer.find('>div').attr({
			alt: q*6+1
		});
		
		var size = q*270+30;
		layer.find('>div>div').css({
			width: size,
			height: size,
			'border-radius': size,
			'-webkit-filter': 'blur('+q*15+'px)',
			background: 'rgba(255, 255, 255, .5)'
		});

		$('#more .popularResolution').append(layer);

		var animatedCopy = layer.clone();

		$('#animated .popularResolution').append(animatedCopy);

		(function(animatedCopy){

			var paused = true,
				progress = 0,
				initialPosition = animatedCopy.position(),
				speedKoeff = Math.random(),
				initialPhase = Math.random()*Math.PI*2,
				amplitude = Math.random()*100+100;

			setInterval(function(){
				if(paused) return;

				var angle = progress*speedKoeff+initialPhase;
				animatedCopy.css('left',initialPosition.left+Math.sin(angle)*amplitude);
				animatedCopy.css('top',initialPosition.top+Math.cos(angle)*amplitude);

				progress+=.1;

			},17);

			animatedCopy.data({
				resume: function(){
					paused = false;
				},
				pause: function(){
					paused = true;
				}
			});

		})(animatedCopy);

	};
}


$(function(){

	createLayers();
	optimizationSlide.resume();

	$('#parallax').on('finishedMove', function(amount) {

		$('#animated .popularResolution .fastLayer').each(function(){
			$(this).data('resume')();
		});
		optimizationSlide.resume();
	});
	$('#parallax').on('startedMove', function() {

		$('#animated .popularResolution .fastLayer').each(function(){
			$(this).data('pause')();
		});

		optimizationSlide.pause();
	});

	// the only call to the parallax system you need to make
	startAllParaSystems();

});
