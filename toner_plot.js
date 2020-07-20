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