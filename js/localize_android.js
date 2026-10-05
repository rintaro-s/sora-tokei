/*	ローカライズ(Android)	*/

$(function($){
	
	//	日本語メッセージ

});


var localeTextAndroid = {
};


function setLocalizaEach(lang)
{
	for( var key in localeTextAndroid)
	{
		document.getElementById(key).innerHTML = localeTextAndroid[key][lang].replace(/\{br\}/g,'<br>');
	}

	if( lang == 'en')
	{
		//	英語メッセージ
	}
}

