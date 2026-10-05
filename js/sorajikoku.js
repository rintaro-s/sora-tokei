
const _VERSION = '1.3.1';

//	デフォルト（東京-江戸城天守閣）
var longitude = 139.75442469120026;		//	経度
var latitude = 35.68833496446526;		//	緯度
var gps_stat = false;

//	デフォルト起床、終業時刻
const DEF_SUNRIZE = 6;
const DEF_SUNSET = 18;

const DEF_LON_1M = 0.000010966382364;		//	1mあたり経度
const DEF_LAT_1M = 0.000008983148616;		//	1mあたり緯度
const DEF_LOCATION_TOLERANCE_LON = DEF_LON_1M * 50000;		//	再取得不要範囲(50km)
const DEF_LOCATION_TOLERANCE_LAT = DEF_LAT_1M * 50000;		//	再取得不要範囲(50km)

const URL_CLOCKINFO = 'https://sora-tokei.com/lite/data/recvclockinfo.php';

//	Private Clock Cloud
const URL_PCC_REQUEST = 'https://private-clock.cloud/reqparam/';


const DEF_TWILIGHT_SUNRISE_MIN = 80;		//	日の出前薄明80分
const DEF_TWILIGHT_SUNSET_MIN = 60;		//	日の出前薄明60分

//	localstorage名
const DEF_STORAGE_SORAJIKOKU = 'sorajikoku-lite.1';						//	設定時刻
const DEF_STORAGE_NAVI_FIRST = 'sorajikoku-lite.1.navi_first';			//	初めて起動するか
const DEF_STORAGE_LOCATION_LON = 'sorajikoku-lite.1.location.lon';		//	取得した経度
const DEF_STORAGE_LOCATION_LAT = 'sorajikoku-lite.1.location.lat';		//	取得した緯度
const DEF_STORAGE_LOCATION_STAT = 'sorajikoku-lite.1.location.stat';		//	１度でも取得したものか	0...していない、1...している
const DEF_STORAGE_LSP = 'sorajikoku-lite.1.LSP';							//	LSPログ(LifeStylePoint)


const DEF_STORAGE_UPDATE_INFO = 'soratokei-lite.1.update.info';		//	更新内容のお知らせを表示	0...していない、1...した


const WHISPER_TIME = 8000;	//	max26文字、8秒表示
var timer_whisper = null;
const DEF_WHISPER_MODE = 2;	//	デフォルト　はじまりだけ表示する


var SwipeDuration = 200;


//	リソース
var preload;
var stage;
var instSkyMap = null;

var	imgMorning;		//	朝
var	imgNoon;		//	昼
var	imgEvening;		//	夕方
var	imgNight;		//	夜
var	imgSkyTimer;	//	スカイタイマーインジケーター

var	imgSun;			//	太陽
var	imgMoon;		//	月
    
var	imgClockColon;	//	コロン(数字の親)


var timerObj = null;	//	描画用タイマー
var gFPS = 1000;			//	画面更新タイミング（ミリ秒）
var gPass = 0;			//	前回の時間パス
var gCurTImeSpeed = 1;	//	時間の速度
var gSkyTimerMode = false;	//	スカイタイマーモード

var readyImages = false;	//	画像素材の読み込み準備


//	時間データ等
var presentDate;		//	現在時刻（早回しが出来るようにこれを使う）

var	myTime;							//	現在相対時刻
var	bgTimes = new Array();			//	背景の時間？


//	取り扱いデータ（保存、転送にも使用）
var udata = {
	digi: false,
	gps: false,
	st_lowpow: false,
	arrowTime: 0,		//	通常の時刻設定（pcc=trueの場合、pccの設定）
	bright: true,		//	輝度最大有効
	pcc: false,			//	Private Clock Cloud連携のON/OFF
	pcc_code: '',		//	Private Clock Cloudのコード
	arrowTimeTemp: 0,	//	pcc=trueの場合、通常の時刻設定の退避場所（pcc=falseになった時点でarrowTimeに戻してクリアしてよし）
//	hue_ip: null		//	Hueのipアドレス
}
//	スカイタイマー時の退避データ
var udata_st_bk = {
	store: false,
	digi: false,
	gps: false,
	arrowTime: 0,
	pcc: false,
	pcc_code: '',
	arrowTimeTemp: 0
}
var arrayArrow = function(h,a) {
	this.hour = h;			//	時刻（実時刻との結び付け用）
	this.angle = a;			//	角度（相対時刻情報）
}
var DEF_ARROW_ANGLE_NONE = -999;		//	クリアされた時刻	h,angle共に使用
var DEF_ARROW_ANGLE_NONE_MARK = '-';	//	クリアされた時刻の表記



//	画面情報
var mon = {
	w:	0,			//	width
	h:	0,			//	height
	c:	{			//	center position
			x: 0,
			y: 0
		},
	aspect: 1,		//	aspect
	s: 1.0,			//	setting dial scale
	o: false		//	orientation
};

var NEIGHBOR_DEG = 7.5;

//	スワイプ操作用
var tapSwipe = {
	hold:	false,
	touchArea: '',
	x:-1,
	y:-1,
	t: 0
}
var swipeListener_sky;
var swipeListener_setting;
var swipeListener_skymap;
var swipeListener_opt_minHorizontal = 100;

var DEF_SCREEN_SKY = 'sky';		//	又はSkyTimer
var DEF_SCREEN_SETTING = 'setting';
var DEF_SCREEN_SKYMAP = 'skymap';

var gCurrentScreen = DEF_SCREEN_SKY;

var gNavi = null;		//	初回ナビゲーション


window.onload = function() {

	onloadEach();		//	各OSごとの処理



}


//	MobiScrollのテーマの背景色を取得
function getThemeBKColor(theme)
{
	var p = $('<div class="'+theme+'" style="display:none;"></div>');
	var c = $('<div class="dwwr">ABC</div>');
	p.append(c);
	$('body').prepend(p);
	var bgcolor = $($('body').children()[0].children[0]).css('background-color');
	$('body').children()[0].remove();

	return bgcolor;
}




$(function($){

	//	設定画面のちらつきがあるため、読み込み時は非表示で、準備完了後に表示

	$('#version').html(_VERSION);
//	document.getElementById('setting').style.visibility = 'visible';
//	document.getElementById('skymap').style.visibility = 'visible';
	$('#setting').css('visibility','hidden');
	$('#setting').css('left','0px');
//	$('#skymap').css('visibility','visible');


	//	保存データ読み込み
/*
	var str = localStorage.getItem(DEF_STORAGE_SORAJIKOKU);
	if( str == null)
	{
		reset_udata();
	}
	else
	{
		udata = JSON.parse(str);
	}
*/

	//---------------------
	//	ライフスタイルサイクル
    $('#t_wakeup').mobiscroll().time({
		lang: _LANG,
		display: 'bottom',
		timeFormat: 'HH:ii',
		timeWheels: 'HHii',
		headerText: false,
		maxWidth: 90,
		onSelect: function(time,inst){
			var stat = isCorrectInputTime([timeform2hour(time),getTimeField('t_lunch'),getTimeField('t_endwork')]);
			if( stat != 0)
			{
				showConfirm( MSG_BAD_RELATION_TIMES_TITLE, MSG_BAD_RELATION_TIMES_DESC1, function(){
					pitchshiftTime('t_wakeup', timeform2hour(time));
					saveLocal();
				});
				return false;
			}

			$('#t_wakeup').html(time);
			saveLocal();
		}
    });
    $('#t_lunch').mobiscroll().time({
		lang: _LANG,
		display: 'bottom',
		timeFormat: 'HH:ii',
		timeWheels: 'HHii',
		headerText: false,
		maxWidth: 90,
		onSelect: function(time,inst){

			var stat = isCorrectInputTime([getTimeField('t_wakeup'),timeform2hour(time),getTimeField('t_endwork')]);
			if( stat != 0)
			{
				showConfirm( MSG_BAD_RELATION_TIMES_TITLE, MSG_BAD_RELATION_TIMES_DESC2, function(){
					pitchshiftTime('t_lunch', timeform2hour(time));
					saveLocal();
				});
				return false;
			}

			$('#t_lunch').html(time);
			saveLocal();
		}
    });
    $('#t_endwork').mobiscroll().time({
		lang: _LANG,
		display: 'bottom',
		timeFormat: 'HH:ii',
		timeWheels: 'HHii',
		headerText: false,
		maxWidth: 90,
		onSelect: function(time,inst){

			var stat = isCorrectInputTime([getTimeField('t_wakeup'),getTimeField('t_lunch'),timeform2hour(time)]);
			if( stat != 0)
			{
				showConfirm( MSG_BAD_RELATION_TIMES_TITLE, MSG_BAD_RELATION_TIMES_DESC3, function(){
					pitchshiftTime('t_endwork', timeform2hour(time));
					saveLocal();
				});
				return false;
			}

			$('#t_endwork').html(time);
			saveLocal();
		}
    });

	$('#cycle_time_select').mobiscroll().select({
		lang: _LANG,
		display: 'modal',
		onSelect: function(data,inst){

			var target = $('#cycle_time_select').attr('target_time');

			if( inst._tempValue == 1)
			{
				//	現在時刻
				var t = new Array();
				t['t_wakeup'] = getTimeField('t_wakeup');
				t['t_lunch'] = getTimeField('t_lunch');
				t['t_endwork'] = getTimeField('t_endwork');

				var now = new Date();	//	現在時分
				t[target] = now.getHours() + now.getMinutes() / 60;

				var stat = isCorrectInputTime([t['t_wakeup'],t['t_lunch'],t['t_endwork']]);
				if( stat != 0)
				{
					showConfirm( MSG_BAD_RELATION_TIMES_TITLE, MSG_BAD_RELATION_TIMES_DESC1, function(){
						pitchshiftTime(target, t[target]);
						saveLocal();
					});
					return false;
				}

				setTimeField(target,t[target]);
				saveLocal();
			}
			else if( inst._tempValue == 2)
			{
				//	クリア
				setTimeField(target,DEF_ARROW_ANGLE_NONE);
				saveLocal();
			}
			else
			{
				$('#'+target).mobiscroll('setVal',$('#'+target).html()); 
				$('#'+target).mobiscroll('show');
			}
		}
	});



	//---------------------
	//	スカイアラーム
    $('#t_alarm').mobiscroll().time({
		lang: _LANG,
		display: 'bottom',
		timeFormat: 'HH:ii',
		timeWheels: 'HHii',
		headerText: false,
		maxWidth: 90,
		onSelect: function(time,inst){
			$('#t_alarm').html(time);
		}
    });
	$('#t_skytimer').mobiscroll().select({
		lang: _LANG,
		display: 'bottom',		//	display: 'modal',
		onSelect: function () {
			// Trigger validation
//			$(this).blur();
			saveLocal();
		}
	});


	$('#opt_digital').mobiscroll().select({
		lang: _LANG,
		display: 'bottom',		//	display: 'modal',
		onSelect: function () {
			// Trigger validation
//			$(this).blur();
			saveLocal();
			switchDigital();		//	時刻表示切り替え
		}
	});

	$('#opt_whisper').mobiscroll().select({
		lang: _LANG,
		display: 'bottom',		//	display: 'modal',
		onSelect: function () {
			// Trigger validation
//			$(this).blur();
			saveLocal();
		}
	});



	//	hueブリッジリスト表示
/*	検索APIが廃止されたためIPアドレス直入力に変更
	$('#hue_bridge').mobiscroll().select({
		lang: _LANG,
		display: 'modal',
//		minWidth: 200
		onSelect: function(data,inst){
			connectHueRegBridge(data);
		}
	});
*/
	//	hueライトリスト表示
	$('#hue_lights_each').mobiscroll().select({
		lang: _LANG,
		display: 'modal',
		onSelect: function(data,inst){

			if( inst._tempValue == 0)
			{
				copyHueAllLights();
				$('#text_title_exlight_lights_status').html(STATUS_HUE_ALL_LIGHTS);
			}
			else
			{
				showHueLightsList();
			}
		}
	});
	//	hueライトリスト表示
	$('#hue_lights').mobiscroll().select({
		lang: _LANG,
		display: 'modal',
//		minWidth: 200
		onSelect: function(data,inst){

			if( inst._tempValue.length == 0)
			{
				showMessage( MSG_NOSELECT_LIGHT_TITLE, MSG_NOSELECT_LIGHT_DESC);
			}
			else
			{
				storeLights(inst._tempValue);
				$('#text_title_exlight_lights_status').html(data);
			}

		}
	});

	$('#text_whisper').change(function() {
		saveLocal();
	});





/*	ライブラリのイベント処理がおかしい為、UI変更
	$('#opt_digital').click(function() {
		saveLocal();
	});
	$('#opt_gps').click(function() {
		changeGPS();
		saveLocal();
	});
	$('#opt_skytimer_lowpow').click(function() {
		saveLocal();
	});
*/


	$('#menutab').mobiscroll().menustrip({
		lang: _LANG,
		display: 'bottom',
		type: 'tabs',	//'options',
//		layout: 4,		//'liquid',	//'fixed',
		select: 'single',
		theme: 'mobiscroll-dark',
		context: '#scrollarea',
		itemWidth: ($('#setting').width() / 4),

		onItemTap: function (item, inst) {
			$('.menutab-list').removeClass('menutab-list-sel');
			$('#scrollarea').scrollTop(0);
			$('#' + item.data('tab')).addClass('menutab-list-sel');
		}
	});


	$('#list-lsc').mobiscroll().listview({
		lang: _LANG,
		enhance: true,
		context: '#scrollarea',
		swipe: false,
		itemGroups: {
			wakeup: {
				tap: function () {
					if( udata.pcc){
						showMessage(MSG_WARN_PCC_RUNNING_TITLE,MSG_WARN_PCC_RUNNING_DESC);
						return;
					}
					$('#cycle_time_select').attr('target_time','t_wakeup');
					$('#cycle_time_select').mobiscroll('show'); 
//					$('#t_wakeup').mobiscroll('setVal',getTimeField('t_wakeup')); 
//					$('#t_wakeup').mobiscroll('show'); 
				}
			},
			lunch: {
				tap: function () {
					if( udata.pcc){
						showMessage(MSG_WARN_PCC_RUNNING_TITLE,MSG_WARN_PCC_RUNNING_DESC);
						return;
					}
					$('#cycle_time_select').attr('target_time','t_lunch');
					$('#cycle_time_select').mobiscroll('show'); 
//					$('#t_lunch').mobiscroll('setVal',getTimeField('t_lunch')); 
//					$('#t_lunch').mobiscroll('show'); 
				}
			},
			endwork: {
				tap: function () {
					if( udata.pcc){
						showMessage(MSG_WARN_PCC_RUNNING_TITLE,MSG_WARN_PCC_RUNNING_DESC);
						return;
					}
					$('#cycle_time_select').attr('target_time','t_endwork');
					$('#cycle_time_select').mobiscroll('show'); 
//					$('#t_endwork').mobiscroll('setVal',getTimeField('t_endwork')); 
//					$('#t_endwork').mobiscroll('show'); 
				}
			},
			use_location: {
				tap: function () {
					toggleCheckControl('opt_gps');
					changeGPS();
					saveLocal();
				}
			}

		}

	});

	$('#list-skytimer').mobiscroll().listview({
		lang: _LANG,
		enhance: true,
		context: '#scrollarea',
		swipe: false,
		itemGroups: {
			st_alarm: {
				tap: function () {
					$('#t_alarm').mobiscroll('setVal',$('#t_alarm').html()); 
					$('#t_alarm').mobiscroll('show'); 
				}
			},
			st_lowpow: {
				tap: function () {
					toggleCheckControl('opt_skytimer_lowpow');
					saveLocal();
				}
			},
			st_target: {
				tap: function () {

				}
			}

		}

	});

	$('#list-exlight').mobiscroll().listview({
		lang: _LANG,
		enhance: true,
		context: '#scrollarea',
		swipe: false,
		itemGroups: {

/*	検索APIが廃止
			select_hue_bridge: {
				tap: function () {
					showHueBrideList();
				}
			},
*/
			select_hue_lights: {
				tap: function () {

					if( hueIP == null)
					{
						showMessage( MSG_NOSELECT_BRIDGE_TITLE, MSG_NOSELECT_BRIDGE_DESC);
						return;
					}

					$('#hue_lights_each').mobiscroll('show'); 
				}
			}

		}

	});


	$('#list-options').mobiscroll().listview({
		lang: _LANG,
		enhance: true,
		context: '#scrollarea',
		altRow: true,
		swipe: false,
		itemGroups: {
			set_brightness: {
				tap: function () {
					toggleCheckControl('opt_brightness');
					saveLocal();
				}
			}
/*
			show_digital: {
				tap: function () {
					toggleCheckControl('opt_digital');
					saveLocal();
				}
			}
*/
		}


	});


/*
	$('#hue_bridge_ip').change(function(e) {
		connectHueRegBridge($(this).val());
	});
*/




















	initOrientation();


	//	ナビ用
	gNavi = new FirstNavi({
		name: 'first_navigation',
		w: mon.w,								//	画面の幅
		h: mon.h,								//	画面の高さ
		head_h: $('#st_header').outerHeight(),	//	ヘッダの高さ
		times_h:$('#list-lsc').outerHeight(),	//	ライフスタイルサイクルメニューリストの高さ
		menu_h:	$('#menutab').height()			//	メニュータブの高さ
		},
		function(check){
			if( check)
			{
				setFirst();
			}
		}
		,isFirst()
	);




	//	cavy initialize
	window.addEventListener('load', function() {
		preload = new cavy.Preload({
			sky_morning:		'images/sky_morning.png',
			sky_noon:			'images/sky_noon.png',
			sky_evening:		'images/sky_evening.png',
			sky_night:			'images/sky_night.png',
			sky_diginums:		'images/diginums.png',
			sky_digicolon:		'images/digicolon.png',
			sky_sun:			'images/sun.png',
			sky_moon:			'images/moon.png',
			indicator_skytimer:	'images/icon_skytimer.png'
		}).complete(initImageLoaded);
	});

	//	ライフスタイルサイクルマップ（LSサイクルマップ）
	var now = new Date();
	instSkyMap = new SkyMap( 'skymap_canvas', mon.w, mon.h);
	instSkyMap.preload();


	//	OSごとの初期処理
	initEarch();

	updateCountLSP();



	//	更新内容のお知らせ
	if( isFirst())
	{
		setShownUpdateInfo();	//	表示済みにする
	}
	else if( !isShownUpdateInfo())
	{
		showUpdateInfo();		//	自動的に表示する
	}

});

