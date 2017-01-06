const Lobby = (self) =>{
    state = {   
    //element holders			
			signInBtn : $("#signIn"),
			signOutBtn : $("#signOut"),			
			fileLoader :$("#mediaCapture"),
			jservice : $("#jservice"),
			mainDisplay : $("#mainDisplay"),
			deleteBtn: $(".deleteGame"),
			gameSlots: $("#gameSlots"),
			testBtn: $("#testBtn"),
			createGameBtn: $("#createBtn"),
			createGameDiv: $("#gameCreate"),
			randomCatBtn: $("#randomCatBtn"),
			snackbarDiv: $("#snackbar"),
			loginChoice: $("#loginChoice"),
			googleSignIn: $("#googleSignIn"),
			//client info vars		
			refList : ["Files", "Games", "Categories", "Questions"],
			notRendered : true,	
			catsLoaded: false,
			gamesList: {},
			categoriesList: {},
			maxCats: 2,
			catHolder: [],
			testholder: null,
			//Server info vars	
									
			//must be initialized
			init: (self) => {
				//to give access to composition methods
				state.self = self;
				//w3 stuff
				//w3DisplayData("mainbody", {"number" : state.maxCats});
				//firebase starting
				state.self.initFirebase( state.self.onSignIn, state.self.onSignOut)				  
					.then(() => console.log('firebase started'))
					.catch((e) => console.log(e))
				
				
			}
		}
	  //hide certain elements at start
		state.createGameDiv.hide();
	  state.snackbarDiv.hide();
		//event handlers
	  //allow if signed out
		state.signInBtn.on("click", function(e){
			  state.self.snackbar("signing in");
				state.self.openModal("#loginChoice");
//				state.self.signIn('google', state.self.bugo);
		})
		//allow if signed in
		state.signOutBtn.on("click", function(e){
				state.self.signOut();
		})
		
		$('body').on("click","#googleSignIn", function(e){			
				state.self.signIn("google");
			  state.self.closeModal("#loginChoice");
		})
		
		$('body').on("click","#perilSignIn", function(e){
				state.self.closeModal("#loginChoice");
				state.self.openModal("#loginPeril");
			  
		})
		
		$('body').on("click","#perilCreate", function(e){
				state.self.closeModal("#loginChoice");
				state.self.openModal("#loginCreate");
			  
		})
//		
		$('body').on("click","#createPeril", function(e){
			  
				e.preventDefault();			  
				var $inputs = $('#createForm :input');

			// not sure if you wanted this, but I thought I'd add it.
			// get an associative array of just the values.
				var values = {};
				$inputs.each(function() {
						values[this.name] = $(this).val();
				});				
			
							
			  state.self.createLogin(values.usrname, values.psw, function(){
					state.self.closeModal("#loginCreate");
				});
		})			
		
		
		$('body').on("click", "#loginPerilBtn", function(e){
			  
				e.preventDefault();			  
				var $inputs = $('#loginForm :input');

			// not sure if you wanted this, but I thought I'd add it.
			// get an associative array of just the values.
				var values = {};
				$inputs.each(function() {
						values[this.name] = $(this).val();
				});			
							
			
			  state.self.accountLogin(values.usrname, values.psw, function(){
					state.self.closeModal("#loginPeril");
				});
		})			
		

		
			state.mainDisplay.on("click", ".deleteGame", function(e){
				
						
				state.self.deleteGame($(this));
		})
			
			state.createGameBtn.on("click", function(e){
				
				state.self.createGame();
		})
			
			state.randomCatBtn.on("click", function(e){
			  if(state.catHolder.length < state.maxCats){
					state.self.pickGameCats("");
				}
				
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
			fireStuff.createLogin(state),
			fireStuff.accountLogin(state),
			//game state methods
			onSignIn(state),
			onSignOut(state),
			loadGame(state),	
			saveImageMessage(state),
			getQuestions(state),
			createGameJson(state),
			deleteGame(state),
			createGame(state),
			loadCats(state),
			pickGameCats(state),
			appendCat(state),
			curryMaster(state),
			//utility methods
			pageStuff.snackbar(state),
			pageStuff.bugo(state),
			pageStuff.openModal(state),
			pageStuff.closeModal(state),
			testMode(state)		
			
		)
}
//mandatory signIn / signOut functions triggered on Auth Change
const onSignOut = (state) => ({
	onSignOut : () => {
		state.self.snackbar("you are signed out :(")
		state.signInBtn.show();
		state.signOutBtn.hide();
		state.mainDisplay.hide();
		state.createGameBtn.hide();
	  state.testBtn.hide();
	}
});
//this can trigger periodicly even when no auth has changed be Ready
const onSignIn = (state) => ({
	onSignIn : () => {	
		state.self.snackbar('you are signed in!');
		console.log(state.auth.currentUser);
		state.userId = state.auth.currentUser.uid;	
		
		if(state.auth.currentUser.providerData["0"].providerId == "password"){
			var name = /([^@]+)/.exec(state.auth.currentUser.email);
			state.userName = name[0];		
		}else{
			state.userName = state.auth.currentUser.displayName;
		}
		
		
		state.signOutBtn.show();
		state.signInBtn.hide();
		state.mainDisplay.show();
		state.createGameBtn.show();
	  state.testBtn.show();
		//check if already in player slot and reassign disconnect
		
		//check if game was rendered already
		if(state.notRendered){
				state.self.createRefs(state.refList, "");
			  state.notRendered = false;
				state.self.loadGame();
		}							
	}
});



//load game should only happen once
const loadGame = (state) => ({
	loadGame : () => {	
		console.log("loading Games");
		
		state.GamesRef.on('child_added', addGame);
		state.GamesRef.on('child_removed', removeGame); 	
		var noSpaceId = "";
		
		function addGame(snap){			
			noSpaceId = snap.key.replace(' ', '');
			state.gamesList[noSpaceId] = true;
			var newGame = $("<li>", {	
				id: noSpaceId,
				class: "gameItem",
				html: "<a href='perody.html#" + snap.key + "'>" + snap.key + "'s Game</a><span class='deleteGame' datakey='" + snap.key + "' >X</span>"
			})
			state.mainDisplay.append(newGame);
		}
		
		function removeGame(snap){			
			noSpaceId = snap.key.replace(' ', '');
			state.gamesList[noSpaceId] = false;
			state.self.snackbar("someone deleted ", noSpaceId);
			$("#" + noSpaceId).remove();
		}
	}
})

const loadCats = (state) => ({
	loadCats : () => {
		state.catsLoaded = true;
		
		state.CategoriesRef.once("value", function(snap){
			state.categoriesList = snap.val();
		})
		
		state.CategoriesRef.on("child_added", function(snap){			
			state.categoriesList[snap.key] = snap.val();
		})
	}
})


const createGame = (state) => ({
	createGame : () => {
		

		var name = state.userName.replace(' ', '');
		if(name in state.gamesList){
			if(state.gamesList[name]){
					state.self.snackbar("your game is still running");
					return;
			}
		}
		
		if(!state.catsLoaded){
			state.self.snackbar("ok pick your categories");
			state.self.loadCats();
			state.createGameDiv.show();
			state.createGameBtn.hide();
		}
		
//		state.self.getQuestions();
	}
})
const pickGameCats = (state) => ({
	pickGameCats : (cat) => {
		var catTempHolder = {};	
	
		if(cat){
			//TODO test this PLZ
				catTempHolder.id = cat;
			  catTempHolder.title = state.categoriesList[cat];
				
				state.catHolder.push(catTempHolder);
			
				state.self.appendCat(cat);
			}
		else{
			var keys = Object.keys(state.categoriesList)
    	keyId = keys[ keys.length * Math.random() << 0];
			
			catTempHolder.id = keyId;
			catTempHolder.title = state.categoriesList[keyId];

			state.catHolder.push(catTempHolder);
			state.self.appendCat(state.categoriesList[keyId])
		}
			
		if(state.catHolder.length >= state.maxCats){
					//console.log("creating game now!", state.catHolder);
					for(let i = 0; i < state.maxCats; i++){	

							state.QuestionsRef.child(state.catHolder[i].id).once("value", function(snap){						
							state.catHolder[i].clues = snap.val().clues; 				
						}).then(function(){
								if(i == state.maxCats - 1){
									//console.log(state.catHolder);
									state.self.getQuestions();
								}
						})					
					}	
		}
				
	}
	
})

const appendCat = (state) => ({
 appendCat : (title)=>{
	 
	  var catDiv = $("<li>", {
			text: title,
			class: "titleBlock"
		})
		
		state.createGameDiv.append(catDiv);
 }	
})

const getQuestions = (state) => ({
	getQuestions : () => {			
		
		state.self.snackbar("creating your game");
		state.createGameDiv.hide();
		var myData = {count: 1, offset:0};

		var newData = {Category: {}};
		Object.assign(newData, roomData.emptyRoom);	
		console.log(newData);
		
		for(let i = 0; i < state.maxCats; i++){			
			state.self.createGameJson(newData, state.catHolder[i].title, i + 1, state.catHolder[i].clues)
		}
	
//		state.self.createGameJson(newData, "Literacy", 1, dummyData);
//		state.self.createGameJson(newData, "Literacy", 2, dummyData);
		
		//object to update server data
		var updateObj = {};
		//tie to users name
		var gameName = state.userName.replace( /\W/g , '');
		updateObj[gameName] = newData;
		
		console.log(updateObj);
		
		state.GamesRef.update(updateObj);
		
		state.createGameDiv.hide();
	//	state.self.createGameJson(newData, "Books N Stuff", 2, dummyData);
		
	}
})

//creates a category
const createGameJson = (state) => ({
	createGameJson : (catObj, catName, catCol, catData) => {		 
		
		var pointData = [1, 2, 3, 4, 5];	
		
		
		var len = catData.length;
		
		var startInt = Math.floor((Math.random() * (len/5)) + 1);	 		
		
		
		len = startInt * 5;
		
		catObj.Category['cat' + catCol] = {Name: catName};
		
		for(let i = len - 5, b = 0; i < len; i++, b++){	
			
			if(!catData[i].hasOwnProperty("value")){
				   catData[i].value = 400;
			}
			
			catObj.Category['cat' + catCol]["c" + b] = {
				Points: catData[i].value,
				Clue: catData[i].question, 
				Answer: catData[i].answer.replace(/<\/?i[^>]*>/g,"").replace(/\W+/g, " ").trim(),
				done: false
			};
		}			
	}
});

const deleteGame = (state) => ({
	deleteGame : (e) => {
		var gameName = e.attr("datakey");
		state.self.snackbar('you just deleted ', gameName);
		state.GamesRef.child(gameName).remove();
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
		state.self.snackbar("don't click this again thanks");
	}
});

const curryMaster = (state) => ({
	curryMaster : () =>{
		
	}	
})

$(document).ready(function(){
	w3IncludeHTML();
	window.theLobby = Lobby();
	theLobby.init(theLobby);
})
// Initializes FriendlyChat.
function FriendlyChat() {
  
}


// Loads chat messages history and listens for upcoming ones.
FriendlyChat.prototype.loadMessages = function() {
  // Reference to the /messages/ database path.
  this.messagesRef = this.database.ref('messages');
  // Make sure we remove all previous listeners.
  this.messagesRef.off();

  // Loads the last 12 messages and listen for new ones.
  var setMessage = function(data) {
    var val = data.val();
    this.displayMessage(data.key, val.name, val.text, val.photoUrl, val.imageUrl);
  }.bind(this);
  this.messagesRef.limitToLast(12).on('child_added', setMessage);
  this.messagesRef.limitToLast(12).on('child_changed', setMessage);
};


// Sets the URL of the given img element with the URL of the image stored in Firebase Storage.
FriendlyChat.prototype.setImageUrl = function(imageUri, imgElement) {
  // If the image is a Firebase Storage URI we fetch the URL.
	console.log(imageUri);
  if (imageUri.startsWith('gs://')) {
    imgElement.src = FriendlyChat.LOADING_IMAGE_URL; // Display a loading image first.
    this.storage.refFromURL(imageUri).getMetadata().then(function(metadata) {
      imgElement.src = metadata.downloadURLs[0];
    });
  } else {
    imgElement.src = imageUri;
  }
};

// Saves a new message containing an image URI in Firebase.
// This first saves the image in Firebase storage.
FriendlyChat.prototype.saveImageMessage = function(event) {
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  this.imageForm.reset();

  // Check if the file is an image.
  if (!file.type.match('image.*')) {
    var data = {
      message: 'You can only share images',
      timeout: 2000
    };
    this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
    return;
  }

  // Check if the user is signed-in
  if (this.checkSignedInWithMessage()) {

    // We add a message with a loading icon that will get updated with the shared image.
    var currentUser = this.auth.currentUser;
    this.messagesRef.push({
      name: currentUser.displayName,
      imageUrl: FriendlyChat.LOADING_IMAGE_URL,
      photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
    }).then(function(data) {
      // Upload the image to Firebase Storage.
      this.storage.ref(currentUser.uid + '/' + Date.now() + '/' + file.name)
          .put(file, {contentType: file.type})
          .then(function(snapshot) {
            // Get the file's Storage URI and update the chat message placeholder.
            var filePath = snapshot.metadata.fullPath;
            data.update({imageUrl: this.storage.ref(filePath).toString()});
          }.bind(this)).catch(function(error) {
            console.error('There was an error uploading a file to Firebase Storage:', error);
          });
    }.bind(this));
  }
};


// Returns true if user is signed-in. Otherwise false and displays a message.
FriendlyChat.prototype.checkSignedInWithMessage = function() {
  // Return true if the user is signed in Firebase
  if (this.auth.currentUser) {
    return true;
  } 
  return false;
};

// Resets the given MaterialTextField.
FriendlyChat.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

// Template for messages.
FriendlyChat.MESSAGE_TEMPLATE =
    '<div class="message-container">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="message"></div>' +
      '<div class="name"></div>' +
    '</div>';

// A loading image URL.
FriendlyChat.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';

// Displays a Message in the UI.
FriendlyChat.prototype.displayMessage = function(key, name, text, picUrl, imageUri) {
  var div = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = FriendlyChat.MESSAGE_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', key);
    this.messageList.appendChild(div);
  }
  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
  }
  div.querySelector('.name').textContent = name;
  var messageElement = div.querySelector('.message');
  if (text) { // If the message is text.
    messageElement.textContent = text;
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  } else if (imageUri) { // If the message is an image.
    var image = document.createElement('img');
    image.addEventListener('load', function() {
      this.messageList.scrollTop = this.messageList.scrollHeight;
    }.bind(this));
    this.setImageUrl(imageUri, image);
    messageElement.innerHTML = '';
    messageElement.appendChild(image);
  }
  // Show the card fading-in and scroll to view the new message.
  setTimeout(function() {div.classList.add('visible')}, 1);
  this.messageList.scrollTop = this.messageList.scrollHeight;
  this.messageInput.focus();
};



