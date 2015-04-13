var STATUS_INDEX = 0;

function splitApiResult(d)
{
	var arr1 = d.split(/\|/);
	for (var i = 0 ; i < arr1.length; ++i)
	{
		var o = $.trim(arr1[i]);
		if (o == "") {
			arr1[i] = null;
			continue;
		}
		o = o.split(/,/);

		var rep = {};
		for (j = 0 ; j < o.length; ++j) {
			var ass = $.trim(o[j]);
			var search = ass.search(/=/);
			if (search == -1)
				continue;
			rep[ ass.substr(0, search) ] = ass.substr(search + 1);
		}
		arr1[i] = rep;
	}
	arr1 = $.grep(arr1, function(o) { return o != null; });
	return arr1;
}
