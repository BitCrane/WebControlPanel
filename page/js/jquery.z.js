jQuery.syncGet = function(url, callback, opt) { jQuery.ajax(jQuery.extend({ url:url, success: function(r) { callback(r); }, error: function() { callback(null); }, async: false, beforeSend: function(request) {
			request.setRequestHeader("Cache-Control","no-cache");
			request.setRequestHeader("If-Modified-Since","0");
			} }, opt)) ; }
jQuery.sec2day = function(sec) {
	var numdays = Math.floor(sec / 86400);
	var numhours = Math.floor((sec % 86400) / 3600);
	var numminutes = Math.floor(((sec % 86400) % 3600) / 60);
	var numsec = ((sec % 86400) % 3600) % 60;
	return { day: numdays, hour: numhours, min: numminutes, sec:numsec }
}


function formatDate(date, format) {
	if (arguments.length < 2 && !date.getTime) {
		format = date;
		date = new Date();
	}
	typeof format != 'string' && (format = 'YYYY年MM月DD日 hh时mm分ss秒');
	var week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', '日', '一', '二', '三', '四', '五', '六'];
	return format.replace(/YYYY|YY|MM|DD|hh|mm|ss|星期|周|www|week/g, function(a) {
			switch (a) {
			case "YYYY": return date.getFullYear();
			case "YY": return (date.getFullYear()+"").slice(2);
			case "MM": return date.getMonth() + 1;
			case "DD": return date.getDate();
			case "hh": return date.getHours();
			case "mm": return date.getMinutes();
			case "ss": return date.getSeconds();
			case "week": return week[date.getDay()];
			case "www": return week[date.getDay()].slice(0,3);
			}
			});
}



