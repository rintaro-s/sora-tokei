/*	apple用上書きモジュール	*/

//	テーマ及びUIの基本設定
$.mobiscroll.setDefaults({
	theme: 'ios',		//	material,ios,android-holo-light
	lang: _LANG,
	display: 'bottom',
	setText: UI_TEXT_DECISION
});



$(function($){
	
});



function onloadEach()
{
	//	iOSでテキストフィールドをタップしてもキーボードが出るだけで入力できないため、力技・・・
	$('#text_whisper').on('touchend',function(e){
		setTimeout( function(){
			var len = $('#text_whisper').val().length;
			document.getElementById('text_whisper').setSelectionRange(len, len);
			$(this).focus();
		},1000);
	});
}


function openBrowser(url)
{
	window.open(url,'_blank');
}


//============================
//	輝度コントロール
//============================
function setBrightness()
{

	if( udata.bright)
		location.href = 'bright://set';
}



//============================
//	GPSまわり
//============================

var gps_force = false;
function getGEO(force)
{

	if( !force)
	{
		if( localStorage.getItem(DEF_STORAGE_LOCATION_LON) != null)
		{
			gps_stat = true;
			return;
		}
	}


	gps_force = force;
	location.href = 'gps://get';
}
function setGeo( new_longitude, new_latitude)
{
	var lon = Number(localStorage.getItem(DEF_STORAGE_LOCATION_LON));
	var lat = Number(localStorage.getItem(DEF_STORAGE_LOCATION_LAT));

	var setgps = true;
	if( lon)
	{
		if( new_longitude > (lon-DEF_LOCATION_TOLERANCE_LON) && new_longitude < (lon+DEF_LOCATION_TOLERANCE_LON))
		{
			setgps = false;
		}
	}
	if( lat)
	{
		if( latitude > (lat-DEF_LOCATION_TOLERANCE_LAT) && latitude < (lat+DEF_LOCATION_TOLERANCE_LAT))
		{
			setgps = false;
		}
	}

	if( setgps || gps_force)
	{
		longitude = new_longitude;		//	経度
		latitude = new_latitude;			//	緯度
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
}

function errorGPS()
{
	gps_stat = false;
	localStorage.removeItem(DEF_STORAGE_LOCATION_STAT);

}






