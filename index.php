<?php
session_start();

global $miner, $port;
$miner = '127.0.0.1'; # hostname or IP address
$port = 4028;

$here = $_SERVER['PHP_SELF'];

?>
<html>
<head>
<title>BitCrane Miner Control Panel</title>
<meta http-equiv-"content-type" content="text/html"; charset="UTF-8"; />
<link rel="stylesheet" type="text/css" href="./css/pools.css" />

<script type='text/javascript'>

//PageRefreash function
function pr(a,m){
	if(m!=null){
		if(!confirm(m+'?'))
		return
	}
	window.location="<?php echo $here ?>"+a
}

function prc(a,m){
	pr('?arg='+a,m);
}

function prs(a){
	var c=a.substr(3);
	var z=c.split('|',2);
	var m=z[0].substr(0,1).toUpperCase()+z[0].substr(1)+' GPU '+z[1];
	pr('?arg='+a,m)
}

</script>

</head>
<body>

<h1>
<div id="c_header" style="margin:0 auto; text-align:center; background: url(./imgs/title.jpg); width:1366px; height:157px;"></div>
</h1>

<?php 
 echo '<div class=sta style="text-align:center">Date: '.date('H:i:s j-M-Y \U\T\CP').'</div>';
?>

<table border=0 cellpadding=5 cellspacing=0 summary='Mine'>

<?php

global $error;
$error = null;

function getsock($addr, $port)
{
 global $error;
 $socket = null;
 $socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
 if ($socket === false || $socket === null)
 {
	$error = socket_strerror(socket_last_error());
	$msg = "socket create(TCP) failed";
	$error = "ERR: $msg '$error'\n";
	return null;
 }
 $res = socket_connect($socket, $addr, $port);
 if ($res === false)
 {
	$error = socket_strerror(socket_last_error());
	$msg = "socket connect($addr,$port) failed";
	$error = "ERR: $msg '$error'\n";
	socket_close($socket);
	return null;
 }
 return $socket;
}
#
function readsockline($socket)
{
 $line = '';
 while (true)
 {
	$byte = socket_read($socket, 1);
	if ($byte === false || $byte === '')
		break;
	if ($byte === "\0")
		break;
	$line .= $byte;
 }
 return $line;
}
#
function api($cmd)
{
 global $miner, $port;
 $socket = getsock($miner, $port);
 if ($socket != null)
 {
	socket_write($socket, $cmd, strlen($cmd));
	$line = readsockline($socket);
	socket_close($socket);
	if (strlen($line) == 0)
	{
		$error = "WARN: '$cmd' returned nothing\n";
		return $line;
	}
#	print "$cmd returned '$line'\n";
	$data = array();
	$objs = explode('|', $line);
	foreach ($objs as $obj)
	{
		if (strlen($obj) > 0)
		{
			$items = explode(',', $obj);
			$item = $items[0];
			$id = explode('=', $items[0], 2);
			if (count($id) == 1 or !ctype_digit($id[1]))
				$name = $id[0];
			else
				$name = $id[0].$id[1];
			if (strlen($name) == 0)
				$name = 'null';
			if (isset($data[$name]))
			{
				$num = 1;
				while (isset($data[$name.$num]))
					$num++;
				$name .= $num;
			}
			$counter = 0;
			foreach ($items as $item)
			{
				$id = explode('=', $item, 2);
				if (count($id) == 2)
					$data[$name][$id[0]] = $id[1];
				else
					$data[$name][$counter] = $id[0];
				$counter++;
			}
		}
	}
	return $data;
 }
 return null;
}
#
function getparam($name, $both = false)
{
 $a = null;
 if (isset($_POST[$name]))
	$a = $_POST[$name];
 if (($both === true) and ($a === null))
 {
	if (isset($_GET[$name]))
		$a = $_GET[$name];
 }
 if ($a == '' || $a == null)
	return null;
 // limit to 1K just to be safe
 return substr($a, 0, 1024);
}
#
function details($cmd, $list)
{
 $stas = array('S' => 'Success', 'W' => 'Warning', 'I' => 'Informational', 'E' => 'Error', 'F' => 'Fatal');

 $tb = '<tr><td><table border=1 cellpadding=5 cellspacing=0>';
 $te = '</table></td></tr>';

 echo $tb;
 echo $te.$tb;

 if (isset($list['STATUS']))
 {
	echo '<tr>';
	echo '<td>Version: '.$list['STATUS']['Description'].'</td>';
	$sta = $list['STATUS']['STATUS'];
	echo '<td>Status: '.$stas[$sta].'</td>';
	echo '<td>Message: '.$list['STATUS']['Msg'].'</td>';
	echo '</tr>';
 }

 echo $te.$tb;

$poolcmd = array (	'Switch to'  =>  'switchpool',
			'Enable'     =>  'enablepool',
			'disable'    =>  'disablepool');

 foreach ($list as $item => $values)
 {
	if ($item != 'STATUS')
	{
		echo '<tr>';
		foreach ($values as $name => $value)
		{
			if ($name == '0')
				$name = '&nbsp;';
			echo "<td valign=bottom class=h>$name</td>";
		}
		
		if ($cmd == 'pools')
			foreach ($poolcmd as $name => $pcmd)
				echo "<td valign=bottom class=h>$name</td>";
		echo '</tr>';

		break;
	}
 }
 foreach ($list as $item => $values)
 {
	if ($item == 'STATUS')
		continue;
		
	echo '<tr>';

	foreach ($values as $name => $value)
	echo "<td>$value</td>";
	
	if ($cmd == 'pools')
	{

		reset($values);
		$pool = current($values);

		foreach ($poolcmd as $name => $pcmd)
		{
			echo "<td>";
			if ($pool ===false)
				echo '&nbsp;';
			else
			{
				echo "<input type=button value='Pool $pool'";
				echo " onclick='prc(\"$pcmd|$pool\",\"$name Pool $pool\")'>";
			}
			echo '</td>';
		}

	}


	echo '</tr>';

}
 echo $te;
}
#
function process($cmds, $rd, $ro)
{
 global $error;
 foreach ($cmds as $cmd => $des)
 {
	$process = api($cmd);
	if ($error != null)
	{
		echo "<tr><td>Error getting $des: ";
		echo $rd.$error.$ro.'</td></tr>';
		break;
	}
	else
	{
		details($cmd,$process);
		echo '<tr><td><br><br></td></tr>';
	}
 }
}
#
function display()
{
 global $error;
 $error = null;
 $rd = '<font color=red><b>';
 $ro = '</b></font>';
 echo "<tr><td><table cellpadding=0 cellspacing=0 border=0><tr><td>";
 echo "<input type=button value='Refresh' onclick='pr(\"\",null)'>";
 echo "</td><td width=100%>&nbsp;</td><td>";
 echo "<input type=button value='Quit' onclick='prc(\"quit\",\"Quit CGMiner\")'>";
 echo "</td></tr></table></td></tr>";
 $arg = trim(getparam('arg', true));
 if ($arg != null and $arg != '')
	process(array($arg => $arg), $rd, $ro);
 $cmds = array(
		'lcd' => 'summary information',
		'edevs'    => 'device list',
		'pools'   => 'pool list',
		'config' => 'cgminer config');
 process($cmds, $rd, $ro);
}
#
display();
#
?>

</table>
</body>
</html>
