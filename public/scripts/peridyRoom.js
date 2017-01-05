

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
			questionBoard : $("#questionBoard"),
			questionBoardText : $("#questionBoard p"),
			trebekChat : $("#trebekChat"),
			unpicked: $(".unpicked"),
			snackbarDiv: $("#snackbar"),
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
				QuestionPhase: false,
				HotSeat: false,
				TempSeat: false,
				currentQuestion: "",
				currentAnswer: "",
				currentValue: 0,
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
	  state.buzzerBtn.hide();
	  state.answerBtn.hide();
		state.startGameBtn.hide();
		state.snackbarDiv.hide();
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
			if(!state.notRendered){
				state.self.joinGame();
			}
				
		})
		//allow at any time
		state.playerSlots.on("click", ".playerStand", function(e){
			if(!state.playerSlot){
				var playerspot = $(this).attr("id");			
				state.self.joinGame(playerspot);
			}
			
			
		})
		//allow if game has not started yet
		state.startGameBtn.on("click", function(e){
			e.preventDefault();	
			if(state.playerSlot && !state.gameInfo.Started){
				state.startGameBtn.hide();
				state.self.startGame();				
			}	
			else{
				state.self.snackbar("you must join the game first");
			}
				
		})
		//allow if game is question phase and temp seat open
		state.buzzerBtn.on("click", function(e){
			e.preventDefault();
				state.self.buzzGame();
		})
		//allow if joined game is question phase and is in temp seat
		state.answerBtn.on("click", function(e){
			e.preventDefault();			
			if(state.playerSlot && state.gameInfo.QuestionPhase && state.gameInfo.TempSeat == state.playerSlot){
				state.self.answerQuestion();		
				
				
			}
			else if(state.playerSlot){
				state.PlayersRef.child("PlayerInfo/" + state.playerSlot)
					.update({
						chat:state.answerInput.val()
								 })
				  state.answerInput.val("");
			}
			else{			
				state.self.snackbar("you have not joined the game yet");
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
			gameError(state),
			gameEnd(state),
			//utility methods
			pageStuff.snackbar(state),
			pageStuff.bugo(state)			
		)
}
//mandatory signIn / signOut functions triggered on Auth Change
const onSignOut = (state) => ({
	onSignOut : () => {
		state.self.snackbar("you are signed out! :(");		
		state.signInBtn.show();
		state.signOutBtn.hide();
	}
});
//this can trigger periodicly even when no auth has changed be Ready
const onSignIn = (state) => ({
	onSignIn : () => {
		state.self.snackbar("you are signed in!");		
		
		state.userId = state.auth.currentUser.uid;	
		
		if(state.auth.currentUser.providerData["0"].providerId == "password"){
			var name = /([^@]+)/.exec(state.auth.currentUser.email);
			state.userName = name[0];
		}else{
			state.userName = state.auth.currentUser.displayName;
		}
		
		//state.signOutBtn.show();
		state.signOutBtn.hide();
		
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
		state.self.updateGameBoard();
		
		
	}
})

//creates the board
const createGameBoard = (state) => ({
	createGameBoard : ()=> {
		state.CategoryRef.once("value", function(data){
			var cats = data.val();				
			
			for(var i in cats){			
				
				var title = $("<div>", {
					text: cats[i].Name,
					class: "cluetitle"
				})
				
				state.gameBoard.append(title);
				for(var clueNum = 0; clueNum <= 4; clueNum++){
					var done = " unpicked";
					var points = cats[i]["c" + clueNum].Points;
					//var points = (clue * 100) * 2;
					if(cats[i]["c" + clueNum].done){
						done = " picked";
					}
					
					var qDiv = $("<div>",{
					text: points,
					class: "clues" + done,
					datarow: i,
					datacol: clueNum,
					id: i + clueNum
				})
					state.gameBoard.append(qDiv);
				}				
				
			}
			//set the question amount
			//state.gameInfo.questionsLeft = $(".unpicked").length;
		
			//set click event for all questions
			state.gameBoard.on("click", ".clues", function(e){				 
								   
				   var board = $(this);				
					 var row = board.attr('datarow');
				   var col = board.attr('datacol');
				 	 var divID = board.attr('id');				 
				   var picked = board.hasClass("unpicked");
				
					 if(picked && state.gameInfo.PickPhase && state.playerSlot && state.playerSlot == state.gameInfo.HotSeat && state.gameInfo.Started){
						 //start Question Timer
						 //trigger Answer Phase
						 //end pick Phase
						 state.gameInfo.questionsLeft -= 1;
						 state.GameRef.update({
							 PickPhase: false
//							 totalQuestions: state.gameInfo.questionsLeft
						 });
						 
						 state.self.pickQuestion(row, col, divID);						
					 }
					 else if(!state.playerSlot){
						 state.self.snackbar("click on open square to join");
					 }
					else if(state.playerSlot !== state.gameInfo.HotSeat){
						state.self.snackbar("you are not in hotseat");
					}
				
				})
			
		});
	}																						 
	
})

//const updateGameBoard = (state) => ({
//	updateGameBoard : (id) => {
//		$("#" + id).removeClass("unpicked");
//		$("#" + id).addClass("picked");
//	}
//})

const updateGameBoard = (state) => ({
	updateGameBoard : () => {
		//state.CategoryRef.on("child_added", updateInfo);
		state.CategoryRef.on("child_changed", updateInfo);	
		
		function updateInfo(snap){
			var serverInfo = snap.val();
			var key = snap.key;
			
			if(state.gameInfo.QuestionPhase){
				var qInfo = state.gameInfo.QuestionPhase;
//				var points = qInfo.substr(6);
//				var id = qInfo.substr(0,4) + points;
				
				$("#" + qInfo).removeClass("unpicked");
				$("#" + qInfo).addClass("picked");
			}			
		}
		
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
					if(serverInfo){
						state.questionBoard.addClass("zoom");
						state.startGameBtn.hide();
					}
					else{
						state.startGameBtn.show();
					}
					break;
				case "PickPhase":
					state.gameInfo.PickPhase = serverInfo;
					if(state.gameInfo.HotSeat){
						state.trebekChat.text("TerbekBot: " + state.playerinfo[state.gameInfo.HotSeat].name + "Please choose a Category");
					}
					state.trebekChat.text("TerbekBot: Someone join the Game! and pick a category");
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
					if(state.gameInfo.QuestionPhase && state.gameInfo.Started){
						state.questionBoard.removeClass("zoom");						
//						state.self.updateCurrentQuestion(state.gameInfo.QuestionPhase);
						state.questionBoardText.text(state.gameInfo.currentQuestion);
						state.buzzerBtn.show();				
					}					
					
					else if(state.gameInfo.Started) {
						state.buzzerBtn.hide();						
						state.questionBoard.addClass("zoom");
						state.self.endQuestionPhase();
					}				
				
					break;
				case "CurrentQuestion":
					state.gameInfo.currentQuestion = serverInfo;
					break;
				case "CurrentAnswer":
					state.gameInfo.currentAnswer = serverInfo;
					break;
				case "CurrentValue":
					state.gameInfo.currentValue = serverInfo;
					break;
			}					
			 
			//console.log('changed ' + snap.key + " to " + state.gameInfo[snap.key]);
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
						//use instead?
						state.GameRef.update({
							 QuestionPhase: false
						})										
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
		
		  //check if you are owner of the answer timer
			if(state.playerSlot && state.gameInfo.TempSeat == state.playerSlot){
				
					clearInterval(state.answerTimer);
				
					state.GameRef.update({TempSeat:false});
				
					state.TimersRef.child("Answer").update({
						Started: false,
						Time: "X"
					});	
				
					state.PlayersRef.child("PlayerInfo/" + state.playerSlot)
						.update({
							chat:"What is " + state.answerInput.val()
									 })
				  
				//check if the answer is correct
				if(state.gameInfo.currentAnswer.toLowerCase() == state.answerInput.val().toLowerCase()){
					//reset the question timer
					state.TimersRef.child("Question").update({
						 Time: 0					 						
					 })
						//then update the hotseat
						.then(function(){
							if(state.gameInfo.HotSeat != state.playerSlot){
								state.GameRef.update({				
									HotSeat: state.playerSlot		
								})
							}
					})		
					//calculate new points
				
					var newPoints = (state.playerinfo[state.playerSlot].points) + (state.gameInfo.currentValue);
					//update them to player stats
					state.PlayersRef.child("PlayerInfo/" + state.playerSlot).update({
						points: newPoints
					})		

				}	
				else{		
					
						clearInterval(state.answerTimer);
							state.GameRef.update({TempSeat:false});
							state.TimersRef.child("Answer").update({
								Started: false,
								Time: "X"
						});	
					
						var newPoints = (state.playerinfo[state.playerSlot].points) - (state.gameInfo.currentValue);

						state.PlayersRef.child("PlayerInfo/" + state.playerSlot).update({
							points: newPoints
						})		
				}				
	
		state.answerInput.val("");
		//if user is in the tempseat clear it and the timer
	
		
		}							
	}
})

