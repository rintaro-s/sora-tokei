//
//	日の出、日の入り時刻取得ライブラリ
//	月齢計算
//  suntime.js

var kSTParamPAI = 0.017453278;		//	Circle ratio(radian)
var kSTParamSO = 0.266994;			//	太陽視半径
var kSTParamR = 0.585556;			//	大気差
var kSTParamPO = 0.0024428;			//	視差
var kSTParamDT = 0.00074074074;		//	地球自転遅れの補正(day)

var kSTParamTwiLight = 5400;		//	-90 * 60;	薄明起点

var SunTime = function(ttime, ji, lo, la, tl)
{

	if( tl != void 0)
	{
		kSTParamTwiLight = tl;
	}

	this.timezone = ji;
	this.longitude = lo;
	this.latitude = la;
	
	this.zenith = 90.8333;	//	90 + (50 / 60);

	this.nYY = ttime.getFullYear();
	this.nMM = ttime.getMonth()+1;
	this.nDD = ttime.getDate();

	this.isTwilight = 0;

	//	Returns Time of Sun Rise
	this.getSunRise = function(twilight)
	{
		if( twilight == 1)	this.isTwilight = 1;
		else 				this.isTwilight = 0;
		
		var twTime = 0;
		if( twilight == 1) twTime = -kSTParamTwiLight;

		return this.calculation(true) + twTime;
	}

	//	Returns Time of Sun Set
	this.getSunSet = function(twilight)
	{
		if( twilight == 1)	this.isTwilight = 1;
		else				this.isTwilight = 0;

		var twTime = 0;
		if( twilight == 1)	twTime = kSTParamTwiLight;

		return this.calculation(false) + twTime;
	}

	this.getTwiLight = function(){	return kSTParamTwiLight;	}


	this.calculation = function(rise)
	{
		var n = this.getTYKo();

		var lnghour = this.longitude / 15;

		var t;
		if( !rise)		t = n + ((18 - lnghour) / 24);
		else 			t = n + ((6 - lnghour) / 24);

		var m = (0.9856 * t) - 3.289;

		var l = m + (1.916 * Math.sin(DEG2RAD(m))) + (0.020 * Math.sin(DEG2RAD(2 * m))) + 282.634;
		l = l % 360;

		var ra = RAD2DEG(Math.atan(0.91764 * Math.tan(DEG2RAD(l))));
		ra = ra % 360;

		var lquadrant = Math.floor(l / 90) * 90;
		var raquadrant = Math.floor(ra / 90) * 90;
		ra = ra + (lquadrant - raquadrant);
		ra = ra / 15;

		var sindec = 0.39782 * Math.sin(DEG2RAD(l));
		var cosdec = Math.cos(DEG2RAD(RAD2DEG(Math.asin(sindec))));
		var cosh = (Math.cos(DEG2RAD(this.zenith)) - (sindec * Math.sin(DEG2RAD(this.latitude)))) / (cosdec * Math.cos(DEG2RAD(this.latitude)));

		if(( rise) && (cosh > 1))		return 0;
		if(( !rise) && (cosh < -1))		return 0;

		var h;
		if( !rise) 	h = RAD2DEG(Math.acos(cosh));
		else		h = 360 - RAD2DEG(Math.acos(cosh));
		h = h / 15;

		t = h + ra - (0.06571 * t) - 6.622;

		var ut = t - lnghour;
		ut = ut % 24;

		return parseInt((ut + this.timezone)*3600);
	}









	//	Returns the Sun Time
	this.calc = function(rise)
	{

		var Ko = this.getKo();		//	J2000.0からの経過日数
		
		//temporary result(day)
		var G = 17.0 / 24.0;
		if( rise == true) G = 6.0 / 24.0;
		
		//use the method of approximation
		var dd = 1.0;
		
		while(dd > 0.00005)
		{
			var T = ((Ko + G + kSTParamDT) / 365.25);			//経過ユリウス年
			var theta = this.getTheta(T, G);					//恒星時
			
			var r = this.getR(T);								//太陽距離
			var k = this.getK(r);								//太陽出没高度[k]

			var ramda = this.getRamda(T);						//太陽黄経（単位：度）
			var e = this.getE(T);								//黄道傾角
			var alpha = this.getAlpha(ramda,e);					//太陽赤経
			var delta = this.getDelta(ramda,e);					//太陽赤緯
			var tk = this.getTk(k, delta, rise);				//日の出入高度の時角
			var t_tmp = theta - alpha;							//仮定時刻の時角
			dd = (tk - t_tmp) / 360.0;							//仮定時刻dに対する補正値
			dd -= Math.floor(G);
			
			//補正
			G += dd;
		}
		
		//追加補正
		if( G >= 1.0)	G -= Math.floor(G);
		
		//整形
		var hh = G * 24.0;
		var mm = (hh - Math.floor(hh)) * 60.0;
		var hour = parthInt(Math.floor(hh));
		var min = parseInt(Math.floor(mm));
		var second = parseInt(Math.floor((mm - Math.floor(mm)) * 60));
		if( second >= 60)
		{
			second -= 60;
			min++;
		}
		if( min >= 60)
		{
			min -= 60;
			hour++;
		}
		
		return ((hour * 60 * 60) + (min * 60) + second);
	}




	//	J2000.0からの経過日数、経過ユリウス年
	this.getKo = function()
	{
		var year  = this.nYY - 2000;
		if( this.nMM < 3)	year = this.nYY - 2001;

		var month = this.nMM;
		if( this.nMM < 3)	month = this.nMM +12;

		var day = this.nDD;
		return (year * 365.0 + month * 30.0 + day - 33.5 + Math.floor(3.0 * (month + 1.0) / 5.0) +  Math.floor(year / 4.0) - (this.timezone / 24.0));
	}
	//	当年の経過日数
	this.getTYKo = function()
	{
		var year  = 0;
		if( this.nMM < 3)	year = 1;

		var month = this.nMM;
		if( this.nMM < 3)	month = this.nMM +12;

		var day = this.nDD;
		return (year * 365.0 + month * 30.0 + day - 33.5 + Math.floor(3.0 * (month + 1.0) / 5.0) + Math.floor(year / 4.0) - (this.timezone / 24.0));
	}
	//	恒星時
	this.getTheta = function getTheta(t1, t2)
	{
		var theta = 100.4606 + 360.007700536 * t1 + 0.00000003879 * t1 * t1 + 360.0 * t2 - 15.0 * this.timezone + this.longitude;
		if( theta < 0.0)
		{
			while (theta < 0.0)
			{
				theta += 360.0;
			}
		}
		else if (theta >= 360.0)
		{
			while (theta >= 360.0)
			{
				theta -= 360.0;
			}
		}
		return theta;
	}



	//	太陽距離
	function getR(t)
	{
		var q;
		q = (0.007256 - 0.0000002 * t) * Math.sin((267.54 + 359.991 * t) * kSTParamPAI);
		q += 0.000091 * Math.sin((265.1 + 719.98 * t) * kSTParamPAI);
		q += 0.000030 * Math.sin(90.0 * kSTParamPAI);
		q += 0.000013 * Math.sin((27.8 + 4452.67 * t) * kSTParamPAI);
		q += 0.000007 * Math.sin((254.0 + 450.4 * t) * kSTParamPAI);
		q += 0.000007 * Math.sin((156.0 + 329.6 * t) * kSTParamPAI);
		
		return Math.pow(10, q);
	}

	//	太陽出没高度
	function getK(r)
	{
		var S = kSTParamSO / r;
		var P = kSTParamPO / r;

		if( this.isTwilight)	return (P - 7.36111);
		else					return (P - S - kSTParamR);
	}

	//	太陽黄経
	function getRamda(t)
	{
		var ramda;
		ramda = 280.4603 + 360.00769 * t;
		ramda += (1.9146 - 0.00005 * t) * Math.sin((357.538 + 359.991 * t) * kSTParamPAI);
		ramda += 0.0200 * Math.sin((355.05 + 719.981 * t) * kSTParamPAI);
		ramda += 0.0048 * Math.sin((234.95 + 19.341 * t) * kSTParamPAI);
		ramda += 0.0020 * Math.sin((247.1 + 329.64 * t) * kSTParamPAI);
		ramda += 0.0018 * Math.sin((297.8 + 4452.67 * t) * kSTParamPAI);
		ramda += 0.0018 * Math.sin((251.3 + 0.20 * t) * kSTParamPAI);
		ramda += 0.0015 * Math.sin((343.2 + 450.37 * t) * kSTParamPAI);
		ramda += 0.0013 * Math.sin((81.4 + 225.18 * t) * kSTParamPAI);
		ramda += 0.0008 * Math.sin((132.5 + 659.29 * t) * kSTParamPAI);
		ramda += 0.0007 * Math.sin((153.3 + 90.38 * t) * kSTParamPAI);
		ramda += 0.0007 * Math.sin((206.8 + 30.35 * t) * kSTParamPAI);
		ramda += 0.0006 * Math.sin((29.8 + 337.18 * t) * kSTParamPAI);
		ramda += 0.0005 * Math.sin((207.4 + 1.50 * t) * kSTParamPAI);
		ramda += 0.0005 * Math.sin((291.2 + 22.81 * t) * kSTParamPAI);
		ramda += 0.0004 * Math.sin((234.9 + 315.56 * t) * kSTParamPAI);
		ramda += 0.0004 * Math.sin((157.3 + 299.30 * t) * kSTParamPAI);
		ramda += 0.0004 * Math.sin((21.1 + 720.02 * t) * kSTParamPAI);
		ramda += 0.0003 * Math.sin((352.5 + 1079.97 * t) * kSTParamPAI);
		ramda += 0.0003 * Math.sin((329.7 + 44.43 * t) * kSTParamPAI);
		
		if( ramda > 0.0)
		{
			while( ramda >= 360.0)
			{
				ramda -= 360.0;
			}
		}
		else
		{
			while( ramda < 0.0)
			{
				ramda += 360.0;
			}
		}
		return ramda;
	}


	//	黄道傾角
	function getE(t)
	{
		return (23.439291 - 0.000130042 * t);
	}

	// 太陽赤経[alpha]の計算
	function getAlpha(ramda, e)
	{
		var alpha = Math.atan(Math.tan(ramda * kSTParamPAI) * Math.cos(e * kSTParamPAI)) / kSTParamPAI;
		if( ramda < 180.0)
		{
			if( alpha < 0.0)
			{
				while (alpha < 0.0)
				{
					alpha += 180.0;
				}
			}
			else
			{
				while( alpha >= 180.0)
				{
					alpha -= 180.0;
				}
			}
		}
		else
		{
			if( alpha < 180.0)
			{
				while( alpha < 180.0)
				{
					alpha += 180.0;
				}
			}
			else
			{
				while( alpha >= 360.0)
				{
					alpha -= 180.0;
				}
			}
		}
		return alpha;
	}


	//	太陽赤緯
	function getDelta(ramda, e)
	{
		return Math.asin(Math.sin(ramda * kSTParamPAI) * Math.sin(e * kSTParamPAI)) / kSTParamPAI;
	}


	//	日の出高度の時角
	function getTk(k, delta, rise)
	{
		var costk = (Math.sin(k * kSTParamPAI) - Math.sin(delta * kSTParamPAI) * Math.sin(self.latitude * kSTParamPAI)) / (Math.cos(delta * kSTParamPAI) * Math.cos(self.latitude * kSTParamPAI));
		var tk = Math.acos(costk) / kSTParamPAI;

		if( rise == true)	return ((tk > 0.0) ? tk * -1.0 : tk);
		else				return ((tk < 0.0) ? tk * -1.0 : tk);
	}

}



//	月齢計算
function calcMoonAge(y,m,d,h)
{
	var ytYear = y;
	var ytMonth = m;
	var ytDay = d;
	if( h < 12)
	{
		var yesterday = new Date(y, m-1, d-1);
		ytYear = yesterday.getFullYear();
		ytMonth = yesterday.getMonth()+1;
		ytDay = yesterday.getDate();
	}
	var moonAgeMonth;
	if( ytMonth == 1 || ytMonth == 3)
	{
		moonAgeMonth = 0;
	}
	else if( ytMonth == 2 || ytMonth == 4 || ytMonth == 5)
	{
		moonAgeMonth = 2;
	}
	else
	{
		moonAgeMonth = ytMonth - 2;
	}
	var moonAge = (((ytYear-11) % 19)*11 + moonAgeMonth + ytDay) % 30;

	return moonAge;
}


