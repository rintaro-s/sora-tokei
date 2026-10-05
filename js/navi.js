/*!
	js library (c) convex corporation ,ltd. 
		初回ナビゲーション
*/

var FirstNavi = function(info,finish_func,valid)
{
	this.valid = (valid != void 0) ? valid : false;

	this.infoLayout = {
		name: 'first_navigation',
		w: 0,			//	画面の幅
		h: 0,			//	画面の高さ
		head_h: 0,		//	ヘッダの高さ
		times_h: 0,		//	ライフスタイルサイクルメニューリストの高さ
		menu_h: 0		//	メニュータブの高さ
	};
	for( var i in info)
	{
		this.infoLayout[i] = info[i];
	}

	this.fadetime = 500;
	this.cur_page = 1;		//	現在のページ数
	this.rootEle = $('#'+this.infoLayout.name);
	this.lh = parseInt(this.rootEle.css('line-height'))*1.2;

	this.trans = false;


	this.permitSwipe = '';		//	なし

	//	配置処理
	this.init = function()
	{


	}




	this.update = function(w,h)
	{
		this.infoLayout.w = w;
		this.infoLayout.h = h;
		this.setStyle();
	}

	this.setStyle = function()
	{

		var obj;
		var img, org_img, imgh;

		var pos_desc = 50;
		var pos_prog = this.infoLayout.h - this.infoLayout.menu_h - (this.lh*4);
		var pos_ope = this.infoLayout.h - this.infoLayout.menu_h - (this.lh*2.5);
		var pos_skip = this.infoLayout.h - (this.lh*2);

		var navi = this.rootEle.find('div[navipage]');

		//	desc
		obj = this.rootEle.find('div[layout=desc]');
		for( var i=0; i<obj.length; i++)
		{
			$(obj[i]).css('position','absolute');
			$(obj[i]).css('width','100%');
			$(obj[i]).css('top',pos_desc+'px');
			$(obj[i]).css('text-align','center');
			$(obj[i]).css('line-height','2em');
		}

		//	operation
		obj = this.rootEle.find('div[layout=operation]');
		for( var i=0; i<obj.length; i++)
		{
			$(obj[i]).css('position','absolute');
			$(obj[i]).css('width','100%');
			$(obj[i]).css('top',pos_ope+'px');
		}

		//	progress
		obj = this.rootEle.find('div[layout=progress]');
		for( var i=0; i<obj.length; i++)
		{
			$(obj[i]).css('position','absolute');
			$(obj[i]).css('width','100%');
			$(obj[i]).css('top', pos_prog+'px');
		}

		//	skip
		obj = this.rootEle.find('div[layout=skip]');
		for( var i=0; i<obj.length; i++)
		{
			$(obj[i]).css('position','absolute');
			$(obj[i]).css('right','2em');
//			$(obj[i]).css('top', pos_skip+'px');
			$(obj[i]).css('bottom', '10px');
		}

		//	check
		obj = this.rootEle.find('div[layout=check]');
		for( var i=0; i<obj.length; i++)
		{
			$(obj[i]).css('position','absolute');
			$(obj[i]).css('width','100%');
//			$(obj[i]).css('top', pos_skip+'px');
			$(obj[i]).css('bottom', '0px');
		}


		//	img
		obj = this.rootEle.find('div[layout=img]');
		for( var i=0; i<obj.length; i++)
		{
			$(obj[i]).css('padding-top','1em');
			imgh = (pos_ope - pos_desc) * 0.9;
			img = $(obj[i]).children('img')[0];
			org_img = new Image();
			org_img.src = img.src;
			if( org_img.height > imgh)
			{
				var per = imgh / org_img.height;
				var iw = org_img.width * per;
				var ih = org_img.height * per;
				$(img).css('width',iw+'px');
				$(img).css('height',ih+'px');
			}
		}

		//	背景

/*
		//-------------------
		//	page4
		page_bg = this.rootEle.find('div[navipage=4] > .first_navigation_bg');

		child = $(page_bg[0]);
		child.css('position','absolute');
		child.css('width','100%');
		child.css('top','0px');
		child.css('height',this.infoLayout.h-this.infoLayout.menu_h+'px');
		child = $(page_bg[1]);
		child.css('position','absolute');
		child.css('width',this.infoLayout.w/4+'px');
		child.css('left','0px');
		child.css('top',this.infoLayout.h-this.infoLayout.menu_h+'px');
		child.css('height',this.infoLayout.menu_h+'px');
		child = $(page_bg[2]);
		child.css('position','absolute');
		child.css('width',this.infoLayout.w/2+'px');
		child.css('left',this.infoLayout.w/2+'px');
		child.css('top',this.infoLayout.h-this.infoLayout.menu_h+'px');
		child.css('height',this.infoLayout.menu_h+'px');

		page_bg = this.rootEle.find('div[navipage=4]');
		child = $($(page_bg[0]).find('div[layout=operation_area]')[0]);
		child.css('position','absolute');
		child.css('top',this.infoLayout.h-this.infoLayout.menu_h+'px');
		child.css('height',this.infoLayout.menu_h+'px');
		child.css('left',this.infoLayout.w/4+'px');
		child.css('width',this.infoLayout.w/4+'px');
*/
	}


	this.next = function()
	{
		this.setEvent(this.cur_page, false);	//	解除
		this.show(this.cur_page+1);
		this.setEvent(this.cur_page, true);		//	登録
	}

	//	次のページへ
	this.show = function( page, itv)
	{
//		$('#'+this.infoLayout.name + ' *').unbind();
		var quick = (itv != void 0)? itv : false;

		var prev_page = this.cur_page;
		this.cur_page = page;


		if( quick)
		{
			var pg = this.rootEle.children('div[navipage='+page+']');
			$(pg[0]).css('opacity','0');
			$(pg[0]).show(0);
			$(pg[0]).animate({'opacity':'1'}, this.fadetime, function(){
					this.trans = false;
				});
		}
		else
		{
			var pg = this.rootEle.children('div[navipage]');
			for( var i=0; i<pg.length; i++)
			{
				if( $(pg[i]).attr('navipage') == page)
					$(pg[i]).show(0);
				else
					$(pg[i]).hide(0);
			}

			this.rootEle.animate({'opacity':'1'}, this.fadetime, function(){
					this.trans = false;
				});
		}

	}

	this.hide = function(func)
	{
		this.rootEle.animate({'opacity':'0'}, this.fadetime,(function(func){
				return function(e){
						func();
					};
				})(func)
		);
	}
	this.close = function()
	{
		this.rootEle.animate({'opacity':'0'}, this.fadetime,(function(thisclass){
				return function(e){
					thisclass.rootEle.hide(0);
					};
				})(this)
		);

		this.setEvent(this.cur_page, false);	//	解除


		finish_func( $('#navi_next_hide').prop('checked'));

		this.rootEle.html('');
		this.valid = false;
	}

	//	各画面のイベント登録／解除
	this.setEvent = function(page,add)
	{
		var child;
		var page_bg;

		this.permitSwipe = '';
		page_bg = $(this.rootEle.children('div[navipage='+page+']')[0]);

		switch(page)
		{
			case 1:			//	page1
				if( add)
				{
					//	次へ
					child = $(page_bg.find('div[layout=operation]')[0]);
					child.click((function(my){
						return function(e){

							if( this.trans)
								return false;

							this.trans = true;

							my.hide((function(my){
								return function(e){
									my.next();
								};
							})(my));
						};
					})(this));

					//	スキップ
					child = $(page_bg.find('div[layout=skip]')[0]);
					child.click((function(my){
						return function(e){

							if( this.trans)
								return false;

							my.setEvent(my.cur_page, false);	//	解除
							my.show(6,true);
							my.setEvent(my.cur_page, true);	//	登録
						};
					})(this));
				}
				else
				{
					//	次へ
					child = $(page_bg.find('div[layout=operation]')[0]);
					child.off('click');

					//	スキップ
					child = $(page_bg.find('div[layout=skip]')[0]);
					child.off('click');
				}
				break;

			case 2:		//	page2
			case 3:		//	page3
			case 4:		//	page4
			case 5:		//	page5
				if( page == 2 || page == 5)
					this.permitSwipe = 'left';
				else
					this.permitSwipe = 'right';

				if( add)
				{
					page_bg.bind('touchstart', funcTouchStart);
					page_bg.bind('mousedown', funcTouchStart);
					page_bg.bind('touchmove', funcTouchMove);
					page_bg.bind('mousemove', funcTouchMove);
					page_bg.bind('touchend', funcTouchEnd);
					page_bg.bind('mouseup', funcTouchEnd);
				}
				else
				{
					page_bg.unbind();
				}

				break;
/*
			case 4:		//	page4
				page_bg = this.rootEle.children('div[navipage=3]');
				child = $($(page_bg[0]).find('div[layout=operation]')[0]);			//	次へ
				if( add)
				{
					child.click((function(my){
						return function(e){

							if( this.trans)
								return false;

							this.trans = true;
							my.hide((function(my){
								return function(e){
									my.next();
								};
							})(my));
						};
					})(this));
				}
				else
				{
					child.off('click');
				}

				break;

			case 3:		//	page3
				page_bg = this.rootEle.find('div[navipage=4]');
				child = $($(page_bg[0]).find('div[layout=operation_area]')[0]);	//	ライフスタイルサイクル
				if( add)
				{
					child.click((function(my){
						return function(e){

							if( this.trans)
								return false;

							this.trans = true;
							my.hide((function(my){
								return function(e){

									$('#menutab').mobiscroll('navigate',2);
									my.next();

								};
							})(my));
						};
					})(this));
				}
				else
				{
					child.off('click');
				}

				break;
*/
			case 6:		//	page6
				page_bg = this.rootEle.children('div[navipage=6]');
				child = $($(page_bg[0]).find('div[layout=operation]')[0]);
				if( add)
				{
					child.click((function(my){
						return function(e){

							if( this.trans)
								return false;

							this.trans = true;
							my.hide((function(my){
								return function(e){
									my.close();
								};
							})(my));
						};
					})(this));
				}
				else
				{
					child.off('click');
				}

				break;
		}

	}







	if( this.valid)
	{
		this.init();

		this.rootEle.show(0);
		this.show(1);
		this.setEvent(this.cur_page, true);		//	登録

	}
}