//action when question picked start timer on hotseats client
const pickQuestion = (state) =>({
	pickQuestion: (row, col, cid) =>{
		//console.log(row + " " + col);
		var qInfo = row + "/c" + col;
		
		var startTime = 15;																		
		//trigger Question Phase for everyone
		
		
		//lets try updating question game data instead
		var qData = {QuestionPhase: cid};
		
		state.CategoryRef.child(qInfo).once("value", function(snap){
			var catsInfo = snap.val();
			console.log(catsInfo);
			qData.CurrentAnswer = catsInfo.Answer;
			qData.CurrentQuestion = catsInfo.Clue;
			qData.CurrentValue = catsInfo.Points;
		}).catch(state.self.gameError);	
		
		state.GameRef.update(qData);
		
		
		//trigger update board for evryone
		state.CategoryRef.child(qInfo).update(
			{ done:true }
		);
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
		//var id = qInfo.substr(0,4) + points;
		
		//state.self.updateGameBoard(id);
	
		
	
	}
	
})

const endQuestionPhase = (state) => ({
	endQuestionPhase : () => {
		 if(state.gameInfo.currentAnswer){
			 state.trebekChat.text("TrebekBot: The answer was " + state.gameInfo.currentAnswer);
			 setTimeout(function(){
				 state.trebekChat.text("TrebekBot: Please pick a peril");	
			 }, 4000)			 
		 }
		 
		 //console.log("qtimer end for " + state.gameInfo.HotSeat);
		
		 if(state.playerSlot == state.gameInfo.HotSeat){
			  clearInterval(state.questionTimer);
			 	state.TimersRef.child("Question").update({				 
					Started: false,
					Time: "X"
			 	})
				state.GameRef.update({
				// QuestionPhase: false,
				 PickPhase: true				 
			 	})	
		 }
		
		 //end Answer Timer first
		 state.self.endAnswerTimer();
		//reset ability to buzz in
		 state.notAnswered = true;		
      
			if($(".unpicked").length == 0){
				 console.log("Its time for final Peridly!!");	
				state.self.gameEnd();
			}
					
		}
})

