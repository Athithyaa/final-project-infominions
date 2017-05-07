var cnt = 0;

function addLayer(name) {
    $("<div>" + name + "</div>").insertBefore("#out");
    $(".container").shapeshift({maxColumns: 1,selector: "*:not('.excl')"});
}

function drawNN(imgData){

    var width = 32, height = 32,buffer = new Uint8ClampedArray(width*height*4);

    var numLayers = 5;

    var nodes = [];
    var edges = [];
    var ldescp = {};
    var cnt = 1;
    var nn = [1,5,5,5,5];
    for(var i=1;i<=numLayers;i++){
        var numNodes = nn[i-1];
        for(var j=1;j<=numNodes;j++){

            for(var y = 0; y < height; y++) {
                for(var x = 0; x < width; x++) {
                    var pos = (width * y + x) << 2;
                    var pv = Math.floor(Math.random()*255);
                    buffer[pos] = pv;
                    buffer[pos+1] = pv;
                    buffer[pos+2] = pv;
                    buffer[pos+3] = pv;
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
                y: true
            }
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
            data: pjson,
            contentType: "application/json",
            success: function (data) {
                console.log(data);
            }
        })
    });

    plotBarChart(exampleData());
    plotLineChart(sinAndCos());
    drawNN("test");
});

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
    var sin = []

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
            key: "Cumulative Return",
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