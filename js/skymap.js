/*!
	SkyMap

	id		タグID
	w		画面幅
	h		画面高さ
	rtime	現在の相対時刻
	param	時刻情報

*/

var SkyMap = function( id, w, h)
{
	'use strict';
	this.stage;		//	ステージ
	this.root;		//	親（透明背景）
	this.preload;	//	画像読み込み

	this.id = id;
	this.rtime = new Date();
	this.stime = [		//	各空の時刻（秒）
		5,		//	(0)end of night
		5.5,	//	(1)sunrise
		6.5,	//	(2)start of noon
		17,		//	(3)end of noon
		18,		//	(4)sunset
		18.5	//	(5)start of night
	];
	this.htimer = null;	//	タイマーハンドル


	this.padding = ((w<h)?w:h) / 10;		//	左上の余白
	this.sc = {
		width: w,			//	画面幅
		height:	h,			//	画面高さ
		c: {
			x: (w/2),		//	中央座標ｘ
			y: (h/2)+50		//	中央座標ｙ
		},
		r: (((w<h ? w:h)/2) - this.padding)	//	半径
	};


	this.preload = function()
	{
		//	画像読み込み＆初期処理
		this.preload = new cavy.Preload({
			sky_sun:	'images/sun-skymap.png',
			sky_moon:	'images/moon.png'
		}).complete((function(inst){
				return function(e){
					inst.initStage();
					inst.draw(inst.sc.width, inst.sc.height);
				};
			})(this)
		);
	}

	//	初期要素の設定
	this.initStage = function()
	{
		var obj;
		var deg,rad,x0,y0,x1,y1;

		this.stage = new cavy.Stage(this.id, this.sc.width, this.sc.height, false);
		this.root = new cavy.Rectangle( this.sc.width, this.sc.height);	//	ルート（背景）
		this.stage.addChild(this.root);
//		this.root.backgroundColor = '#000';


		var x = this.sc.c.x;
		var y = this.sc.c.y;
		var r = this.sc.r;


		//	空グラデーション
		obj = new cavy.Rectangle( this.sc.width, this.sc.height);	//	グラデーション用
		this.root.addChild(obj);

		//	太陽と月
		obj = new cavy.Sprite(this.preload.get('sky_sun'));
		obj.originX = 0.5;
		obj.originY = 0.5;
		this.root.addChild(obj);

		obj = new cavy.Sprite(this.preload.get('sky_moon'));
		obj.width = 160;
		obj.height = 160;
		obj.offsetX = 0;
		obj.offsetY = 0;
		obj.originX = 0.5;
		obj.originY = 0.5;
		this.root.addChild(obj);

		//	現在時刻用針
		obj = new cavy.Rectangle( this.sc.width, this.sc.height);	//	現在時刻用針用
		this.root.addChild(obj);

		//	フレーム
		obj = new cavy.Rectangle( this.sc.width, this.sc.height);	//	フレーム用
		this.root.addChild(obj);

//		this.stage.startRender();
	}


	//	円弧グラデーション描画
	this.drawArc = function(parent,x,y,r,ang1,color1,ang2,color2)
	{
		var aw = ang2 - ang1;
		if( aw < 1.5)
			aw = 1.5;				//	小さい角度は描画されない（不具合？）

		var step = 0.5;				//	前の重なりにジャギーがでる対策？

		var obj = new cavy.Shape();
		parent.addChild(obj);
		obj.interactive  = false;
		obj.backgroundColor = color2;
		obj.fan( x, y, r, ang1+step/2, aw+step);

		if( color1 == color2)
		{
			return;
		}

		var grd = new GradientColor(color1,color2);
		var t = ang1 - step;
		var gs = Math.ceil(aw / step);	//	グラデーションステップ数
		var gc = 0;						//	グラデーションカウント
	//	while( t < ang2)
		for( var gc=0; gc<=gs; gc++)
		{
			obj = new cavy.Shape();
			parent.addChild(obj);
			obj.interactive  = false;
			obj.backgroundColor = grd.getGradientRGB(gc/gs);
			obj.fan( x, y, r, t, 1.5);

			t += step;	//	0.5度ずつ刻んでいく
		}


	}

	this.updateTime = function( rtime, param)
	{
		this.rtime = rtime;
		this.stime = param;
		this.draw(this.sc.width, this.sc.height);
	}

	//	サイズの合わせて描画
	this.draw = function( w, h)
	{
		this.padding = ((w<h)?w:h) / 10;		//	左上の余白
		this.sc = {
			width: w,			//	画面幅
			height:	h,			//	画面高さ
			c: {
				x: (w/2),		//	中央座標ｘ
				y: (h/2)		//	中央座標ｙ
			},
			r: (((w<h ? w:h)/2) - this.padding)	//	半径
		};

		//	広告用スペース	高さ50
		if( (this.sc.c.y - this.sc.r) < 50)
			this.sc.c.y = this.sc.r + 50;


		this.stage.context.canvas.width = mon.w;
		this.stage.context.canvas.height = mon.h;

		//	stageのサイズ変更

		this.stage.width = mon.w;
		this.stage.height = mon.h;




		var obj;
		var deg,rad,x0,y0,x1,y1;

		var x = this.sc.c.x;
		var y = this.sc.c.y;
		var r = this.sc.r;

		//	0.グラデーション
		this.root.children[0].removeAllChildren();

		//	空グラデーション
		var skyColors = [
				'#161d49',		//	(0)end of night
				'#ffb0aa',		//	(1)sunrise
				'#98bbe3',		//	(2)start of noon
				'#98bbe3',		//	(3)end of noon
				'#ba9437',		//	(4)sunset
				'#161d49'		//	(5)start of night
			];

		var angs,ange;
		var offset = 180;
		for( var i=0; i<this.stime.length; i++)
		{
			var pt = i+1;
			if( pt >= this.stime.length)
				pt = 0;

			angs = this.stime[i]/24*360+offset;
			ange = this.stime[pt]/24*360+offset;
			if( ange < angs)
				ange += 360;

			this.drawArc( this.root.children[0], x, y, r, angs,skyColors[i], ange,skyColors[pt]);	//	night
		}


		//	太陽と月
		//	sun
		if( this.stime[2] < this.stime[3])
		{
			deg = (this.stime[2]+this.stime[3])/2/24*360;
		}
		else
		{
			deg = (this.stime[2]+this.stime[3]+24)/2/24*360;
		}
		rad = (deg+90) * Math.PI / 180.0;
		x0 = r / 2;		//	半径
		y0 = 0.0;
		x1 = x0*Math.cos(rad) - y0*Math.sin(rad);
		y1 = x0*Math.sin(rad) + y0*Math.cos(rad);
		this.root.children[1].x = x1 + x;
		this.root.children[1].y = y1 + y;
//		this.root.children[1].rotation = deg-180;
		this.root.children[1].rotation = deg-60;

		//	moon
		if( this.stime[this.stime.length-1] < this.stime[0])
		{
			deg = (this.stime[this.stime.length-1]+this.stime[0])/2/24*360;
		}
		else
		{
			deg = (this.stime[this.stime.length-1]+this.stime[0]+24)/2/24*360;
		}
		rad = (deg+90) * Math.PI / 180.0;
		x0 = r / 2;		//	半径
		y0 = 0.0;
		x1 = x0*Math.cos(rad) - y0*Math.sin(rad);
		y1 = x0*Math.sin(rad) + y0*Math.cos(rad);
		this.root.children[2].x = x1 + x;
		this.root.children[2].y = y1 + y;
		this.root.children[2].rotation = deg-180;

		//	天体のスケール	40幅基準として計算
		var sat_scale = r / 350;
		this.root.children[1].scaleX = sat_scale;
		this.root.children[1].scaleY = sat_scale;
		this.root.children[2].scaleX = sat_scale;
		this.root.children[2].scaleY = sat_scale;

		//	月齢
		var moonAge = calcMoonAge( this.rtime.getYear(), this.rtime.getMonth() + 1, this.rtime.getDate(), this.rtime.getHours());
		this.root.children[2].offsetX = moonAge % 5;
		this.root.children[2].offsetY = parseInt(moonAge / 5);



		//	現在時刻用針
		this.root.children[3].removeAllChildren();

		obj = new cavy.Shape();
		this.root.children[3].addChild(obj);
		obj.interactive  = false;
		obj.borderColor = '#ff3c7b';
		obj.borderWidth = 2;
		obj.opacity = 0.5;

		var now = new Date();
		deg = (now.getHours() + now.getMinutes() / 60) / 24 * 360;
//		deg = (this.rtime.getHours() + this.rtime.getMinutes() / 60) / 24 * 360;

		rad = (deg+90) * Math.PI / 180.0;
		x0 = r - 1;		//	半径
		y0 = 0;
		x1 = x0*Math.cos(rad) - y0*Math.sin(rad);
		y1 = x0*Math.sin(rad) + y0*Math.cos(rad);

		obj.moveTo( x, y);
		obj.lineTo( x+x1, y+y1);




		//	フレーム
		this.root.children[4].removeAllChildren();

		//	フレーム枠
		obj = new cavy.Shape();
		this.root.children[4].addChild(obj);
		obj.interactive  = false;
		obj.backgroundColor = '#000';

		obj.fan( x, y, r/3, 0, 360);

		//	中心
		var fw = r / 8;	//	フレーム幅
		obj = new cavy.Circle( r-fw/2, 0, 360, false, {});
		this.root.children[4].addChild(obj);
		obj.x = x -r+fw/2;
		obj.y = y -r+fw/2;
		obj.borderColor = '#000';
		obj.borderWidth = fw*1.1;
	//	obj.backgroundColor = new cavy.CircleGradient( 0,0, mon.c.x/2, mon.c.x/2,mon.c.x/2,mon.c.x/2);

		//	時刻版	65->89	,97->121
		deg = 0;
		var chr;
	//	var chr_sp = String.fromCharCode(122);
	//	for( var c=97; c<=120; c++)
		var chr_sp = String.fromCharCode(90);
		for( var c=65; c<=88; c++)
		{
			rad = (deg+90) * Math.PI / 180.0;
			x0 = r - fw / 2;		//	半径
			y0 = 0.0;
			x1 = x0*Math.cos(rad) - y0*Math.sin(rad);
			y1 = x0*Math.sin(rad) + y0*Math.cos(rad);

			if( (c % 2) == 0)
				chr = chr_sp;
			else
				chr = String.fromCharCode(c);

			var t = new cavy.Text(chr);
			this.root.children[4].addChild(t);
			t.interactive  = false;
			t.fontFamily = 'num24';
			t.fontSize = fw+'px';
			t.color = '#aaaaaa';
			t.autoResize = true;
			t.textAlign = 'center';
			t.originX = 0.5;
			t.originY = 0.4;


			t.x = x1 + x;
			t.y = y1 + y;
			t.rotation = deg+180;
			deg += 15;
		}



		this.stage.update(0);
	}





	//	アニメーション開始
	this.start = function()
	{
		if( this.htimer != null)
			return;

		this.htimer = setInterval((function(inst){
				return function(e){
					inst.draw(inst.sc.width, inst.sc.height);
				};
			})(this)
		,1000);
	}
	//	アニメーション停止
	this.stop = function()
	{
		clearInterval(this.htimer);
		this.htimer = null;
	}

};






