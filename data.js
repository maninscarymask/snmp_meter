// Enter your complete Firebase database name.  The sub-folder is created from the Powershell script, so just match those.
var url = "https://xxx-xxx-xxx.firebaseio.com/Company%20Name"

// This is only to prettify the output of the meter counts
function thousands_separator(num) {
	if (num == null) {
		return 0;
	} else {
		return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
	}
}

// Main function that pulls all data and displays it
function get_machine_data() {
	// User input
	asset = document.getElementById("u_input").value;

	// Retrieve ipaddr (identifier)
	//
	// The way I've found it can work efficiently is to have a section which maps
	// equipment IDs to their IP address, only using hyphens (i.e. "xxx-xxx-xxx-xxx"), since
	// Firebase doesn't like "." in names.  This allows the ipaddr identifier to be used in
	// other locations and keep ambiguity to a minimum.
	//
	// The main reason is when the scan is happening, you don't know what the "Asset Number"
	// actually is at the start, as the machines are scanned by IP and the asset number is
	// written after the fact, so the only readily available identifier is the IP Address.
	//
	fetch(url + "/asset/" + asset + ".json")
		.then(function (response) {
			return response.json();
		})
		.then(function (data) {
			//console.log(JSON.stringify(data));
			ipaddr = data;

			// Retrieve model
			fetch(url + "/machines/" + ipaddr + ".json")
				.then(function (response) {
					return response.json();
				})
				.then(function (data) {
					// Retrieve model
					model = data["Model"];
					document.getElementById("model_output").innerHTML = model;

					// Retrieve serial
					serial = data["Serial Number"];
					document.getElementById("serial_output").innerHTML = serial;

					// Retrieve asset
					asset = data["Asset Number"];
					document.getElementById("asset_output").innerHTML = asset;

					// Retrieve ip address
					ip = data["IP Address"];
					document.getElementById("ip_output").innerHTML = ip;

					// Retrieve mac address
					mac = data["Hardware Address"];
					document.getElementById("mac_output").innerHTML = mac;

					// Retrieve firmware
					firmware = data["Firmware Version"];
					document.getElementById("firmware_output").innerHTML = firmware;

					// Retrieve location
					loc = data["Location"];
					document.getElementById("loc_output").innerHTML = loc;

					// Retrieve Shipped data
					shipped = data["Shipped"];

					if (shipped == null) {
						console.log("shipped is empty");
					} else {
						if (shipped["Black"] === 1) {
							document.getElementById("tkc").checked = true;
						} else {
							document.getElementById("tkc").checked = false;
						}

						if (shipped["Cyan"] === 1) {
							document.getElementById("tcc").checked = true;
						} else {
							document.getElementById("tcc").checked = false;
						}

						if (shipped["Magenta"] === 1) {
							document.getElementById("tmc").checked = true;
						} else {
							document.getElementById("tmc").checked = false;
						}

						if (shipped["Yellow"] === 1) {
							document.getElementById("tyc").checked = true;
						} else {
							document.getElementById("tyc").checked = false;
						}

						if (shipped["Waste"] === 1) {
							document.getElementById("wbc").checked = true;
						} else {
							document.getElementById("wbc").checked = false;
						}
					}

					// Retrieve latest scan
					scan = data["Latest Scan"];
					document.getElementById("scan_output").innerHTML = scan;

					// Data for graphs
					fetch(url + "/scans/" + ipaddr + ".json")
						// This used to work, but no longer does
						//fetch(url + "/scans/" + ipaddr + ".json" + encodeURIComponent('?orderBy="$key"&limitToLast=30'))

						// Correct form for pulling only a few of the scans
						//fetch(url + "/scans/" + ipaddr + ".json" + '?orderBy="$key"&limitToLast=300')
						.then(function (response) {
							return response.json();
						})
						.then(function (data) {
							// This runs all plots with all data retrieved
							toner_plot(data);
							developer_plot(data);
							drum_plot(data);
							maint_plot(data);
							total_plot(data);

							// Added to show toner install date
							var elements = [];
							for (date in data) {
								elements.push(date);
							}

							// /* You are not expected to understand this. */
							//
							// Setting up variables in order to have the dates shown for toner out/replaced
							var el_length = elements.length;

							// Black Toner Near End date
							for (let i = 1; i < el_length; i++) {
								tk_value = data[elements[el_length - i]]["Black Toner"];
								tk_value_prev = data[elements[el_length - (i + 1)]]["Black Toner"];
								k_date_value = data[elements[el_length - i]]["Date"];

								if (tk_value <= 0 && tk_value_prev > 10) {
									k_ne_date_value = k_date_value;
									document.getElementById("tk_ne_date_val").innerHTML = k_ne_date_value;
									break;
								} else {
									document.getElementById("tk_ne_date_val").innerHTML = "Not reached";
								}
							}

							// Black Toner Replaced date
							for (let i = 1; i < el_length; i++) {
								tk_value = data[elements[el_length - i]]["Black Toner"];
								tk_value_prev = data[elements[el_length - (i + 1)]]["Black Toner"];
								k_date_value = data[elements[el_length - i]]["Date"];

								if (tk_value > 90 && tk_value_prev <= 15) {
									tk_date_value = k_date_value;
									document.getElementById("tk_date_val").innerHTML = k_date_value;
									break;
								} else {
									if (tk_value_prev <= 0 && tk_value <= 0) {
										document.getElementById("tk_date_val").innerHTML = "Not replaced yet";
										break;
									} else {
										document.getElementById("tk_date_val").innerHTML = "Not replaced yet";
									}
								}
							}

							// Cyan Toner Near End date
							for (let i = 1; i < el_length; i++) {
								tc_value = data[elements[el_length - i]]["Cyan Toner"];
								tc_value_prev = data[elements[el_length - (i + 1)]]["Cyan Toner"];
								c_date_value = data[elements[el_length - i]]["Date"];

								if (tc_value <= 0 && tc_value_prev > 10) {
									c_ne_date_value = c_date_value;
									document.getElementById("tc_ne_date_val").innerHTML = c_ne_date_value;
									break;
								} else {
									document.getElementById("tc_ne_date_val").innerHTML = "Not reached";
								}
							}

							// Cyan Toner replaced date
							for (let i = 1; i < el_length; i++) {
								tc_value = data[elements[el_length - i]]["Cyan Toner"];
								tc_value_prev = data[elements[el_length - (i + 1)]]["Cyan Toner"];
								c_date_value = data[elements[el_length - i]]["Date"];

								if (tc_value > 90 && tc_value_prev <= 15) {
									tc_date_value = c_date_value;
									document.getElementById("tc_date_val").innerHTML = c_date_value;
									break;
								} else {
									if (tc_value_prev <= 0 && tc_value <= 0) {
										document.getElementById("tc_date_val").innerHTML = "Not replaced yet";
										break;
									} else {
										document.getElementById("tc_date_val").innerHTML = "Not replaced yet";
									}
								}
							}

							// Magenta Toner Near End date
							for (let i = 1; i < el_length; i++) {
								tm_value = data[elements[el_length - i]]["Magenta Toner"];
								tm_value_prev = data[elements[el_length - (i + 1)]]["Magenta Toner"];
								m_date_value = data[elements[el_length - i]]["Date"];

								if (tm_value <= 0 && tm_value_prev > 10) {
									m_ne_date_value = m_date_value;
									document.getElementById("tm_ne_date_val").innerHTML = m_ne_date_value;
									break;
								} else {
									document.getElementById("tm_ne_date_val").innerHTML = "Not reached";
								}
							}

							// Magenta Toner replaced date
							for (let i = 1; i < el_length; i++) {
								tm_value = data[elements[el_length - i]]["Magenta Toner"];
								tm_value_prev = data[elements[el_length - (i + 1)]]["Magenta Toner"];
								m_date_value = data[elements[el_length - i]]["Date"];

								if (tm_value > 90 && tm_value_prev <= 15) {
									tm_date_value = m_date_value;
									document.getElementById("tm_date_val").innerHTML = m_date_value;
									break;
								} else {
									if (tm_value_prev <= 0 && tm_value <= 0) {
										document.getElementById("tm_date_val").innerHTML = "Not replaced yet";
										break;
									} else {
										document.getElementById("tm_date_val").innerHTML = "Not replaced yet";
									}
								}
							}

							// Yellow Toner Near End date
							for (let i = 1; i < el_length; i++) {
								ty_value = data[elements[el_length - i]]["Yellow Toner"];
								ty_value_prev = data[elements[el_length - (i + 1)]]["Yellow Toner"];
								y_date_value = data[elements[el_length - i]]["Date"];

								if (ty_value <= 0 && ty_value_prev > 10) {
									y_ne_date_value = y_date_value;
									document.getElementById("ty_ne_date_val").innerHTML = y_ne_date_value;
									break;
								} else {
									document.getElementById("ty_ne_date_val").innerHTML = "Not reached";
								}
							}

							// Yellow Toner replaced date
							for (let i = 1; i < el_length; i++) {
								ty_value = data[elements[el_length - i]]["Yellow Toner"];
								ty_value_prev = data[elements[el_length - (i + 1)]]["Yellow Toner"];
								y_date_value = data[elements[el_length - i]]["Date"];

								if (ty_value > 90 && ty_value_prev <= 15) {
									ty_date_value = y_date_value;
									document.getElementById("ty_date_val").innerHTML = y_date_value;
									break;
								} else {
									if (ty_value_prev <= 0 && ty_value <= 0) {
										document.getElementById("ty_date_val").innerHTML = "Not replaced yet";
										break;
									} else {
										document.getElementById("ty_date_val").innerHTML = "Not replaced yet";
									}
								}
							}

							// Waste Toner Near End date
							for (let i = 1; i < el_length; i++) {
								wb_value = data[elements[el_length - i]]["Waste Toner"];
								wb_value_prev = data[elements[el_length - (i + 1)]]["Waste Toner"];
								w_date_value = data[elements[el_length - i]]["Date"];

								if (wb_value <= 0 && wb_value_prev > 10) {
									w_ne_date_value = w_date_value;
									document.getElementById("wb_ne_date_val").innerHTML = w_ne_date_value;
									break;
								} else {
									document.getElementById("wb_ne_date_val").innerHTML = "Not reached";
								}
							}

							// Waste Toner replaced date
							for (let i = 1; i < el_length; i++) {
								wb_value = data[elements[el_length - i]]["Waste Toner"];
								wb_value_prev = data[elements[el_length - (i + 1)]]["Waste Toner"];
								w_date_value = data[elements[el_length - i]]["Date"];

								if (wb_value == 100 && (wb_value_prev == 0 || wb_value_prev == -3)) {
									document.getElementById("wb_date_val").innerHTML = w_date_value;
									break;
								} else {
									document.getElementById("wb_date_val").innerHTML = "Not replaced yet";
								}
							}
						})

					// Retrieve all current supply data
					fetch(url + "/scans/" + ipaddr + "/" + scan + ".json")
						.then(function (response) {
							return response.json();
						})
						.then(function (data) {
							// Total count
							count = thousands_separator(data["Total Count"]);
							document.getElementById("total_count").innerHTML = count;
							if (count == null) {
								document.getElementById("total_count").innerHTML = count;
							}

							// Color total
							color_total = thousands_separator(data["Full Color Total Count"]);
							document.getElementById("color_total").innerHTML = color_total;
							if (color_total == null) {
								document.getElementById("color_total").innerHTML = color_total;
							}

							// Black and white total
							black_total = thousands_separator(data["Black & White Total Count"]);
							document.getElementById("black_total").innerHTML = black_total;

							// Black Toner
							black_toner = data["Black Toner"];
							if (black_toner == "-3") {
								black_toner = "Near End";
								document.getElementById("black_bar").setAttribute("style", "width: 99.75%; background-color: red; color: white;");
							} else {
								document.getElementById("black_bar").setAttribute("style", "color: white; width:" + black_toner + "%");
							}
							// This is for the numerical display
							document.getElementById("black_toner").innerHTML = black_toner;

							// Cyan Toner
							cyan_toner = data["Cyan Toner"];
							if (cyan_toner == "-3") {
								cyan_toner = "Near End";
								document.getElementById("cyan_bar").setAttribute("style", "width: 99.75%; background-color: red; color: white;");
							} else {
								document.getElementById("cyan_bar").setAttribute("style", "width:" + cyan_toner + "%");
							}
							// This is for the numerical display
							document.getElementById("cyan_toner").innerHTML = cyan_toner;

							// if machine is mono
							if (cyan_toner == null) {
								document.getElementById("cyan_bar").setAttribute("style", "height: 0px; border: 0px; color: #000000;");
							}
							if (cyan_toner == null && black_toner == "Near End") {
								document.getElementById("cyan_bar").setAttribute("style", "height: 0px; border: 0px; color: red;");
							}

							// Magenta toner
							magenta_toner = data["Magenta Toner"];
							if (magenta_toner == "-3") {
								magenta_toner = "Near End";
								document.getElementById("magenta_bar").setAttribute("style", "width: 99.75%; background-color: red; color: white;");
							} else {
								document.getElementById("magenta_bar").setAttribute("style", "width:" + magenta_toner + "%");
							}
							// This is for the numerical display
							document.getElementById("magenta_toner").innerHTML = magenta_toner;

							if (magenta_toner == null) {
								document.getElementById("magenta_bar").setAttribute("style", "height: 0px; border: 0px; color: #000000;");
							}
							if (magenta_toner == null && black_toner == "Near End") {
								document.getElementById("magenta_bar").setAttribute("style", "height: 0px; border: 0px; color: red;");
							}

							// Yellow toner
							yellow_toner = data["Yellow Toner"];
							if (yellow_toner == "-3") {
								yellow_toner = "Near End";
								document.getElementById("yellow_bar").setAttribute("style", "width: 99.75%; background-color: red; color: white;");
							} else {
								document.getElementById("yellow_bar").setAttribute("style", "width:" + yellow_toner + "%");
							}
							// This is for the numerical display
							document.getElementById("yellow_toner").innerHTML = yellow_toner;

							if (yellow_toner == null) {
								document.getElementById("yellow_bar").setAttribute("style", "height: 0px; border: 0px; color: #000000;");
							}
							if (yellow_toner == null && black_toner == "Near End") {
								document.getElementById("yellow_bar").setAttribute("style", "height: 0px; border: 0px; color: red;");
							}

							// Waste toner
							waste = data["Waste Toner"];
							//document.getElementById("waste_toner").innerHTML = waste;
							document.getElementById("waste_bar").setAttribute("style", "width: 99.75%;");
							if (waste == null) {
								document.getElementById("waste_bar").setAttribute("style", "height: 0px; border: 0px; color: #dddddd;");
							}

							// Fusing unit
							fusing_unit = data["Fusing Unit"];
							if (fusing_unit == "-2") {
								fusing_unit = "No data";
								document.getElementById("fusing_unit_bar").setAttribute("style", "width: 99.75%;");
							}
							//document.getElementById("fusing_unit").innerHTML = fusing_unit;
							if (fusing_unit == null) {
								document.getElementById("fusing_unit_bar").setAttribute("style", "height: 0px; border: 0px; color: #dddddd;");
							}

							// Black Developer
							black_dev = data["Black Developer"];
							if (black_dev == "-3") {
								black_dev = "Near End";
								document.getElementById("black_dev").innerHTML = black_dev;
								document.getElementById("black_dev_bar").setAttribute("style", "width: 99.75%");
							}
							// This is for the numerical display
							document.getElementById("black_dev").innerHTML = black_dev;

							if (black_dev == null) {
								document.getElementById("black_dev_bar").setAttribute("style", "height: 0px; border: 0px; color: #dddddd;");
							} else {
								document.getElementById("black_dev_bar").setAttribute("style", "color: white; width:" + black_dev + "%");
							}

							// Cyan Developer
							cyan_dev = data["Cyan Developer"];
							if (cyan_dev == "-3") {
								cyan_dev = "Near End";
								document.getElementById("cyan_dev").innerHTML = cyan_dev;
								document.getElementById("cyan_dev_bar").setAttribute("style", "width: 99.75%");
							}
							// This is for the numerical display
							document.getElementById("cyan_dev").innerHTML = cyan_dev;

							if (cyan_dev == null) {
								document.getElementById("cyan_dev").innerHTML = null;
								document.getElementById("cyan_dev_bar").setAttribute("style", "height: 0px; border: 0px; color: black;");
							} else {
								document.getElementById("cyan_dev_bar").setAttribute("style", "color: black; width:" + cyan_dev + "%");
							}

							// Magenta Developer
							magenta_dev = data["Magenta Developer"];
							if (magenta_dev == "-3") {
								magenta_dev = "Near End";
								document.getElementById("magenta_dev").innerHTML = magenta_dev;
								document.getElementById("magenta_dev_bar").setAttribute("style", "width: 99.75%");
							}
							// This is for the numerical display
							document.getElementById("magenta_dev").innerHTML = magenta_dev;

							if (magenta_dev == null) {
								document.getElementById("magenta_dev_bar").setAttribute("style", "height: 0px; border: 0px; color: black;");
							} else {
								document.getElementById("magenta_dev_bar").setAttribute("style", "color: black; width:" + magenta_dev + "%");
							}

							// Yellow Developer
							yellow_dev = data["Yellow Developer"];
							if (yellow_dev == "-3") {
								yellow_dev = "Near End";
								document.getElementById("yellow_dev").innerHTML = yellow_dev;
								document.getElementById("yellow_dev_bar").setAttribute("style", "width: 99.75%");
							}
							// This is for the numerical display
							document.getElementById("yellow_dev").innerHTML = yellow_dev;

							if (yellow_dev == null) {
								document.getElementById("yellow_dev_bar").setAttribute("style", "height: 0px; border: 0px; color: black;");
							} else {
								document.getElementById("yellow_dev_bar").setAttribute("style", "color: black; width:" + yellow_dev + "%");
							}


							// Black Drum
							black_drum = data["Black Drum"];
							if (black_drum == "-3") {
								black_drum = "Near End";
								document.getElementById("black_drum").innerHTML = black_drum;
								document.getElementById("black_drum_bar").setAttribute("style", "width: 99.75%");
							}
							// This is for the numerical display
							document.getElementById("black_drum").innerHTML = black_drum;

							if (black_drum == null) {
								document.getElementById("black_drum_bar").setAttribute("style", "height: 0px; border: 0px; color: black;");
							} else {
								document.getElementById("black_drum_bar").setAttribute("style", "color: white; width:" + black_drum + "%");
							}

							// Cyan Drum
							cyan_drum = data["Cyan Drum"];
							if (cyan_drum == "-3") {
								cyan_drum = "Near End";
								document.getElementById("cyan_drum").innerHTML = cyan_drum;
								document.getElementById("cyan_drum_bar").setAttribute("style", "width: 99.75%");
							} else {
								//document.getElementById("cyan_drum").innerHTML = cyan_drum;
								document.getElementById("cyan_drum_bar").setAttribute("style", "width:" + cyan_drum + "%");
							}
							document.getElementById("cyan_drum").innerHTML = cyan_drum;

							if (cyan_drum == null) {
								document.getElementById("cyan_drum_bar").setAttribute("style", "height: 0px; border: 0px; color: black;")
							} else {
								document.getElementById("cyan_drum_bar").setAttribute("style", "color: black; width:" + cyan_drum + "%");
							}

							// Magenta Drum
							magenta_drum = data["Magenta Drum"];
							if (magenta_drum == "-3") {
								magenta_drum = "Near End";
								document.getElementById("magenta_drum").innerHTML = magenta_drum;
								document.getElementById("magenta_drum_bar").setAttribute("style", "width: 99.75%");
							}
							document.getElementById("magenta_drum").innerHTML = magenta_drum;

							if (magenta_drum == null) {
								document.getElementById("magenta_drum_bar").setAttribute("style", "height: 0px; border: 0px; color: black;");
							} else {
								document.getElementById("magenta_drum_bar").setAttribute("style", "color: black; width:" + magenta_drum + "%");
							}

							// Yellow Drum
							yellow_drum = data["Yellow Drum"];
							if (yellow_drum == "-3") {
								yellow_drum = "Near End";
								document.getElementById("yellow_drum").innerHTML = yellow_drum;
								document.getElementById("yellow_drum_bar").setAttribute("style", "width: 99.75%");
							}
							document.getElementById("yellow_drum").innerHTML = yellow_drum;

							if (yellow_drum == null) {
								document.getElementById("yellow_drum_bar").setAttribute("style", "height: 0px; border: 0px; color: black;");
							} else {
								document.getElementById("yellow_drum_bar").setAttribute("style", "color: black;");
								document.getElementById("yellow_drum_bar").setAttribute("style", "width:" + yellow_drum + "%");
							}
						})
				})
		})
}

