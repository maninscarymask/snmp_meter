var linewidth = 3;

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