//should listen for Server Player Changes and update Players
const updatePlayerInfo = (state) => ({
	updatePlayerInfo : () => {
		state.PlayersRef.child("PlayerInfo").on("child_added", checkPlayers); 
		state.PlayersRef.child("PlayerInfo").on("child_changed", checkPlayers); 
																						
		function checkPlayers(data){
			
			var playerSpot = data.key;
		
			var info = data.val();		
				
			let tempInfo = {};
			tempInfo.name = info.Name;
			tempInfo.points = info.points;
			tempInfo.id = info.uid;
			tempInfo.chat = info.chat;
			
			

			state.playerinfo[playerSpot] = tempInfo;
			
			state.self.renderPlayerInfo(playerSpot);
		}
		
	}	
})
//renders the Player info
const renderPlayerInfo = (state) => ({
	renderPlayerInfo : (playerSpot) =>{		
		if(state.playerinfo[playerSpot].points < 0){
			$("#" + playerSpot + " .money").addClass("debt");
		}
		else{
			$("#" + playerSpot + " .money").removeClass("debt");
		}
		$("#" + playerSpot + "chat").text(state.playerinfo[playerSpot].chat);
		
		$("#" + playerSpot + " .money").text("$ " + state.playerinfo[playerSpot].points)
		$("#" + playerSpot + " .namo").text(state.playerinfo[playerSpot].name)		
	
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
				
			}
			
			else if(state.userId == players[playerSpot].uid || !players[playerSpot].uid){
				state.playerSlot = playerSpot;
				state.self.setPlayer(playerSpot);
				state.self.setDisconnect(state.playerSlot);
				state.self.snackbar("you are now " + playerSpot);
			}
			else{
				state.self.snackbar('that spot is filled');
			}
			
			
			if(!state.gameInfo.HotSeat){
				state.GameRef.update({HotSeat: state.playerSlot});
			}
		}).catch(state.self.gameError);
		
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
			state.self.snackbar("please join game first");
			return 
		}		

		if(state.gameInfo.Started){
			
			state.self.snackbar("game has already started");
		}
		else{
			var gameStuff = {
				Started: true,
				HotSeat: state.playerSlot,
				PickPhase: true
			}
			state.GameRef.update(gameStuff);
			
			state.self.snackbar("starting game");
		}		
			
	}
})
//lets a player buzz in when question is read if they havn't buzzed in already
//starts answer timer and puts player in temp seat
const buzzGame = (state) => ({
	buzzGame : () => {
		 //make sure they havn't buzzed and its the question Phase and temp seat open
		if(state.notAnswered && state.gameInfo.QuestionPhase && !state.gameInfo.TempSeat && state.playerSlot){
			//flag buzzed and fill temp seat
			state.notAnswered = false;
			state.buzzerBtn.hide();	
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
			state.self.snackbar("Someone else buzzed in!");
			console.log("no buzz allowed", state.gameInfo.currentAnswer, state.gameInfo.currentQuestion);
		}		
	}
})
//gives attempted answer to question
//award points and clear answer timer 
const answerQuestion = (state) => ({
	answerQuestion : () => {	
		
		  if(state.gameInfo.TempSeat == state.playerSlot){			
			state.TimersRef.child("Answer").update({
				 Time: 0					 						
			 })		
		}		
	}		
})

