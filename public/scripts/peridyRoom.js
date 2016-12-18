

const Perildy = (self) =>{
    state = {   
    //element holders			
			signInBtn : $("#signIn"),
			signOutBtn : $("#signOut"),			
			joinGameBtn : $("#joinGame"),
			startGameBtn: $("#startGame"),
			buzzerBtn: $("#buzzer"),
			answerBtn: $('#answerBtn'),
			answerInput: $("#answerInput"),
			playerSlots : $("#playerSlots"),
			player1div : $("#player1"),
			player2div : $("#player2"),
			player3div : $("#player3"),
			
			playerinfo : {},
			gameName : window.location.hash.substr(1),
			
			notRendered : true,			
			playerSlot: false,
			gameStarted: false,
			currentHost: false,
			
			refList : ["Players", "Timers", "Category", "Game"],
			
			init: (self) => {
				state.self = self;	
				state.self.initFirebase( state.self.onSignIn, state.self.onSignOut)				  
					.then(() => console.log('firebase started'))
					.catch((e) => console.log(e))
			}
			
		}
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

		return Object.assign(
			
			{init: state.init},
			
			fireStuff.initFirebase(state),
			fireStuff.onAuthStateChanged(state),
			fireStuff.signIn(state),
			fireStuff.signOut(state),
			fireStuff.createRefs(state),
			
			onSignIn(state),
			onSignOut(state),
			loadGame(state),
			joinGame(state),
			startGame(state),
			updatePlayerInfo(state),
			renderPlayerInfo(state),
			updateGameBoard(state),
			buzzGame(state),
			answerQuestion(state),
			checkGameInput(state),
			
			bugo(state)
		)
}
//mandatory signIn / signOut functions
const onSignOut = (state) => ({
	onSignOut : () => {
		state.signInBtn.show();
		state.signOutBtn.hide();
	}
});

const onSignIn = (state) => ({
	onSignIn : () => {
		state.self.createRefs(state.refList, "Games/" + state.gameName + "/");
		console.log('signed in!');
		state.signOutBtn.show();
		state.signInBtn.hide();
		if(state.notRendered){
			  state.notRendered = false;
				state.self.loadGame();
		}							
	}
});

const loadGame = (state) => ({
	loadGame : () => {
		
		
		state.PlayersRef.child("PlayerSlots").on("value", function(){
			//check Player info
			
		})
		
		state.joinGameBtn.show();		
		state.self.updatePlayerInfo();
		state.self.updateGameBoard();
	}
})

const updateGameBoard = (state) => ({
	updateGameBoard : ()=> {
		state.CategoryRef.on("value", function(data){
			var cats = data.val();
			var len = cats.length;		
			
			for(var i = 1; i < len; i++ ){			
				
				var title = $("<div>", {
					text: cats[i].Name,
					class: "cluetitle"
				})
				
				var q1 = $("<div>",{
					text: cats[i]["100"].Clue,
					class: "clues"
				})
					var q2 = $("<div>",{
					text: cats[i]["200"].Clue,
					class: "clues"
				})
				
				$("#gameBoard").append(title, q1, q2);
				
				
			}
			
			$("#gameBoard").on("click", ".clues", function(){
					 console.log(this);
				})
			
		});
	}																						 
	
})

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
				
				state.playerinfo["player" + i] = tempInfo;
			}
			state.self.renderPlayerInfo();
		})	
		
	}	
})

const renderPlayerInfo = (state) => ({
	renderPlayerInfo : () =>{		
		state.player1div.text(state.playerinfo.player1.name + 
													state.playerinfo.player1.points);
		state.player2div.text(state.playerinfo.player2.name + 
													state.playerinfo.player2.points);
		state.player3div.text(state.playerinfo.player3.name + 
													state.playerinfo.player3.points);
	}	
})

const joinGame = (state) => ({
	joinGame : () => {
		 
		if(!state.notRendered){
			
			console.log(state.playerinfo );
		}
			
	}
})

const startGame = (state) => ({
	startGame : () => {
			if(state.self.checkGameInput(state.GameRef.child("Started"))){
				console.log("game has laready started");
			}
		else{
			console.log("starting game");
		}
			
			
	}
})

const buzzGame = (state) => ({
	buzzGame : () => {
		 
		if(!state.notRendered){
			
			console.log("buzzz" );
		}
			
	}
})

const answerQuestion = (state) => ({
	answerQuestion : () => {
		 
		if(!state.notRendered){
			
			state.self.checkGameInput(state.GameRef.child("HotSeat"))
		}
			
	}
})

const checkGameInput = (state) => ({
	checkGameInput : (ref, child) => {
		 
		ref.once("value", function(snap){
			var input = snap.val();
			return input;
		})
			
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