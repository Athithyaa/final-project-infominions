var cnt = 0;
var margin = {top: 50, right: 50, bottom: 100, left: 100};

function addLayer(name) {
    $("<div>" + name + "</div>").insertBefore("#out");
    $(".container").shapeshift({maxColumns: 1,selector: "*:not('.excl')"});
}

function drawNN(imgData){

    var keys = Object.keys(imgData);
    var numLayers = keys.length-1;

    var nodes = [];
    var edges = [];
    var ldescp = {};
    var cnt = 1;

    for(var i=1;i<=numLayers;i++){
        var numNodes = imgData[keys[i-1]].length;
        for(var j=1;j<=numNodes;j++){
            var img = imgData[keys[i-1]][j-1];
            var width = img.length, height = img[0].length,buffer = new Uint8ClampedArray(width*height*4);
            for(var y = 0; y < height; y++) {
                for(var x = 0; x < width; x++) {
                    var pos = (width * y + x) << 2;
                    var pv = img[y][x]*255;
                    buffer[pos] = pv;
                    buffer[pos+1] = pv;
                    buffer[pos+2] = pv;
                    buffer[pos+3] = 255;
                }
            }

            var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;
            var idata = ctx.createImageData(width, height);
            idata.data.set(buffer);
            ctx.putImageData(idata, 0, 0, 0, 0, width,height);
            var dataUri = canvas.toDataURL();

            nodes.push({id: cnt, level:i-1, image:dataUri, shape:'image'});
            if(ldescp[String(i-1)])
                ldescp[String(i-1)].push(cnt);
            else
                ldescp[String(i-1)] = [cnt];
            cnt+=1;
        }
    }

    function constructEdges(l1,l2,fc) {
        var edges = [];
        var i,j;
        if(!fc){
            if(ldescp[l1].length > 1) {
                for (i = 0; i < ldescp[l1].length; i++) {
                    edges.push({from: ldescp[l1][i], to: ldescp[l2][i]});
                }
            }else{
                for (i = 0; i < ldescp[l2].length; i++) {
                    edges.push({from: ldescp[l1][0], to: ldescp[l2][i]});
                }
            }
        }else{
            if(ldescp[l1].length > 1) {
                for (i = 0; i < ldescp[l1].length; i++) {
                    for(j = 0; j< ldescp[l2].length; j++) {
                        edges.push({from: ldescp[l1][i], to: ldescp[l2][j]});
                    }
                }
            }
        }
        return edges;
    }

    for(i=0;i<numLayers-2;i++) {
        edges = edges.concat(constructEdges(String(i),String(i+1),false));
    }
    edges = edges.concat(constructEdges(String(i),String(i+1),false));

    var container = document.getElementById('nndiagram');

    // provide the data in the vis format
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = { layout: {
            hierarchical: {
                direction: "LR"
            }
        },
        nodes: {
            fixed: {
                x: true,
                y: false
            }
        },
        interaction: {
            zoomView: false
        }
    };

    // initialize your network!
    var network = new vis.Network(container, data, options);
}

$(document).ready(function () {
    $(".container").shapeshift({maxColumns: 1,selector: "*:not('.excl')"});
    $("#layerbutton").click(function () {
        cnt+=1;
        if(cnt <= 3)
            addLayer($("#layerpicker").val());
    });

    $("#predict").click(function () {
        var pjson = {};
        pjson["noOfFilters"] = $("#noOfFilters").val();
        pjson["spatialExtent"] = $("#spatial_extent").val()[0];
        pjson["stride"] = $("#stride").val();
        pjson["spatialExtentMp"] = $("#spatial_extent_mp").val()[0];
        pjson["strideMp"] = $("#stride_mp").val();
        var layerdivs = $(".ss-active-child");
        pjson["layers"] = "";
        for(var i=0;i<layerdivs.length;i++){
            pjson["layers"] += layerdivs[i].innerText[0];
        }
        $.ajax({
            type: "POST",
            url: "/predict",
            data: JSON.stringify(pjson),
            contentType: "application/json",
            success: function (data) {
                var result = data["result"];
                drawNN(result);
            }
        })
    });

    plotBarChart(exampleData());
    plotLineChart(sinAndCos());
    var confusionMatrix = [
        [5,65,17,29,95,30,3,64,25,90],
        [68,51,39,43,92,70,56,37,29,87],
        [4,97,83,1,5,66,88,19,61,81],
        [7,64,80,98,73,53,66,42,26,26],
        [52,80,6,16,26,69,19,48,82,59],
        [9,45,39,10,42,66,36,12,98,2],
        [81,43,52,37,54,17,46,58,73,42],
        [81,82,41,19,94,12,98,22,34,31],
        [72,8,65,48,41,99,15,38,58,16],
        [14,13,62,33,98,17,85,58,10,17]
    ];
    var labels = ['Class A', 'Class B', 'Class C', 'Class D','Class E', 'Class F','Class G', 'Class H','Class I', 'Class J' ];
    plotConfusionMatrix(confusionMatrix,labels);
});

