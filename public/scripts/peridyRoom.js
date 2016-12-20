

const Perildy = (self) =>{
    state = {   
    //element holders			
			signInBtn : $("#signIn"),
			signOutBtn : $("#signOut"),			
			joinGameBtn : $("#joinGame"),
			startGameBtn: $("#startGame"),
			timerBox: $("#timerBox"),
			buzzerBtn: $("#buzzer"),
			answerBtn: $('#answerBtn'),
			answerInput: $("#answerInput"),
			playerSlots : $("#playerSlots"),
			player1div : $("#player1"),
			player2div : $("#player2"),
			player3div : $("#player3"),
			gameBoard : $("#gameBoard"),
			
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
				gameStarted: false,
				gamePickPhase: false,
				questionPhase: false,
				hotSeat: false,
				tempSeat: false,
				currentQuestion: false,
				currentAnswer: false,
				currentPoints: 0,
				questionsLeft: null
			},
			
			//Server Timers
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
		state.signInBtn.on("click", function(e){
				state.self.signIn('google', state.self.bugo);
		})

		state.signOutBtn.on("click", function(e){
				state.self.signOut();
		})
		
		state.joinGameBtn.on("click", function(e){
				state.self.joinGame();
		})
		
		state.startGameBtn.on("click", function(e){
				state.self.startGame();
		})
		
		state.buzzerBtn.on("click", function(e){
				state.self.buzzGame();
		})
		
		state.answerBtn.on("click", function(e){
				state.self.answerQuestion();
		})
		//return the final object with all methods composted
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
			//utility methods
			bugo(state)
		)
}
//mandatory signIn / signOut functions triggered on Auth Change
const onSignOut = (state) => ({
	onSignOut : () => {
		state.signInBtn.show();
		state.signOutBtn.hide();
	}
});

const onSignIn = (state) => ({
	onSignIn : () => {
		
		state.userId = state.auth.currentUser.uid;		
		state.userName = state.auth.currentUser.displayName;
		console.log('signed in!');
		state.signOutBtn.show();
		state.signInBtn.hide();
		
		if(state.playerSlot){
			state.self.setDisconnect(state.playerSlot);
		}
		
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
//should listen for Server Game info Changes
const updateGameInfo = (state) => ({
	updateGameInfo : ()=> {
		state.GameRef.on("value", function(snap){
			var serverInfo = snap.val();
			
			state.gameInfo.gameStarted = serverInfo.Started;
			state.gameInfo.gamePickPhase = serverInfo.PickPhase;
			state.gameInfo.hotSeat = serverInfo.HotSeat;
			state.gameInfo.tempSeat = serverInfo.TempSeat;
			state.gameInfo.questionPhase = serverInfo.QuestionPhase;
			
			
			if(state.playerSlot){
				state.self.setDisconnect(state.playerSlot);
			}
			
			console.log(state.gameInfo);
		})	
	}	
})

const updateTimer = (state) => ({
	updateTimer : ()=> {
		state.TimersRef.on("child_changed", function(snap){
			var serverInfo = snap.val();
			var key = snap.key;
			switch(key){
				case "Question":
					state.timerBox.text(serverInfo.Time);
					if(serverInfo.Time <= 0){
						state.notAnswered = true;
						
					}
			}
			
			
			
			
		
		})	
	}	
})

//should listen for Server Board Changes and update board
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
					datacol: "100"
				})
					var q2 = $("<div>",{
					text: cats[i]["c200"].Clue,
					class: "clues c200 unpicked",
					datarow: i,
					datacol: "200"
				})
				
				state.gameBoard.append(title, q1, q2);				
				
			}
			//set the question amount
			state.gameInfo.questionsLeft = $(".unpicked").length;
		
			
			state.gameBoard.on("click", ".clues", function(e){
				 
					 //console.log($(this).hasClass("clues"));				   
				   var board = $(this);
					 var row = board.attr('datarow');
				   var col = board.attr('datacol');
				 //TODO: has unpicked class
					 if(state.gameInfo.gamePickPhase && state.playerSlot && state.userId == state.gameInfo.hotSeat){
						 //start Question Timer
						 //trigger Answer Phase
						 //end pick Phase
						 
						 state.GameRef.update({PickPhase: false});
						 state.self.pickQuestion(row, col);
						 board.addClass("picked");
						 board.removeClass("unpicked");
					 }
					 else if(!state.playerSlot){
						 console.log("please join the game");
					 }
					else if(state.userId !== state.gameInfo.hotSeat){
						console.log("you are not in hotseat");
					}
				
				})
			
		});
	}																						 
	
})

