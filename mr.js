var url = "https://xxx-xxx-xxx.firebaseio.com/Company%20Name"

// Firmware version list to compare to retrieved firmware versions
var latest_fw_300p = "01.06.Y1";
var latest_fw_300w = "02.10.E1";
var latest_fw_301w = "03.01.M1";
var latest_fw_754 = "03m00.t1";
var latest_fw_2630 = "07.90.K1";
var latest_fw_3070 = "07.90.Z1";
var latest_fw_3640 = "06I00.A2";
var latest_fw_5070 = "07.90.Z1";
var latest_fw_7040 = "05x00.S1";

var low_threshold = 10;
var low_color = "#FF9999";
var medium_threshold = 30;
var medium_color = "#FFFF99";
var white = '#FFFFFF';
var red = '#FF0000';
var black = '#000000'

function get_machine_data() {
	var table = document.getElementById("scan");

	// retrieve assets
	fetch(url + "/asset.json")
		.then(function (response) {
			return response.json();
		})
		.then(function (assets) {
			for (item in assets) {

				// Retrieve ipaddr
				fetch(url + "/asset/" + item + ".json")
					.then(function (response) {
						return response.json();
					})
					.then(function (ipaddr) {
						//console.log(ipaddr);

						var row = table.insertRow(-1);

						// Retrieve asset
						fetch(url + "/machines/" + ipaddr + ".json")
							.then(function (response) {
								return response.json();
							})
							.then(function (data) {
								asset = data["Asset Number"]
								var casset = row.insertCell(-1);
								casset.innerHTML = "<a target=\"_blank\" href=\"./scan/index.html?asset=" + asset + "\">" + asset + "</a>";

								// Retrieve serial
								serial = data["Serial Number"]
								var cserial = row.insertCell(-1);
								cserial.innerHTML = serial;

								// Retrieve location
								loc = data["Location"]
								var cloc = row.insertCell(-1);
								cloc.innerHTML = loc;

								// Retrieve IP
								ip = data["IP Address"]
								var cip = row.insertCell(-1);
								cip.innerHTML = ip;

								// MAC
								mac = data["Hardware Address"]
								var cmac = row.insertCell(-1);
								cmac.innerHTML = mac;

								// Retrieve model
								model = data["Model"]
								var cmodel = row.insertCell(-1);
								cmodel.innerHTML = model;

								// Firmware
								fw = data["Firmware Version"]
								var cfw = row.insertCell(-1);
								cfw.innerHTML = fw;

								// Checking for shipped
								//if (data["Shipped"] != null) {
								//	shipped = data["Shipped"];
								//	//console.log(shipped);
								//} else {
								//	data["Shipped"]["Black"]
								//}

								// if the model and its firmware don't match, make the cell red
								if (model.includes("7040N") & fw != latest_fw_7040) {
									cfw.style.color = white;
									cfw.style.backgroundColor = red;
								}
								if ((model.includes("3070N") | model.includes("4070N")) & fw != latest_fw_3070) {
									cfw.style.color = white;
									cfw.style.backgroundColor = red;
								}
								if ((model.includes("5070N") | model.includes("6070N")) & fw != latest_fw_5070) {
									cfw.style.color = white;
									cfw.style.backgroundColor = red;
								}
								if (model.includes("301W") & fw != latest_fw_301w) {
									cfw.style.color = white;
									cfw.style.backgroundColor = red;
								}
								if (model.includes("300W") & fw != latest_fw_300w) {
									cfw.style.color = white;
									cfw.style.backgroundColor = red;
								}
								if (model.includes("300P") & fw != latest_fw_300p) {
									cfw.style.color = white;
									cfw.style.backgroundColor = red;
								}
								if (model.includes("2630") & fw != latest_fw_2630) {
									cfw.style.color = white;
									cfw.style.backgroundColor = red;
								}
								if (model.includes("3640") & fw != latest_fw_3640) {
									cfw.style.color = white;
									cfw.style.backgroundColor = red;
								}
								if ((model.includes("654N") | model.includes("754N")) & fw != latest_fw_754) {
									cfw.style.color = white;
									cfw.style.backgroundColor = red;
								}

								// Latest scan
								scan = data["Latest Scan"]
								var cscan = row.insertCell(-1);
								cscan.innerHTML = scan;

								// Retrieve latest scan data 
								fetch(url + "/scans/" + ipaddr + "/" + scan + ".json")
									.then(function (response) {
										return response.json();
									})
									.then(function (data) {
										// Aggregate Total count
										total = data["Total Count"]
										var ctotal = row.insertCell(-1);
										ctotal.innerHTML = total;

										// Black and white total
										black_total = data["Black & White Total Count"]
										var cbc = row.insertCell(-1);
										cbc.innerHTML = black_total;

										// Color total
										color_total = data["Full Color Total Count"]
										var ccc = row.insertCell(-1);
										ccc.innerHTML = color_total;

										// Percentages
										black_toner = data["Black Toner"]
										var tpk = row.insertCell(-1);
										tpk.innerHTML = black_toner;

										//if (shipped["Black"] == 1) {
										//	var black_toner_shipped = 1;
										//	console.log("shipped: " + black_toner_shipped)
										//} else {
										//	if ((shipped["Black"] == null) & (shipped["Black"] == 0)) {
										//		black_toner_shipped = 0;
										//	}
										//}

										if (black_toner <= medium_threshold && black_toner > low_threshold) {
											tpk.style.backgroundColor = medium_color;
											tpk.style.color = black;
										}
										if (black_toner <= low_threshold) {
											if (black_toner < 0) {
												tpk.style.backgroundColor = red;
												tpk.style.color = white;

												// Not holding out hope this will ever materialize...
												//if (data["Shipped"]["Black"] == 1)
												//{
												//console.log(asset + "  testing");
												//tpk.style.backgroundColor = "#FF00FF";
											} else {
												tpk.style.backgroundColor = low_color;
												tpk.style.color = black;
											}
										}
										//if (black_toner <= low_threshold) && shipped["Black"] > 0)
										//{
										//tpk.style.backgroundColor = "#FF00FF";
										//}

										//if (black_toner_shipped == 1) {
										//tpk.style.backgroundColor = "#FFFFFF";
										//}

										//if (black_toner_shipped == 1) {
										//pk.style.backgroundColor = "#FF00FF";
										//}

										// if machine is b&w, need the extra dances
										cyan_toner = data["Cyan Toner"]
										var tpc = row.insertCell(-1);
										if (cyan_toner == null) {
											tpc.innerHTML = "";
										} else {
											tpc.innerHTML = cyan_toner;
											if (cyan_toner <= low_threshold) {
												if (cyan_toner < 0) {
													tpc.style.backgroundColor = red;
													tpc.style.color = white;
												} else {
													tpc.style.backgroundColor = low_color;
													tpc.style.color = black;
												}
											}
										}
										if (cyan_toner <= medium_threshold && cyan_toner > low_threshold) {
											tpc.style.backgroundColor = medium_color;
											tpc.style.color = black;
										}

										magenta_toner = data["Magenta Toner"]
										var tpm = row.insertCell(-1);
										if (magenta_toner == null) {
											tpm.innerHTML = "";
										} else {
											tpm.innerHTML = magenta_toner;
											if (magenta_toner <= low_threshold) {
												if (magenta_toner < 0) {
													tpm.style.backgroundColor = red;
													tpm.style.color = white;
												} else {
													tpm.style.backgroundColor = low_color;
													tpm.style.color = black;
												}
											}
										}
										if (magenta_toner <= medium_threshold && magenta_toner > low_threshold) {
											tpm.style.backgroundColor = medium_color;
											tpm.style.color = black;
										}

										yellow_toner = data["Yellow Toner"]
										var tpy = row.insertCell(-1);
										if (yellow_toner == null) {
											tpy.innerHTML = "";
										} else {
											tpy.innerHTML = yellow_toner;
											if (yellow_toner <= low_threshold) {
												if (yellow_toner < 0) {
													tpy.style.backgroundColor = red;
													tpy.style.color = white;
												} else {
													tpy.style.backgroundColor = low_color;
													tpy.style.color = black;
												}
											}
										}
										if (yellow_toner <= medium_threshold && yellow_toner > low_threshold) {
											tpy.style.backgroundColor = medium_color;
											tpy.style.color = black;
										}

										black_drum = data["Black Drum"]
										var dpk = row.insertCell(-1);
										dpk.innerHTML = black_drum;
										if (black_drum <= low_threshold) {
											if (black_drum < 0) {
												dpk.style.backgroundColor = red;
												dpk.style.color = white;
											} else {
												dpk.style.backgroundColor = low_color;
												dpk.style.color = black;
											}
										}
										if (black_drum <= medium_threshold && black_drum > low_threshold) {
											dpk.style.backgroundColor = medium_color;
											dpk.style.color = black;
										}

										cyan_drum = data["Cyan Drum"]
										var dpc = row.insertCell(-1);
										if (cyan_drum == null) {
											dpc.innerHTML = "";
										} else {
											dpc.innerHTML = cyan_drum;
											if (cyan_drum <= low_threshold) {
												if (cyan_drum < 0) {
													dpc.style.backgroundColor = red;
													dpc.style.color = white;
												} else {
													dpc.style.backgroundColor = low_color;
													dpc.style.color = black;
												}
											}
										}
										if (cyan_drum <= medium_threshold && cyan_drum > low_threshold) {
											dpc.style.backgroundColor = medium_color;
											dpc.style.color = black;
										}

										magenta_drum = data["Magenta Drum"]
										var dpm = row.insertCell(-1);
										if (magenta_drum == null) {
											dpm.innerHTML = "";
										} else {
											dpm.innerHTML = magenta_drum;
											if (magenta_drum <= low_threshold) {
												if (magenta_drum < 0) {
													dpm.style.backgroundColor = red;
													dpm.style.color = white;
												} else {
													dpm.style.backgroundColor = low_color;
													dpm.style.color = black;
												}
											}
										}
										if (magenta_drum <= medium_threshold && magenta_drum > low_threshold) {
											dpm.style.backgroundColor = medium_color;
											dpm.style.color = black;
										}

										yellow_drum = data["Yellow Drum"]
										var dpy = row.insertCell(-1);
										if (yellow_drum == null) {
											dpy.innerHTML = "";
										} else {
											dpy.innerHTML = yellow_drum;
											if (yellow_drum <= low_threshold) {
												if (yellow_drum < 0) {
													dpy.style.backgroundColor = red;
													dpy.style.color = white;
												} else {
													dpy.style.backgroundColor = low_color;
													dpy.style.color = black;
												}
											}
										}
										if (yellow_drum <= medium_threshold && yellow_drum > low_threshold) {
											dpy.style.backgroundColor = medium_color;
											dpy.style.color = black;
										}

										black_developer = data["Black Developer"]
										var vpk = row.insertCell(-1);
										vpk.innerHTML = black_developer;
										if (black_developer <= low_threshold) {
											if (black_developer < 0) {
												vpk.style.backgroundColor = red;
												vpk.style.color = white;
											} else {
												vpk.style.backgroundColor = low_color;
												vpk.style.color = black;
											}
										}
										if (black_developer <= medium_threshold && black_developer > low_threshold) {
											vpk.style.backgroundColor = medium_color;
											vpk.style.color = black;
										}

										cyan_developer = data["Cyan Developer"]
										var vpc = row.insertCell(-1);
										if (cyan_developer == null) {
											vpc.innerHTML = "";
										} else {
											vpc.innerHTML = cyan_developer;
											if (cyan_developer <= low_threshold) {
												if (cyan_developer < 0) {
													vpc.style.backgroundColor = red;
													vpc.style.color = white;
												} else {
													vpc.style.backgroundColor = low_color;
													vpc.style.color = black;
												}
											}
										}
										if (cyan_developer <= medium_threshold && cyan_developer > low_threshold) {
											vpc.style.backgroundColor = medium_color;
											vpc.style.color = black;
										}

										magenta_developer = data["Magenta Developer"]
										var vpm = row.insertCell(-1);
										if (magenta_developer == null) {
											vpm.innerHTML = "";
										} else {
											vpm.innerHTML = magenta_developer;
											if (magenta_developer <= low_threshold) {
												if (magenta_developer < 0) {
													vpm.style.backgroundColor = red;
													vpm.style.color = white;
												} else {
													vpm.style.backgroundColor = low_color;
													vpm.style.color = black;
												}
											}
										}
										if (magenta_developer <= medium_threshold && magenta_developer > low_threshold) {
											vpm.style.backgroundColor = medium_color;
											vpm.style.color = black;
										}

										yellow_developer = data["Yellow Developer"]
										var vpy = row.insertCell(-1);
										if (yellow_developer == null) {
											vpy.innerHTML = "";
										} else {
											vpy.innerHTML = yellow_developer;
											if (yellow_developer <= low_threshold) {
												if (yellow_developer < 0) {
													vpy.style.backgroundColor = red;
													vpy.style.color = white;
												} else {
													vpy.style.backgroundColor = low_color;
													vpy.style.color = black;
												}
											}
										}
										if (yellow_developer <= medium_threshold && yellow_developer > low_threshold) {
											vpy.style.backgroundColor = medium_color;
											vpy.style.color = black;
										}
									})
							})
					})
			}
		})
}