window.onscroll = function(e)
{
	e.preventDefault();return false;
}

//*****************************************
//	初期設定
var initImageLoaded = function()
{

	readyImages = true;

	init_sky();

    bgTimes.push(0);				//	(0)start of day		0
    bgTimes.push((4 * 60 * 60));	//	(1)end of night		14400
    bgTimes.push((6 * 60 * 60));	//	(2)morning			21600
    bgTimes.push((10 * 60 * 60));	//	(3)noon				36000
    bgTimes.push((16 * 60 * 60));	//	(4)noon				57600
    bgTimes.push((17 * 60 * 60));	//	(5)evening			61200
    bgTimes.push((20 * 60 * 60));	//	(6)start of night	72000
    bgTimes.push((24 * 60 * 60));	//	(7)end of day		86400


	// 画面の向き初期化設定
	checkOrientation();

	// 画面回転時に向きをチェックして調整
/*	window.addEventListener('orientationchange', function(e){
		checkOrientation();
		e.preventDefault();
	}, false);*/
	window.addEventListener('resize', function(e){
		checkOrientation();
		e.preventDefault();
	}, false);

/*
	document.getElementsByTagName('body')[0].addEventListener('touchstart', function(e){ 
console.log('body');
	e.preventDefault();return false;

}, false);
*/


	//	2021.4.16	タッチ操作ライブラリ使用に変更
	var area_sky = document.getElementById('sky');
	var area_setting = document.getElementById('setting');
	var area_skymap = document.getElementById('skymap');

	swipeListener_sky = SwipeListener( area_sky,{
		minHorizontal: swipeListener_opt_minHorizontal
	});
	swipeListener_setting = SwipeListener( area_setting,{
		minHorizontal: swipeListener_opt_minHorizontal
	});
	swipeListener_skymap = SwipeListener( area_skymap,{
		minHorizontal: swipeListener_opt_minHorizontal
	});

	area_sky.addEventListener('swipe', function (e) {
		if( gNavi.valid)
		{
			if( e.detail.directions.left && gNavi.permitSwipe == 'left')
			{
				gNavi.hide(function(){
					showSetting( SwipeDuration, function(){
						gNavi.next();
					});
				});
			}
			else if( e.detail.directions.right && gNavi.permitSwipe == 'right')
			{
				gNavi.hide(function(){
					showSkyMap( SwipeDuration, function(){
						gNavi.next();
					});
				});
			}
		}
		else
		{
			if( e.detail.directions.left)				showSetting( SwipeDuration);
			else if( e.detail.directions.right)			showSkyMap( SwipeDuration);
		}
	});
	area_setting.addEventListener('swipe', function (e) {
		if( gNavi.valid)
		{
			if( e.detail.directions.right && gNavi.permitSwipe == 'right')
			{
				gNavi.hide(function(){
					set2sky( SwipeDuration, function(){
						gNavi.next();
					});
				});
			}
		}
		else
		{
			if( e.detail.directions.right)
				set2sky( SwipeDuration);
		}
	});
	area_skymap.addEventListener('swipe', function (e) {
		if( gNavi.valid)
		{
			if( e.detail.directions.left && gNavi.permitSwipe == 'left')
			{
				gNavi.hide(function(){
					hideSkyMap( SwipeDuration, function(){
						gNavi.next();
					});
				});
			}
		}
		else
		{
			if( e.detail.directions.left)
				hideSkyMap( SwipeDuration);
		}
	});


/*

	$('#sky').bind('touchstart', funcTouchStart);
	$('#sky').bind('mousedown', funcTouchStart);
	$('#sky').bind('touchmove', funcTouchMove);
	$('#sky').bind('mousemove', funcTouchMove);
	$('#sky').bind('touchend', funcTouchEnd);
	$('#sky').bind('mouseup', funcTouchEnd);

	$('#setting').bind('touchstart', funcTouchStart);
	$('#setting').bind('mousedown', funcTouchStart);
	$('#setting').bind('touchmove', funcTouchMove);
	$('#setting').bind('mousemove', funcTouchMove);
	$('#setting').bind('touchend', funcTouchEnd);
	$('#setting').bind('mouseup', funcTouchEnd);

	$('#skymap').bind('touchstart', funcTouchStart);
	$('#skymap').bind('mousedown', funcTouchStart);
	$('#skymap').bind('touchmove', funcTouchMove);
	$('#skymap').bind('mousemove', funcTouchMove);
	$('#skymap').bind('touchend', funcTouchEnd);
	$('#skymap').bind('mouseup', funcTouchEnd);

*/


	presentDate = new Date();

	//	設定時刻（デフォルト)

	var str = localStorage.getItem(DEF_STORAGE_SORAJIKOKU);
	if( str == null)
	{
		reset_udata();
	}
	else
	{
		udata = JSON.parse(str);

		//	1.3.0〜
		if( udata.pcc == void 0)		udata.pcc = false;
		if( udata.pcc_code == void 0)	udata.pcc_code = '';
	}

//	setCheckControl( 'opt_digital', udata.digi);
	setSelectControl('opt_digital',udata.digi);
	setCheckControl( 'opt_gps', udata.gps);
	setSelectControl('t_skytimer',udata.st_mode)
	setCheckControl( 'opt_skytimer_lowpow', udata.st_lowpow);
	setCheckControl( 'opt_brightness', udata.bright);

	$('#text_pcc_code').val( unescapeHTML( udata.pcc_code));

/*	$('#hue_bridge_ip').val(udata.hue_ip);
	if( udata.hue_ip.length > 0)
		hueIP = udata.hue_ip;
*/
	if( udata.pcc)
	{
		$('#text_btn_pcc_start').attr({'hidden':'hidden'});
		$('#text_btn_pcc_stop').removeAttr('hidden');
		$('#text_pcc_indicator').removeAttr('hidden');
		$('#text_pcc_code').attr('readonly',true);

		setTimeField('t_wakeup', angle2hour( udata.arrowTimeTemp[0].angle));
		setTimeField('t_lunch', angle2hour( udata.arrowTimeTemp[1].angle));
		setTimeField('t_endwork', angle2hour( udata.arrowTimeTemp[2].angle));
	}
	else
	{
		setTimeField('t_wakeup', angle2hour( udata.arrowTime[0].angle));
		setTimeField('t_lunch', angle2hour( udata.arrowTime[1].angle));
		setTimeField('t_endwork', angle2hour( udata.arrowTime[2].angle));
	}

	//	1.2.3追加
	if( udata.whisper == void 0)
	{
		udata.whisper = DEF_WHISPER_MODE;		//	非表示
		udata.whisper_text = '';
	}
	setSelectControl('opt_whisper',udata.whisper);
//	document.getElementById('text_whisper').value = unescapeHTML( udata.whisper_text);
	$('#text_whisper').val( unescapeHTML( udata.whisper_text));
	setWhisperText();



	//	GPS復元
	var lon = Number(localStorage.getItem(DEF_STORAGE_LOCATION_LON));
	var lat = Number(localStorage.getItem(DEF_STORAGE_LOCATION_LAT));
	var gps_stat = (localStorage.getItem(DEF_STORAGE_LOCATION_STAT) == '1');
	if( lon)
	{
		longitude = lon;
		latitude = lat;
	}


	//	輝度設定
	setBrightness();


	//	画面更新開始
	startTimer(true);

	switchDigital();		//	時刻表示切り替え


	//	OSごとの初期処理
	initImageLoadedEach();


	//	初期スクリーン解除
//	document.getElementById('black_screen').style.opacity = '0';
	$('#black_screen').css('opacity','0');

	setTimeout( function(){
//		document.getElementById('black_screen').style.visibility = 'hidden';
		$('#black_screen').css('visibility','hidden');
	}, 500);

}

function switchDigital()
{
	if( udata.digi == 1)
	{
		imgClockColon.visible = true;
		$('#digital_text').hide();
	}
	else if( udata.digi == 2)
	{
		imgClockColon.visible = false;
		$('#digital_text').show();
	}
	else
	{
		imgClockColon.visible = false;
		$('#digital_text').hide();
	}
}


//	onload内で呼ばれ、必要に応じてOSごとにオーバーライドする
function onloadEach()
{
}
//	必要に応じてOSごとにオーバーライドする初期化処理
function initEarch()
{
//	$('#setting').css('left', mon.w+'px');
	$('#skymap').css('left', -mon.w+'px');
}
//	必要に応じてOSごとにオーバーライドする画像読み込み後の処理
function initImageLoadedEach()
{
}






function startTimer(logflag)
{
	//	LSPログに記録

	if( logflag != void 0)
	{
//		if( !isFirstBack())
//		{
			addLSP();
//		}
	}

	if( timerObj)
		return;

	getGEO(false);

	whisper(true);
	myTime = getRelationalTime(new Date());	//	相対時刻取得
	if( readyImages)
		drawsky();

	if( instSkyMap)
	{
		instSkyMap.updateTime( myTime, [
			getRelation2RealHour(bgTimes[1]/3600),
			getRelation2RealHour(bgTimes[2]/3600),
			getRelation2RealHour(bgTimes[3]/3600),
			getRelation2RealHour(bgTimes[4]/3600),
			getRelation2RealHour(bgTimes[5]/3600),
			getRelation2RealHour(bgTimes[6]/3600)
		]);
	}

	gPass = getPass(myTime);
//	stage.startRender();

//	timerObj = cavy.Timer.repeat(callTimer, gFPS);
stage.update(0);		
timerObj = setTimeout(callTimer, gFPS);

}
function callTimer()
{
	if( !timerObj)
		return;

	myTime = getRelationalTime(new Date());	//	相対時刻取得
	var pitch = checkFPS();
	if( pitch != 0)
	{
		gFPS = gFPS / pitch;		//	FPSを1ピクセル移動ペースに再計算

		//	スカイタイマー時
		if( gSkyTimerMode)
		{
			if( getCheckControl('opt_skytimer_lowpow'))
			{
				gFPS *= 4;	//	省電力の場合4倍(4ピクセル移動ペース)の速度に
			}
		}
		else
		{
			//	分表示を優先するため、FPSが仮想１分ペースより遅ければ、再設定
			var base_fps = 1000 / gCurTImeSpeed;
			if( gFPS > base_fps)
				gFPS = base_fps;
		}



/*
		stage.stopRender();
		cavy.Timer.stop(timerObj);
*/
		gPass = getPass(myTime);
//		stage.startRender();

//		timerObj = cavy.Timer.repeat(callTimer, gFPS);

stage.update(0);		
timerObj = setTimeout(callTimer, gFPS);
	}


	if( readyImages)
		drawsky();

	if( gCurrentScreen == DEF_SCREEN_SKYMAP)
	{
		instSkyMap.updateTime( myTime, [
			getRelation2RealHour(bgTimes[1]/3600),
			getRelation2RealHour(bgTimes[2]/3600),
			getRelation2RealHour(bgTimes[3]/3600),
			getRelation2RealHour(bgTimes[4]/3600),
			getRelation2RealHour(bgTimes[5]/3600),
			getRelation2RealHour(bgTimes[6]/3600)
		]);
	}

}
function stopTimer()
{
	whisper(false);

//	stage.stopRender();
	if( timerObj == null)
		return;

//	 cavy.Timer.stop(timerObj);
	timerObj = null;
}



