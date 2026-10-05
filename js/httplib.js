

var httpTimeOut = 5000;		//	5秒

//*****************************************
//	HTTP リクエスト
//		method...	GET/POST/PUT/DELETE
//		url...		URL
//		sendfunc	戻り関数
function httpRequest(method,url,sendfunc,async)
{

	if( async == void 0)
	{
		async = false;	//	デフォルト同期
	}

	var httpObj = new XMLHttpRequest();
	if ( !httpObj){
		return false;
	}

	httpObj.open(method,url,async);
	if( async)
	{
		httpObj.responseType = '';
		httpObj.timeout = httpTimeOut;
/*
		httpObj.ontimeout = function(e){
			sendfunc( -2,this.responseText);
		}
*/
	}
	httpObj.onreadystatechange = function(e){
		if ( this.readyState == 4)
		{
			if( this.status == 200 || this.status == 201)
			{
				sendfunc( 0,this.responseText);
			}
			else
			{
				sendfunc( -1,this.responseText);
			}
		}
	};
	httpObj.send(null);

	return true;
}

//*****************************************
//	HTTP リクエスト	クエリー
//		method...	GET/POST/PUT/DELETE
//		url...		URL
//		data...		クエリー
//		sendfunc	戻り関数
function httpRequestQuery(method,url,data,sendfunc,async)
{

	if( async == void 0)
	{
		async = false;	//	デフォルト同期
	}

	var httpObj = new XMLHttpRequest();
	if ( !httpObj){
		return false;
	}

	httpObj.open(method,url,async);
	if( async)
	{
		httpObj.responseType = '';
		httpObj.timeout = httpTimeOut;
/*
		httpObj.ontimeout = function(e){
			sendfunc( -2,this.responseText);
		}
*/
	}
	httpObj.setRequestHeader('Content-Type','application/x-www-form-urlencoded;charset=UTF-8');
	httpObj.onreadystatechange = function(e)
	{
		if ( this.readyState == 4)
		{
			if( this.status == 200 || this.status == 201)
			{
				sendfunc( 0,this.responseText);
			}
			else
			{
				sendfunc( -1,this.responseText);
			}
		}
	};

	httpObj.send(data);

	return true;
}




