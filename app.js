$(function() {
  // define variables
  var audioCtx = new window.AudioContext() || new window.webkitAudioContext;
  var source;

  $("#pads div").each(function() {
    addAudioProperties(this);
  })

  // use XHR to load an audio track, and
  // decodeAudioData to decode it and stick it in a buffer
  // then we put the buffer into the source
  function loadAudio(object, url) {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function() {
      audioCtx.decodeAudioData(request.response, function(buffer) {
        object.buffer = buffer;
      });
    }
    request.send();
  }

  function addAudioProperties(object) {
    object.name = object.id;
    object.url = $(object).data("sound");
    object.volume = audioCtx.createGain();
    object.loop = false;
    object.playbackRate = 1;

    loadAudio(object, object.url);

    object.play = function() {
      var source = audioCtx.createBufferSource();
      source.buffer = object.buffer;
      source.playbackRate.value = object.playbackRate;
      source.connect(object.volume);
      object.volume.connect(audioCtx.destination);
      source.loop = object.loop;
      source.start(0);
      object.source = source;
    };

    object.stop = function() {
      if(object.source) object.source.stop(0);
    };
  }

  // event listeners
  $("#pads div").on("click", function() {
    this.play();
  });

  $(".control-pad input").on("change", function() {
    var v = $(this).parent().data("pad");
    var pad = $("#" + v)[0];

    switch ($(this).data("control")) {
      case "gain":
        pad.volume.gain.value = $(this).val();
        break;
      case "playback-rate":
        pad.playbackRate = $(this).val();
        pad.source.playbackRate.value = pad.playbackRate;
        break;
      default:
        break;
    }
  });

  $(".control-pad button").on("click", function() {
    var v = $(this).parent().data("pad");
    var toggle = $(this).text();
    var pad = $("#" + v)[0];

    switch ($(this)[0].className) {
      case "loop-button":
        pad.stop();
        $(this).text($(this).data("toggleText")).data("toggleText", toggle);
        ($(this).val() === "false") ? $(this).val("true") : $(this).val("false");
        pad.loop = ($(this).val() == "false") ? false : true;
        break;
      default:
        break;
    }
  });
});