function plotConfusionMatrix(confusionMatrix,labels){
    Matrix({
        container : '#confusion_matrix',
        data      : confusionMatrix,
        labels    : labels,
        start_color : '#ffffff',
        end_color : '#e67e22'
    });

}

function Matrix(options) {
    var width = 250,
        height = 250,
        data = options.data,
        container = options.container,
        labelsData = options.labels,
        startColor = options.start_color,
        endColor = options.end_color;

    var widthLegend = 100;

    if(!data){
        throw new Error('Please pass data');
    }

    if(!Array.isArray(data) || !data.length || !Array.isArray(data[0])){
        throw new Error('It should be a 2-D array');
    }

    var maxValue = d3.max(data, function(layer) { return d3.max(layer, function(d) { return d; }); });
    var minValue = d3.min(data, function(layer) { return d3.min(layer, function(d) { return d; }); });

    var numrows = data.length;
    var numcols = data[0].length;

    var svg = d3.select(container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var background = svg.append("rect")
        .style("stroke", "black")
        .style("stroke-width", "2px")
        .attr("width", width)
        .attr("height", height);

    var x = d3.scale.ordinal()
        .domain(d3.range(numcols))
        .rangeBands([0, width]);

    var y = d3.scale.ordinal()
        .domain(d3.range(numrows))
        .rangeBands([0, height]);

    var colorMap = d3.scale.linear()
        .domain([minValue,maxValue])
        .range([startColor, endColor]);

    var row = svg.selectAll(".row")
        .data(data)
        .enter().append("g")
        .attr("class", "row")
        .attr("transform", function(d, i) { return "translate(0," + y(i) + ")"; });

    var cell = row.selectAll(".cell")
        .data(function(d) { return d; })
        .enter().append("g")
        .attr("class", "cell")
        .attr("transform", function(d, i) { return "translate(" + x(i) + ", 0)"; });

    cell.append('rect')
        .attr("width", x.rangeBand())
        .attr("height", y.rangeBand())
        .style("stroke-width", 0);

    cell.append("text")
        .attr("dy", ".32em")
        .attr("x", x.rangeBand() / 2)
        .attr("y", y.rangeBand() / 2)
        .attr("text-anchor", "middle")
        .style("fill", function(d, i) { return d >= maxValue/2 ? 'white' : 'black'; })
        .text(function(d, i) { return d; });

    row.selectAll(".cell")
        .data(function(d, i) { return data[i]; })
        .style("fill", colorMap);

    var labels = svg.append('g')
        .attr('class', "labels");

    var columnLabels = labels.selectAll(".column-label")
        .data(labelsData)
        .enter().append("g")
        .attr("class", "column-label")
        .attr("transform", function(d, i) { return "translate(" + x(i) + "," + (height+25) + ")"; });

    columnLabels.append("line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .attr("x1", x.rangeBand() / 2)
        .attr("x2", x.rangeBand() / 2)
        .attr("y1", 0)
        .attr("y2", 5);

    columnLabels.append("text")
        .attr("x", 30)
        .attr("y", y.rangeBand() / 2)
        .attr("dy", ".22em")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-60)")
        .text(function(d, i) { return d; });

    var rowLabels = labels.selectAll(".row-label")
        .data(labelsData)
        .enter().append("g")
        .attr("class", "row-label")
        .attr("transform", function(d, i) { return "translate(" + 0 + "," + y(i) + ")"; });

    rowLabels.append("line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .attr("x1", 0)
        .attr("x2", -5)
        .attr("y1", y.rangeBand() / 2)
        .attr("y2", y.rangeBand() / 2);

    rowLabels.append("text")
        .attr("x", -8)
        .attr("y", y.rangeBand() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "end")
        .text(function(d, i) { return d; });

    var key = d3.select("#legend")
        .append("svg")
        .attr("width", widthLegend)
        .attr("height", height + margin.top + margin.bottom);

    var legend = key
        .append("defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "100%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

    legend
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", endColor)
        .attr("stop-opacity", 1);

    legend
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", startColor)
        .attr("stop-opacity", 1);

    key.append("rect")
        .attr("width", widthLegend/2-10)
        .attr("height", height)
        .style("fill", "url(#gradient)")
        .attr("transform", "translate(0," + margin.top + ")");

    var y = d3.scale.linear()
        .range([height, 0])
        .domain([minValue, maxValue]);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("right");

    key.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(41," + margin.top + ")")
        .call(yAxis)

}

function plotBarChart(data) {
    nv.addGraph(function() {
        var chart = nv.models.discreteBarChart()
            .x(function(d) { return d.label })    //Specify the data accessors.
            .y(function(d) { return d.value })
            .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
            .showValues(true)       //...instead, show the bar value right on top of each bar.
            .options({
                duration: 350
            });

        chart.tooltip.enabled(false);

        d3.select('#bar_chart svg')
            .datum(data)
            .call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
    });
}

function plotLineChart(data) {
    nv.addGraph(function() {
        var chart = nv.models.lineChart()
            .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
            .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
            .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
            .showYAxis(true)        //Show the y-axis
            .showXAxis(true)        //Show the x-axis
            .options({
                duration: 350
            });

        chart.xAxis     //Chart x-axis settings
            .axisLabel('Time (ms)')
            .tickFormat(d3.format(',r'));

        chart.yAxis     //Chart y-axis settings
            .axisLabel('Voltage (v)')
            .tickFormat(d3.format('.02f'));

        d3.select('#line_chart svg')    //Select the <svg> element you want to render the chart in.
            .datum(data)         //Populate the <svg> element with chart data...
            .call(chart);          //Finally, render the chart!

        //Update the chart when window resizes.
        nv.utils.windowResize(function() { chart.update() });
        return chart;
    });
}

function sinAndCos() {
    var sin = [];

    //Data is represented as an array of {x,y} pairs.
    for (var i = 0; i < 100; i++) {
        sin.push({x: i, y: Math.sin(i/10)});
    }

    //Line chart data should be sent as an array of series objects.
    return [
        {
            values: sin,      //values - represents the array of {x,y} data points
            key: 'Sine Wave', //key  - the name of the series.
            color: '#ff7f0e'  //color - optional: choose your own line color.
        }
    ];
}

function exampleData() {
    return  [
        {
            values: [
                {
                    "label" : "1" ,
                    "value" : 0.01
                } ,
                {
                    "label" : "2" ,
                    "value" : 0.05
                } ,
                {
                    "label" : "3" ,
                    "value" : 0.50
                } ,
                {
                    "label" : "4" ,
                    "value" : 0.03
                } ,
                {
                    "label" : "5" ,
                    "value" : 0.1
                } ,
                {
                    "label" : "6" ,
                    "value" : 0.04
                } ,
                {
                    "label" : "7" ,
                    "value" : 0
                } ,
                {
                    "label" : "8" ,
                    "value" : 0.2
                } ,
                {
                    "label" : "9" ,
                    "value" : 0.04
                } ,
                {
                    "label" : "10" ,
                    "value" : 0.03
                }

            ]
        }
    ]
}