function confirmResetLSP()
{
	showConfirm('', MSG_RESET_LSP, function(){
		localStorage.removeItem(DEF_STORAGE_LSP);
		updateCountLSP();
	});
}
function confirmGoHomepage(pagename)
{
	var url = 'https://sora-tokei.com';
	if( pagename != void 0)
		url += '/' + pagename;

	showConfirm( MSG_CONFIRM_HP_LINK_TITLE, MSG_CONFIRM_HP_LINK_DESC,function(){
		openBrowser(url);
	});
}


//*****************************************
//	データ読み書き

function isCorrectInputTime(t)
{
	//	有効時刻が３つなければ、チェック無用
	var invalid_cnt = 0;
	for( var i=0; i<t.length; i++)
	{
		if( t[i] == DEF_ARROW_ANGLE_NONE)
			return 0;
	}


	//	時間の前後チェック
	if( t[0] > t[2])
	{
		t[2] += 24;
	}

	if( (t[0] < t[1] && t[2] > t[1]) || (t[0] < (t[1]+24) && t[2] > (t[1]+24)))
	{
		//	OK
		return 0;
	}
	else
	{
		return -1;
	}

	return 0;
}


//	設定データをローカルに保存
function saveLocal(alreadytime)
{

//	udata.digi = getCheckControl('opt_digital');
	udata.digi = getSelectControl('opt_digital');
	udata.gps = getCheckControl('opt_gps');
	udata.st_lowpow = getCheckControl('opt_skytimer_lowpow');
	udata.st_mode = getSelectControl('t_skytimer');
	udata.bright = getCheckControl('opt_brightness');
	udata.whisper = getSelectControl('opt_whisper');
//	udata.whisper_text = escapeHTML( document.getElementById('text_whisper').value);
	udata.whisper_text = escapeHTML( $('#text_whisper').val());
//	udata.hue_ip = (hueIP == null) ? '' : hueIP;
	setWhisperText();

	udata.pcc_code = escapeHTML( $('#text_pcc_code').val());

	if( alreadytime == void 0)
	{
		var t = new Array();

		t[0] = getTimeField('t_wakeup');
		t[1] = getTimeField('t_lunch');
		t[2] = getTimeField('t_endwork');

		udata.arrowTime = new Array();

		var sun;
		sun = getSunTime(true);	//	（起床）日の出
		udata.arrowTime.push(new arrayArrow(sun,hour2angle(t[0])));

		//	（昼）12
		udata.arrowTime.push(new arrayArrow(12,hour2angle(t[1])));

		//	日の入り
		sun = getSunTime(false);
		udata.arrowTime.push(new arrayArrow(sun,hour2angle(t[2])));
	}

	localStorage.setItem(DEF_STORAGE_SORAJIKOKU, JSON.stringify(udata));

	return 0;
}
function changeGPS()
{
	if( getCheckControl('opt_gps'))
	{
		getGEO(true);
	}
	else
	{
		localStorage.removeItem(DEF_STORAGE_LOCATION_LON);
		localStorage.removeItem(DEF_STORAGE_LOCATION_LAT);
	}
}

// LSP 追加
function addLSP()
{
	var now = new Date();
	var yy = now.getFullYear();
	var mm = now.getMonth() + 1;
	var dd = now.getDate();
	var tt = now.getHours() * 100 + now.getMinutes();

	addDateLSP(yy,mm,dd,tt);
	updateCountLSP();
}
function addDateLSP( yy, mm, dd, tt)
{
	var lsp = { date:[], sy: yy, sm: mm, sd: dd };	//	開始年月日

	var str = localStorage.getItem(DEF_STORAGE_LSP);
	if( str != null)
	{
		lsp = JSON.parse(str);
	}

	var yp = -1;
	for( var i=0; i<lsp.date.length; i++)
	{
		if( lsp.date[i].y == yy)
		{
			yp = i;
			break;
		}
	}
	if( yp == -1)
	{
		yp = lsp.date.length;
		lsp.date[lsp.date.length] = { y: yy, m: [ ] };
	}

	if( typeof(lsp.date[yp].m[mm-1]) != 'object')
	{
		lsp.date[yp].m[mm-1] = { d: [] }; 
	}
	if( typeof( lsp.date[yp].m[mm-1].d[dd-1]) != 'object' || lsp.date[yp].m[mm-1].d[dd-1] == null)
	{
		 lsp.date[yp].m[mm-1].d[dd-1] = [];
	}

	var dc = lsp.date[yp].m[mm-1].d[dd-1].length;
	if( dc == 0 || lsp.date[yp].m[mm-1].d[dd-1][dc-1] != tt)
	{
		lsp.date[yp].m[mm-1].d[dd-1].push(tt);
	}
	localStorage.setItem(DEF_STORAGE_LSP,  JSON.stringify(lsp));
}
function updateCountLSP()
{
	var lsp = { date:[]};
	var str = localStorage.getItem(DEF_STORAGE_LSP);
	if( str != null)
	{
		lsp = JSON.parse(str);
	}

	var total = 0;
	var cnt_m = 0;
	var cnt_d = 0;

	for( var i=0; i<lsp.date.length; i++)
	{
		if( lsp.date[i].y < lsp.sy)	//	開始日付以前はカウントしない
		{
			continue;
		}

		for( var j=0; j<lsp.date[i].m.length; j++)
		{
			if( lsp.date[i].y == lsp.sy && j < (lsp.ym-1))	//	開始日付以前はカウントしない
			{
				continue;
			}
			if( lsp.date[i].m[j] == null)
			{
				continue;
			}

			for( var k=0; k<lsp.date[i].m[j].d.length; k++)
			{
				if( lsp.date[i].y == lsp.sy && j == (lsp.ym-1) && k < (lsp.sd-1))	//	開始日付以前はカウントしない
				{
					continue;
				}

				if( lsp.date[i].m[j].d[k] != null)
				{
					total += lsp.date[i].m[j].d[k].length;
					cnt_d ++;
				}
			}
			cnt_m ++;
		}
	}

	var ave_day = 0;
	var ave_month = 0;

	if( cnt_m > 0)
	{
		ave_month = Math.floor(total / cnt_m);
	}
	if( cnt_d > 0)
	{
		ave_day = Math.floor(total / cnt_d);
	}

	var lspstr = NAME_LPS_AVRDAY + ave_day + NAME_LPS_TOTAL + total;
	$('#st_lsp_value').html( lspstr);
}


function timeform2hour(tf)
{
	if( tf == DEF_ARROW_ANGLE_NONE_MARK)
		return DEF_ARROW_ANGLE_NONE;

	var hs = tf.split(':');
	if( !hs[0].match(/^[0-9]+$/) || !hs[1].match(/^[0-9]+$/))
	{
		return -1;			//	未設定
	}

	return parseInt(hs[0],10) + (parseInt(hs[1],10) / 60);
}

function getTimeField(id)
{
//	var tf = document.getElementById(id).value;
	var tf = $('#'+id).html();

	if( tf == DEF_ARROW_ANGLE_NONE_MARK)
		return DEF_ARROW_ANGLE_NONE;

	return timeform2hour(tf);
/*
	var hs = tf.split(':');

	if( !hs[0].match(/^[0-9]+$/) || !hs[1].match(/^[0-9]+$/))
	{
		return -1;			//	未設定
	}

	return parseInt(hs[0],10) + (parseInt(hs[1],10) / 60);
*/
}
function setTimeField(id,t)
{
	if( t == DEF_ARROW_ANGLE_NONE)
	{
		$('#'+id).html(DEF_ARROW_ANGLE_NONE_MARK);
		return;
	}

	var h = Math.floor(t);
//	var m = Math.floor((t - h) * 60);
	var m = Math.round((t - h) * 60);
	
	var tf = ('0' + h).substr(-2,2);
	tf += ':' + ('0' + m).substr(-2,2);
	
	$('#'+id).html(tf);
//	document.getElementById(id).value = tf;
}
function setCheckControl( id, chk)
{
	$('#'+id).attr('value', chk ? 1 : 0);

	if(chk)
		$('#'+id).html('<span class="mbsc-ic mbsc-ic-material-check-box chkcolor"></span>');
	else
		$('#'+id).html('<span class="mbsc-ic mbsc-ic-material-check-box-outline-blank chkcolor"></span>');
}
function getCheckControl( id)
{
	var val = $('#'+id).attr('value');
	if( val == void 0)
		return false;

	return (val == 1);
}
function toggleCheckControl( id)
{
	var val = $('#'+id).attr('value');
	if( val == void 0)
	{
		setCheckControl( id, true);
	}
	else
	{
		val ++;
		setCheckControl( id, ((val%2)==1));
	}
}

function setSelectControl( id, val)
{
	$('#'+id).val(val);
	$('#'+id).mobiscroll('getInst').setValue(val,true)
}
function getSelectControl( id, val)
{
	return $('#'+id).val();
}

function setWhisperText()
{
/*
	if( document.getElementById('text_whisper').value.length == 0)
		document.getElementById('sky_whisper').innerHTML = document.getElementById('text_whisper').placeholder;
	else
		document.getElementById('sky_whisper').innerHTML = udata.whisper_text;
*/
	if( $('#text_whisper').val().length == 0)
		$('#sky_whisper').html( $('#text_whisper').attr('placeholder'));
	else
		$('#sky_whisper').html( udata.whisper_text);
}



//	初回起動か？
function isFirst()
{
	if( localStorage.getItem(DEF_STORAGE_NAVI_FIRST))
	{
		return false;
	}

	return true;
}
//	初起動時の日時保存（初回ナビゲートの判断に使用）
function setFirst()
{
	var d = new Date();
	localStorage.setItem(DEF_STORAGE_NAVI_FIRST, d.toLocaleString());
}





//	更新情報を表示したか？
function isShownUpdateInfo()
{
	if( localStorage.getItem(DEF_STORAGE_UPDATE_INFO))
	{
		return true;
	}
	return false;
}
//	更新情報を表示済み
function setShownUpdateInfo()
{
	var d = new Date();
	localStorage.setItem(DEF_STORAGE_UPDATE_INFO, d.toLocaleString());
}
//	更新情報を表示
function showUpdateInfo()
{
	showMessage(INFO_UPDATING_TITLE,INFO_UPDATING_TEXT);
	setShownUpdateInfo();
}






function getGEO(force)
{
	//	各OSで処理
}



function confirmSendClockInfo()
{
	showConfirm('', MSG_CONFIRM_SENDINFO, sendClockInfo);
}

//	情報をサーバに送信
function sendClockInfo()
{
	//	HTTPサーバにリクエストするための準備
	var httpObj = new XMLHttpRequest();
	if ( !httpObj){
		return false;
	}

	httpObj.open( 'POST', URL_CLOCKINFO, true);	//	非同期
	httpObj.responseType = '';
	httpObj.setRequestHeader('Content-Type','application/x-www-form-urlencoded;charset=UTF-8');
	httpObj.onreadystatechange = function(){
		loadingView( false);
		if ( this.readyState == 4 && this.status == 200)
		{
			showMessage('', MSG_THANKS_SENDCLOCK);
//			console.log(this.responseText);
		}
	};
	httpObj.onerror = function (e) {
			loadingView( false);
			showMessage('', MSG_ERROR_SENDCLOCK);
	};
	httpObj.timeout = 5000;
	httpObj.ontimeout = function() {
			loadingView( false);
			showMessage('', MSG_ERROR_SENDCLOCK);
	};
	var query = 'clockdata=' + encodeURIComponent(localStorage.getItem(DEF_STORAGE_SORAJIKOKU));
	query += '&param1=' + encodeURIComponent(localStorage.getItem(DEF_STORAGE_LOCATION_LON)+'/'+localStorage.getItem(DEF_STORAGE_LOCATION_LAT));
	query += '&param2=' + encodeURIComponent($('#st_lsp_value').html());

	loadingView( true);
	httpObj.send(query);
}




//	全ての保存データをクリア
function _clear_storage()
{
	localStorage.removeItem(DEF_STORAGE_SORAJIKOKU);
	localStorage.removeItem(DEF_STORAGE_NAVI_FIRST);
	localStorage.removeItem(DEF_STORAGE_LOCATION_LON);
	localStorage.removeItem(DEF_STORAGE_LOCATION_LAT);
	localStorage.removeItem(DEF_STORAGE_LOCATION_STAT);
	localStorage.removeItem(DEF_STORAGE_LSP);
}



