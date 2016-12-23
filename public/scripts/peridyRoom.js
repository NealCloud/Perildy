

const Perildy = (self) =>{
    state = {   
    //element holders			
			signInBtn : $("#signIn"),
			signOutBtn : $("#signOut"),			
			joinGameBtn : $("#joinGame"),
			startGameBtn: $("#startGame"),
			timerBox: $("#timerBox"),
			timerBox2: $('#timerBox2'),
			buzzerBtn: $("#buzzer"),
			answerBtn: $('#answerBtn'),
			answerInput: $("#answerInput"),
			playerSlots : $("#playerSlots"),
			Player1div : $("#Player1"),
			Player2div : $("#Player2"),
			Player3div : $("#Player3"),
			gameBoard : $("#gameBoard"),
			resetBtn : $("#resetBtn"),
			playerSlots : $("#playerSlots"),
			//client info vars
			gameName : window.location.hash.substr(1),
			refList : ["Players", "Timers", "Category", "Game"],
			notRendered : true,			
			playerSlot: false,
			notAnswered: true,
			
			//Server info vars
			userId : false,
			userName : false,
			playerinfo : {},
			gameInfo: {
				Started: false,
				PickPhase: false,
				questionPhase: false,
				HotSeat: false,
				tempSeat: false,
				currentQuestion: false,
				currentAnswer: false,
				currentPoints: 0,
				questionsLeft: null
			},
			
			//Server Inteveral Timer Holders
			questionTimer: null,
			answerTimer: null,
			gameTimer: null,
					
			//must be initialized
			init: (self) => {
				//to give access to composition methods
				state.self = self;
				//firebase starting
				state.self.initFirebase( state.self.onSignIn, state.self.onSignOut)				  
					.then(() => console.log('firebase started'))
					.catch((e) => console.log(e))
			}
			
		}
		//hide elements
		state.joinGameBtn.hide();
		//event handlers
	  //allow if signed out
		state.signInBtn.on("click", function(e){
				state.self.signIn('google', state.self.bugo);
		})
		//allow if signed in
		state.signOutBtn.on("click", function(e){
				state.self.signOut();
		})
		//remove after testing
		state.joinGameBtn.on("click", function(e){
				state.self.joinGame();
		})
		//allow at any time
		state.playerSlots.on("click", "li", function(e){
			var playerspot = $(this).attr("id");
			state.self.joinGame(playerspot);
		})
		//allow if game has not started yet
		state.startGameBtn.on("click", function(e){
				state.self.startGame();
		})
		//allow if game is question phase and temp seat open
		state.buzzerBtn.on("click", function(e){
				state.self.buzzGame();
		})
		//allow if joined game is question phase and is in temp seat
		state.answerBtn.on("click", function(e){
			e.preventDefault();			
			if(state.playerSlot && state.gameInfo.QuestionPhase && state.gameInfo.TempSeat == state.playerSlot){
				state.self.answerQuestion();
			}
			else{
				console.log("no answer allowed for you")
			}			
		})
		
		state.resetBtn.on("click", function(e){
			state.self.resetBtn();
		})
		//return the final object with all its composition methods attached
		return Object.assign(
			
			{init: state.init},
			//firebase methods
			fireStuff.initFirebase(state),
			fireStuff.onAuthStateChanged(state),
			fireStuff.signIn(state),
			fireStuff.signOut(state),
			fireStuff.createRefs(state),
			//game state methods
			onSignIn(state),
			onSignOut(state),
			loadGame(state),
			joinGame(state),
			startGame(state),
			updatePlayerInfo(state),
			renderPlayerInfo(state),
			createGameBoard(state),
			buzzGame(state),
			answerQuestion(state),			
			setPlayer(state),
			setDisconnect(state),
			updateGameInfo(state),
			pickQuestion(state),
			updateTimer(state),
			endQuestionPhase(state),
			resetBtn(state),
			endAnswerTimer(state),
			updateCurrentQuestion(state),
			updateGameBoard(state),
			//utility methods
			bugo(state)
		)
}
//mandatory signIn / signOut functions triggered on Auth Change
const onSignOut = (state) => ({
	onSignOut : () => {
		console.log("signed out :(")
		state.signInBtn.show();
		state.signOutBtn.hide();
	}
});
//this can trigger periodicly even when no auth has changed be Ready
const onSignIn = (state) => ({
	onSignIn : () => {	
		console.log('signed in!');
		
		state.userId = state.auth.currentUser.uid;		
		state.userName = state.auth.currentUser.displayName;
		
		state.signOutBtn.show();
		state.signInBtn.hide();
		//check if already in player slot and reassign disconnect
		if(state.playerSlot){
			state.self.setDisconnect(state.playerSlot);
		}
		//check if game was rendered already
		if(state.notRendered){
				state.self.createRefs(state.refList, "Games/" + state.gameName + "/");
			  state.notRendered = false;
				state.self.loadGame();
		}							
	}
});
//load game should only happen once
const loadGame = (state) => ({
	loadGame : () => {	
		state.joinGameBtn.show();		
		state.self.updatePlayerInfo();
		state.self.createGameBoard();
		state.self.updateGameInfo();
		state.self.updateTimer();
	}
})