const gameEnd = (state) => ({
	gameEnd : ()=>{
		state.self.snackbar("calculating scores");
   setTimeout(function(){
		 var pointArr = [];
		
		for(let i in state.playerinfo){				
			pointArr.push(state.playerinfo[i].points);
		}
		var winner = Math.max(...pointArr);		
		var winnerArr = [];

		for(let k in state.playerinfo){
			if(state.playerinfo[k].points == winner){
				winnerArr.push(state.playerinfo[k].name); 
			}
		}
		var wintext= "";
		
		if(winnerArr.length > 1){
			for(let i = 0; i < winnerArr.length; i++){
				wintext += winnerArr[i] + ", "; 
			}
			wintext += "have all tied what close a game you all lose!";
		}
		else{
			wintext = winnerArr[0] + " HAS WON THE MATCH!! now please leave";
		}
		
		
		state.questionBoardText.text(wintext)
		state.questionBoard.removeClass("zoom");	
		 
	 },2000)
		
		
	}	
})


//what happens when a player leaves midgame
const setDisconnect = (state) => ({
	setDisconnect : (playerSpot) => {		
		
		 wipe = {
			 Name: "",
			 points: 0,
			 uid: "",
			 chat: ""
		 }
		state.PlayersRef.child("PlayerInfo/" + playerSpot).onDisconnect().update(wipe);	
	}
})

const gameError = (state) => ({
	gameError : ()=>{
		state.questionBoardText.text("Sorry This Game has been Deleted by a Marlon" )
		state.questionBoard.removeClass("zoom");	
	}	
})

const resetBtn = (state) => ({
	resetBtn : () => {
		//clears game refs
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
	
		//console.log(state.gameInfo, state.playerinfo);
		state.self.snackbar("sorry I can't allow that");
	}
});


$(document).ready(function(){
	window.jepidy = Perildy();
	jepidy.init(jepidy);
})