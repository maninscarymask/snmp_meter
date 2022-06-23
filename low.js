var url = "https://xxx-xxx-xxx.firebaseio.com/Company%20Name"

// This is the "low" threshold value, as a percentage.  10 is okay if there's decent usage, whereas 20 is probably recommended if there is very high usage.
const low_value = 5;

// ID numbers of machines, which get correlated in the firebase setup
var machines = ["1001", "1002", "1003", "1004"];

var machine_info = [];

var low_tc = [];
var c_tc = 0;
var low_tm = [];
var c_tm = 0;
var low_ty = [];
var c_ty = 0;
var low_tk = [];
var c_tk = 0;
var low_vc = [];
var c_vc = 0;
var low_vm = [];
var c_vm = 0;
var low_vy = [];
var c_vy = 0;
var low_vk = [];
var c_vk = 0;
var low_dc = [];
var c_dc = 0;
var low_dm = [];
var c_dm = 0;
var low_dy = [];
var c_dy = 0;
var low_dk = [];
var c_dk = 0;
var low_wt = [];
var c_wt = 0;
var total_zero = [];
var c_tz = 0;

// these two lines go together, just need to change "asset = item" to "asset = machines[i]" if swapping back
machines.forEach(test);

function test(item, index) {
	let asset = item;

	var single = [];

	// retrieve ipaddr
	fetch(url + "/asset/" + asset + ".json")
	.then(function (response) {
		return response.json();
	})
	.then(function (ipaddr) {

		fetch(url + "/machines/" + ipaddr + "/Latest%20Scan.json")
		.then(function (response) {
			return response.json();
		})
		.then(function (latest_scan) {

			fetch(url + "/scans/" + ipaddr + "/" + encodeURIComponent(latest_scan) + ".json")
			.then(function (response) {
				return response.json();
			})
			.then(function (scan) {
//				single.push({"Asset":asset, "Date":scan["Date"]});

				if (scan["Black Toner"] <= low_value) {
					single.push({"Black Toner":scan["Black Toner"]});
					low_tk += "<a target=\"_blank\" href=\"data.html?asset=" + asset + "\">" + asset + "</a> ";
					c_tk++;
					if (scan["Black Toner"] == 0) {
						total_zero += "<a target=\"_blank\" href=\"data.html?asset=" + asset + "\">" + asset + "</a> ";
						c_tz++;
					}

				}
				if (scan["Black Developer"] <= low_value) {
					single.push({"Black Developer":scan["Black Developer"]});
					low_vk += "<a target=\"_blank\" href=\"data.html?asset=" + asset + "\">" + asset + "</a> ";
					c_vk++;
				}
				if (scan["Black Drum"] <= low_value) {
					single.push({"Black Drum":scan["Black Drum"]});
					low_dk += "<a target=\"_blank\" href=\"data.html?asset=" + asset + "\">" + asset + "</a> ";
					c_dk++;
				}

				if (scan["Cyan Toner"] <= low_value) {
					single.push({"Cyan Toner":scan["Cyan Toner"]});
					low_tc += "<a target=\"_blank\" href=\"data.html?asset=" + asset + "\">" + asset + "</a> ";
					c_tc++;
					if (scan["Cyan Toner"] == 0) {
						total_zero += "<a target=\"_blank\" href=\"data.html?asset=" + asset + "\">" + asset + "</a> ";
						c_tz++;
					}

				}
				if (scan["Cyan Developer"] <= low_value) {
					single.push({"Cyan Developer":scan["Cyan Developer"]});
					low_vc += "<a target=\"_blank\" href=\"data.html?asset=" + asset + "\">" + asset + "</a> ";
					c_vc++;
				}
				if (scan["Cyan Drum"] <= low_value) {
					single.push({"Cyan Drum":scan["Cyan Drum"]});
					low_dc += "<a target=\"_blank\" href=\"data.html?asset=" + asset + "\">" + asset + "</a> ";
					c_dc++;
				}

				if (scan["Magenta Toner"] <= low_value) {
					single.push({"Magenta Toner":scan["Magenta Toner"]});
					low_tm += "<a target=\"_blank\" href=\"data.html?asset=" + asset + "\">" + asset + "</a> ";
					c_tm++;
					if (scan["Magenta Toner"] == 0) {
						total_zero += "<a target=\"_blank\" href=\"data.html?asset=" + asset + "\">" + asset + "</a> ";
						c_tz++;
					}
				}
				if (scan["Magenta Developer"] <= low_value) {
					single.push({"Magenta Developer":scan["Magenta Developer"]});
					low_vm += "<a target=\"_blank\" href=\"data.html?asset=" + asset + "\">" + asset + "</a> ";
					c_vm++;
				}
				if (scan["Magenta Drum"] <= low_value) {
					single.push({"Magenta Drum":scan["Magenta Drum"]});
					low_dm += "<a target=\"_blank\" href=\"data.html?asset=" + asset + "\">" + asset + "</a> ";
					c_dm++;
				}

				if (scan["Yellow Toner"] <= low_value) {
					single.push({"Yellow Toner":scan["Yellow Toner"]});
					low_ty += "<a target=\"_blank\" href=\"data.html?asset=" + asset + "\">" + asset + "</a> ";
					c_ty++;
					if (scan["Yellow Toner"] == 0) {
						total_zero += "<a target=\"_blank\" href=\"data.html?asset=" + asset + "\">" + asset + "</a> ";
						c_tz++;
					}
				}
				if (scan["Yellow Developer"] <= low_value) {
					single.push({"Yellow Developer":scan["Yellow Developer"]});
					low_vy += "<a target=\"_blank\" href=\"data.html?asset=" + asset + "\">" + asset + "</a> ";
					c_vy++;
				}
				if (scan["Yellow Drum"] <= low_value) {
					single.push({"Yellow Drum":scan["Yellow Drum"]});
					low_dy += "<a target=\"_blank\" href=\"data.html?asset=" + asset + "\">" + asset + "</a> ";
					c_dy++;
				}

				if (scan["Waste Toner"] <= low_value) {
					single.push({"Waste Toner":scan["Waste Toner"]});
					low_wt += "<a target=\"_blank\" href=\"data.html?asset=" + asset + "\">" + asset + "</a> ";
					c_wt++;
				}

				if (c_tz > 0) {
					document.getElementById("total_zero").innerHTML = "<h3>Total at Zero (<font color=#dd0000>" + c_tz + "</font>): </h3>" + total_zero;
				}
				if (c_tz > 0) {
					document.getElementById("low_tc").innerHTML = "<h3>Total Cyan Toners (<font color=#dd0000>" + c_tc  + "</font>): </h3>" + low_tc;
				}
				if (c_tm > 0) {
					document.getElementById("low_tm").innerHTML = "<h3>Total Magenta Toners (<font color=#dd0000>" + c_tm + "</font>): </h3>" + low_tm;
				}
				if (c_ty > 0) {
					document.getElementById("low_ty").innerHTML = "<h3>Total Yellow Toners (<font color=#dd0000>" + c_ty + "</font>): </h3>" + low_ty;
				}
				if (c_tk > 0) {
					document.getElementById("low_tk").innerHTML = "<h3>Total Black Toners (<font color=#dd0000>" + c_tk + "</font>): </h3>" + low_tk;
				}
				if (c_vc > 0) {
					document.getElementById("low_vc").innerHTML = "<h3>Total Cyan Developers (<font color=#dd0000>" + c_vc + "</font>): </h3>" + low_vc;
				}
				if (c_vm > 0) {
					document.getElementById("low_vm").innerHTML = "<h3>Total Magenta Developers (<font color=#dd0000>" + c_vm + "</font>): </h3>" + low_vm;
				}
				if (c_vy > 0) {
					document.getElementById("low_vy").innerHTML = "<h3>Total Yellow Developers (<font color=#dd0000>" + c_vy + "</font>): </h3>" + low_vy;
				}
				if (c_vk > 0) {
					document.getElementById("low_vk").innerHTML = "<h3>Total Black Developers (<font color=#dd0000>" + c_vk + "</font>): </h3>" + low_vk;
				}
				if (c_dc > 0) {
					document.getElementById("low_dc").innerHTML = "<h3>Total Cyan Drums (<font color=#dd0000>" + c_dc + "</font>): </h3>" + low_dc;
				}
				if (c_dm > 0) {
					document.getElementById("low_dm").innerHTML = "<h3>Total Magenta Drums (<font color=#dd0000>" + c_dm + "</font>): </h3>" + low_dm;
				}
				if (c_dy > 0) {
					document.getElementById("low_dy").innerHTML = "<h3>Total Yellow Drums (<font color=#dd0000>" + c_dy + "</font>): </h3>" + low_dy;
				}
				if (c_dk > 0) {
					document.getElementById("low_dk").innerHTML = "<h3>Total Black Drums (<font color=#dd0000>" + c_dk + "</font>): </h3>" + low_dk;
				}
				if (c_wt > 0) {
					document.getElementById("low_wt").innerHTML = "<h3>Total Waste Toners (<font color=#dd0000>" + c_wt + "</font>): </h3>" + low_wt;
				}
			})
		})
	})

}

//console.log(machine_info);
