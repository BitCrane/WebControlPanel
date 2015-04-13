var pool_status_template = null;
var pool_arr = null;
var pool_normal = null;


function post_pool_config()
{
	var obj = {
		p1 : $.trim($('#p1').val()),
		p1u : $.trim($('#p1u').val()),
		p1p : $.trim($('#p1p').val()),
		p2 : $.trim($('#p2').val()),
		p2u : $.trim($('#p2u').val()),
		p2p : $.trim($('#p2p').val()),
		p3 : $.trim($('#p3').val()),
		p3u : $.trim($('#p3u').val()),
		p3p : $.trim($('#p3p').val())
	};
	var pools = 
	{
		pup : [],
		freq : 800,
		maxDiff : 0
	}
	if (obj.p1 != "") { pools.pup.push( { o: obj.p1, u: obj.p1u, p: obj.p1p } ); }
	if (obj.p2 != "") { pools.pup.push( { o: obj.p2, u: obj.p2u, p: obj.p2p } ); }
	if (obj.p3 != "") { pools.pup.push( { o: obj.p3, u: obj.p3u, p: obj.p3p } ); }
	var freq = parseInt($.trim($("#freq").val()));
	var maxDiff = parseInt($.trim($("#maxDiff").val()));
	if (!isNaN(freq) && freq != 0) {
		pools.freq = freq;
	}
	if (isNaN(maxDiff)) {
		maxDiff = 0;
	}
	pools.maxDiff = maxDiff;
	if (pools.pup.length == 0) {
		alert(ALL_POOLS_ARE_EMPTY);
		return;
	}

	$.post("/config/pools.conf.json", JSON.stringify(pools), 
			function(data) { 
				$.syncGet("/restart/miner", function(d) {
					if (d != null) {
						alert(ALERT_RESTART_MINER);
					}
				});
			} , "json");
}

function load_pool_config()
{
	$.syncGet("/sf/config/pools.conf.json", function(data)
			{
				if (data != null) {
					$("#freq").val(data.freq);
					$("#maxDiff").val(data.maxDiff);
					for (i = 0 ; i < data.pup.length; ) {
						var o = data.pup[i];
						++i;
						$("#p" + i).val(o.o);
						$("#p" + i + "u").val(o.u);
						$("#p" + i + "p").val(o.p);
					}
				}
			}, "json");
}

function pools()
{
	if (pool_status_template == null) {
		tmpl = ccbmc.C_TMPL_PATH + ["pool_status", ccbmc.lang, "jsrender"].join(".");
		$.syncGet(tmpl, function(d) { pool_status_template = d } );
		if (pool_status_template == null)
			return;
		pool_status_template = $.templates(pool_status_template); 
	}

	var ret = null;
	$.syncGet("/cgi//pools", function(d)
		{
			if (null == d) return;
			if (typeof(d) != "string") return;
			var arr = splitApiResult(d);
			pool_arr = arr;

			ret = {};
			var oStatus = arr[STATUS_INDEX];
			if (oStatus == null || oStatus.STATUS != "S") return;
	
			ret.time = new Date(oStatus.When * 1000);
			ret.description = oStatus.Description;
			ret.msg = oStatus.Msg;

			ret.Poolx = [];
			var sn = 0;
			for (var i = 0 ; i < arr.length; ++i) {
				var o = arr[i];
				if (o.POOL == null) continue;
				ret.Poolx.push({
					id: o.POOL,
					sn: ++sn,
					url: o.URL,
					user: o.User,
					accepted: parseInt(o.Accepted),
					rejected: parseInt(o.Rejected),
					diffA: parseInt(o["Difficulty Accepted"]),
					diffR: parseInt(o["Difficulty Rejected"]),
					status: o.Status
				});
			}
			pool_normal = ret;
		}, {dataType: "text"} );
	if (ret != null) $("#c_pool_status").html(pool_status_template.render(ret));
}

function loop_pool_status()
{
	update_pool_status();
}

function update_pool_status()
{
	var d = pools();

	setTimeout(update_pool_status, 5000);
}
