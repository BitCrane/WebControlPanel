var dev_template = null;
var dev_arr = null;
var dev_nomal = null;
var mode = "economic";

function compare(a, b) {
    var str1 = a["Op Name"];
    var str2 = b["Op Name"];
    if (str1 == str2)
        return 0;
    if (str1 == null)
        return -1;
    if (str2 == null)
        return 1;

    if (str1.length < str2.length)
        return -1;
    if (str1.length > str2.length)
        return 1;

    if (str1 < str2)
        return -1;
    if (str1 > str2)
        return 1;
    return 0;
}

function devs() 
{
	if (dev_template == null) {
		tmpl = ccbmc.C_TMPL_PATH + ["dev", ccbmc.lang, "jsrender"].join(".");
		$.syncGet(tmpl, function(d) { dev_template = d } );
		if (dev_template == null)
			return;
		dev_template = $.templates(dev_template); 
	}    

    // {"mode":"turbo","freq":800,"voltage":880}
	$.syncGet("/mode", function (d) {
	    var o = null;
	    //mode = typeof (d);
	    if (null == d) return;
	    if (typeof (d) == "string")
	        o = JSON.parse(d);
	    else if (typeof (d) == "object")
	        o = d;
	    if (o != null && o["mode"] != null)
	        mode = o["mode"];
	    else
	        mode = "economic";
	});

	var ret = null;
	$.syncGet("/cgi//devs", function (d) {
	    if (null == d) return;
	    if (typeof (d) != "string") return;
	    var arr = splitApiResult(d);
	    dev_arr = arr;

	    ret = {};

	    ret.mode = mode;

	    var oStatus = arr[STATUS_INDEX];
	    if (oStatus == null || oStatus.STATUS != "S") return;
	    ret.time = formatDate(new Date(oStatus.When * 1000), 'YYYY-MM-DD hh:mm');
	    ret.description = oStatus.Description;
	    ret.msg = oStatus.Msg;

	    ret.ASCx = [];
	    var sn = 0;	    

        /*
	    if (arr.length > 0) {
	        if (arr[0]["Op Name"] != null)
	            arr.sort(compare);
	    }
        */
	    arr.sort(compare);

	    for (var i = 0; i < arr.length; ++i) {
	        var o = arr[i];
	        if (o.ASC == null) continue;
	        if (o.Enabled != 'Y') continue;
	        if (o["No Device"] == 'true') continue;
	        ret.ASCx.push({
	            id: o.ASC,
	            //sn: ++sn,
	            sn: (o["Op Name"] != null) ? o["Op Name"] : ++sn,
	            accepted: parseInt(o.Accepted),
	            rejected: parseInt(o.Rejected),
	            devRejected: parseInt(o["Device Rejected"]),
	            devH: parseFloat(o["Device Hardware%"]),
	            lsd: parseInt(o["Last Share Difficulty"]),
	            diffA: parseInt(o["Difficulty Accepted"]),
	            diffR: parseInt(o["Difficulty Rejected"]),
	            mhs5s: Math.round(parseFloat(o["MHS 5s"]) / 10) / 100,
	            mhsAv: Math.round(parseFloat(o["MHS av"]) / 10) / 100,
	            elapsed: parseInt(o["Device Elapsed"]),
	            utility: parseFloat(o["Utility"]),
	            temp: parseFloat(o["Temperature"]),

	            status: o.Status
	        });
	    }
	    dev_nomal = ret;

	    var sum = {
	        lsd: 0,
	        diffA: 0,
	        diffR: 0,
	        mhs5s: 0,
	        mhsAv: 0,
	        utility: 0,
	        devH: 0,
	        elapsed: 0,

	        status: "summary"
	    };
	    var ascx = ret.ASCx;
	    for (var i = 0; i < ascx.length; ++i) {
	        var o = ascx[i];
	        sum.lsd += o.lsd;
	        sum.diffA += o.diffA;
	        sum.diffR += o.diffR;
	        sum.mhs5s += o.mhs5s;
	        sum.mhsAv += o.mhsAv;
	        sum.utility += o.utility;
	        sum.devH += o.devH;
	        sum.elapsed = sum.elapsed > o.elapsed ? sum.elapsed : o.elapsed;
	    }
	    if (ascx.length != 0) {
	        sum.devH /= ascx.length;
	    }
	    sum.lsd = "----";
	    sum.mhs5s = Math.round(sum.mhs5s * 100) / 100;
	    sum.mhsAv = Math.round(sum.mhsAv * 100) / 100;
	    sum.utility = Math.round(sum.utility * 100) / 100;
	    sum.devH = Math.round(sum.devH * 100) / 100;
	    sum.elapsed = $.sec2day(sum.elapsed);
	    ret.sum = sum;

	}, { dataType: "text" });
	if (ret != null) $("#c_dev").html(dev_template.render(ret));
}

function loop_dev_info()
{
	update_dev_info();
}

function update_dev_info()
{
	var d = devs();

	setTimeout(update_dev_info, 5000);
}

function switch_mode() {
    $.get("/restart/switch_mode", function (d) { if (d != null) alert(ALERT_SWITCH_MODE); });
}
