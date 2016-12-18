function FartStone(){
    var self = this;
	this.trebukTimer = false;
	this.qTimer = false;
    this.playerSlot = false;
	this.timerQuestion = false;
		this.joinGameBtn = document.getElementById('joinGame');
	this.signOutButton = document.getElementById('signout');
	this.signInButton = document.getElementById('signin');
	  this.message = document.getElementById("message");
	this.timerBtn = document.getElementById("timer");
		this.signInButton.addEventListener('click', this.signIn.bind(this));
	this.signOutButton.addEventListener('click', this.signOut.bind(this));
	this.joinGameBtn.addEventListener('click', this.startGame.bind(this));
	this.timerBtn.addEventListener('click', this.startTimer.bind(this));
	
	
		this.initFirebase();
	

}


	
		//create database refs
		FartStone.prototype.signIn = function(){
		 var provider = new firebase.auth.GoogleAuthProvider();
		 this.auth.signInWithPopup(provider);
	 }
		
		
		
		//signout firebase function
	 FartStone.prototype.signOut = function(){		 
			this.auth.signOut();
		 console.log($);
	 };
  


FartStone.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
	
		this.playersRef = this.database.ref("Players");	  
	
	this.playersRef.child("PlayerSlots").on("value", function(snapo){
		 	var players = snapo.val();
			var keyo = snapo.key;
	 		console.log("changed", keyo, players);
		 
			$('#Player1').text(players.Player1);
			$('#Player2').text(players.Player2);
		
		});;
	
	this. timerRef = this.database.ref("Timers");
	
	this.timerRef.child("Question").on("value", function(snap){
		var pos = snap.val();
		console.log(pos, this.trebukTimer);
		if(pos && !this.trebukTimer){
			console.log(getTimeRemaining(pos));
			$("#Qtimer").text(getTimeRemaining(pos).total);
			this.trebukTimer = setInterval(function(){
				console.log("TREEBUT");
				$("#Qtimer").text(getTimeRemaining(pos).total);
			}, 1000);
		}
		
		else if(!pos){
			window.clearInterval(this.trebukTimer);
			this.trebukTimer = false;
			console.log("timer has stopped");
		}
		
	})
	
	function getTimeRemaining(endtime){
  var t =  Date.parse(new Date()) + Date.parse(new Date(endtime));
  var seconds = Math.floor( (t/1000) % 60 );
  var minutes = Math.floor( (t/1000/60) % 60 );
  var hours = Math.floor( (t/(1000*60*60)) % 24 );
  var days = Math.floor( t/(1000*60*60*24) );
  return {
    'total': t,
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
	}
	
	
};

FartStone.prototype.startTimer = function(){
	var self = this;
	this.timerRef.child("Question").set(firebase.database.ServerValue.TIMESTAMP);
	
	this.trebukTimer = setTimeout(function(){
		self.timerRef.child("Question").set(false);
	}, 5000);
}

FartStone.prototype.onAuthStateChanged = function(user){
	
    if(user){
        console.log("signed in :)", this.playerSlot );
			  if(this.playerSlot){
					this.playersRef.child("PlayerSlots/Player1").onDisconnect().set(false);
				}
			
    }
    else{
        console.log("singed out :(");
    }
}

FartStone.prototype.startGame = function() {	
	var self = this;
	var bloke = this.auth.currentUser.uid;
	
	this.playersRef.once("value").then(function(data){
		var players = data.val();
		
		
		 
		
		if(bloke == players.PlayerSlots.Player1 || (!players.PlayerSlots.Player1 && bloke != players.PlayerSlots.Player2)){
			console.log("you are now player 1");
			self.playersRef.child("PlayerSlots").update({Player1: bloke});
			document.addEventListener('keydown', self.moveCard.bind(self));
			self.playerSlot = 'Player1';
			self.playersRef.child("PlayerSlots/Player1").onDisconnect().set(false);
			//window.location = ("dogs.html#"+ "dopes");
		}
		else if(bloke == players.PlayerSlots.Player2 || (!players.PlayerSlots.Player2 && bloke != players.PlayerSlots.Player1)){
			console.log("you are now player 2");
			self.playersRef.child("PlayerSlots").update({Player2: bloke})
			self.playerSlot = 'Player2';
			self.playersRef.child("PlayerSlots/Player2").onDisconnect().set(false);
		}		
	
	});
	
	
		

 
};

FartStone.prototype.updateList = function(){
		
}

FartStone.prototype.moveCard = function(){
	console.log("moving!");
	var self = this;
	this.playersRef.child("Player1/Board/card1/Position").once("value").then(function(data){
		var d = data.val();
		self.playersRef.child("Player1/Board/card1/Position").update({x: d.x + 10});
	})
	
	//$("#message").animate({ top: '+10px' });
	//document.getElementById("message").style.paddingLeft += 10;
}

window.onload = function(){
	var bark = new FartStone();
	
}