//	設定情報から更新
function reset_udata()
{
//	udata.digi = true;
	udata.digi = 2;	//	白（小）
	udata.gps = true;
	udata.st_mode = 1;
	udata.st_lowpow = true;
	udata.bright = true;
	udata.pcc = false;
	udata.pcc_code = '';
//	udata.hue_ip = null;

	udata.arrowTime = new Array();

	var t;
	t = getSunTime(true);	//	（起床）日の出
//	udata.arrowTime.push(new arrayArrow(t,hour2angle(t)));
	udata.arrowTime.push(new arrayArrow(t,DEF_ARROW_ANGLE_NONE));

	//	（昼）12
//	udata.arrowTime.push(new arrayArrow(12,hour2angle(12)));
	udata.arrowTime.push(new arrayArrow(12,DEF_ARROW_ANGLE_NONE));

	//	日の入り
	t = getSunTime(false);
//	udata.arrowTime.push(new arrayArrow(t,hour2angle(t)));
	udata.arrowTime.push(new arrayArrow(t,DEF_ARROW_ANGLE_NONE));


	//	1.2.3
	udata.whisper = DEF_WHISPER_MODE;			//	デフォルト非表示
	udata.whisper_text = '';


//	setCheckControl( 'opt_digital', udata.digi);
	setSelectControl('opt_digital',udata.digi);
	setCheckControl( 'opt_gps', udata.gps);
	setSelectControl('t_skytimer',udata.st_mode)
	setCheckControl( 'opt_skytimer_lowpow', udata.st_lowpow);
	setCheckControl( 'opt_brightness', udata.bright);

	setTimeField('t_wakeup', angle2hour( udata.arrowTime[0].angle));
	setTimeField('t_lunch', angle2hour( udata.arrowTime[1].angle));
	setTimeField('t_endwork', angle2hour( udata.arrowTime[2].angle));

	$('#text_pcc_code').val( unescapeHTML( udata.pcc_code));

	setSelectControl('opt_whisper',udata.whisper);
//	document.getElementById('text_whisper').value = unescapeHTML( udata.whisper_text);
	$('#text_whisper').val( unescapeHTML( udata.whisper_text));
	setWhisperText();

}

//	時間（10進数）と角度に変換
//	0時...0度、	12時...180度
function hour2angle(t)
{
	if( t == DEF_ARROW_ANGLE_NONE)
		return DEF_ARROW_ANGLE_NONE;

	var ang = t / 24 * 360;
	ang %= 360;

	return ang;
}
function angle2hour(ang)
{
	if( ang == DEF_ARROW_ANGLE_NONE)
		return DEF_ARROW_ANGLE_NONE;

	var t = ang / 360 * 24;
	t %= 24;
	return t;
}




//	ソラのトケイボタン
function set2sky(dur,afterfunc)
{
	gFPS = 1000;
	stopTimer();
	startTimer(true);

	imgSkyTimer.visible = false;		//	タイマーアイコン非表示
//	document.getElementById('area_whisper').style.visibility = 'visible';	//	ささやきエリア表示可
	$('#area_whisper').css('visibility','visible');	//	ささやきエリア表示可

	showSky(dur,afterfunc);
}

//	スカイタイマー起動ボタン
function startSkyTimer()
{
	t = getTimeField('t_alarm');
	if( t <= 0)
	{
		showMessage('', MSG_INCORRECT_SKYTIME);
		return;
	}

	//ソラのトケイ情報を退避
	udata_st_bk.digi = udata.digi;
	udata_st_bk.gps = udata.gps;
	udata_st_bk.pcc = udata.pcc;
	udata_st_bk.pcc_code = udata.pcc_code;
	udata_st_bk.arrowTime = new Array();
	for( var i=0; i<udata.arrowTime.length; i++)
	{
		udata_st_bk.arrowTime.push(udata.arrowTime[i]);
	}
	udata_st_bk.arrowTimeTemp = new Array();
	for( var i=0; i<udata.arrowTimeTemp.length; i++)
	{
		udata_st_bk.arrowTimeTemp.push(udata.arrowTimeTemp[i]);
	}
	udata_st_bk.store = true;


//	udata.digi = false;
	udata.digi = 0;
	udata.gps = false;
	udata.arrowTime = new Array();


	var now = new Date();
	var st = now.getHours() + (now.getMinutes() / 60) + (now.getSeconds() / 3600);

	var h1,h2,h3;
//	var mode = document.getElementById('t_skytimer').value;
	var mode = $('#t_skytimer').val();
	if( mode == 1)	//	日の出前後
	{
		var sunt = getSunTime(true);		//	日の出
		h1 = sunt - (DEF_TWILIGHT_SUNRISE_MIN / 60);
		h2 = sunt;
		h3 = 12;
	}
	else if( mode == 2)	//	日の入り前後
	{
		var sunt = getSunTime(false);		//	日の入り
		h1 = sunt - (DEF_TWILIGHT_SUNSET_MIN / 60 * 0.7);
		h2 = sunt;
		h3 = 0;
	}
	else if( mode == 3)		//	日の出
	{
		h1 = 0;
		h2 = getSunTime(true);		//	日の出
		h3 = h2 * 2;
	}
	else if( mode == 4)	//	日の入り
	{
		h1 = 12;
		h2 = getSunTime(false);		//	日の入り
		h3 = h2 + (h2-12);
	}
	else if( mode == 5)		//	日中
	{
		h1 = getSunTime(true) - (DEF_TWILIGHT_SUNRISE_MIN / 60);;		//	日の出
		h2 = getSunTime(false);		//	日の入り
		h3 = 0;
	}
	else if( mode == 6)		//	夜間
	{
		h1 = getSunTime(false) - (DEF_TWILIGHT_SUNSET_MIN / 60 * 0.7);		//	日の入り
		h2 = getSunTime(true);		//	日の出
		h3 = 12;
	}

	udata.arrowTime.push(new arrayArrow( h1, hour2angle(st)));
	udata.arrowTime.push(new arrayArrow( h2, hour2angle(st+t)));
	udata.arrowTime.push(new arrayArrow( h3, hour2angle(st+t*2)));

/*
	udata.arrowTime.push(new arrayArrow( h1, hour2angle(st)));
	udata.arrowTime.push(new arrayArrow( h2, hour2angle(t)));
	udata.arrowTime.push(new arrayArrow( h3, hour2angle(t+(t-st))));
*/


	imgSkyTimer.visible = true;	//	タイマーアイコン表示
//	document.getElementById('area_whisper').style.visibility = 'hidden';	//	ささやきエリア非表示
	$('#area_whisper').css('visibility','hidden');	//	ささやきエリア非表示

	gSkyTimerMode = true;

	gFPS = 100;
	stopTimer();
	startTimer(true);
	showSky(SwipeDuration);
}


var funcTouchStart = function(e)
{
	var x, y;
	if (e.originalEvent.touches)
	{
		x = e.originalEvent.touches[0].pageX;
		y = e.originalEvent.touches[0].pageY;
	}
	else if (e.changedTouches)
	{
		x = e.changedTouches[0].pageX;
		y = e.changedTouches[0].pageY;
	}
	else if( e.touches )
	{
		x = e.touches[0].pageX;
		y = e.touches[0].pageY;
	}
	else
	{
		x = e.pageX;
		y = e.pageY;
	}

	tapSwipe.x = x;
	tapSwipe.y = y;

	var t = new Date();
	tapSwipe.t = t.getTime();

	switch(gCurrentScreen)
	{
		case DEF_SCREEN_SKY:
			if( x > (mon.w / 2))
			{
				tapSwipe.touchArea = 'right';
				tapSwipe.hold = true;
			}
			else
			{
				tapSwipe.touchArea = 'left';
				tapSwipe.hold = true;
			}
			e.preventDefault();
			break;
		case DEF_SCREEN_SETTING:
			if( x < (mon.w / 2))
			{
				tapSwipe.touchArea = 'left';
				tapSwipe.hold = true;
			}
			break;
		case DEF_SCREEN_SKYMAP:
			if( x > (mon.w / 2))
			{
				tapSwipe.touchArea = 'right';
				tapSwipe.hold = true;
			}
//			e.preventDefault();
			break;
		default:
			e.preventDefault();
			break;
	}

}
var funcTouchMove = function(e)
{

	if( tapSwipe.hold)
	{
		var x, y;
		if (e.originalEvent.touches)
		{
			x = e.originalEvent.touches[0].pageX;
			y = e.originalEvent.touches[0].pageY;
		}
		else if (e.changedTouches)
		{
			x = e.changedTouches[0].pageX;
			y = e.changedTouches[0].pageY;
		}
		else if( e.touches )
		{
			x = e.touches[0].pageX;
			y = e.touches[0].pageY;
		}
		else
		{
			x = e.pageX;
			y = e.pageY;
		}

		var t = new Date();
		if( (t.getTime() - tapSwipe.t) > 500)
		{
			tapSwipe.hold = false;
		}
		else if( Math.abs(tapSwipe.x - x) > (mon.w / 2)+1)
		{
			tapSwipe.hold = false;

			//	スワイプ処理
			switch(gCurrentScreen)
			{
				case DEF_SCREEN_SKY:
					if( gNavi.valid)
					{
						if( tapSwipe.touchArea == 'right' && gNavi.permitSwipe == 'left')
						{
							gNavi.hide(function(){
								showSetting( SwipeDuration, function(){
									gNavi.next();
								});
							});
						}
						else if( tapSwipe.touchArea == 'left' && gNavi.permitSwipe == 'right')
						{
							gNavi.hide(function(){
								showSkyMap( SwipeDuration, function(){
									gNavi.next();
								});
							});
						}
					}
					else
					{
						if( tapSwipe.touchArea == 'right')
						{
							showSetting( SwipeDuration);
						}
						else if( tapSwipe.touchArea == 'left')
						{
							showSkyMap( SwipeDuration);
						}
					}

					break;
				case DEF_SCREEN_SETTING:
					if( gNavi.valid)
					{
						if( tapSwipe.touchArea == 'left' && gNavi.permitSwipe == 'right')
						{
							gNavi.hide(function(){
								set2sky( SwipeDuration, function(){
									gNavi.next();
								});
							});
						}
					}
					else
					{
						if( tapSwipe.touchArea == 'left')
						{
							set2sky( SwipeDuration);
						}
					}

					break;
				case DEF_SCREEN_SKYMAP:
					if( gNavi.valid)
					{
						if( tapSwipe.touchArea == 'right' && gNavi.permitSwipe == 'left')
						{
							gNavi.hide(function(){
								hideSkyMap( SwipeDuration, function(){
									gNavi.next();
								});
							});
						}
					}
					else
					{
						if( tapSwipe.touchArea == 'right')
						{
							hideSkyMap( SwipeDuration);
						}
					}

					break;
				default:
					break;
			}

			e.stopPropagation();
			return false;

		}
	}
}
var funcTouchEnd = function(e)
{
	tapSwipe.hold = false;
	tapSwipe.touchArea = '';
}







var dlgOK = function(){}
var dlgConfirmOK = function(){}
var dlgProgressInst = null;

function showMessage( title, msg, func)
{
/*
	if( title.length > 0){	title += '<br><br>';}
	$('#dlg_title').html( title);
*/

	$('#dlg_msg').html( msg);

	if( func == void 0)
	{
		dlgOK = function(){	};
	}
	else
	{
		dlgOK = func;
	}

	$('#dlg').mobiscroll().widget({
		lang: _LANG,
//		theme: 'android-holo-light',
		lang: 'ja',
		display: 'modal',
		closeOnOverlay: false,
		headerText: title,
		buttons: [
			{
			text: 'OK', 
			handler: function (event, inst) { 
				inst.destroy();
				dlgOK();
				}
			}
		]
	});
	$('#dlg').mobiscroll('show'); 
}
function showConfirm( title, msg, func)
{
/*
	if( title.length > 0){	title += '<br><br>';}
	$('#dlg_title').html( title);
*/
	$('#dlg_msg').html( msg);
	dlgConfirmOK = func;

	$('#dlg').mobiscroll().widget({
		lang: _LANG,
//		theme: 'android-holo-light',
		lang: 'ja',
		display: 'modal',
		closeOnOverlay: false,
		headerText: title,
		buttons: [
			{
				text: 'OK', 
				handler: function (event, inst) { 
					inst.destroy();
					dlgConfirmOK();
				}
			},
			{
				text: UI_TEXT_CANCEL,
				handler: function (event, inst) { 
					inst.cancel();
				}
			}
		]
	});
	$('#dlg').mobiscroll('show'); 
}
function showProgress( title)
{

//	if( dlgProgressInst != null)
//		return;

/*
	if( title.length > 0){	title += '<br><br>';}
	$('#dlg_progress_title').html( title);
*/

	$('#dlg_progress').mobiscroll().widget({
		lang: _LANG,
//		theme: 'android-holo-light',
		lang: 'ja',
		display: 'modal',
		closeOnOverlay: false,
		headerText: title,
		buttons: [
		]
	});

	dlgProgressInst = $('#bar_progress').mobiscroll('getInst');

	dlgProgressInst.setVal(0);
	dlgProgressInst.settings.returnAffix = false;

	$('#dlg_progress').mobiscroll('show');
}
function setProgressVal(val)
{
	if( dlgProgressInst == null)
		return;

//console.log('setProgressVal',val);


	dlgProgressInst.setVal(val);
//	dlgProgressInst.refresh();

}
function closeProgress()
{
	if( dlgProgressInst == null)
		return;

//console.log('closeProgress');

	$('#dlg_progress').mobiscroll('getInst').destroy();
//	$('#dlg_progress').mobiscroll('getInst').hide();
//	$('#dlg_progress').mobiscroll('hide'); 

	dlgProgressInst = null;
}