var linewidth = 3;

function toner_plot(data) {
	var key_array = Object.keys(data);

	//range
	N = 50;

	var toner_c = [];
	var toner_m = [];
	var toner_y = [];
	var toner_k = [];
	var dates = key_array;

	for (var i = 0; i < key_array.length; i++) {
		toner_c.push(data[key_array[i]]["Cyan Toner"]);
		toner_m.push(data[key_array[i]]["Magenta Toner"]);
		toner_y.push(data[key_array[i]]["Yellow Toner"]);
		toner_k.push(data[key_array[i]]["Black Toner"]);
	}

	//console.log(toner_c);
	//console.log(toner_m);
	//console.log(toner_y);
	//console.log(toner_k);
	//console.log(dates);

	var plot_c = {
		mode: "lines",
		connectgaps: true,
		x: dates,
		y: toner_c,
		name: "Cyan Toner",
		line: {
			//shape: "spline",
			color: "#0066CC",
			width: linewidth
		}
	};

	var plot_m = {
		mode: "lines",
		connectgaps: true,
		x: dates,
		y: toner_m,
		name: "Magenta Toner",
		line: {
			//shape: "spline",
			color: "#FF3366",
			width: linewidth
		}
	};

	var plot_y = {
		mode: "lines",
		connectgaps: true,
		x: dates,
		y: toner_y,
		name: "Yellow Toner",
		line: {
			//shape: "spline",
			color: "#FFFF00",
			width: linewidth
		}
	};

	var plot_k = {
		mode: "lines",
		connectgaps: true,
		x: dates,
		y: toner_k,
		name: "Black Toner",
		line: {
			//shape: "spline",
			color: "#333333",
			width: linewidth
		}
	};

	data = [plot_k, plot_c, plot_m, plot_y];

	var layout = {
		title: "Toner",
		autosize: false,
		displaymodebar: false,
		displaylogo: false,
		dragmode: 'pan',
		height: 300,
		width: 600,
		zeroline: true,
		margin: {
			autoexpand: false,
			l: 25,
			r: 25,
			t: 50
		},
		xaxis: {
			fixedrange: false
		},
		yaxis: {
			fixedrange: true,
			// we want the -3 or 100 to stay on the plot and not get trimmed at the bounds
			range: [-7, 104]
		},
		showlegend: false
	};

	// scrollZoom adds the ability to select a range and zoom in on it
	Plotly.newPlot("toner", data, layout, {
		scrollZoom: true
	});
}

