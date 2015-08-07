
 Alerts = new Meteor.Collection("alerts");

if (Meteor.isClient) {

  var iinterview = new IInterview();
  iinterview.setStatus("IDLE");
  var currentQuestion="", email="",counter=0,fDate;
  Template.body.events({
    'click .startInterview' : function(e, t) {
      e.preventDefault();
      if(Meteor.userId()){
        if(counter < 5) {
          console.log("counter",counter);
          counter = counter + 1;
          email= Meteor.user().emails[0].address;
          var questionNumber = Math.floor((Math.random() * 5) + 1);
            currentQuestion = questions[questionNumber].question;
            console.log("question"+questionNumber+"-"+currentQuestion);
            document.getElementById("demo").innerHTML = currentQuestion;
          var d = new Date();
          var index = d.toString().indexOf("GMT");
          fDate = d.toString().substr(0,index);
          var file_uri = 'file:///videos/'+email+'-'+fDate+'-'+currentQuestion+'.webm';
          Session.set("file_url",file_uri);
          iinterview.start(file_uri);
        }
        else {
          console.log("Answered all 5 questions");
          iinterview.setStatus("DISABLED");
        }
      }
      return false;
    },
    
    'click .playInterview' : function(e, t) {
      e.preventDefault();
      if(currentQuestion != ""){
      var file_uri = 'file:///videos/'+email+'-'+fDate+'-'+currentQuestion+'.webm';
      iinterview.play(file_uri);
    }
    else {
      console.log("current question blank!!");
    }
      return false;
    }
  });

}

if (Meteor.isServer) {

  var kurento = Meteor.npmRequire("kurento-client");
  var client,pipeline,file_uri,endofstream = false,wendofstream;

  var ws_uri = 'ws://192.168.78.30:8888/kurento';

  Alerts.remove({}); // remove all

  Meteor.methods({
    'onOffer' : function(offer,file_uri) {
      var syncedClient = Meteor.wrapAsync(kurento);
      client = syncedClient(ws_uri);
      var syncedPipeline = Meteor.wrapAsync(client.create,client);
      pipeline = syncedPipeline('MediaPipeline');
      var syncedwebRtc = Meteor.wrapAsync(pipeline.create,pipeline);
      var webRtc = syncedwebRtc('WebRtcEndpoint');
      var syncedRecorder = Meteor.wrapAsync(pipeline.create,pipeline);
      var recorder = syncedRecorder('RecorderEndpoint', {uri: file_uri});
      var syncedConnectRecorder = Meteor.wrapAsync(webRtc.connect,webRtc);
      syncedConnectRecorder(recorder);
      var syncedConnectWebRtc = Meteor.wrapAsync(webRtc.connect,webRtc);
      syncedConnectWebRtc(webRtc);
      var syncedRecord = Meteor.wrapAsync(recorder.record,recorder);
      syncedRecord();
      var syncedsdpAnswer = Meteor.wrapAsync(webRtc.processOffer,webRtc);
      var sdpAnswer = syncedsdpAnswer(offer);
      return sdpAnswer;
      
    },

    'onPlayOffer' : function(offer,file_uri) {

      var syncedClient = Meteor.wrapAsync(kurento);
      client = syncedClient(ws_uri);
      //console.log("got connected to server"+client);
      var syncedPipeline = Meteor.wrapAsync(client.create,client);
      pipeline = syncedPipeline('MediaPipeline');
      //console.log("Got MediaPipeline");
      var syncedwebRtc = Meteor.wrapAsync(pipeline.create,pipeline);
      var webRtc = syncedwebRtc('WebRtcEndpoint');
      //console.log("Got WebRtcEndpoint");
      var syncedPlayer = Meteor.wrapAsync(pipeline.create,pipeline);
      var player = syncedPlayer('PlayerEndpoint', {uri: file_uri});
      console.log("Got PlayerEndpoint"+player);
      var syncedConnectPlayer = Meteor.wrapAsync(player.connect,player);
      syncedConnectPlayer(webRtc);
      //console.log("Connected Player");
      var syncedPlay = Meteor.wrapAsync(player.play,player);
      syncedPlay();
      player.on('EndOfStream', Meteor.bindEnvironment(function(){
        console.log("endofstream");
        endofstream = true;
        Alerts.insert({message: true});
      }));
      
    
      var syncedsdpAnswer = Meteor.wrapAsync(webRtc.processOffer,webRtc);
      var sdpAnswer = syncedsdpAnswer(offer);
      //console.log("sdpAnswer"+sdpAnswer);
      return [sdpAnswer,wendofstream];

    }
  });

  Meteor.startup(function () {
    // code to run on server at startup
  });
}
