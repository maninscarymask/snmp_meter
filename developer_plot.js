var linewidth = 3;

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