get_machine_data();

function sortTable(table, col, reverse) {
	var tb = table.tBodies[0], // use `<tbody>` to ignore `<thead>` and `<tfoot>` rows
		tr = Array.prototype.slice.call(tb.rows, 0), // put rows into array
		i;
	reverse = -((+reverse) || -1);
	tr = tr.sort(function (a, b) { // sort rows
		return reverse // `-1 *` if want opposite order
			*
			(a.cells[col].textContent.trim() // using `.textContent.trim()` for test
				.localeCompare(b.cells[col].textContent.trim(), undefined, {
					numeric: true
				})
			);
	});
	for (i = 0; i < tr.length; ++i) tb.appendChild(tr[i]); // append each row in order
}

function makeSortable(table) {
	var th = table.tHead,
		i;
	th && (th = th.rows[0]) && (th = th.cells);
	if (th) i = th.length;
	else return; // if no `<thead>` then do nothing
	while (--i >= 0)(function (i) {
		var dir = 1;
		th[i].addEventListener('click', function () {
			sortTable(table, i, (dir = 1 - dir))
		});
	}(i));
}

function makeAllSortable(parent) {
	parent = parent || document.body;
	var t = parent.getElementsByTagName('table'),
		i = t.length;
	while (--i >= 0) makeSortable(t[i]);
}

