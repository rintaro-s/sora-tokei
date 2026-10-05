/*!
	js library

	グラデーションカラー
	(c) convex corporation ,ltd.
*/


var GradientColor = function( start_color, end_color) {


	//	x	0.0 - 1.0
	this.getGradient = function(x){

		if( x > 1)	x = 1;
		if( x < 0)	x = 0;

		var rgb = {
			R: Math.round(this.ec.R*x + this.sc.R*(1-x)),
			G: Math.round(this.ec.G*x + this.sc.G*(1-x)),
			B: Math.round(this.ec.B*x + this.sc.B*(1-x))
		}
		return rgb;

/*
( {R*X + r*(F-X)}/F, {G*X + g*(F-X)}/F, {B*X + b*(F-X)}/F )
	(0,0,255) (255,128,0)
例えば、長さ１００で位置６０で
	(255*0.6 + 0*0.4, 128*0.6 + 0*0.4, 0*0.6 + 255*0.4)
で(153,76,102)になります
*/

	}
	this.getGradientRGB = function(x){
		return this.toHex(this.getGradient(x));
	}


	this.toRGB = function(strrgb){
		
		if( strrgb.charAt(0) != '#')
			return null;

		var rgb = {
			R:0,
			G:0,
			B:0
		}

		if( strrgb.length == 7)
		{
			//	16bit
			rgb.R = parseInt(strrgb.substr(1,2),16);
			rgb.G = parseInt(strrgb.substr(3,2),16);
			rgb.B = parseInt(strrgb.substr(5,2),16);
		}
		else
		{
			//	8bit
			rgb.R = parseInt(strrgb.substr(1,1)+strrgb.substr(1,1),16);
			rgb.G = parseInt(strrgb.substr(2,1)+strrgb.substr(2,1),16);
			rgb.B = parseInt(strrgb.substr(3,1)+strrgb.substr(3,1),16);
		}
		return rgb;
	}

	this.toHex = function(rgb){
		var str = '#';
		str += ('0'+rgb.R.toString(16)).substr(-2);
		str += ('0'+rgb.G.toString(16)).substr(-2);
		str += ('0'+rgb.B.toString(16)).substr(-2);
		return str;
	}

	this.sc = this.toRGB( start_color || '#000');
	this.ec = this.toRGB( end_color || '#fff');

}







