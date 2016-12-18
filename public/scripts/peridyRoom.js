

const Perildy = (self) =>{
    state = {   
    //element holders			
			signInBtn : $("#signIn"),
			signOutBtn : $("#signOut"),			
			joinGameBtn : $("#joinGame"),
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
			
			refList : ["Players", "Timers", "Category"],
			
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
			updatePlayerInfo(state),
			renderPlayerInfo(state),
			
			
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
		console.log("loading game");
		state.self.updatePlayerInfo();
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


const bugo = (state) => ({
	bugo : (buglog) => {
		console.log(buglog);
	}
});

$(document).ready(function(){
	window.jepidy = Perildy();
	jepidy.init(jepidy);
})