//creates the board
const createGameBoard = (state) => ({
	createGameBoard : ()=> {
		state.CategoryRef.on("value", function(data){
			var cats = data.val();				
			
			for(var i in cats ){			
				
				var title = $("<div>", {
					text: cats[i].Name,
					class: "cluetitle"
				})
				
				var q1 = $("<div>",{
					text: cats[i]["c100"].Clue,
					class: "clues c100 unpicked",
					datarow: i,
					datacol: "100",
					id: i + '100'
				})
					var q2 = $("<div>",{
					text: cats[i]["c200"].Clue,
					class: "clues c200 unpicked",
					datarow: i,
					datacol: "200",
					id: i + '200'
				})
				
				state.gameBoard.append(title, q1, q2);				
				
			}
			//set the question amount
			state.gameInfo.questionsLeft = $(".unpicked").length;
		
			//set click event for all questions
			state.gameBoard.on("click", ".clues", function(e){
				 
					 //console.log($(this).hasClass("clues"));				   
				   var board = $(this);
					 var row = board.attr('datarow');
				   var col = board.attr('datacol');
				 	 var divID = board.attr('id');
				 //TODO: has unpicked class
					 if(state.gameInfo.PickPhase && state.playerSlot && state.playerSlot == state.gameInfo.HotSeat){
						 //start Question Timer
						 //trigger Answer Phase
						 //end pick Phase
						 state.gameInfo.questionsLeft -= 1;
						 state.GameRef.update({PickPhase: false});
						 state.self.pickQuestion(row, col, divID);
						
					 }
					 else if(!state.playerSlot){
						 console.log("please join the game");
					 }
					else if(state.playerSlot !== state.gameInfo.HotSeat){
						console.log("you are not in hotseat");
					}
				
				})
			
		});
	}																						 
	
})

const updateGameBoard = (state) => ({
	updateGameBoard : (id) => {
		$("#" + id).removeClass("unpicked");
		$("#" + id).addClass("picked");
	}
})

const updateGameInfo = (state) => ({
	updateGameInfo : ()=> {
		
		state.GameRef.on("child_added", updateInfo);
		state.GameRef.on("child_changed", updateInfo);
										 
	  function updateInfo(snap){
			
			var serverInfo = snap.val();		  
			
			switch(snap.key){
				case "Started": 
					state.gameInfo.Started = serverInfo;
					break;
				case "PickPhase":
					state.gameInfo.PickPhase = serverInfo;
					break;
				case "HotSeat":
					state.gameInfo.HotSeat = serverInfo;
					$("#playerSlots > li").removeClass("hotseat");
					if(state.gameInfo.HotSeat){				
						state[state.gameInfo.HotSeat + "div"].addClass("hotseat");
					}
					if(state.playerSlot == state.gameInfo.HotSeat){
					 	state.GameRef.onDisconnect().update({HotSeat: false});
					}
					break;
				case "TempSeat":
					state.gameInfo.TempSeat = serverInfo;
					$("#playerSlots > li").removeClass("tempseat");
					if(state.gameInfo.TempSeat){				
						state[state.gameInfo.TempSeat + "div"].addClass("tempseat");
					}
					break;
				case "QuestionPhase":
					state.gameInfo.QuestionPhase = serverInfo;
					if(state.gameInfo.QuestionPhase){
						state.self.updateCurrentQuestion(state.gameInfo.QuestionPhase);				
					}
					else {
						state.self.endQuestionPhase();
					}
					break;
			}		
//												
//			if(state.playerSlot){
//				state.self.setDisconnect(state.playerSlot);			}			
			 
			console.log('changed ' + snap.key + " to " + state.gameInfo[snap.key]);
		}	
	}	
})



