
var xScaler = function(x)
{
  var x_scale = d3.scale.linear()
      .domain([0, N])
      .range([0 + PADDING_X, SVG_WIDTH - PADDING_X]);

  return x_scale(x);
};



var yScaler = function(y)
{

  var y_scale = d3.scale.linear()
            .domain([0, N])
            .range([SVG_HEIGHT - PADDING_Y, 0 + PADDING_Y]);

  return y_scale(y);
};




function plotTestData()
{
  var x, y;
  
  // Plot Data
  SVG_front_layer.selectAll("circle").data(training_data)
                  .enter().append("circle")
                    .attr("class", "circles")
                    .attr("id", function(d, i) { return "training_data_id_" + i; })
                    .attr("cx", function(d, i)
                    { 
                      x = d[0];
                      return x;
                    })
                    .attr("cy", function(d, i)
                    { 
                      y = d[1];
                      return y;
                    })
                    .attr("r", DATA_POINT_R)
                    .style("fill", function(d, i)
                    { 
                      return d[2];
                    })
                    .style("stroke", "black")
                    .style("opacity", 0)
                    .on("mouseover", function(d) 
                    {   
                        d3.select(this).transition()
                              .duration(200)
                              .attr("r", DATA_POINT_R*3.5);

                    })
                    .on("mouseout", function(d) 
                    { 
                        d3.select(".tool_tip_info").remove();
                        d3.select(".neighbor_info").remove();
                        d3.select(this).transition()
                              .duration(100)
                              .attr("r", DATA_POINT_R);
                    })
                    .transition()
                      .duration(2000)
                      .style("opacity", 1);
  
  // Plot Text
  SVG_front_layer.selectAll("text").data(training_data)
                          .enter().append("text")
                            .attr("class", "training_data_numbers")
                            .attr("id", function(d, i) { return "training_data_text_id_" + i; })
                            .attr("x", function(d, i)
                            { 
                              x = d[0];
                              return x;
                            })
                            .attr("y", function(d, i)
                            { 
                              y = d[1];
                              return y;
                            })
                            .style("opacity", 0)
                            .attr("text-anchor", "middle")
                            .attr("dominant-baseline", "middle")
                            .attr("font-size", "12")
                            .text( function(d, i) { return i; })
                            .transition()
                            .duration(2000)
                            .style("opacity", 1);
}


function generateData()
{
  var datum;
  var x, y;
  training_data = [];
  for (var i=0; i < N; i++)
  {
    x = Math.random()*N;
    y = Math.random()*N;
    datum = [xScaler(x),
             yScaler(y),
             (Math.random() < P_RED) ? RED : BLUE];
    training_data.push(datum)
  }
}