function showSetting(dur,afterfunc)
{
	if( gCurrentScreen != DEF_SCREEN_SKY)
	{
		return;
	}

	imgSkyTimer.visible = false;

	$('#setting').css('left', mon.w+'px');
	$('#setting').css('visibility','visible');


	//	初めだけスクロール出来ない対策
	if( $($('#menutab').find('[data-selected]')[0]).attr('data-id') == 1)
	{
		$('#menutab').mobiscroll('navigate',1);
	}

	$('#setting').animate({
		left: '0px',
	},dur,'swing',function (){
		stopTimer();

		if( gSkyTimerMode && udata_st_bk.store)
		{
			//	退避したソラのトケイ情報を復元
			udata.digi = udata_st_bk.digi;
			udata.gps = udata_st_bk.gps;
			udata.pcc = udata_st_bk.pcc;
			udata.pcc_code = udata_st_bk.pcc_code;
			udata.arrowTime = new Array();
			for( var i=0; i<udata_st_bk.arrowTime.length; i++)
			{
				udata.arrowTime.push(udata_st_bk.arrowTime[i]);
			}
			udata.arrowTimeTemp = new Array();
			for( var i=0; i<udata_st_bk.arrowTimeTemp.length; i++)
			{
				udata.arrowTimeTemp.push(udata_st_bk.arrowTimeTemp[i]);
			}
			udata_st_bk.store = false;

			gSkyTimerMode = false;
		}

		if( afterfunc != void 0)
		{
			(afterfunc)();
		}
		gCurrentScreen = DEF_SCREEN_SETTING;

	});
}
function showSky(dur,afterfunc)
{
	if( gCurrentScreen == DEF_SCREEN_SKY)
	{
		return;
	}

	$('#setting').animate({ 
		left: mon.w+'px',
		},
		dur,'swing',
		function() {
			$('#setting').css('visibility','hidden');
			$('#setting').css('left', '0px');

			if( afterfunc != void 0)
			{
				(afterfunc)();
			}
			gCurrentScreen = DEF_SCREEN_SKY;
	});

	addLSP();
}
function showSkyMap(dur,afterfunc)
{
	if( gCurrentScreen != DEF_SCREEN_SKY)
	{
		return;
	}

	$('#skymap').css('left', -mon.w+'px');
	$('#skymap').css('visibility','visible');

	$('#skymap').animate({
		left: '0px',
	},dur,'swing',function (){

		if( afterfunc != void 0)
		{
			(afterfunc)();
		}
		gCurrentScreen = DEF_SCREEN_SKYMAP;
	});
}
function hideSkyMap(dur,afterfunc)
{
	if( gCurrentScreen != DEF_SCREEN_SKYMAP)
	{
		return;
	}

	$('#skymap').animate({
		left: -mon.w+'px',
	},dur,'swing',function (){

		$('#skymap').css('visibility','hidden');
		$('#skymap').css('left', '0px');

		if( afterfunc != void 0)
		{
			(afterfunc)();
		}
		gCurrentScreen = DEF_SCREEN_SKY;
	});
}



function init_sky()
{
	stage = new cavy.Stage('sky', mon.w, mon.h,true);
	stage.fitImage = true;
	stage.fitType = 'cover';

	imgMorning = new cavy.Sprite(preload.get('sky_morning'));
	imgMorning.width = mon.w;
	imgMorning.height = mon.h;
	imgMorning.fitImage = true;
	imgMorning.fitType = 'cover';
	imgMorning.opacity = 1;
	imgMorning.originX = 0;
	imgMorning.originY = 0;
	imgMorning.visible = true;

	imgNoon = new cavy.Sprite(preload.get('sky_noon'));
	imgNoon.width = mon.w;
	imgNoon.height = mon.h;
	imgNoon.fitImage = true;
	imgNoon.fitType = 'cover';
	imgNoon.visible = false;

	imgEvening = new cavy.Sprite(preload.get('sky_evening'));
	imgEvening.width = mon.w;
	imgEvening.height = mon.h;
	imgEvening.fitImage = true;
	imgEvening.fitType = 'cover';
	imgEvening.visible = false;

	imgNight = new cavy.Sprite(preload.get('sky_night'));
	imgNight.width = mon.w;
	imgNight.height = mon.h;
	imgNight.fitImage = true;
	imgNight.fitType = 'cover';
	imgNight.visible = false;

	imgSun = new cavy.Sprite(preload.get('sky_sun'));
	imgSun.originX = 0.5;
	imgSun.originY = 0.5;
	imgSun.scaleX = 0.7;
	imgSun.scaleY = 0.7;
	imgSun.visible = false;
//	imgSun.filter = 'lighter';

	imgMoon = new cavy.Sprite(preload.get('sky_moon'));
	imgMoon.width = 160;
	imgMoon.height = 160;
	imgMoon.offsetX = 0;
	imgMoon.offsetY = 0;
	imgMoon.originX = 0.5;
	imgMoon.originY = 0.5;
	imgMoon.scaleX = 0.9;
	imgMoon.scaleY = 0.9;
	imgMoon.visible = false;
	imgMoon.filter = 'lighter';


	imgClockColon = new cavy.Sprite(preload.get('sky_digicolon'));
	imgClockColon.width = 15;
	imgClockColon.height = 74;
	imgClockColon.offsetX = 0;
	imgClockColon.offsetY = 0;
	imgClockColon.originX = 0.5;
	imgClockColon.originY = 0.5;
//	imgClockColon.visible = udata.digi;
	imgClockColon.visible = false;

	var diginum = new cavy.Sprite(preload.get('sky_diginums'));
	diginum.width = 50;
	diginum.height = 74;
	diginum.offsetX = 0;
	diginum.offsetY = 0;
	diginum.originX = 0.5;
	diginum.originY = 0.5;
	diginum.x = imgClockColon.width / 2;
	diginum.y = imgClockColon.height / 2;
	diginum.visible = true;

	imgClockColon.addChild(diginum.clone());
	imgClockColon.addChild(diginum.clone());
	imgClockColon.addChild(diginum.clone());
	imgClockColon.addChild(diginum.clone());
	imgClockColon.children[0].x -= (diginum.width+4) * 1.7;
	imgClockColon.children[1].x -= (diginum.width+4) * 0.7;
	imgClockColon.children[2].x += (diginum.width+4) * 0.7;
	imgClockColon.children[3].x += (diginum.width+4) * 1.7;


	imgSkyTimer = new cavy.Sprite(preload.get('indicator_skytimer'));
	imgSkyTimer.originX = 0.5;
	imgSkyTimer.originY = 1;
	imgSkyTimer.opacity = 0.3;
	imgSkyTimer.x = mon.c.x;
	imgSkyTimer.y = mon.h - 10;
	imgSkyTimer.visible = false;



	stage.addChild(imgMorning);		//	index 0-3が背景空画像
	stage.addChild(imgNoon);
	stage.addChild(imgEvening);
	stage.addChild(imgNight);

	stage.addChild(imgSun);
	stage.addChild(imgMoon);
	stage.addChild(imgClockColon);

	stage.addChild(imgSkyTimer);

//	stage.startRender();


}


function update_setting()
{
	stage.destroy();
	checkOrientation();
	stage.update(0);
}



function loadingView( flag)
{
	var target = $('#loading');

	if( !flag)
	{
		target.css('visibility','hidden');
		document.body.className = '';
		document.onkeydown = null;
		return;
	}

	target.css('height', mon.h+'px');
	document.body.className = 'no-action';
	document.onkeydown = function() {	return false;	}
  
	target.css('padding-top', mon.h / 2 +'px');
	target.css('visibility','visible');


/*
	var target = document.getElementById('loading');

	if( !flag)
	{
		target.style.visibility = 'hidden';
		document.body.className = '';
		document.onkeydown = null;
		return;
	}

	target.style.height = mon.h+'px';
	document.body.className = 'no-action';
	document.onkeydown = function() {	return false;	}
  
	document.getElementById('loading').style.paddingTop = mon.h / 2 +'px';

	target.style.visibility = 'visible';
*/
}







//==========================================================
//	画面の向き初期化
function initOrientation()
{
	var ori = mon.o;
	if('orientation' in window)
	{
		var o1 = ($(window).width() < $(window).height());
		var o2 = (window.orientation % 180 == 0);
		ori = (o1 && o2) || !(o1 || o2);
	}

//	mon.w = window.innerWidth;
//	mon.h = window.innerHeight;
	mon.w = $(window).width();
	mon.h = $(window).height();

	mon.c.x = mon.w / 2;
	mon.c.y = mon.h / 2;
	mon.aspect = mon.w / mon.h;

	mon.s = 1.0;
	if( mon.w < 900 || mon.h < 900)
	{
		if( mon.w < mon.h)		mon.s = (mon.w-130) / mon.w;
		else if( mon.w > mon.h)	mon.s = (mon.h-140) / mon.h;
	}

	mon.o = ori;

}

//	画面の向き
function checkOrientation()
{
	initOrientation();

	//	canvasのサイズを画面に合わせて変更
	stage.context.canvas.width = mon.w;
	stage.context.canvas.height = mon.h;

	//	stageのサイズ変更
	stage.width = mon.w;
	stage.height = mon.h;

	//	空背景のサイズ変更と位置を調整
	for( var i=0; i<4; i++)	//	空背景
	{
		stage.children[i].width = mon.w;
		stage.children[i].height = mon.h;
		if( i >= 4)
			break;

		if( mon.aspect > 1.0)
		{
			stage.children[i].x = 0;
			stage.children[i].y = ((mon.w*0.75)-mon.h) / -2;
			if( stage.children[i].y > 0){	stage.children[i].y = 0;}
		}
		else
		{
			stage.children[i].x = ((mon.h/0.75)-mon.w) / -2;
			stage.children[i].y = 0;
		}
	}

	//	太陽、月の位置サイズ調整

	//	時刻の位置サイズ調整
	imgClockColon.x = mon.c.x;
	imgClockColon.y = mon.c.y;


	$('#setting').css('width', mon.w+'px');
//	if( $('#setting').css('left') != '0px' && gCurrentScreen == DEF_SCREEN_SETTING)
//		$('#setting').css('left', mon.w+'px');

	$('#skymap').css('width', mon.w+'px');
//	if( $('#skymap').css('left') != '0px')
//		$('#skymap').css('left', -mon.w+'px');

	if( instSkyMap)
		instSkyMap.draw( mon.w, mon.h);

	var tabs = $('#menutab').children('li');
	for( var i=0; i<tabs.length; i++)
	{
		tabs[i].style.width = mon.w / 4 + 'px';
	}

	var ele = $('#scrollarea').find('.menutab-list-sel');
	if( ele.length > 0)
	{
		$(ele[0]).removeClass('menutab-list-sel');
		$('#scrollarea').scrollTop(0);
		$(ele[0]).addClass('menutab-list-sel');
	}

	if( gNavi.valid)
	{
		gNavi.update( mon.w, mon.h);
	}

}




//*************************************
//
//	相対時刻計算
//
function getRelationalTime(srctime)
{

	presentDate = new Date(srctime);

	var nYear = presentDate.getFullYear();
	var nMonth = presentDate.getMonth();
	var nDay = presentDate.getDate();
	var nHour = presentDate.getHours();
	var nMin = presentDate.getMinutes();
	var nSec = presentDate.getSeconds() + presentDate.getMilliseconds() / 1000;

//document.getElementById('rt').innerHTML = ('0'+nHour).substr(-2,2) + ':' + ('0'+nMin).substr(-2,2);


//	var deg_clock = (nHour*60.0+nMin) / 1440.0 * 360.0;
	var deg_clock = (nHour*60.0+nMin+(nSec/60)) / 1440.0 * 360.0;


	//	有効なものだけをコピー
	var validTime = new Array();
	for( var i=0; i<udata.arrowTime.length; i++)
	{
		if( udata.arrowTime[i].angle != DEF_ARROW_ANGLE_NONE)
			validTime.push(udata.arrowTime[i]);
	}

	for( var i=0; i<validTime.length; i++)
	{
		var ptr1, ptr2;
		ptr1 = i;
		if( i == (validTime.length-1))	ptr2 = 0;
		else									ptr2 = i + 1;

		var deg1, deg2;
		deg1 = validTime[ptr1].angle;
		deg2 = validTime[ptr2].angle;
		if( validTime.length == 1)
			deg2 = validTime[ptr1].angle - 0.1;

		if( deg1 >= deg2)	deg2 += 360;


		if( (deg_clock >= deg1 && deg_clock < deg2) || ((deg_clock+360.0) >= deg1 && (deg_clock+360.0) < deg2))
		{
			if( deg_clock < deg1)
				deg_clock += 360.0;

			var deg_range = deg2 - deg1;
			var deg_clock_per = (deg_clock - deg1) / deg_range;

			var hh1 = validTime[ptr1].hour;
			var hh2 = validTime[ptr2].hour;

			if( validTime.length == 1)
				hh2 = hh1 - 0.006;


			var oneDay = 86400000;	//24.0 * 60.0 * 60.0 * 1000;

			var newDay = nDay;
			if( (nHour+nMin/60) < hh1)
				newDay = nDay - 1;

			var mm,ss;

			mm = (hh1 % 1) * 60;
			ss = parseInt((mm % 1) * 60);
			var date1 = new Date(nYear, nMonth, newDay, parseInt(hh1), parseInt(mm), ss);
			var itv1 = date1.getTime();

			mm = (hh2 % 1) * 60;
			ss = parseInt((mm % 1) * 60);
			var date2 = new Date(nYear, nMonth, newDay, hh2, mm, ss);
			var itv2 = date2.getTime();
			if( itv2 < itv1)
				itv2 += oneDay;

			var len = (itv2 - itv1) * deg_clock_per;
			var rdate = new Date( (itv1 + len));

			//	時間速度計算
			var angrt = (itv2 - itv1) / oneDay * 360;
			var angvt = (deg2-deg1);
			gCurTImeSpeed = angvt / angrt;		//	1..等速
			gCurTImeSpeed = angrt / angvt;		//	1..等速

			return rdate;

		}

	}
	return presentDate;
}

//	相対時刻（単位：時）を実時刻（単位：時）に変換
function getRelation2RealHour(hour)
{
	var deg_clock = hour / 24 * 360;

	//	有効なものだけをコピー
	var validTime = new Array();
	for( var i=0; i<udata.arrowTime.length; i++)
	{
		if( udata.arrowTime[i].angle != DEF_ARROW_ANGLE_NONE)
			validTime.push(udata.arrowTime[i]);
	}

	for( var i=0; i<validTime.length; i++)
	{
		var ptr1, ptr2;
		ptr1 = i;
		if( i == (validTime.length-1))	ptr2 = 0;
		else							ptr2 = i + 1;

		var deg1, deg2;
		deg1 = validTime[ptr1].hour / 24 * 360;
		deg2 = validTime[ptr2].hour / 24 * 360;
		if( deg1 >= deg2)	deg2 += 360;

		if( (deg_clock >= deg1 && deg_clock < deg2) || ((deg_clock+360.0) >= deg1 && (deg_clock+360.0) < deg2))
		{
			if( deg_clock < deg1)
				deg_clock += 360.0;

			var deg_range = deg2 - deg1;
			var deg_clock_per = (deg_clock - deg1) / deg_range;

			var h1 = validTime[ptr1].angle / 360 * 24;
			var h2 = validTime[ptr2].angle / 360 * 24;
			if( h1 >= h2)	h2 += 24;
			var h_range = h2 - h1;

			var rh = (h_range * deg_clock_per + h1) % 24;
			return rh;
		}
	}
	return hour;
}





