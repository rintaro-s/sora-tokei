/*	ローカライズ(iOS)	*/

$(function($){
	
	//	日本語メッセージ

});


var localeTextiOS = {
};


function setLocalizaEach(lang)
{
	for( var key in localeTextiOS)
	{
		document.getElementById(key).innerHTML = localeTextiOS[key][lang].replace(/\{br\}/g,'<br>');
	}

	if( lang == 'en')
	{
		//	英語メッセージ
	}

}


