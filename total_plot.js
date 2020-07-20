var linewidth = 3;

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