//	現在の描画タイミングで太陽または月が移動するピクセル数を計算
//	（必要以上に描画させない為）
function checkFPS()
{
	var pass = getPass(myTime);

	var rad1 = pass / 86400 * 360;
	var rad2 = gPass / 86400 * 360;
	var pitch = Math.sin(DEG2RAD((rad1-rad2)/2))*mon.h*2;

	gPass = pass;

	return Math.abs(pitch);
}

function getPass(t)
{
	return ( t.getHours() * 60 * 60) + (t.getMinutes() * 60) + t.getSeconds() + (t.getMilliseconds() / 1000);
}

//======================================================
//
//		空画面描画
//
function whisper(show)
{

	clearTimeout(timer_whisper);
	timer_whisper = null;
	for( var i=0; i<document.getElementsByClassName('whisper_text').length; i++)
	{
		if( document.getElementsByClassName('whisper_text')[i].classList.contains('fade'))
			document.getElementsByClassName('whisper_text')[i].classList.remove('fade');
		if( document.getElementsByClassName('whisper_text')[i].classList.contains('whisper_show'))
			document.getElementsByClassName('whisper_text')[i].classList.remove('whisper_show');
	}

	if( show)
	{
		if( udata.whisper != 3)
		{
			for( var i=0; i<document.getElementsByClassName('whisper_text').length; i++)
			{
				if( !document.getElementsByClassName('whisper_text')[i].classList.contains('fade'))
					document.getElementsByClassName('whisper_text')[i].classList.add('fade');
				if( !document.getElementsByClassName('whisper_text')[i].classList.contains('whisper_show'))
					document.getElementsByClassName('whisper_text')[i].classList.add('whisper_show');
			}
		}

		if( udata.whisper == 2 && timer_whisper == null)		//	始まりだけ表示する
		{
			timer_whisper = setTimeout( function(){
				for( var i=0; i<document.getElementsByClassName('whisper_text').length; i++)
				{
					if( document.getElementsByClassName('whisper_text')[i].classList.contains('whisper_show'))
						document.getElementsByClassName('whisper_text')[i].classList.remove('whisper_show');
				}
				timer_whisper = null;
			}, WHISPER_TIME);
		}
		return;
	}

}



function drawsky()
{
	var nYear = myTime.getFullYear();
	var nMonth = myTime.getMonth();
	var nDay = myTime.getDate();
	var nHour = myTime.getHours();
	var nMin = myTime.getMinutes();
	var nSec = myTime.getSeconds();

	var pass = getPass(myTime);
	var jisa = myTime.getTimezoneOffset() / -60;


	var sunrize = DEF_SUNRIZE * 3600;
	var sunset = DEF_SUNSET * 3600;
	var twilight = kSTParamTwiLight;
	if( gps_stat && udata.gps)
	{
		var suntime = new SunTime(myTime, jisa, longitude, latitude);
		sunrize = suntime.getSunRise(0);
		sunset = suntime.getSunSet(0);
		twilight = suntime.getTwiLight();
	}


	// season	gesi(6/22)=1.0,toji(12/22)=-1.0 
	var season = 0.0;
	var gesi = new Date(nYear, 5, 22, nHour, nMin, nSec);
	var since = parseInt((gesi.getTime() - myTime.getTime()) / 1000);	//	夏至との差を秒に

	var half = 15768000;	//	182.5 * 24 * 60 * 60;
	season = (Math.abs(1.0 - (Math.abs(since) / half))) * 2.0 - 1.0;
	
	//	season
	var seasonTime;

	//	日の出（薄明）時刻（秒単位）
	var datecal = new Date(nYear, nMonth, nDay,0,0, sunrize);
    seasonTime = (datecal.getHours() * 60 * 60) + (datecal.getMinutes() * 60) + datecal.getSeconds() - (DEF_TWILIGHT_SUNRISE_MIN * 60);	//	薄明80分
	bgTimes[1] = seasonTime;	//	(1)end of night
    seasonTime = (datecal.getHours() * 60 * 60) + (datecal.getMinutes() * 60) + datecal.getSeconds();	
	bgTimes[2] = seasonTime;	//	(2)morning

//	seasonTime = parseInt((8 + (1.0 * season)) * 60 * 60);		//	明るくなるまで30分 x 夏至／冬至
	seasonTime = seasonTime + ((45 + (15 * season)) * 60);		//	明るくなるまで45分 x 夏至／冬至で15分前後
	bgTimes[3] = parseInt( seasonTime);	//	(3)noon

	//	日の入り時刻（秒単位）
	datecal = new Date(nYear, nMonth, nDay,0,0, sunset);
    seasonTime = (datecal.getHours() * 60 * 60) + (datecal.getMinutes() * 60) + datecal.getSeconds();	
//	var yuu =  seasonTime - (45 * 60);		//	45分前から開始
	var yuu =  seasonTime - ((45 + (15 * season)) * 60);		//	45分前から開始 x 夏至／冬至で15分前後
	bgTimes[4] = parseInt( yuu);			//	(4)end of noon
	bgTimes[5] = seasonTime;	//	(5)evening
    seasonTime = (datecal.getHours() * 60 * 60) + (datecal.getMinutes() * 60) + datecal.getSeconds() + (DEF_TWILIGHT_SUNSET_MIN * 60);	//	薄明60分
	bgTimes[6] = seasonTime;	//	(6)start of night

/*//debug用
var str = '';
for( var i=1; i<bgTimes.length; i++)
{
	var hhh = parseInt(bgTimes[i] / 3600);
	var mmm = parseInt((bgTimes[i] - hhh * 3600) / 60);
	var sss = bgTimes[i] % 60;

	str += '[' + i + '] ' + hhh + ':'+ mmm + ':' + sss + ' / ';
}
console.log(str);
*/

    var timeBelt;
    var balance;
    
    var num1;
    var num2;
    var tmp;
    timeBelt = 0;
    balance = 0.0;
    for(var i=0; i<(bgTimes.length-1); i++)
    {
        num1 = bgTimes[i];
        num2 = bgTimes[(i+1)];
        if( pass >= num1 && pass < num2)
        {
            timeBelt = i;	
			tmp = (num2 - num1);
			
			if( i == 0 || i == (bgTimes.length-2))
			{
				var lastnight;
				lastnight = bgTimes[(bgTimes.length-1)] - bgTimes[(bgTimes.length-2)];
				tmp += lastnight;
				num1 -= lastnight;
			}
						
			balance = (pass - num1) / tmp;
            break;
        }
    }



    // moon age
	moonAge = calcMoonAge( nYear, nMonth + 1, nDay, nHour);
//moonAge = 15;
	imgMoon.offsetX = moonAge % 5;
	imgMoon.offsetY = parseInt(moonAge / 5);


    //	sun & moon
	imgSun.visible = true;
	imgMoon.visible = true;

//	var ang_sate = 90;
	var ang_sate = 180;

	//  sun
	var vislen = bgTimes[5] - bgTimes[2];
	var deg = ang_sate * (pass - bgTimes[2]) / vislen;
	drawSatelite(imgSun,season,deg);

	//  moon
	var nightlen = bgTimes[(bgTimes.length-1)] - bgTimes[(bgTimes.length-2)];
	vislen = nightlen + bgTimes[1];
	var pass2 = pass;
	if( timeBelt >= 0 && timeBelt <= 2)
	{
		pass2 += nightlen;
		deg = ang_sate * pass2 / vislen;
	}
	else
	{
		deg = ang_sate * (pass - bgTimes[(bgTimes.length-2)]) / vislen;
	}
	drawSatelite(imgMoon,season,deg);




	// background
	if( timeBelt == 0 || timeBelt == 6)
    {
		//  night
		imgMorning.visible = false;
		imgNoon.visible = false;
		imgEvening.visible = false;
		imgNight.visible = true;
		
		imgNight.opacity = 1.0;
	}
	else if( timeBelt == 1)
	{
		//  night to morning
		imgMorning.visible = true;
		imgNoon.visible = false;
		imgEvening.visible = false;
		imgNight.visible = true;
		
		imgMorning.opacity = 1.0;
		imgNight.opacity = 1.0 - balance;
	}
	else if( timeBelt == 2)
	{
		//  morning to noon
		imgMorning.visible = true;
		imgNoon.visible = true;
		imgEvening.visible = false;
		imgNight.visible = false;

	
		imgMorning.opacity = 1.0;
		imgNoon.opacity = balance;
	}
	else if( timeBelt == 3)
	{
		//	noon
		imgMorning.visible = false;
		imgNoon.visible = true;
		imgEvening.visible = false;
		imgNight.visible = false;
		
		imgNoon.opacity = 1.0;
	}
	else if( timeBelt == 4)
	{
		//  noon to evening
		imgMorning.visible = false;
		imgNoon.visible = true;
		imgEvening.visible = true;
		imgNight.visible = false;
		
		imgNoon.opacity = 1.0;
		imgEvening.opacity = balance;
	}
	else if( timeBelt == 5)
	{
		//  evening to night
		imgMorning.visible = false;
		imgNoon.visible = false;
		imgEvening.visible = true;
		imgNight.visible = true;
		
		imgEvening.opacity = 1.0;
		imgNight.opacity = balance;
    }


	//	時刻表示
	if( imgSkyTimer.visible)
	{
		imgClockColon.visible = false;
		$('#digital_text').html('');
	}
	else if( udata.digi > 0)
	{
		var h1 = parseInt(nHour / 10);
		var h2 = nHour % 10;
		var m1 = parseInt(nMin / 10);
		var m2 = nMin % 10;

		if( udata.digi == 1)
		{
			imgClockColon.children[0].offsetX = h1;
			imgClockColon.children[1].offsetX = h2;
			imgClockColon.children[2].offsetX = m1;
			imgClockColon.children[3].offsetX = m2;

			for( var i=0; i<imgClockColon.children.length; i++)
			{
				if( timeBelt >= 2 && timeBelt <= 4)		imgClockColon.children[i].positionY = 0;
				else									imgClockColon.children[i].positionY = imgClockColon.height;
			}
			if( timeBelt >= 2 && timeBelt <= 4)		imgClockColon.positionY = 0;
			else									imgClockColon.positionY = imgClockColon.height;
//			imgClockColon.visible = true;
		}
		else if( udata.digi == 2)
		{
			var timeString = '' + h1 + h2 + ':' + m1 + m2;
			$('#digital_text').html(timeString);
//			$('#digital_text').show();
		}
		
	}
/*
	else
	{
		imgClockColon.visible = false;
		$('#digital_text').hide();
	}
*/

	//	スカイタイマーインジケーター表示
	imgSkyTimer.x = mon.c.x;
	imgSkyTimer.y = mon.h - 10;

}

//	太陽、月の位置、角度、不透明度
function drawSatelite( obj, season, deg)
{

	var tall = mon.h * 0.8;
	var cx = (mon.w > mon.h) ? (mon.w / 2) : tall;


//	rad = (135.0 - deg) * Math.PI / 180.0;
	rad = (180 - deg) * Math.PI / 180.0;
	var x0 = cx;		//	半径
	var y0 = 0.0;
	var x1 = x0*Math.cos(rad) - y0*Math.sin(rad);
	var y1 = x0*Math.sin(rad) + y0*Math.cos(rad);


	//	南半球は右から左に	ver1.1
	if( latitude < 0)
		x1 *= -1;


//	var sink = 200;		//	回転中心を埋め込む距離
	var sink = mon.h * 0.1;		//	回転中心を埋め込む距離
	var oval = (tall + sink) / x0;

	//	縦画面の場合	ver1.1
	if( mon.w < mon.h)
		x1 *= mon.w / mon.h * 0.6;


	x1 += mon.c.x;				//	中心点ｘ

	y1 = mon.h + sink - y1 * oval;
//	y1 = mon.h - y1 + mon.h * 0.3;	//	中心点ｙ
//	y1 -= season * 50.0;		//	季節で太陽の高さを調整
//	y1 = mon.h - y1 + sink;		//	中心点ｙ

	//	季節によって高さをプラスマイナス40ほどずらす（夏至、冬至）
	y1 -= season * 40.0;	//	季節で太陽の高さを調整（season -1～1）



	obj.x = x1;
	obj.y = y1;

	obj.rotation = deg - 90;


	if( obj.rotation >= -90 && obj.rotation <= 90)
	{
		obj.opacity = 1;
	}
	else if( obj.rotation >= -100 && obj.rotation < -90)
	{
		obj.opacity = (obj.rotation+100) / 10;
	}
	else if( obj.rotation > 90 && obj.rotation <= 100)
	{
		obj.opacity = (100-obj.rotation) / 10;
	}
	else
	{
		obj.opacity = 0;
	}


	//	南半球は180度回転		ver1.1
	if( latitude < 0)
		obj.rotation = (obj.rotation + 180) % 360;

}




//	日の出、日の入りの時刻（１０進）の取得
function getSunTime(dir)
{
	if( !(gps_stat && udata.gps))
	{
		if( dir)
		{
			return DEF_SUNRIZE;
		}
		else
		{
			return DEF_SUNSET;
		}
	}

	var now = new Date();
	var jisa = now.getTimezoneOffset() / -60;

	var suntime = new SunTime(now, jisa, longitude, latitude);

	var t;
	if( dir)
	{
		//	日の出
		t = suntime.getSunRise(0) / 3600;
	}
	else
	{
		//	日の入り
		t = suntime.getSunSet(0) / 3600;
	}
	if( t < 0)
		t += 24;

	return t;
}