window.onload = function () {
	makeAllSortable();
};

(function () {
	var thElm;
	var startOffset;

	Array.prototype.forEach.call(
		document.querySelectorAll("table th"),
		function (th) {
			th.style.position = 'relative';
			th.row;

			var grip = document.createElement('div');
			grip.innerHTML = "&nbsp;";
			grip.style.top = 0;
			grip.style.right = 0;
			grip.style.bottom = 0;
			grip.style.width = '5px';
			grip.style.position = 'absolute';
			grip.style.cursor = 'col-resize';
			grip.addEventListener('mousedown', function (e) {
				thElm = th;
				startOffset = th.offsetWidth - e.pageX;
			});

			th.appendChild(grip);
		});

	document.addEventListener('mousemove', function (e) {
		if (thElm) {
			thElm.style.width = startOffset + e.pageX + 'px';
		}
	});

	document.addEventListener('mouseup', function () {
		thElm = undefined;
	});
})();

var table = document.getElementById('table1');
var tbody = table.getElementsByTagName('tbody')[0];
var cells = tbody.getElementsByTagName('td');

// not sure this actually helps...
for (var i = 0, len = cells.length; i < len; i++) {
	if (parseInt(cells[i].innerHTML, 10) > 20) {
		cells[i].style.backgroundColor = '#FFFFFF';
	} else if (parseInt(cells[i].innerHTML, 10) < -5) {
		cells[i].style.backgroundColor = '#00FF00';
	}
	if (parseInt(cells[i].innerHTML, 10) < 5) {
		cells[i].style.backgroundColor = '#FFFFFF';
	}
}
