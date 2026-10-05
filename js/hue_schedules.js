
/*	各時刻の照明設定	*/

var hue_schedules = {

//	夜明け前
	sunrise: [
		{
			per: 0,
			body:{
				'on':	true,
				'bri':	0,
				'xy':	[	0.016,	0.056	]	//	0%
			}
		},
		{
			per: 0.2,
			body:{
				'on':	true,
				'bri':	0,
				'xy':	[	0.484,	0.366	]	//	20%
			}
		},
		{
			per: 0.3,
			body:{
				'on':	true,
				'bri':	64,
				'xy':	[	0.504,	0.358	]	//	30%
			}
		},
		{
			per: 0.65,
			body:{
				'on':	true,
				'bri':	109,
				'xy':	[	0.534,	0.364	]	//	65%
			}
		},
		{
			per: 1,
			body:{
				'on':	true,
				'bri':	254,
				'xy':	[	0.556,	0.348	]	//	100%
			}
		}
	],

//	午前中
	noon: [
		{
			per: 0.25,
			body:{
				'on':	true,
				'bri':	254,
				'xy':	[	0.314,	0.308	]	//	25%
			}
		},
		{
			per: 0.5,
			body:{
				'on':	true,
				'bri':	254,
				'xy':	[	0.282,	0.27	]	//	50%
			}
		},
		{
			per: 1,
			body:{
				'on':	true,
				'bri':	254,
				'xy':	[	0.22,	0.26	]	//	100%
			}
		}
	],

//	午後
	sunset: [
		{
			per: 0.2,
			body:{
				'on':	true,
				'bri':	204,
				'xy':	[	0.342,	0.362	]	//	D020
			}
		},
		{
			per: 0.45,
			body:{
				'on':	true,
				'bri':	160,
				'xy':	[	0.342,	0.362	]	//	D045
			}
		},
		{
			per: 0.65,
			body:{
				'on':	true,
				'bri':	130,
				'xy':	[	0.432,	0.402	]	//	D065
			}
		},
		{
			per: 0.85,
			body:{
				'on':	true,
				'bri':	100,
				'xy':	[	0.5,	0.442	]	//	D085
			}
		},
		{
			per: 1,
			body:{
				'on':	true,
				'bri':	80,
				'xy':	[	0.5,	0.456	]	//	100%
			}
		}
	],

//	日の入り
	night: [
	//	夜更け
		{
			per: 0.5,
			body:{
				'on':	true,
				'bri':	0,
				'xy':	[	0.508,	0.432	]	//	50%
			}
		},
		{
			per: 0.8,
			body:{
				'on':	true,
				'bri':	0,
				'xy':	[	0.2,	0.216	]	//	80%
			}
		},
		{
			per: 1,							//	100%
			body:{
				'on':	false,
				'bri':	0,
				'xy':	[	0.0,	0.0	]
			}
		}
	]
};


