var linewidth = 3;

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