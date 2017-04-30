var margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


var slider_x = d3.scaleLinear()
    .domain([0, 180])
    .range([0, width])
    .clamp(true);

// set the ranges
var x = d3.scaleLinear()
          .domain([-1, 1])
          .range([0, width]);
var y = d3.scaleLinear()
          .domain([height, 0])
          .range([height, 0]);

// set the parameters for the histogram
var histogram = d3.histogram()
    .value(function(d) { 
        return d;
    })
    .domain(x.domain())
   .thresholds(x.ticks(100));

var prev_max;
var colors = ["#99ff99", "#ccff99", "#ccccff", "#ccf2ff", "#ffd9b3"]



function flatten_list(list) {
  var flat_list = [];
  
  for (var i=0; i < list.length; i ++) {
    for (var j=0; j < list[i].length; j++) {
      flat_list.push(list[i][j]);
    }
  }
  return flat_list;
}


function initialize() {
  d3.select("body").append("h1").html("Hello!")
  
  



  var json_path_1 = "json_files/Model_1_layer_5.json";
  var json_path_2 = "json_files/Model_2_layer_5.json";
  var json_path_3 = "json_files/Model_3_layer_5.json";
  
  d3.queue()
    .defer(d3.json, json_path_1)
    .defer(d3.json, json_path_2)
    .defer(d3.json, json_path_3)
    .await(initHistograms);
}


function createHistogram(model_data, model_num, model_color) {
    
    var svg = d3.select("#histo_group");
  
    // flatten data
    data = flatten_list(model_data);
  
    // group the data for the bars
    var bins = histogram(data);
    
    var new_max = d3.max(bins, function(d) {
        return d.length;
      })

    if (new_max > prev_max) {
      d3.select("#y_axis").remove();
      prev_max = new_max;
      // Scale the range of the data in the y domain
      y.domain([0, new_max]);
      d3.select("#y_axis").remove();
    
      // add the y Axis
      svg.append("g")
         .attr("id", "y_axis")
          .call(d3.axisLeft(y));
    }
    
    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // append the bar rectangles to the svg element
    svg.selectAll("rect.model_"+model_num)
        .data(bins)
      .enter().append("rect")
        .attr("class", "model_"+model_num)
        .attr("class", "bar")
        .attr("x", 1)
        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
        .attr("height", function(d) { return height - y(d.length); })
        .attr("transform", function(d) {
            return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .style("fill", model_color)
        .style("opacity", 0.8)
        .style("stroke", "black");

    
  
  
}


function createSlider() {
  
  var controls_div = d3.select("#controls_div");
  
  var svg = controls_div.append("svg").attr("width", 960).attr("height", 200);
  
  var margin = {right: 50, left: 50},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height");
  
  // Add slider
  var slider = svg.append("g")
      .attr("class", "slider")
      .attr("transform", "translate(" + margin.left + "," + height *.2 + ")");
  
  slider.append("line")
      .attr("class", "track")
      .attr("x1", x.range()[0])
      .attr("x2", x.range()[1])
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset")
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function() { slider.interrupt(); })
            .on("start drag", function() { hue(slider_x.invert(d3.event.x)); }));
  
  slider.insert("g", ".track-overlay")
      .attr("class", "ticks")
      .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data(slider_x.ticks(10))
    .enter().append("text")
      .attr("x", slider_x)
      .attr("text-anchor", "middle")
      .text(function(d) { return d; });
  
  var handle = slider.insert("circle", ".track-overlay")
      .attr("class", "handle")
      .attr("r", 9);

  slider.transition() // Gratuitous intro!
      .duration(750)
      .tween("hue", function() {
        var i = d3.interpolate(0, 70);
        return function(t) { hue(i(t)); };
      });
  
  function hue(h) {
    handle.attr("cx", slider_x(h));
    svg.style("background-color", d3.hsl(h, 0.8, 0.8));
  }
}


function initHistograms(error, data1, data2, data3) {
    
  // append the svg object to the body of the page
  // append a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var main_div = d3.select("body").append("div").attr("id", "main_div");
  
  var hist_div = main_div.append("div").attr("id", "histo_div");
  var controls_div = main_div.append("div").attr("id", "controls_div");
  
  var svg = hist_div.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

  svg.append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")")
      .attr("id", "histo_group");
  
  createSlider();
  

  prev_max = 0;
  // make histogram with data1
  createHistogram(data1, 1, colors[0]);

  createHistogram(data2, 2, colors[1]);

  createHistogram(data3, 3, colors[2]);
    
    
  
}