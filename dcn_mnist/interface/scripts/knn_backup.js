var red_field_data, blue_field_data;
var red_field_x, red_field_y, blue_field_x, blue_field_y;



var scale_field_x = function(x)
{ 
  
  var stuff_x = d3.scale.linear()
                    .domain([0, FIELD_RESOLUTION])
                    .range([0 + PADDING_X, SVG_WIDTH - PADDING_X]);
 
  return stuff_x(x);
}

var scale_field_y = function(y)
{
  var stuff_y = d3.scale.linear()
                    .domain([0, FIELD_RESOLUTION])
                    .range([SVG_HEIGHT - PADDING_Y, 0 + PADDING_Y]);
  
  return stuff_y(y);
}



function generateField()
{
  field_data = [];
  for (var i=0; i <= FIELD_RESOLUTION; i++)
  {
    for (var j=0; j <= FIELD_RESOLUTION; j++)
    {
      point = [i, j, undefined]
      
      field_data.push(point)
    }
  }
  
  // Classify field data
  classify(field_data);
}



function reclassify()
{
  classify(field_data);
}



function plotField()
{
  var x, y, field_color, neighbors_dict;
  d3.selectAll(".field_circles").remove();
      
//  // Plot Data
//  SVG_back_layer.selectAll("svg:circle")
//                  .data(field_data)
//                  .enter().append("svg:circle")
//                    .attr("class", "field_circles")
//                    .data([[x, y, field_color, neighbors_dict, i]])
//                    .attr("id", function(d) { return "circle_"+i; })
//                    .attr("cx", scale_field_x(x))
//                    .attr("cy", scale_field_y(y))
//                    .attr("r", 0)
//                    .style("fill", field_color)
//                    .style("opacity", 0)
//                    .style("stroke", "black")
//                    .on("mouseover", function(d) 
//                    {   
//                        addData(d[0], d[1], d[2], neighbors_dict, -99, layer=SVG_front_layer)
//                        d3.select("#circle_-99").transition()
//                              .duration(200)
//                              .attr("r", FIELD_DATA_R*3.5)
//                              .style("opacity", 1);
//
//                    })
//                    .on("mouseout", function(d) 
//                    { 
//                        d3.select("#circle_-99").transition()
//                              .duration(1000)
//                              .attr("r", FIELD_DATA_R)
//                              .style("opacity", GRID_OPACITY)
//
//                        d3.select("#circle_-99").remove();
//
//                    });
//  
  for (var i=0; i < field_data.length; i++)
  {
    x = field_data[i][0];
    y = field_data[i][1];
    field_color = field_data[i][2];
    neighbors_dict = field_data[i][3];
 
    addData(x, y, field_color, neighbors_dict, i);
        
    
  }
  
  d3.selectAll(".field_circles")
                .transition()
                  .duration(1500)
                  .attr("r", FIELD_DATA_R)
                  .style("opacity", GRID_OPACITY);
  
}


function addData(x, y, field_color, neighbors_dict, i, layer=SVG_back_layer)
{
  
  layer.append("svg:circle").attr("class", "field_circles")
                .data([[x, y, field_color, neighbors_dict, i]])
                .attr("id", function(d) { return "circle_"+i; })
                .attr("cx", scale_field_x(x))
                .attr("cy", scale_field_y(y))
                .attr("r", 0)
                .style("fill", field_color)
                .style("opacity", 0)
                .style("stroke", "black")
                .on("mouseover", function(d) 
                {   
                    addData(d[0], d[1], d[2], neighbors_dict, -99, layer=SVG_front_layer)
                    d3.select("#circle_-99").transition()
                          .duration(200)
                          .attr("r", FIELD_DATA_R*3.5)
                          .style("opacity", 1);
      
                })
                .on("mouseout", function(d) 
                { 
                    d3.select("#circle_-99").transition()
                          .duration(1000)
                          .attr("r", FIELD_DATA_R)
                          .style("opacity", GRID_OPACITY)
                    
                    d3.select("#circle_-99").remove();
                    
                });
}


function classify(data)
{
  var test_datum, training_datum;
  var test_x, test_y, train_x, train_y;
  var train_color, distance;
  
  for (var i=0; i < data.length; i++)
  {
    test_datum = data[i];
    test_x = test_datum[0];
    test_y = test_datum[1];
    
    var unsorted_distances = []
    for (var j=0; j < training_data.length; j++)
    {
      training_datum = training_data[j];
      train_x = training_datum[0];
      train_y = training_datum[1];
      train_color = training_datum[2];
      
      distance = Math.sqrt( (test_x - train_x)**2 + (test_y - train_y)**2)
      
      unsorted_distances.push([distance, train_color]);
    }
    
    var sorted_distances = unsorted_distances.sort( function(a, b)
                           {
                              return a[0] - b[0];   
                           });
    
    var k_nearest_neighbors = sorted_distances.slice(0, K);
    
    var red_count = 0;
    var blue_count = 0;
    
    for (var j=0; j < k_nearest_neighbors.length; j++)
    {
      var neighbor = k_nearest_neighbors[j];
      var color = neighbor[1];
      if (color == RED)
      {
        red_count++;
      }
      else if (color == BLUE)
      {
        blue_count++;
      }
    }
    var prediction_color;
    if (red_count > blue_count)
    {
      prediction_color = RED;
    }
    else if (blue_count > red_count)
    {
      prediction_color = BLUE;
    }
    else
    {
      prediction_color = INDETERMINED_COLOR;
    }
    
    data[i][2] = prediction_color;
    data[i].push(k_nearest_neighbors);
  }
}



  
 

    






