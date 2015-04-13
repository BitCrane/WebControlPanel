function load_addr_config()
{
	$.get("/sf/config/addr.conf.json", function (data) 
			{
				if (data != null) {
					$("#address").val(data.address);
					$("#netmask").val(data.netmask);
					$("#gateway").val(data.gateway);
					$("#dns").val(data.dns);
				}
			}, "json");
}

function post_addr_config()
{
	var obj = {
		address : $("#address").val(),
		netmask : $("#netmask").val(),
		gateway : $("#gateway").val(),
		dns: $("#dns").val()
	};
	$.post("/config/addr.conf.json", JSON.stringify(obj), 
			function(data) { 
				$.syncGet("/restart/addr", function(d) {
					if (d != null) {
						alert(ALERT_ADDR_SAVED);
					}
				});
			} );

}

function restart_system()
{
	$.get("/restart/system", function(d) { if (d != null) alert(ALERT_SYS_RESTART); });
}


