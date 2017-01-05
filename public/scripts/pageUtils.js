var pageStuff = {};

(function(pageUtil){
	
	const main = {
		
		  bugo : (state) => ({
				bugo : (buglog) => {
					console.log(buglog);
				}
			}),	
		
		 snackbar : (state) => ({
				snackbar : (text) => {
					
					state.snackbarDiv.show().text(text);
    			setTimeout(function(){ state.snackbarDiv.hide() }, 3000);
				}
			}),	
		
}
	Object.assign(
						pageUtil,
						main						 
							 
							 )
	
	
	
})(pageStuff)