//listener for Timer Changes
const updateTimer = (state) => ({
	updateTimer : ()=> {
		state.TimersRef.on("child_changed", function(snap){
			var serverInfo = snap.val();
			var key = snap.key;
			
			switch(key){
					//if Question ticks mark on timer text
					//if timer done trigger end Phase
				case "Question":
					state.timerBox.text(serverInfo.Time);
					if(serverInfo.Time <= 0 && serverInfo.Started && state.gameInfo.QuestionPhase){
						console.log("question timer end triggered");						
						state.self.endQuestionPhase();				
					}
					break;
					//if Answer ticks mark on timer2 text
					//if final tick remove temp seat reference and turn off
				case "Answer":
					state.timerBox2.text(serverInfo.Time);
					if(serverInfo.Time <= 0 && serverInfo.Started && state.gameInfo.QuestionPhase){
						state.self.endAnswerTimer();
					}
					break;
			}			
		})	
	}	
})

const endAnswerTimer = (state) => ({
	endAnswerTimer: ()=>{
		console.log("ending timer for ", state.playerSlot, state.gameInfo.TempSeat);
		//if user is in the tempseat clear it and the timer
		if(state.gameInfo.TempSeat == state.playerSlot){
			clearInterval(state.answerTimer);
			state.GameRef.update({TempSeat:false});
			state.TimersRef.child("Answer").update({
				Started:false,
				Time: "clear"
			});	
		}							
	}
})

//action when question picked start timer on hotseats client
const pickQuestion = (state) =>({
	pickQuestion: (row, col) =>{
		//console.log(row + " " + col);
		var qInfo = row + "/c" + col;
		var startTime = 15;																		
		//trigger Question Phase for everyone
		state.GameRef.update(
			{QuestionPhase: qInfo}
		)				
		//start Question Timer
		state.TimersRef.child("Question").update({
				 Time: startTime,
				 Started: true
			 })
		//Start local Timer
		state.questionTimer = setInterval(function(){			
			startTime -= 1;
			//update Server Question Timer
			state.TimersRef.child("Question").update({				 
				 Time: startTime
			 })			
			
		}, 1000)
	}
})
//update the current Question for eve
const updateCurrentQuestion = (state) => ({
	updateCurrentQuestion : (qInfo) => {
		var points = qInfo.substr(6);
		var id = qInfo.substr(0,4) + points;
		console.log(id);
		state.self.updateGameBoard(id);
		
		state.CategoryRef.child(qInfo).once("value", function(snap){
			var catsInfo = snap.val();
			console.log(catsInfo);
			state.gameInfo.currentAnswer = catsInfo.Answer;
			state.gameInfo.currentQuestion = catsInfo.Clue;
			state.gameInfo.currentPoints = parseInt(points);
		});	
	}
	
})

const endQuestionPhase = (state) => ({
	endQuestionPhase : () => {
		
			
		 console.log("qtimer end for " + state.gameInfo.HotSeat);
		 if(state.playerSlot == state.gameInfo.HotSeat){
			  clearInterval(state.questionTimer);
			 	state.TimersRef.child("Question").update({				 
					Started: false,
					Time: "Clearbo"
			 	})
				state.GameRef.update({
				 //QuestionPhase: false,
				 PickPhase: true				 
			 	})	
		 }
		
		 //end Answer Timer first
		 state.self.endAnswerTimer();
		//reset ability to buzz in
		 state.notAnswered = true;	
	

			if(state.gameInfo.questionsLeft <= 0 && state.playerSlot == state.gameInfo.HotSeat){
				 console.log("Its time for final Peridly!!");							
			}
					
		}
})

