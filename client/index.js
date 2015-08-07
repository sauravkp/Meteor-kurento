/*
* (C) Copyright 2014 Kurento (http://kurento.org/)
*
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the GNU Lesser General Public License
* (LGPL) version 2.1 which accompanies this distribution, and is available at
* http://www.gnu.org/licenses/lgpl-2.1.html
*
* This library is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
* Lesser General Public License for more details.
*
*/

IInterview = function() {
  var myvar;
};




IInterview.prototype.start = function start(file_uri) {
  IInterview.prototype.setStatus("DISABLED");

  console.log("file_uri",file_uri);
  //file_uri = 'file:///tmp/'+currentQuestion+'.webm';

  var videoInput = document.getElementById("videoInput");
  var videoOutput = document.getElementById("videoOutput");

  IInterview.prototype.showSpinner(videoInput, videoOutput);

  webRtcPeer = kurentoUtils.WebRtcPeer.startSendRecv(videoInput, videoOutput,
      onOffer, onError);

  function onOffer(offer) {
    console.log("Offer ...");
    Meteor.call('onOffer',offer,file_uri,
          function (error, sdpAnswer) {
            if (!error) {
              webRtcPeer.processSdpAnswer(sdpAnswer);
              IInterview.prototype.setStatus("CALLING");
              setTimeout(function(){
                    console.log("after 3 minutes");
                    //recorder.stop();
                  //pipeline.release();
                  webRtcPeer.dispose();
                  videoInput.src = "";
                  videoOutput.src = "";
                  IInterview.prototype.hideSpinner(videoInput, videoOutput);
                  IInterview.prototype.setStatus("IDLE");
                document.getElementById("demo").innerHTML = ' ';
                IInterview.prototype.startTimer(threeMinutes, display,'stop');
                  },180000);

                  var threeMinutes = 60 * 3,
                    display = document.querySelector('#time');
                    IInterview.prototype.startTimer(threeMinutes, display,'start');

                document.getElementById("stop").addEventListener("click",
                function(event){
                  //recorder.stop();
                  //pipeline.release();
                  webRtcPeer.dispose();
                  videoInput.src = "";
                  videoOutput.src = "";
                  IInterview.prototype.hideSpinner(videoInput, videoOutput);
                  IInterview.prototype.setStatus("IDLE");
                document.getElementById("demo").innerHTML = ' ';
                IInterview.prototype.startTimer(threeMinutes, display,'stop');
                //document.getElementById("timer").innerHTML = ' ';
                })
            }
            else
              console.log(error);
          });
   
  }
}


IInterview.prototype.play = function play(file_uri)
{
  IInterview.prototype.setStatus("DISABLED");
  console.log("Start playing");
  console.log("file_uri",file_uri);
  var endofstream = false;
  var videoPlayer = document.getElementById('videoOutput');
  IInterview.prototype.showSpinner(videoPlayer);
  
  
              
  var webRtcPeer = kurentoUtils.WebRtcPeer.startRecvOnly(videoPlayer,
      onPlayOffer, onError);


  function onPlayOffer(offer) {

      Meteor.call('onPlayOffer',offer,file_uri,
          function (error, result) {
            if (!error) {
              console.log("result"+result[1]);
              result[1];
              webRtcPeer.processSdpAnswer(result[0]);

              Meteor.autosubscribe(function() {
            Alerts.find().observe({
            added: function(item){ 
            console.log("endofstream"+item.message);
             if( item.message == true){
                videoPlayer.src = "";
                IInterview.prototype.hideSpinner(videoOutput);
                videoPlayer.controls = false;
              }
            }
          });
        });
             

                IInterview.prototype.setStatus("PLAYING");
              document.getElementById("stop").addEventListener("click",
              function(event){
                webRtcPeer.dispose();
                videoPlayer.src="";
               IInterview.prototype.hideSpinner(videoPlayer);
                IInterview.prototype.setStatus("IDLE");
                document.getElementById("demo").innerHTML = ' ';
              })

              
            }
            else
              console.log(error);
          });
    
  };
}

function onError(error) {
  console.log(error);
}
IInterview.prototype.showSpinner = function showSpinner() {
  for (var i = 0; i < arguments.length; i++) {
    arguments[i].poster = 'img/transparent-1px.png';
    arguments[i].style.background = "center transparent url('img/spinner.gif') no-repeat";
  }
}

IInterview.prototype.hideSpinner = function hideSpinner() {
  for (var i = 0; i < arguments.length; i++) {
    arguments[i].src = '';
    //arguments[i].poster = 'img/webrtc.png';
    arguments[i].style.background = '';
  }
}
IInterview.prototype.startTimer = function startTimer(duration, display,status) {

  if(status == 'start')
      {
    var start = Date.now(),
        diff,
        minutes,
        seconds;
    function timer() {

      
        // get the number of seconds that have elapsed since 
        // startTimer() was called
        diff = duration - (((Date.now() - start) / 1000) | 0);

        // does the same job as parseInt truncates the float
        minutes = (diff / 60) | 0;
        seconds = (diff % 60) | 0;

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds; 

        if (diff <= 0) {
            // add one second so that the count down starts at the full duration
            // example 05:00 not 04:59
            start = Date.now() + 1000;
        }
        
    };
    // we don't want to wait a full second before the timer starts
    //timer();
     IInterview.prototype.myvar = setInterval(function(){timer()}, 1000);
  }
  else {
    clearInterval(IInterview.prototype.myvar);
    console.log("interval cleared");
    display.textContent = ' ';
  }
}

IInterview.prototype.setStatus = function setStatus(nextState){
  
  
  switch(nextState){
    case ("IDLE"):
    console.log("idle");
      $('#start').attr('disabled', false)
      $('#stop').attr('disabled', true)
      $('#play').attr('disabled', false)
      //document.getElementById("timer").style.display="none";
      break;
    case ("DISABLED"):
      $('#start').attr('disabled', true)
      $('#stop').attr('disabled', true)
      $('#play').attr('disabled', true)
      break;
    case ("CALLING"):
      $('#start').attr('disabled', true)
      $('#stop').attr('disabled', false)
      $('#play').attr('disabled', true)
      break;
    case ("PLAYING"):
      $('#start').attr('disabled', true)
      $('#stop').attr('disabled', false)
      $('#play').attr('disabled', true)
      break;
    default:
      return;
  }
}