function developer_plot(data) {
	var key_array = Object.keys(data);

	var dev_c = [];
	var dev_m = [];
	var dev_y = [];
	var dev_k = [];
	var dates = key_array;

	for (var i = 0; i < key_array.length; i++) {
		dev_c.push(data[key_array[i]]["Cyan Developer"]);
		dev_m.push(data[key_array[i]]["Magenta Developer"]);
		dev_y.push(data[key_array[i]]["Yellow Developer"]);
		dev_k.push(data[key_array[i]]["Black Developer"]);
	}

	//console.log(dev_c);
	//console.log(dev_m);
	//console.log(dev_y);
	//console.log(dev_k);
	//console.log(dates);

	var plot_c = {
		mode: "lines",
		connectgaps: true,
		x: dates,
		y: dev_c,
		name: "Cyan Developer",
		line: {
			//shape: "spline",
			color: "#0066CC",
			width: linewidth
		}
	};

	var plot_m = {
		mode: "lines",
		connectgaps: true,
		x: dates,
		y: dev_m,
		name: "Magenta Developer",
		line: {
			//shape: "spline",
			color: "#FF3366",
			width: linewidth
		}
	};

	var plot_y = {
		mode: "lines",
		connectgaps: true,
		x: dates,
		y: dev_y,
		name: "Yellow Developer",
		line: {
			//shape: "spline",
			color: "#FFFF00",
			width: linewidth
		}
	};

	var plot_k = {
		mode: "lines",
		connectgaps: true,
		x: dates,
		y: dev_k,
		name: "Black Developer",
		line: {
			//shape: "spline",
			color: "#333333",
			width: linewidth
		}
	};

	data = [plot_k, plot_c, plot_m, plot_y];

	var layout = {
		title: "Developer",
		autosize: false,
		displaymodebar: false,
		displaylogo: false,
		dragmode: 'pan',
		height: 300,
		width: 600,
		zeroline: true,
		margin: {
			autoexpand: false,
			l: 25,
			r: 25,
			t: 25
		},
		xaxis: {
			fixedrange: false
		},
		yaxis: {
			fixedrange: true,
			// we want the -3 or 100 to stay on the plot and not get trimmed at the bounds
			range: [-7, 104]
		},
		showlegend: false
	};

	Plotly.newPlot("dev", data, layout, {
		scrollZoom: true
	});
}

