// 3DPlayer by Scott Hawley
//
// Modified *substatially* from Web Audio and 3D Soundscapes: Implementation
// http://gamedev.tutsplus.com/tutorials/web-audio-and-3d-soundscapes-implementation--cms-22651
//
// all icons by freepic.com except spanish guitar icon by  Egor Rumyantsev
// and speaker icon by Silviu Runceanu

$(function() {

// Globals...
var sounds = [] // <String>
var soundFiles = [
	"sounds/snd-01.ogg",
	"sounds/snd-02.ogg",
	"sounds/snd-03.ogg",
	"sounds/snd-04.ogg",
	"sounds/snd-05.ogg",
	"sounds/snd-06.ogg"
];


	if ((window.AudioContext === undefined) && (window.webkitAudioContext === undefined)) {
                //return
	  	alert('The Web Audio API is not supported in your browser!');

        }

	document.getElementById('start').style.top = "400px"; 
	document.getElementById('stop').style.top = "420px"; 

	$(".icon").draggable({ 		// Make images draggable.

		refreshPositions: true,
		containment: 'parent',

    		start: function(event, ui) { // when image is first being dragged 
	    		//var id = $(event.target).attr("id");
    			// Show start dragged position of image.
    			//var posCanvas = $(this).position();
    			//$("div#start").text(id + " START: \nLeft: "+ posCanvas.left + "\nTop: " + posCanvas.top);
    		},

    		stop: function(event, ui) { // when image is dropped.
	    
    		},


		drag: function(event, ui) { // while image is being dragged
	    		var id = $(event.target).attr("id");
			var i = parseInt(id.substr(id.length - 1)) - 1;
			var snd = sounds[i];

			if (snd === undefined) {
				return
			}
    			// Figure out position of the icon.
    			var posCanvas = $(this).position();
    			//$("div#stop").text(id + " DRAG: \nLeft: "+ posCanvas.left + "\nTop: " + posCanvas.top+ ", i = "+i);
			var img = document.getElementById(id); 
			var width = img.clientWidth;
			var height = img.clientHeight;
			var x = posCanvas.left - 300;
			var z = posCanvas.top - 200;
			x += width/2
			z += height/2

			// Apply this position to the sound
			x = 0.1*x*Math.abs(x)    // extra mapping because it feels better
			z = 0.1*z*Math.abs(z)    // extra mapping because it feels better
			player.setX(snd, x)
			player.setZ(snd, z)

    		},

	});




	// Create a new AudioPlayer object (we only need one of these) and
	// then attach the event handlers needed while loading the sounds.
	var player = new AudioPlayer()

	var soundsEnded = 0   // keep a record of how many tracks have ended
	player.onended = function(snd) {
		soundsEnded++
		// When all sounds have ended, reset the button
		if (soundsEnded >= sounds.length) {
			demoPlaying = false
			$("#playButton").text("Play")
			soundsEnded = 0
		}
	}

	// Called when the audio player starts loading a queue of sounds.
	player.onloadstart = function() {
		window.console.debug("Loading audio.")
	}

	// Called when the audio player encounters a problem loading a
	// sound. The sound queue will be cleared before this event is
	// broadcast to prevent any more sounds from loading.
	player.onloaderror = function() {
		// The errorType property informs us if the error was
		// caused by an I/O or audio decoding problem.
		if (player.errorType === player.IO_ERROR) {
			// Probably a problem with the server.
			//setStatus("Sorry, the demo resource files failed to load")
		} else if (player.errorType === player.DECODING_ERROR) {
			// The browser doesn't support OGG Vorbis audio.
			//setStatus("Sorry, your web browser cannot run this demo")
		}

		// The errorText property contains an error message that
		// can be thrown or sent to the dev console etc.
		window.console.debug(player.errorText)
	}

	// Called when the audio player has loaded a queue of sounds.
	player.onloadcomplete = function() {
		window.console.debug("Loaded.")
		console.log("Sounds Loaded.")
		
		player.onloadstart = null
		player.onloaderror = null
		player.onloadcomplete = null
		
    		$("div#start").text(""); //****  Sounds loaded, commencing playback! >>>>>>>")
    		$("div#stop").text("Audio loaded: 'Windy Places' by Scott Hawley, from upcoming album!")
		$("#playButton").css("visibility", "visible");
		
		//start()
		document.getElementById("playButton").onclick = function() {
			buttonPressed();
    			return false;
		};
	}

	// Load the sounds required for this demo.
	for (i=0; i < soundFiles.length; i++) {
		player.load(soundFiles[i]);
	}

	var demoStarted = false
	var demoPlaying = false
	var demoMuted = false

	function buttonPressed() {
		 demoPlaying = !demoPlaying;
		 if (demoPlaying) {
		 	$("#playButton").text("Stop");
			start();
		 	demoStarted = true;
		 } else {
		 	$("#playButton").text("Play");
			 //mute();
			for (i=0; i<sounds.length; i++) {
				player.stop(sounds[i]);
			}
		}
		return false
	}

	// Starts playing
	function start() {
		// Start the demo unmuted.
		unmute()

		if (!demoStarted) {
			// Create the sounds and push them into the sounds array.
			for (i=0; i < soundFiles.length; i++) {
				sounds.push(player.create(soundFiles[i]))
			}
		}
	
		//start them all playing
		var n = sounds.length
		for (i=0; i<n; i++) {
			player.play(sounds[i], false);  // "true" means loop it, false means play once
							//NB: so all your clips better be the same length! ;-)
		}


		if (!demoStarted) {
		
			// move icons to random positions
			for (i=0; i<n; i++) {
				var snd = sounds[i];
	
				var x = -150 + 300 * Math.random()
				var z = -150 + 300 * Math.random()
	
				player.setX(snd, x)
				player.setZ(snd, z)
	
				var iconstr = "#icon"+(i+1);
				var oldxCanvas = $(iconstr).position().left;
				var oldyCanvas = $(iconstr).position().top;
	
				var xCanvas = x + 150;
				var yCanvas = z + 150;
				var dx = xCanvas - oldxCanvas;
				var dy = yCanvas - oldyCanvas;
				// the drag-n-drop thing is needed because jQuery has no easy mechanism to do this
				$(iconstr).simulate("drag-n-drop", { dx: dx, dy: dy, interpolation: { stepWidth: 1, stepDelay: 0} });
			}		
		}
	}

	// Mutes the demo.
	function mute() {
		if (demoMuted === false) {
			player.setVolume(0.0)
			demoMuted = true
		}
	}

	// Unmutes the demo.
	function unmute() {
		if (demoMuted === true) {
			player.setVolume(1.0, 0.5) // 0.5 second fade-in
			demoMuted = false
		}
	}

});


