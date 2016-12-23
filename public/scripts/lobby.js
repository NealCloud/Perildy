const Lobby = (self) =>{
    state = {   
    //element holders			
			signInBtn : $("#signIn"),
			signOutBtn : $("#signOut"),			
			fileLoader :$("#mediaCapture"),
			jservice : $("#jservice"),
			//client info vars		
			refList : ["Players", "Timers", "Category", "Game"],
			notRendered : true,	
			
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
		
			state.jservice.on("click", function(e){
				state.self.getQuestions();
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
			saveImageMessage(state),
			getQuestions(state),
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
		
		//check if game was rendered already
		if(state.notRendered){
				state.self.createRefs(state.refList, "Files/");
			  state.notRendered = false;
				state.self.loadGame();
		}							
	}
});
//load game should only happen once
const loadGame = (state) => ({
	loadGame : () => {	
		console.log("gamea loaded");
		
		
	}
})

const getQuestions = (state) => ({
	getQuestions : () => {	
		console.log("gamea loaded");
		var myData = {count: 1};
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
//		});
//		
		  $.getJSON("http://jservice.io/api/random", myData, function(result){
				    console.log(result);
            $.each(result, function(i, field){
							console.log(i, field);
                $("#message").append(field.answer + " ");
            });
        });
//		
	}
})

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
  

const bugo = (state) => ({
	bugo : (buglog) => {
		console.log(buglog);
	}
});

$(document).ready(function(){
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