function drum_plot(data) {
	var key_array = Object.keys(data);

	var drum_c = [];
	var drum_m = [];
	var drum_y = [];
	var drum_k = [];
	var dates = key_array;

	for (var i = 0; i < key_array.length; i++) {
		drum_c.push(data[key_array[i]]["Cyan Drum"]);
		drum_m.push(data[key_array[i]]["Magenta Drum"]);
		drum_y.push(data[key_array[i]]["Yellow Drum"]);
		drum_k.push(data[key_array[i]]["Black Drum"]);
	}

	//console.log(drum_c);
	//console.log(drum_m);
	//console.log(drum_y);
	//console.log(drum_k);
	//console.log(dates);

	var plot_c = {
		mode: "lines",
		connectgaps: true,
		x: dates,
		y: drum_c,
		name: "Cyan Drum",
		line: {
			//shape: "spline",
			color: "#0066CC",
			width: linewidth
		}
	};

	var plot_m = {
		mode: "lines",
		connectgaps: true,
		x: dates,
		y: drum_m,
		name: "Magenta Drum",
		line: {
			//shape: "spline",
			color: "#FF3366",
			width: linewidth
		}
	};

	var plot_y = {
		mode: "lines",
		connectgaps: true,
		x: dates,
		y: drum_y,
		name: "Yellow Drum",
		line: {
			//shape: "spline",
			color: "#FFFF00",
			width: linewidth
		}
	};

	var plot_k = {
		mode: "lines",
		connectgaps: true,
		x: dates,
		y: drum_k,
		name: "Black Drum",
		line: {
			//shape: "spline",
			color: "#333333",
			width: linewidth
		}
	};

	data = [plot_k, plot_c, plot_m, plot_y];

	var layout = {
		title: "Drum",
		autosize: false,
		displaymodebar: false,
		displaylogo: false,
		dragmode: 'pan',
		height: 300,
		width: 600,
		zeroline: true,
		margin: {
			autoexpand: false,
			l: 25,
			r: 25,
			t: 25
		},
		xaxis: {
			fixedrange: false
		},
		yaxis: {
			fixedrange: true,
			// we want the -3 or 100 to stay on the plot and not get trimmed at the bounds
			range: [-7, 104]
		},
		showlegend: false
	};

	Plotly.newPlot("drum", data, layout, {
		scrollZoom: true
	});
}

