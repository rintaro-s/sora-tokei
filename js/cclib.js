/*! js library (c) convex corporation ,ltd. */


//**************************************
//	定義
var CR = String.fromCharCode(13); // 改行コード (CR)
var LF = String.fromCharCode(10); // 改行コード (LF)
var TAB = String.fromCharCode(9); // タブコード

function RAD2DEG(rad){	return ((rad) * 180.0 / Math.PI);}
function DEG2RAD(deg){	return ((deg) * Math.PI / 180.0);}


//	改行削除
function delcr(str)
{
	var buf = str.replace(/\r\n/g, '');
	return buf.replace(/(\r|\n)/g, '');
}

//****************************************
//	前ゼロフォーマット
function fZero(keta,val)
{
	var str = '0000000000' + val;
	return str.substr(str.length-keta);
}

//****************************************
//	HTMLエンティティをデコード
function htmlspecialchars2str(str)
{
	var RegExpCode = [
		['&gt;', '>'],
		['&lt;', '<'],
		['&#039;', "'"],
		['&quot;', '"'],
		['&amp;', '&']
	];
	for(var i=0; i<RegExpCode.length; i++){
		var code = new RegExp(RegExpCode[i][0], 'igm');
		str = str.replace(code, RegExpCode[i][1]);
	}
	return str;
}

//****************************************
//	スタイルから各パラメータを取得
function extractionStyleValue(str,key)
{
	var re = null;
	re = new RegExp(key+': ?([0-9]+?)px','i');
	var buf = str.match(re);
	if( buf)
	{
		return parseInt(buf[1]);
	}

	return null;
}
//****************************************
//	スタイルから各パラメータを取得（複数対応）
function extractionStyleValueMulti(str,key)
{
	var re = null;
	re = new RegExp(key+': ?([0-9]+?)px','ig');
	var buf = str.match(re);
	if( buf)
	{
		return buf;
	}

	return null;
}
//****************************************
//	タグ内から各パラメータを取得
function extractionParamValue(str,key)
{
	var re = null;
	re = new RegExp(key+'=\"([0-9]+?)\"','i');
	var buf = str.match(re);
	if( buf)
	{
		return parseInt(buf[1]);
	}

	return null;
}

//****************************************
//	不要なスタイルを除去
function trimStyle(str)
{
	var rbuf = '';

	var normalcode = new RegExp('(<.*?style=\".*?)(font-family:.*?;)(.*\")>', 'igm');
	rbuf = str.replace(normalcode, '$1$3>');

	return rbuf;
}
//****************************************
//	全てのタグを除去
function trimTag(str)
{
	var normalcode = new RegExp('<(.*?)>', 'igm');
	return str.replace(normalcode, '');
}


function ccTauchEventName(ename)
{
	var agent = navigator.userAgent;
	if( agent.indexOf('iPhone') == -1 && agent.indexOf('iPad') == -1 && agent.indexOf('iPod') == -1 && agent.indexOf('Android') == -1)
	{
		if( ename == 'touchstart')	{	return 'mousedown';	}
		if( ename == 'touchend')	{	return 'mouseup';	}
		if( ename == 'touchmove')	{	return 'mousemove';	}
	}
	return ename;
}

//****************************************
//	タッチダウンイベント登録
function addTouchDownEvent(idname,func)
{
	var eventname = 'touchstart';
	var agent = navigator.userAgent;
	if( agent.indexOf('iPhone') == -1 && agent.indexOf('iPad') == -1 && agent.indexOf('iPod') == -1 && agent.indexOf('Android') == -1)
	{
		eventname = 'mousedown';
	}

	var obj = document.getElementById(idname);
	if( obj)
	{
		obj.addEventListener(eventname, func);
	}
}
function addTouchUpEvent(idname,func)
{
	var eventname = 'touchend';
	var agent = navigator.userAgent;
	if( agent.indexOf('iPhone') == -1 && agent.indexOf('iPad') == -1 && agent.indexOf('iPod') == -1 && agent.indexOf('Android') == -1)
	{
		eventname = 'mouseup';
	}

	var obj = document.getElementById(idname);
	if( obj)
	{
		obj.addEventListener(eventname, func);
	}
}
function addTouchMoveEvent(idname,func)
{
	var eventname = 'touchmove';
	var agent = navigator.userAgent;
	if( agent.indexOf('iPhone') == -1 && agent.indexOf('iPad') == -1 && agent.indexOf('iPod') == -1 && agent.indexOf('Android') == -1)
	{
		eventname = 'mousemove';
	}

	var obj = document.getElementById(idname);
	if( obj)
	{
		obj.addEventListener(eventname, func);
	}
}

//****************************************
//	タッチダウンイベント登録
function ua()
{
	var userAgent = window.navigator.userAgent.toLowerCase();
	var appVersion = window.navigator.appVersion.toLowerCase();

	if (userAgent.indexOf('msie') != -1)
	{
		//IE6～9（おそらく）
		if (appVersion.indexOf('msie 6.') != -1)
		{
			//IE6での処理
		}
		else if (appVersion.indexOf('msie 7.') != -1)
		{
			//IE7での処理
		}
		else if (appVersion.indexOf('msie 8.') != -1)
		{
			//IE8での処理
		}
		else if (appVersion.indexOf('msie 9.') != -1)
		{
			//IE9での処理
		}
		return 'ie';

	}
	else if (userAgent.indexOf('chrome') != -1)
	{
		return 'chrome';
	}
	else if (userAgent.indexOf('safari') != -1)
	{
		return 'safari';
	}
	else if (userAgent.indexOf('firefox') != -1)
	{
		return 'firefox';
	}
	return '';
}




