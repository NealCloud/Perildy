var fireStuff = {};

(function(fireUtil){
	
	const main = {
		
		 initFirebase : (state) => ({
			initFirebase : (onSignIn, onSignOut) =>{			
				// Shortcuts to Firebase SDK features.
				state.auth = firebase.auth();
				state.database = firebase.database();
				state.storage = firebase.storage();				  
			
				// Initiates Firebase auth and listen to auth state changes.
				//this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));  
				state.auth.onAuthStateChanged( (user) => state.self.onAuthStateChanged(user,  onSignIn, onSignOut));
				
				return new Promise(function(res, rej){					
					if(state.auth){
						 res();
					}
					else{
						rej('Firebase Failed to Load');
					}					
				})				
			}
		}),

		 onAuthStateChanged : (state) => ({
			 onAuthStateChanged : (user, callin, callout) => {			
					console.log("Auth has changed!");
					if(user){
						callin();					
					}					
					else{
						callout();							
					}
			 }
			}),

	//sign into firebase
	 signIn : (state) => ({
		// Sign in Firebase using popup auth and Google as the identity provider.
		signIn : (authType, loginCallback) => { 
			
			var provider = null;
			console.log(authType, loginCallback);
			switch(authType){
				case "facebook": provider = new firebase.auth.FacebookAuthProvider();
			 	break;
				case "google": 
				default: provider = new firebase.auth.GoogleAuthProvider();
					provider.addScope('profile');
			} 			 

			state.auth.signInWithPopup(provider)
			.catch(function(e){
					loginCallback(e);
			});
			
		 }
	}),
		//create database refs
		createRefs : (state) => ({
			createRefs : (refs, prefix) =>{
				var len = refs.length;
				
		    for(var i = 0; i < len; i++){
						state[refs[i] + "Ref"] = state.database.ref(prefix + refs[i]);					
				}					
			}	
		}),
		
		
		//signout firebase function
	 signOut : (state) => ({
		 
			signOut : () => {state.auth.signOut()}
		 
		})
		
}
	Object.assign(
						fireUtil,
						main						 
							 
							 )
	
	
	
})(fireStuff)