function maint_plot(data) {
	var key_array = Object.keys(data);

	var waste_toner = [];
	var fusing_unit = [];
	var dates = key_array;

	for (var i = 0; i < key_array.length; i++) {
		waste_toner.push(data[key_array[i]]["Waste Toner"]);
		fusing_unit.push(data[key_array[i]]["Fusing Unit"]);
	}

	//console.log(waste_toner);
	//console.log(fusing_unit);
	//console.log(dates);

	var plot_w = {
		mode: "lines",
		connectgaps: true,
		x: dates,
		y: waste_toner,
		name: "Waste Toner",
		line: {
			//shape: "spline",
			color: "#999999",
			width: linewidth
		}
	};

	var plot_f = {
		mode: "lines",
		connectgaps: true,
		x: dates,
		y: fusing_unit,
		name: "Fusing Unit",
		line: {
			//shape: "spline",
			color: "#FF8800",
			width: linewidth
		}
	};

	data = [plot_w, plot_f];

	var layout = {
		title: "Waste Toner and Fusing Unit",
		autosize: false,
		displaymodebar: false,
		displaylogo: false,
		dragmode: 'pan',
		height: 300,
		width: 600,
		zeroline: true,
		margin: {
			autoexpand: false,
			l: 25,
			r: 25,
			t: 25
		},
		xaxis: {
			fixedrange: false
		},
		yaxis: {
			fixedrange: true,
			// we want the -3 or 100 to stay on the plot and not get trimmed at the bounds
			range: [-7, 104]
		},
		showlegend: false
	};

	Plotly.newPlot("maint", data, layout, {
		scrollZoom: true
	});
}

