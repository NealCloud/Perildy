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
		
		openModal : (state) => ({
				openModal : (elem) => {					
					//document.getElementById('loginChoice').style.display='block'
					//elem.style.display='block';
					$(elem).css("display", "block");				
				}
			}),	
		
		 	closeModal : (state) => ({
				closeModal : (elem) => {					
					//document.getElementById('loginChoice').style.display='block'
					//elem.style.display='block';
					$(elem).css("display", "none");				
				}
			})	
}
	Object.assign(
						pageUtil,
						main						 
							 
							 )
	
	
	
})(pageStuff)
