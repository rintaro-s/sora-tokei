/*	Android用上書きモジュール	*/

//	テーマ及びUIの基本設定
$.mobiscroll.setDefaults({
	theme: 'material',		//	material,ios,android-holo-light
	lang: _LANG,
	display: 'bottom',
	setText: UI_TEXT_DECISION
});


$(function($){

});

function openBrowser(url)
{
	if( typeof(android) != 'undefined')
	{
		android.openBrowser(url);
	}
}

function setBrightness()
{
	if( typeof(android) != 'undefined')
	{
		if( udata.bright)
			android.toggleBright(1.0);
	}
}

//============================
//	GPSまわり
//============================
function getGEO(force)
{

	var lon = Number(localStorage.getItem(DEF_STORAGE_LOCATION_LON));
	var lat = Number(localStorage.getItem(DEF_STORAGE_LOCATION_LAT));

	if (navigator.geolocation) 
	{

		navigator.geolocation.getCurrentPosition( (function(lon,lat,force){	return function(p){

			var setgps = true;
			if( lon)
			{
				if( p.coords.longitude > (lon-DEF_LOCATION_TOLERANCE_LON) && p.coords.longitude < (lon+DEF_LOCATION_TOLERANCE_LON))
				{
					setgps = false;
				}
			}
			if( lat)
			{
				if( p.coords.latitude > (lat-DEF_LOCATION_TOLERANCE_LAT) && p.coords.latitude < (lat+DEF_LOCATION_TOLERANCE_LAT))
				{
					setgps = false;
				}
			}

			if( setgps || force)
			{
				longitude = p.coords.longitude;		//	経度
				latitude = p.coords.latitude;		//	緯度

				localStorage.setItem(DEF_STORAGE_LOCATION_LON,longitude);
				localStorage.setItem(DEF_STORAGE_LOCATION_LAT,latitude);
			}
			else
			{
				longitude = lon;
				latitude = lat;
			}
			gps_stat = true;
			localStorage.setItem(DEF_STORAGE_LOCATION_STAT, '1');

		}})(lon,lat,force),
		function(){

			gps_stat = false;
			localStorage.removeItem(DEF_STORAGE_LOCATION_STAT);

		});
	}
	else
	{
		gps_stat = false;
		localStorage.removeItem(DEF_STORAGE_LOCATION_STAT);
	}

}