function total_plot(data) {
	var key_array = Object.keys(data);

	//range
	N = 50;

	var totalc = [];
	var mono = [];
	var color = [];
	var dates = key_array;

	for (var i = 0; i < key_array.length; i++) {
		totalc.push(data[key_array[i]]["Total Count"]);
		mono.push(data[key_array[i]]["Black & White Total Count"]);
		color.push(data[key_array[i]]["Full Color Total Count"]);
	}

	var plot_totalc = {
		mode: "lines",
		connectgaps: true,
		x: dates,
		y: totalc,
		//fill: 'tozeroy',
		//stackgroup: 'one',
		name: "Total Count",
		line: {
			//shape: "spline",
			color: "#00FF00",
			width: 1
		}
	};

	var plot_mono = {
		mode: "lines",
		connectgaps: true,
		x: dates,
		y: mono,
		fill: 'tonexty',
		stackgroup: 'one',
		name: "Black & White",
		line: {
			//shape: "spline",
			color: "#000000",
			width: 1
		}
	};

	var plot_color = {
		mode: "lines",
		connectgaps: true,
		x: dates,
		y: color,
		fill: 'tonexty',
		stackgroup: 'one',
		name: "Full Color",
		line: {
			//shape: "spline",
			color: "#0000FF",
			width: 1
		}
	};

	data = [plot_mono, plot_color, plot_totalc];

	var layout = {
		title: "Usage",
		autosize: false,
		displaymodebar: false,
		displaylogo: false,
		dragmode: 'pan',
		height: 300,
		width: 600,
		zeroline: true,
		margin: {
			autoexpand: false,
			l: 30,
			r: 25,
			t: 50
		},
		xaxis: {
			fixedrange: false //,
			//			automargin: true
		},
		yaxis: {
			rangemode: 'tozero',
			tickmode: 'array',
			autorange: true,
			fill: 'tozeroy',
			//			automargin: true,
			//type: 'log'
		},
		showlegend: false
	};

	// scrollZoom adds the ability to select a range and zoom in on it
	Plotly.newPlot("total", data, layout, {
		scrollZoom: true
	});
}