//****************************************
//	HTMLエンティティをエスケープ／案エスケープ
function escapeHTML(str)
{
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
function unescapeHTML(str)
{
	return str
		.replace(/(&lt;)/g, '<')
		.replace(/(&gt;)/g, '>')
		.replace(/(&quot;)/g, '"')
		.replace(/(&#39;)/g, "'")
		.replace(/(&amp;)/g, '&');
}


function dispatchClick(id)
{
	var evt = document.createEvent('MouseEvents');
	if( ua() == 'ie' )
	{
		// IEの場合
		elem.fireEvent('click');
	}
	else
	{
		evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		document.getElementById(id).dispatchEvent( evt );
	}
}


//	時間を
function pitchshiftTime(tname, basetime)
{

	var t1 = getTimeField('t_wakeup');
	var t2 = getTimeField('t_lunch');
	var t3 = getTimeField('t_endwork');

	var dif1 = subTimes(t2,t1);
	var dif2 = subTimes(t3,t2);
	var dif3 = subTimes(t1,t3);

	var sht = 0;
	switch( tname)
	{
		case 't_wakeup':
			sht = basetime - t1;
			break;
		case 't_lunch':
			sht = basetime - t2;
			break;
		case 't_endwork':
			sht = basetime - t3;
			break;
	}

	setTimeField('t_wakeup', (t1 + sht + 24) % 24);
	setTimeField('t_lunch', (t2 + sht + 24) % 24);
	setTimeField('t_endwork', (t3 + sht + 24) % 24);
}

function subTimes( t1, t2)
{
	if( t1 < t2)
	{
		return ((t1 + 24) - t2);
	}
	return (t1 - t2);
}



function openBrowser(url)
{
	window.open(url,'_blank');
}

function getBrightMode()
{
	return udata.bright;
}








//****************************************
//	Private Clock Cloud　連携
//****************************************
function pccControleStop()
{
	udata.arrowTime = new Array();
	for( var i=0; i<udata.arrowTimeTemp.length; i++)
	{
		udata.arrowTime.push(udata.arrowTimeTemp[i]);
	}
	udata.arrowTimeTemp = new Array();


	$('#text_btn_pcc_start').removeAttr('hidden');
	$('#text_btn_pcc_stop').attr({'hidden':'hidden'});
	$('#text_pcc_indicator').attr({'hidden':'hidden'});

	$('#text_pcc_code').attr('readonly',false);
	udata.pcc = false;

	saveLocal(false);

}
function pccControleStart(pccparam)
{

console.log(pccparam);

	//退避
	udata.arrowTimeTemp = new Array();
	for( var i=0; i<udata.arrowTime.length; i++)
	{
		udata.arrowTimeTemp.push(udata.arrowTime[i]);
	}
	
	udata.arrowTime = new Array();
	for( let i=0; i<pccparam.length; i++)
	{
		udata.arrowTime.push(new arrayArrow(pccparam[i][0],pccparam[i][1]));
	}

	$('#text_btn_pcc_start').attr({'hidden':'hidden'});
	$('#text_btn_pcc_stop').removeAttr('hidden');
	$('#text_pcc_indicator').removeAttr('hidden');

	$('#text_pcc_code').attr('readonly',true);
	udata.pcc = true;

	saveLocal(false);

}
var pccTimeoutSecond = 5000;
var pccTimeoutHandle = null;
function getPccParam()
{
	//	チェックコード
	let cd = $('#text_pcc_code').val().trim();

	if( cd.length != 23)
	{
		showMessage(MSG_FAIL_PCC_INVALIDATE_TITLE,MSG_FAIL_PCC_INVALIDATE_DESC);
		return -1;
	}

	loadingView( true);


/*
console.log("getPccParam");

//	テスト用ダミー連携
	var param = {"timezone":"+9","relation":[[0,0],[19,17],[8,6]]};
	param.relation.sort(pccParamCompare);	//	並び替え
	for( let i=0; i<param.relation.length; i++)
	{
		//	角度に変換
		let a = hour2angle(param.relation[i][0]);
		param.relation[i][0] = param.relation[i][1];
		param.relation[i][1] = a;
	}
	loadingView( false);

	pccControleStart( param);
	return;
*/


	//	タイムアウト設定
	pccTimeoutHandle = setTimeout(function(){
			
			loadingView( false);
			pccTimeoutHandle = null;
			showMessage( MSG_FAIL_PCC_TIMEOUT_TITLE, MSG_FAIL_PCC_TIMEOUT_DESC);
			return;

		},pccTimeoutSecond);


	let url = URL_PCC_REQUEST + cd;
	httpRequest('GET',url,function(res,data){

		loadingView( false);
		clearTimeout(pccTimeoutHandle);
		pccTimeoutHandle = null;
		if( res == 0)
		{
			if( data.length > 0 )
			{
				var param = JSON.parse(data);
				param.relation.sort(pccParamCompare);	//	並び替え
				for( let i=0; i<param.relation.length; i++)
				{
					//	角度に変換
					let a = hour2angle(param.relation[i][0]);
					param.relation[i][0] = param.relation[i][1];
					param.relation[i][1] = a;
				}

				pccControleStart( param.relation);
				showMessage( MSG_SUCCESS_PCC_PARAM_TITLE, MSG_SUCCESS_PCC_PARAM_DESC);
			}


		}


	},true);

	return null;
}
/*****************
	pcc パラメータのソート
	{"timezone":"+9","relation":[[A,B],[0,0],[19,17],[8,6]]}
	Bで小さい順に並び替え
****************/
function pccParamCompare( a, b ){
  if( a[1] < b[1] )	return -1;
  else if( a[1] > b[1] )	return 1;
  return 0;
}














//****************************************
//	外部照明操作
//****************************************


var hueIP = null;;
var hueUsername = 'sorajikokuuser';
var hueDeviceType = 'sorajikoku#smartphone';
var hueLightAll = new Array();
var hueLights = new Array();


//	ブリッジに登録されているライト全てをコピー
function copyHueAllLights()
{
	hueLights = new Array();
	for( var key in hueLightAll)
	{
		hueLights[key] = hueLightAll[key];
	}
}

//	ブリッジを検索して一覧表示
var HueTimeoutSecond = 5000;
var HueTimeoutHandle = null;

function setTimeoutHueConnect()
{
	
}

/*	検索APIが廃止されたためIPアドレス直入力に変更
function showHueBrideList()
{
	loadingView( true);
	HueTimeoutHandle = setTimeout(function(){
			
			loadingView( false);
			HueTimeoutHandle = null;
			showMessage( MSG_NOTFOUND_BRIDGE_TITLE, MSG_NOTFOUND_BRIDGE_DESC);

		},HueTimeoutSecond);

	httpRequest('GET','https://www.meethue.com/api/nupnp',function(res,data){

		loadingView( false);
		clearTimeout(HueTimeoutHandle);
		HueTimeoutHandle = null;


		if( res == 0)
		{
			var bridge = JSON.parse(data);
			if( bridge.length > 0)
			{
//				hueIP = bridge[0].internalipaddress;

				var str = '';
				for( var i=0; i< bridge.length; i++)
				{
					str += '<option value="' + bridge[i].internalipaddress + '">' + bridge[i].internalipaddress + '</option>';
				}
				$('#hue_bridge').html(str);
				$('#hue_bridge').mobiscroll('show'); 
				return;
			}
		}

		showMessage( MSG_NOTFOUND_BRIDGE_TITLE, MSG_NOTFOUND_BRIDGE_DESC);

	},true);
}
*/
//	接続しているブリッジのライト一覧を表示
function showHueLightsList()
{
	var url = 'http://'+hueIP+'/api/'+hueUsername+'/lights';
	httpRequest('GET',url,function(res,data){
		loadingView( false);

		if( res == 0)
		{
			var lights = JSON.parse(data);
			var str = '';
			for( var key in lights)
			{
				str += '<option value="' + key + ':' + lights[key].name + '">' + lights[key].name + '</option>';
			}
			if( str.length > 0)
			{
				$('#hue_lights').html(str);
				$('#hue_lights').mobiscroll('show');
				return;
			}
		}

		showMessage( MSG_NOTFOUND_LIGHT_TITLE, MSG_NOTFOUND_LIGHT_DESC);
	});
}

function storeLights(arr)
{
	hueLights = new Array();

	for( var i=0; i<arr.length; i++)
	{
		var buf = arr[i].split(':');
		hueLights[buf[0]] = {	name: buf[1]	};
	}
}

//	ブリッジ接続
function connectHueRegBridge(ip)
{
	loadingView( true);

	hueIP = ip;

	var url = 'http://'+hueIP+'/api/'+hueUsername;
	httpRequest('GET',url,function(res,data){

		loadingView( false);
		if( res == 0)
		{

			var rdat = JSON.parse(data);
			if( jQuery.isArray(rdat))
			{
				if( !rdat[0].error)
				{
//					$('#text_title_exlight_bridge_ip').html(hueIP);
					getHueAllLightsList();	//	全ライト取得
				}
			}
			else
			{
//					$('#text_title_exlight_bridge_ip').html(hueIP);
					getHueAllLightsList();	//	全ライト取得
			}

			saveLocal();
			return;
		}
		else
		{
			hueIP = null;
			showMessage( MSG_NOTFOUND_BRIDGE_TITLE, MSG_NOTFOUND_BRIDGE_DESC);
			$('#hue_bridge_ip').val('');
			return;
		}

		//	未登録の場合、ユーサー登録
		addHueRegUser();

	},true);
}
//	ユーザー登録
function addHueRegUser()
{
/*
	var param = {
		devicetype:hueDeviceType,
		username: hueUsername
	};
	2016年4月にusernameは指定しない仕様に変更された
*/
	var param = {
		devicetype:hueDeviceType
	};
	var query = JSON.stringify(param);
	var url = 'http://'+hueIP+'/api';
	httpRequestQuery('POST',url,query,function(res,data){

		loadingView( false);

		if( res == 0)
		{
			var rdat = JSON.parse(data);
			if( rdat[0].success)
			{
				hueUsername = rdat[0].success.username;
//				$('#text_title_exlight_bridge_ip').html(hueIP);

				return;
			}
			else if( rdat[0].error)
			{
				if( rdat[0].error.type == 101)
				{
					showMessage( MSG_RETRY_BRIDGE_TITLE, MSG_RETRY_BRIDGE_DESC);
					return;
				}
			}
		}

//		$('#text_title_exlight_bridge_ip').html(STATUS_HUE_BRIDGE_SELECT);

		showMessage( MSG_FAIL_REG_EXLIGHT_TITLE, MSG_FAIL_REG_EXLIGHT_DESC);

	},true);
}
//	全ライトを取得してhueLightAllに代入
function getHueAllLightsList()
{
	var url = 'http://'+hueIP+'/api/'+hueUsername+'/lights';
	httpRequest('GET',url,function(res,data){

		if( res == 0)
		{
			hueLightAll = new Array();

			var lights = JSON.parse(data);
			var str = '';
			for( var key in lights)
			{
				hueLightAll[key] = {	name: lights[key].name	}
			}
			copyHueAllLights();

			getHueSchedule();		//	登録スケジュールを取得

			return;
		}
		loadingView( false);

		showMessage( MSG_NOTFOUND_LIGHT_TITLE, MSG_NOTFOUND_LIGHT_DESC);
	},true);
}

function getHueSchedule()
{

	hueRegistedScheduleList = new Array();
	var url = 'http://'+hueIP+'/api/'+hueUsername+'/schedules';
	httpRequest('GET',url,function(res,data){

		if( res == 0)
		{
			var rdat = JSON.parse(data);
			for( var name in rdat)
			{
				hueRegistedScheduleList.push({
								key: name										
					});
			}
		}

		hueValidate();
		loadingView( false);

	},true);

}


//	スケジュールが登録されている場合
function hueValidate()
{

	if( hueIP == null)
	{
		$('#text_title_exlight_btn_turnon').prop('disabled', true);
		$('#text_title_exlight_btn_turnoff').prop('disabled', true);
		$('#text_title_exlight_btn_reg').prop('disabled', true);
		$('#text_title_exlight_btn_release').prop('disabled', true);

		return;
	}

	//	スイッチ
	$('#text_title_exlight_btn_turnon').prop('disabled', false);
	$('#text_title_exlight_btn_turnoff').prop('disabled', false);

	//	スケジュール登録
	$('#text_title_exlight_btn_reg').prop('disabled', false);


	if( hueRegistedScheduleList.length == 0)
	{
		//	スケジュールが登録されていない場合
		$('#text_title_exlight_btn_release').prop('disabled', true);
	}
	else
	{
		//	スケジュールが登録されている場合
		$('#text_title_exlight_btn_release').prop('disabled', false);
	}


}


//-------------------------------------
//	下記３つはセットで行う
//		setScheduleListParam();
//		calcScheduleListParam();
//		curColor = getPresentHueLightParam();

//	スケジュールリストパラメータ作成
function setScheduleListParam()
{
	scheduleListParam = new Array();
	for( var i in hueLights)
	{
		for( var j=0; j<hue_schedules['sunrise'].length; j++)
		{
			scheduleListParam.push({
					key: i,
					skyid: 'sunrise',
					ele: j
				});
		}
		for( var j=0; j<hue_schedules['noon'].length; j++)
		{
			scheduleListParam.push({
					key: i,
					skyid: 'noon',
					ele: j
				});
		}
		for( var j=0; j<hue_schedules['sunset'].length; j++)
		{
			scheduleListParam.push({
					key: i,
					skyid: 'sunset',
					ele: j
				});
		}
		for( var j=0; j<hue_schedules['night'].length; j++)
		{
			scheduleListParam.push({
					key: i,
					skyid: 'night',
					ele: j
				});
		}
	}
}
//	各時刻を算出してテーブルに保存
function calcScheduleListParam()
{
	var range;
	var tm,hh,mm;
	range = bgTimes[2] - bgTimes[1];
	for( var i=0; i<hue_schedules['sunrise'].length; i++)
	{
		tm = Math.floor(hue_schedules['sunrise'][i].per*range) + bgTimes[1];
		hh = parseInt(tm / 3600);
		mm = parseInt((tm - hh * 3600) / 60);
		hue_schedules['sunrise'][i].time = ('0' + hh).substr(-2,2) + ':' + ('0' + mm).substr(-2,2);
		hue_schedules['sunrise'][i].tm = tm;
	}

	range = bgTimes[3] - bgTimes[2];
	for( var i=0; i<hue_schedules['noon'].length; i++)
	{
		tm = Math.floor(hue_schedules['noon'][i].per*range) + bgTimes[3];
		hh = parseInt(tm / 3600);
		mm = parseInt((tm - hh * 3600) / 60);
		hue_schedules['noon'][i].time =  ('0' + hh).substr(-2,2) + ':' + ('0' + mm).substr(-2,2);
		hue_schedules['noon'][i].tm = tm;
	}

	range = bgTimes[5] - bgTimes[4];
	for( var i=0; i<hue_schedules['sunset'].length; i++)
	{
		tm = Math.floor(hue_schedules['sunset'][i].per*range) + bgTimes[4];
		hh = parseInt(tm / 3600);
		mm = parseInt((tm - hh * 3600) / 60);
		hue_schedules['sunset'][i].time = ('0' + hh).substr(-2,2) + ':' + ('0' + mm).substr(-2,2);
		hue_schedules['sunset'][i].tm = tm;
	}
	range = bgTimes[6] - bgTimes[5];
	for( var i=0; i<hue_schedules['night'].length; i++)
	{
		tm = Math.floor(hue_schedules['night'][i].per*range) + bgTimes[5];
		hh = parseInt(tm / 3600);
		mm = parseInt((tm - hh * 3600) / 60);
		hue_schedules['night'][i].time = ('0' + hh).substr(-2,2) + ':' + ('0' + mm).substr(-2,2);
		hue_schedules['night'][i].tm = tm;
	}
}
//	現在の時刻の空のライト色を取得
function getPresentHueLightParam()
{

	var prevtm = -1;
	var mt = getRelationalTime(new Date());	//	相対時刻取得
	var curtm = (mt.getHours() * 3600) + (mt.getMinutes() * 60);
	var curColor = {
		'on':false,
		'bri':0,
		'xy':[0,0]
	}

	for( var i=0; i<scheduleListParam.length; i++)
	{
		if( prevtm > 0 && curtm >= prevtm && curtm < hue_schedules[scheduleListParam[i].skyid][scheduleListParam[i].ele].tm)
		{

			curColor.on = true;
			break;
		}

		curColor.bri = hue_schedules[scheduleListParam[i].skyid][scheduleListParam[i].ele].body.bri;
		curColor.xy[0] = hue_schedules[scheduleListParam[i].skyid][scheduleListParam[i].ele].body.xy[0];
		curColor.xy[1] = hue_schedules[scheduleListParam[i].skyid][scheduleListParam[i].ele].body.xy[1];
		prevtm = hue_schedules[scheduleListParam[i].skyid][scheduleListParam[i].ele].tm;
	}

	return curColor;
}





//	スケジュール登録

var progNext = 0;
var progIntevalTime = 100;

var scheduleListParam = new Array();
var scheduleListParamCnt = 0;

var hueRegistedScheduleList = new Array();

var flagOnlyClearSchedule = true;


function startHueAllSchedules()
{

	if( hueIP == null)
	{
		showMessage( MSG_REQUEST_SELECT_BRIDGE_TITLE, MSG_REQUEST_SELECT_BRIDGE_DESC);
		return;
	}

	showConfirm( MSG_CONFIRM_REG_LIFESTYLECYCLE_TITLE, MSG_CONFIRM_REG_LIFESTYLECYCLE_DESC, function(){


		//	まず解除処理を行って、その後に登録を行う
		flagOnlyClearSchedule = false;

		//	登録解除処理
		progNext = 0;

		if( scheduleListParam.length == 0)
			setTimeout(procHueAllSchedules, progIntevalTime);		//	登録解除なし」
		else	
			setTimeout(procClearHueSchedulesAll, progIntevalTime);	//	先に登録解除処理

	});

}

function finishHueAllSchedules()
{
	showMessage( MSG_FINISH_REG_LIFESTYLECYCLE_TITLE, MSG_FINISH_REG_LIFESTYLECYCLE_DESC);
	hueValidate();
}

function procHueAllSchedules()
{


	if( progNext == 0)
	{
		showProgress( MSG_PROGRESS_REG_HUE);

		//	スケジュールリストパラメータ作成
		setScheduleListParam();

		progNext = 10;
	}
	else if( progNext == 10)
	{
		//	各時刻を算出してテーブルに保存
		calcScheduleListParam();

		progNext = 20;
		scheduleListParamCnt = 0;
	}
	else if( progNext >= 20 && progNext < 90)		//	70間で進捗
	{

		var sh = hue_schedules[scheduleListParam[scheduleListParamCnt].skyid][scheduleListParam[scheduleListParamCnt].ele].tm;
		hh = Math.floor(sh / 3600);
		hh += Math.floor((sh - hh * 3600) / 60) / 60;


		var realhour = getRelation2RealHour(hh);
		hh = Math.floor(realhour);
		mm = Math.floor((realhour % 1) * 60);
		var tstr = ('0' + hh).substr(-2,2) + ':' + ('0' + mm).substr(-2,2);

		//	送信
		createHueSchedule(scheduleListParam[scheduleListParamCnt].key,
						hue_schedules[scheduleListParam[scheduleListParamCnt].skyid][scheduleListParam[scheduleListParamCnt].ele].body.on,
						hue_schedules[scheduleListParam[scheduleListParamCnt].skyid][scheduleListParam[scheduleListParamCnt].ele].body.bri,
						hue_schedules[scheduleListParam[scheduleListParamCnt].skyid][scheduleListParam[scheduleListParamCnt].ele].body.xy[0],
						hue_schedules[scheduleListParam[scheduleListParamCnt].skyid][scheduleListParam[scheduleListParamCnt].ele].body.xy[1],
						tstr);


		scheduleListParamCnt ++;
		hueRegistedScheduleList.push({	key: scheduleListParamCnt });	//	登録済リストに追加

		progNext = Math.round(70 / scheduleListParam.length * scheduleListParamCnt) + 20;
		if( scheduleListParamCnt >= scheduleListParam.length)
		{
			progNext = 90;
		}
	}
	else if( progNext == 90)
	{
		//	現在の時刻の空のライト色を取得
		curColor = getPresentHueLightParam();

		//	現在のライトを表示
		for( var key in hueLights)
		{
			setHueLight(key, {
				'on': curColor.on,
				'bri': curColor.bri,
				'xy': [ curColor.xy[0], curColor.xy[1]]
				});
		}

		progNext = 100;
	}
	else if( progNext == 100)
	{
		closeProgress();
		progNext = 999;
	}
	else if( progNext == 999) {
		finishHueAllSchedules();
		return;
	}

	setProgressVal(progNext);
	setTimeout(procHueAllSchedules, progIntevalTime);

}



//	スケジュールクリア
function clearHueSchedulesAll()
{
	if( hueIP == null)
	{
		showMessage( MSG_REQUEST_SELECT_BRIDGE_TITLE, MSG_REQUEST_SELECT_BRIDGE_DESC);
		return;
	}

	showConfirm( MSG_CONFIRM_RELEASE_LIFESTYLECYCLE_TITLE, MSG_CONFIRM_RELEASE_LIFESTYLECYCLE_DESC, function(){

		flagOnlyClearSchedule = true;	//	登録解除のみ

		progNext = 0;
		setTimeout(procClearHueSchedulesAll, progIntevalTime);

	});
}
function finishClearHueSchedulesAll()
{
	hueRegistedScheduleList = new Array();	//	クリア

	if( flagOnlyClearSchedule)
	{
		showMessage( MSG_FINISH_RELEASE_LIFESTYLECYCLE_TITLE, MSG_FINISH_RELEASE_LIFESTYLECYCLE_DESC);
		hueValidate();
	}
	else
	{
		//	引き続いて登録処理
		progNext = 0;
		setTimeout(procHueAllSchedules, progIntevalTime);
	}

}
function procClearHueSchedulesAll()
{
	if( progNext == 0)
	{
		showProgress( MSG_PROGRESS_RELEASE_HUE);
		progNext = 10;
	}
	else if( progNext == 10)
	{
		//	登録されているスケジュールを取得

		hueRegistedScheduleList = new Array();
		var url = 'http://'+hueIP+'/api/'+hueUsername+'/schedules';
		httpRequest('GET',url,function(res,data){

			if( res == 0)
			{
				var rdat = JSON.parse(data);
				for( var name in rdat)
				{
					hueRegistedScheduleList.push({
									key: name										
						});
				}
			}
		});

		if( hueRegistedScheduleList.length == 0)
		{
			progNext = 100;
		}
		else
		{
			scheduleListParamCnt = 0;
			progNext = 20;
		}
	}
	else if( progNext >= 20 && progNext < 90)		//	70間で進捗
	{
		//	送信
		clearHueSchedules(hueRegistedScheduleList[scheduleListParamCnt].key);
		scheduleListParamCnt ++;

		progNext = Math.round(70 / hueRegistedScheduleList.length * scheduleListParamCnt) + 20;
		if( scheduleListParamCnt >= hueRegistedScheduleList.length)
		{
			progNext = 100;
		}
	}
	else if( progNext == 100)
	{
		closeProgress();
		progNext = 999;
	}
	else if( progNext == 999) {
		finishClearHueSchedulesAll();

		return;
	}

	setProgressVal(progNext);
	setTimeout(procClearHueSchedulesAll, progIntevalTime);
}

function clearHueSchedules(id)
{
	var url = 'http://'+hueIP+'/api/'+hueUsername+'/schedules/' + id;
	httpRequest('DELETE',url,function(res,data){

		if( res == 0)
		{
			var key = null;
			var rdat = JSON.parse(data);
			if( rdat[0].success)
			{
/*
	{
		'success': '/schedules/1 deleted'
	}
*/
				key = rdat[0].success.match(/\/schedules\/(.+)\s/)[1];
				return;
			}
			else if( rdat[0].error)
			{
				if( rdat[0].error.type == 3)
				{
/*
	{
		'error': {
			'type': 3,
			'address': '/schedules/1',
			'description': 'resource, /schedules/1, not available'
		}
	}
*/
					key = rdat[0].error.address.match(/\/schedules\/(.+)/)[1];
					return;
				}
			}

			if( key != null)
				hueLights[key].del = true;

			//	選択ライトのスケジュールが全て削除されていれば登録処理
			if( isClearHueSchedules())
			{
				//	新スケジュールの登録


			}

		}

	});
}

//	選択ライトのスケジュールを削除したか？
function isClearHueSchedules()
{
	var nodel = false;
	for( var key in hueLights)
	{
		if( !hueLights[key].del)
			return false;
	}
	return true;
}

//	スケジュール登録
function createHueSchedule(key,sw,bri,x,y,tm)
{
	var param = {
		'name': 'your sky',
		'description': 'schedule of your lifestyle sky',
		'command': {
			'address': '/api/convexcorp/lights/'+key+'/state',
			'method': 'PUT',
			'body': {
				'on': sw,
				'bri':bri,
				'xy': [	x,	y]
			}
		},
		'localtime': 'W127/T'+tm+':00'
	};

	var query = JSON.stringify(param);
	var url = 'http://'+hueIP+'/api/'+hueUsername+'/schedules';
	httpRequestQuery('POST',url,query,function(res,data){
		loadingView( false);
		if( res == 0)
		{
//			var rdat = JSON.parse(data);
		}
	});
}



//	個別ライト設定
function setHueLight(key,param)
{
	var query = JSON.stringify(param);
	var url = 'http://'+hueIP+'/api/'+hueUsername+'/lights/'+key+'/state';
	httpRequestQuery('PUT',url,query,function(res,data){
		if( res == 0)
		{
			var rdat = JSON.parse(data);
console.log('-> setHueLight',rdat);

		}
	},true);
}



//	選択されている全てのライトを現在の空で点灯
var hueTurnOnColor = null;
function turnOnHueLightAll()
{
	if( hueIP == null)
	{
		showMessage( MSG_REQUEST_SELECT_BRIDGE_TITLE, MSG_REQUEST_SELECT_BRIDGE_DESC);
		return;
	}

	//	スケジュールリストパラメータ作成
	scheduleListParam = new Array();
	for( var i in hueLights)
	{
		scheduleListParam.push({
						key: i
					});
	}

	progNext = 0;
	setTimeout(procTurnOnHueLightAll, progIntevalTime);
}
function finishTurnOnHueLightAll()
{
}

function procTurnOnHueLightAll()
{
	if( progNext == 0)
	{
		showProgress( MSG_PROGRESS_TURNON_HUE);
		scheduleListParamCnt = 0;
		progNext = 10;
	}
	else if( progNext == 10)
	{
		setScheduleListParam();
		progNext = 20;
	}
	else if( progNext == 20)
	{
		calcScheduleListParam();
		progNext = 30;
	}
	else if( progNext == 30)
	{
		hueTurnOnColor = getPresentHueLightParam();
		progNext = 40;
	}
	else if( progNext >= 40 && progNext < 90)		//	50間で進捗
	{
		//	送信
		setHueLight(scheduleListParam[scheduleListParamCnt].key, {
			'on': hueTurnOnColor.on,
			'bri': hueTurnOnColor.bri,
			'xy': [ hueTurnOnColor.xy[0], hueTurnOnColor.xy[1]]
			});

		scheduleListParamCnt ++;

		progNext = Math.round(50 / scheduleListParam.length * scheduleListParamCnt) + 40;
		if( scheduleListParamCnt >= scheduleListParam.length)
		{
			progNext = 100;
		}
	}
	else if( progNext == 100)
	{
		closeProgress();
		progNext = 999;
	}
	else if( progNext == 999) {
		finishTurnOnHueLightAll();
		return;
	}

	setProgressVal(progNext);
	setTimeout(procTurnOnHueLightAll, progIntevalTime);
}



//	選択されている全てのライトを消灯
function turnOffHueLightAll()
{
	if( hueIP == null)
	{
		showMessage( MSG_REQUEST_SELECT_BRIDGE_TITLE, MSG_REQUEST_SELECT_BRIDGE_DESC);
		return;
	}

	//	スケジュールリストパラメータ作成
	scheduleListParam = new Array();
	for( var i in hueLights)
	{
		scheduleListParam.push({
						key: i
					});
	}

	progNext = 0;
	setTimeout(procTurnOffHueLightAll, progIntevalTime);
}
function finishTurnOffHueLightAll()
{
}

function procTurnOffHueLightAll()
{
	if( progNext == 0)
	{
		showProgress( MSG_PROGRESS_TURNOFF_HUE);
		scheduleListParamCnt = 0;
		progNext = 10;
	}
	else if( progNext >= 10 && progNext < 90)		//	80間で進捗
	{
		//	送信
		setHueLight(scheduleListParam[scheduleListParamCnt].key, {	'on': false	});
		scheduleListParamCnt ++;

		progNext = Math.round(80 / scheduleListParam.length * scheduleListParamCnt) + 10;
		if( scheduleListParamCnt >= scheduleListParam.length)
		{
			progNext = 100;
		}
	}
	else if( progNext == 100)
	{
		closeProgress();
		progNext = 999;
	}
	else if( progNext == 999) {
		finishTurnOffHueLightAll();
		return;
	}

	setProgressVal(progNext);
	setTimeout(procTurnOffHueLightAll, progIntevalTime);
}


