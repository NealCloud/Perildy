var roomData = {
	
	"Files":{
		"Test": true
	},	
	
		"emptyRoom":{
			"Players" :{	
					"PlayerInfo":{
							"Player1":{
								"Name" : "",
								"uid" : "",
								"points" : 0,
								"chat" : ""
							},						
							"Player2":{
								"Name" : "",
								"uid" : "",
								"points" : 0,
								"chat" : ""
							},						
							"Player3":{
								"Name" : "",
								"uid" : "",
								"points" : 0,
								"chat" : ""
							}			
				}
			},	

			"Timers" : {
				"Answer" : {
					"Started" : false,
					"Pause" : false,
					"Time" : 0
				},
				"Game" : {
					"Started" : false,
					"Pause" : false,
					"Time" : 0
				},
				"Question" : {
					"Started" : false,
					"Pause" : false,
					"Time" : 0
				}
			},

			"Game":{
				"Started": false,
				"HotSeat" : false,
				"TempSeat" : false,
				"PickPhase": false,
				"QuestionPhase": false,
				"totalQuestions": 0
			}		

			
		}
	

}
var dummyData = [ 
	{ 
		airdate: "2007-07-17T12:00:00.000Z" ,
		answer: "Fauntleroy" ,
		category_id: 10044, 
		game_id: null, 
		id: 76654, 
		invalid_count: null,
		question: "In a novel by Frances Hodgson Burnett, 7-year-old Cedric Errol inherits a title & is known as Little Lord this",
		value: 200
	},
		{
			airdate: "2007-07-17T12:00:00.000Z",
			answer: "<i>A Wrinkle in Time</i>",
			category_id: 10044,
			game_id: null,
			id: 76660,
			invalid_count: null,
			question: "This classic is the first book in Madeleine L'Engle's Time Quartet",
			value: 400
		},
	{ 
		airdate: "2007-07-17T12:00:00.000Z",
	 answer: "<i>Peter Pan</i>",
	 category_id: 10044,
	 game_id: null,
	 id: 76666,
	 invalid_count: null,
	 question: "This story begins, All children, except one, grow up",
	 value: 600,
	},
		{
			airdate: "2007-07-17T12:00:00.000Z",
		 answer: "...<i>Hear My Cry</i>",
		 category_id: 10044,
		 game_id: null,
		 id: 76672,
		 invalid_count: null,
		 question: "Completes the title of a classic about an African-American family Roll of Thunder...",
		 value: 800
		},
{
	airdate: "2007-07-17T12:00:00.000Z",
 answer: "Scott O\'Dell",
 category_id: 10044,
 game_id: null,
 id: 76678,
 invalid_count: null,
 question: "The Black Pearl & The Island of the Blue Dolphins are 2 classics by him",
 value: 1000
},
{
	airdate: "2009-07-22T12:00:00.000Z",
	answer: "Lilliput",
	category_id: 10044,
	game_id: null,
	id: 87694,
	invalid_count: null,
	question: "In Gulliver's Travels, the sizes in this land are reduced to 1/12",
	value: 200
},
{
	airdate: "2009-07-22T12:00:00.000Z",
	answer: "Adam",
	category_id: 10044,
	game_id: null,
	id: 87700,
	invalid_count: null,
	question: "Paradise Lost calls him The goodliest man of men since born his sons",
	value: 400
},
{
	airdate: "2009-07-22T12:00:00.000Z",
	answer: "Denmark",
	category_id: 10044,
	game_id: null,
	id: 87706,
	invalid_count: null,
	question: "Beowulf, prince of the Geats of southern Sweden, sails off to this country to fight the monster Grendel",
	value: 600
	},
	{
	airdate: "2009-07-22T12:00:00.000Z",
	answer: "Denmark",
	category_id: 10044,
	game_id: null,
	id: 87706,
	invalid_count: null,
	question: "Beowulf, prince of the Geats of southern Sweden, sails off to this country to fight the monster Grendel",
	value: 800
	},
	{
	airdate: "2009-07-22T12:00:00.000Z",
	answer: "Denmark",
	category_id: 10044,
	game_id: null,
	id: 87706,
	invalid_count: null,
	question: "Beowulf, prince of the Geats of southern Sweden, sails off to this country to fight the monster Grendel",
	value: 1000
	}
	
	]