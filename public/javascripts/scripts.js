$(document).ready(function () {
    $(".container").shapeshift({maxColumns: 1,animate: false});

    plotBarChart(exampleData())
    plotLineChart(sinAndCos())
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

        chart.tooltip.enabled(false)

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