const pickQuestion = (state) =>({
	pickQuestion: (row, col) =>{
		//console.log(row + " " + col);
		var qInfo = row + "/c" + col;
		var startTime = 15;
		
		state.CategoryRef.child(qInfo).on("value", function(snap){
			var catsInfo = snap.val();
			console.log(catsInfo);
			state.gameInfo.currentAnswer = catsInfo.Answer;
			state.gameInfo.currentQuestion = catsInfo.Clue;
			state.gameInfo.currentPoints = parseInt(col);
		});																	
		
		state.GameRef.update(
			{QuestionPhase: qInfo}
		)
		
		
		//start Question Timer
		state.TimersRef.child("Question").update({
				 Started: true
			 })
		
		state.questionTimer = setInterval(function(){
			console.log("timer goind");
			startTime -= 1;
			state.TimersRef.child("Question").update({				 
				 Time: startTime
			 })
			if(startTime <= 0){
				clearInterval(state.questionTimer);
				state.GameRef.update({
				 QuestionPhase: false,
				 PickPhase: true,
					TempSeat: false
			 })	
				state.TimersRef.child("Question").update({				 
				 Started: false
			 })
			}
			
			console.log(state.questionTimer);
		}, 1000)
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
		state.player1div.text(state.playerinfo.Player1.name + 
													state.playerinfo.Player1.points);
		state.player2div.text(state.playerinfo.Player2.name + 
													state.playerinfo.Player2.points);
		state.player3div.text(state.playerinfo.Player3.name + 
													state.playerinfo.Player3.points);
	}	
})
//when click join Game should look for open spot
// and open up start game button if not started
//should not activate if full
const joinGame = (state) => ({
	joinGame : () => {
		
		state.PlayersRef.child("PlayerInfo").once("value")
			.then(function(snap){
			var players = snap.val();			
			
			if(state.userId == players.Player1.uid || !players.Player1.uid){
				state.playerSlot = "Player1";
				state.self.setPlayer("Player1");
				state.self.setDisconnect(state.playerSlot);
				console.log("you are player1");
			}
			
			if(!state.gameInfo.hotSeat){
				state.GameRef.update({HotSeat: state.userId});
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
			console.log("please join game")
			return 
		}		

		if(state.gameInfo.gameStarted){
			
			console.log("game has laready started");
		}
		else{
			var gameStuff = {
				Started: true,
				HotSeat: state.userId,
				PickPhase: true
			}
			state.GameRef.update(gameStuff);
			
			console.log("starting game");
		}		
			
	}
})
//lets a player buzz in when question is read
//
const buzzGame = (state) => ({
	buzzGame : () => {
		 
		if(state.notAnswered && state.gameInfo.questionPhase && !state.gameInfo.tempSeat){
			state.notAnswered = false;
			state.GameRef.update({TempSeat:state.userId});
			
			console.log("buzzz");
		}
		else{
			console.log("no buzz allowed", state.gameInfo.currentAnswer, state.gameInfo.currentQuestion);
		}
			
	}
})
//gives answer to question
//award points or 
const answerQuestion = (state) => ({
	answerQuestion : () => {	 
		if(state.gameInfo.questionPhase && state.gameInfo.tempSeat == state.userId){
			
			//correct answer
			if(state.gameInfo.currentAnswer.toLowerCase() == state.answerInput.val().toLowerCase()){
				var newPoints = state.gameInfo.currentPoints + state.playerinfo[state.playerSlot].points;
				
				state.PlayersRef.child("PlayerInfo/" + state.playerSlot).update({
					points: newPoints
				})
			}
			//wrong answer
			else{
				console.log("wrong answer");
			}
			state.GameRef.update({TempSeat:false});
			
			
			
		}		
		
	}
})

const setDisconnect = (state) => ({
	setDisconnect : (playerSpot) => {
		console.log("disconnecting" , playerSpot);
		if(state.userId == state.gameInfo.hotSeat){
			 state.GameRef.onDisconnect().update({HotSeat: false});
		 }
		 wipe = {
			 Name: "",
			 points: 0,
			 uid: ""
		 }
		state.PlayersRef.child("PlayerInfo/" + playerSpot).onDisconnect().update(wipe);
			
	}
})


const bugo = (state) => ({
	bugo : (buglog) => {
		console.log(buglog);
	}
});

$(document).ready(function(){
	window.jepidy = Perildy();
	jepidy.init(jepidy);
})