function updatedb() {
	if (document.getElementById("tkc").checked == true) {
		black = 1;
		//document.getElementById("tk_d").innerHTML = tk_d;
	} else {
		black = 0;
		//tk_d = "";
	}

	if (document.getElementById("tcc").checked == true) {
		cyan = 1;
		//document.getElementById("tc_d").innerHTML = tc_d;
	} else {
		cyan = 0;
		//tc_d = "";
	}

	if (document.getElementById("tmc").checked == true) {
		magenta = 1;
		//document.getElementById("tm_d").innerHTML = tm_d;
	} else {
		magenta = 0;
		//tm_d = "";
	}

	if (document.getElementById("tyc").checked == true) {
		yellow = 1;
		//document.getElementById("ty_d").innerHTML = ty_d;
	} else {
		yellow = 0;
		//ty_d = "";
	}

	if (document.getElementById("wbc").checked == true) {
		waste = 1;
		//document.getElementById("wb_d").innerHTML = wb_d;
	} else {
		waste = 0;
		//wb_d = "";
	}

	var data = {
		"Black": black,
		"Cyan": cyan,
		"Magenta": magenta,
		"Yellow": yellow,
		"Waste": waste
		/* ,
				"tk_d": tk_d,
				"tc_d": tc_d,
				"tm_d": tm_d,
				"ty_d": ty_d,
				"wb_d": wb_d */
	};

	fetch(url + "/machines/" + ipaddr + "/Shipped.json", {
			method: "PUT",
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json'
			}
		})

		.then(function (data) {
			test = data;
			console.log(test);
			/* console.log("Black: " + black + " replaced on " + tk_d);
			console.log("Cyan: " + cyan + " replaced on " + tc_d);
			console.log("Magenta: " + magenta + " replaced on " + tm_d);
			console.log("Yellow: " + yellow + " replaced on " + ty_d);
			console.log("Waste: " + waste + " replaced on " + wb_d); */
		});
}