//should listen for Server Player Changes and update Players
const updatePlayerInfo = (state) => ({
	updatePlayerInfo : () => {
		state.PlayersRef.child("PlayerInfo").on("value", function(data){
			var len = data.numChildren();
			var info = data.val();
			
			for(let i = 1; i <= len; i++){
				
				let tempInfo = {};
				tempInfo.name = info["Player" + i].Name;
				tempInfo.points = info["Player" + i].points;
				tempInfo.id = info["Player" + i].uid;
				
				state.playerinfo["Player" + i] = tempInfo;
			}
			state.self.renderPlayerInfo();
		})	
		
	}	
})
//renders the Player info
const renderPlayerInfo = (state) => ({
	renderPlayerInfo : () =>{		
		state.Player1div.text(state.playerinfo.Player1.name + 
													state.playerinfo.Player1.points);
		state.Player2div.text(state.playerinfo.Player2.name + 
													state.playerinfo.Player2.points);
		state.Player3div.text(state.playerinfo.Player3.name + 
													state.playerinfo.Player3.points);
	}	
})
//when click join Game should look for open spot
// and open up start game button if not started
//should not activate if full
const joinGame = (state) => ({
	joinGame : (playerSpot) => {
		
		state.PlayersRef.child("PlayerInfo").once("value")
			.then(function(snap){
			var players = snap.val();			
			
			if(state.playerSlot){
				console.log("sorry you already are " + state.playerSlot);
			}
			
			else if(state.userId == players[playerSpot].uid || !players[playerSpot].uid){
				state.playerSlot = playerSpot;
				state.self.setPlayer(playerSpot);
				state.self.setDisconnect(state.playerSlot);
				console.log("you are " + playerSpot);
			}
			else{
				console.log('that spot is filled')
			}
			
			
			if(!state.gameInfo.HotSeat){
				state.GameRef.update({HotSeat: state.playerSlot});
			}
		})
		
	}
	
})
//sends the client Player info to update Server
const setPlayer = (state) => ({
	setPlayer : (playerSpot) => {
		var newPlayer = {};		
		newPlayer.uid = state.userId;	
		newPlayer.Name = state.userName;
		
		state.PlayersRef.child("PlayerInfo/" + playerSpot).update(newPlayer);
	}
})
//starts the game if not started and sets starty to hot seat
const startGame = (state) => ({
	startGame : () => {
		if(!state.playerSlot){
			console.log("please join game first")
			return 
		}		

		if(state.gameInfo.Started){
			
			console.log("game has already started");
		}
		else{
			var gameStuff = {
				Started: true,
				HotSeat: state.playerSlot,
				PickPhase: true
			}
			state.GameRef.update(gameStuff);
			
			console.log("starting game");
		}		
			
	}
})
//lets a player buzz in when question is read if they havn't buzzed in already
//starts answer timer and puts player in temp seat
const buzzGame = (state) => ({
	buzzGame : () => {
		 //make sure they havn't buzzed and its the question Phase and temp seat open
		if(state.notAnswered && state.gameInfo.QuestionPhase && !state.gameInfo.TempSeat){
			//flag buzzed and fill temp seat
			state.notAnswered = false;
			state.GameRef.update({TempSeat:state.playerSlot});
			//start timer to 5 seconds and trigger Firebase		
			var startTime = 5;
			state.TimersRef.child("Answer").update({
					 Time: startTime,
					 Started: true						
				 })
			//start Interval for the Temp Seat host
			state.answerTimer = setInterval(function(){
				startTime -= 1;
				state.TimersRef.child("Answer").update({				 
					 Time: startTime
				 })		
			}, 1000)
		}
		//TODO erase after working no cheating
		else{
			console.log("no buzz allowed", state.gameInfo.currentAnswer, state.gameInfo.currentQuestion);
		}		
	}
})
//gives attempted answer to question
//award points and clear answer timer 
const answerQuestion = (state) => ({
	answerQuestion : () => {	
		console.log("answering question");
			//if correct answer award points and update to player stats
			if(state.gameInfo.currentAnswer.toLowerCase() == state.answerInput.val().toLowerCase()){
				
				state.TimersRef.child("Question").update({
					 Time: 0					 						
				 })		
				
				var newPoints = state.gameInfo.currentPoints + state.playerinfo[state.playerSlot].points;
				
				state.PlayersRef.child("PlayerInfo/" + state.playerSlot).update({
					points: newPoints
				}).then(function(snap){
						//set this player to be in the hotseat
					if(state.gameInfo.HotSeat != state.playerSlot){
						state.GameRef.update({				
							HotSeat: state.playerSlot		
						})
					}
				})			
				
				
					
				
			
			
			}	
		else{
			//end Answer Timer  this is done in endQuestion Phase too
			state.self.endAnswerTimer();
		}				
	}
})
//what happens when a player leaves midgame
const setDisconnect = (state) => ({
	setDisconnect : (playerSpot) => {		
		
		 wipe = {
			 Name: "",
			 points: 0,
			 uid: ""
		 }
		state.PlayersRef.child("PlayerInfo/" + playerSpot).onDisconnect().update(wipe);	
	}
})

const resetBtn = (state) => ({
	resetBtn : () => {
//		state.GameRef.update({
//				
//				 QuestionPhase: false,
//				 PickPhase: false,
//					TempSeat: false,
//				HotSeat: false,
//			  Started: false,
//			  totalQuestions: 0
//			 		
//		})
		
		console.log(state.gameInfo);
		
	}
});

const bugo = (state) => ({
	bugo : (buglog) => {
		console.log(buglog);
	}
});

$(document).ready(function(){
	window.jepidy = Perildy();
	jepidy.init(jepidy);
})