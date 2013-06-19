function stack() {
	
  	var n = nod.length, // number of layers
    m = nod[0].length, // number of samples per layer
    stack = d3.layout.stack(),
    layers = stack(nod),
    yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

	var margin = {top: 40, right: 10, bottom: 20, left: 10},
    width = 960 - margin.left - margin.right,
    height = nod[0].length*20 - margin.top - margin.bottom;

	var y = d3.scale.ordinal()
    .domain(d3.range(m))
    .rangeRoundBands([2, height], .08);

	var x = d3.scale.linear()
    .domain([0, yStackMax])
    .range([0, width]);

	var color = d3.scale.linear()
    .domain([0, n - 1])
    .range(["#B8DBFF", "#5C6E80"]);



	var svg = d3.select("#biforce").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var layer = svg.selectAll(".layer")
    .data(layers)
  	.enter().append("g")
    .attr("class", "layer")
    .style("fill", function(d, i) { return color(i); });
	
	
	var rect = layer.selectAll("rect")
    .data(function(d) { return d; })
  	.enter().append("rect")
    .attr("y", function(d) { return y(d.x); })
    .attr("x", function(d) { return x(d.y0);})
    .attr("height", 10)
    .attr("width", function(d) { return x(d.y); })
    .attr("opacity", 1.0)
    
    rect.filter(function(d){return(d.y0==0)})
    .each(function() {
    	console.log(this)
     svg.append("text")	
     .attr("x", '20px')
     .attr("y", '20px')
     .style("font-size",30)
     .text(this.label)
     .attr("dx", -4);
    });
    // .on("click", function(d){
    	// layer.selectAll("rect")
    	// .attr("opacity",1.0);
    	// rect.filter(function(f) {
    		// return f.label!=d.label
    	// })
    	// .attr("opacity",0.5);
//     	
    	// console.log(d.x);
    	// console.log(d.rev);
//     	
    	// svg.select("text")
    	// .remove()
//     	
    	// var text = svg
    	// .append("text")
    	// .attr("font-family","Helvetica")
    	// .attr("font-size","12px")
    	// .attr("x", 2)
		// .attr("y", ".35em")
		// .text(d.label)
    // })
   }