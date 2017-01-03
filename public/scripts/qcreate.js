const Lobby = (self) =>{
    state = {   
    //element holders			
			signInBtn : $("#signIn"),
			signOutBtn : $("#signOut"),		
			testBtn: $("#testBtn"),			
			//client info vars		
			refList : ["Files", "Games"],
			notRendered : true,	
			gamesList: {},
			//Server info vars	
									
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
	
		//event handlers
	  //allow if signed out
		state.signInBtn.on("click", function(e){
				state.self.signIn('google', state.self.bugo);
		})
		//allow if signed in
		state.signOutBtn.on("click", function(e){
				state.self.signOut();
		})
		
			state.mainDisplay.on("click", ".deleteGame", function(e){
				console.log("wat the heck");
				state.self.deleteGame($(this));
		})
			
			state.createGameBtn.on("click", function(e){				
				state.self.createGame();
		})
			
			state.testBtn.on("click", function(e){
				state.self.testMode();
		})
		
		state.fileLoader.on("change", function(e){
			console.log("chango");
			state.self.saveImageMessage(e);
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
			getQuestions(state),
			createGameJson(state),			
			createGame(state),
			//utility methods
			testMode(state),
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
		
		//check if game was rendered already
		if(state.notRendered){
				state.self.createRefs(state.refList, "");
			  state.notRendered = false;
				//state.self.loadGame();
		}							
	}
});


const createGame = (state) => ({
	createGame : () => {
		
		var name = state.userName.replace(' ', '');
		if(name in state.gamesList){
			if(state.gamesList[name]){
					console.log("game already made");
					return;
			}
		}
		state.self.getQuestions();
	}
})

const getQuestions = (state) => ({
	getQuestions : () => {	
		
		console.log("created Game Room");
		
		
		var myData = {count: 1, offset:0};
//		$.ajax({
//			 
//			url: 'http://www.jservice.io/api/random',
//			//data: myData,
//			type: 'GET',		
//			dataType: 'json',
//			//crossDomain: true,
//			success: function(data) { 
//				alert(data); 
//			},
//			error: function() { alert('Failed!'); },
//
//		});10044 text.replace(/\W+/g, " ")
//		
//		  $.getJSON("http://jservice.io/api/categories", myData, function(result){
//				    console.log(result);
//            $.each(result, function(i, field){
//							console.log(i, field);
//                $("#message").append(field.answer + " ");
//            });
//        });
		
//		  var perildyQ = "";
//		  $.getJSON("http://jservice.io/api/category", {id: 10044}, function(result){
//				    console.log(result, dummyData);
//					
//				    perildyQ = result;
//
//        });
		
		
		var xhttp;
		xhttp=new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				console.log(JSON.parse(this.responseText));
			}
	 	};
		xhttp.open("GET", "http://jservice.io/api/random/?count=1", true);
		xhttp.send();
		
		//gotten from param
		var newData = {Category: {}};
		Object.assign(newData, roomData.emptyRoom);	
		console.log(newData);
	
		state.self.createGameJson(newData, "Literacy", 1, dummyData);
		var updateObj = {};
		updateObj[state.userName] = newData;
		
		
		state.GamesRef.update(updateObj);
	//	state.self.createGameJson(newData, "Books N Stuff", 2, dummyData);
		
	}
})
const createGameJson = (state) => ({
	createGameJson : (catObj, catName, catCol, catData) => {		 
		
		var pointData = [100, 200, 300, 400, 500];
		
		
		var len = catData.length;
		
		var startInt = Math.floor((Math.random() * (len/5)) + 1);
	 		
		console.log(startInt);
		
		len = startInt * 5;
		
		catObj.Category['cat' + catCol] = {Name: catName};
		
		for(let i = len - 5, b = 0; i < len; i++, b++){			
			catObj.Category['cat' + catCol]["c" + pointData[b]] = {
				Clue: catData[i].question, 
				Answer: catData[i].answer.replace(/<\/?i[^>]*>/g,"").replace(/\W+/g, " ").trim(),
				done: false
			};
		}			
	}
});



const saveImageMessage = (state) => ({
	saveImageMessage : (event) => {	
		var file = event.target.files[0];
		console.log(file);
		var reader = new FileReader();
		var jsono = "";
    reader.onload = function(){
      var text = reader.result;
      console.log(reader.result.substring(0, 200));
			jsono = JSON.parse(reader.result);
			
			console.log(jsono);
    };
    reader.readAsText(file);
		
		
				
	//var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reader.result));
//	var dlAnchorElem = document.getElementById('downloadAnchorElem');
//	dlAnchorElem.setAttribute("href",     dataStr     );
//	dlAnchorElem.setAttribute("download", "scene.json");
//	dlAnchorElem.click();
//	}
		
//				var http = new XMLHttpRequest();
//				http.open('get', reader.result);
//				http.onreadystatechange = function () {
//						$("#message").text(http.responseText.replace(/\n/g, '<br>'));
//				};
//				http.send();
		

		
	}
		
})

const testMode = (state) => ({
	testMode : (buglog) => {
		console.log(state.gamesList);
	}
});

const bugo = (state) => ({
	bugo : (buglog) => {
		console.log(buglog);
	}
});

$(document).ready(function(){
	window.theLobby = Lobby();
	theLobby.init(theLobby);
})