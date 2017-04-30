var red_field_data, blue_field_data;
var red_field_x, red_field_y, blue_field_x, blue_field_y;
var max_distance;


var scale_field_x = function(x)
{ 
  
  var x_scale = d3.scale.linear()
                    .domain([0, FIELD_RESOLUTION-1])
                    .range([0 + PADDING_X, SVG_WIDTH - PADDING_X]);
 
  return x_scale(x);
}

var scale_field_y = function(y)
{
  var y_scale = d3.scale.linear()
                    .domain([0, FIELD_RESOLUTION-1])
                    .range([SVG_HEIGHT - PADDING_Y, 0 + PADDING_Y]);
  
  return y_scale(y);
}



function generateField()
{
  field_data = [];
  for (var i=0; i < FIELD_RESOLUTION; i++)
  {
    for (var j=0; j < FIELD_RESOLUTION; j++)
    {
      point = [scale_field_x(i), scale_field_y(j), undefined]
      
      field_data.push(point)
    }
  }
  
  // Classify field data
  classify();
}






function makeNeighborConnections(d, border)
{
  var current_x, current_y; 
  var connection_color, weight;
  var neighbor, neighbors, n_x, n_y, distance
  
  var connectionWeightScale = function(d)
  {
    var weight_scale = d3.scale.linear()
                        .domain([0, max_distance])
                        .range([14, 2]);

    return weight_scale(d)
  }
  
  
  current_x = d[0];
  current_y = d[1];
  neighbors = d[3];
  
  
  // Draw line
  SVG_tooltip_layer.selectAll("line").data(neighbors)
                 .enter().append("line")
                    .attr("class", "mouseover_connections")
                    .attr("x1", current_x)
                    .attr("y1", current_y)
                    .attr("x2", function(datum, index)
                    {
                        neighbor = datum['neighbor']['data']
                        n_x = neighbor[0];
                        return n_x;
                    })
                    .attr("y2", function(datum, index)
                    {
                        neighbor = datum['neighbor']['data']
                        n_y = neighbor[1];
                        return n_y;
                    })
                    .style("opacity", 0)
                    .style("stroke", function(datum)
                    {
                        connection_color = (border) ? "black" : datum['neighbor']['data'][2];
                        
                        return connection_color;
                    })
                    .style("stroke-width", function(datum)
                    {
                        var temp = connectionWeightScale(datum['distance']);
                        weight = (border) ? temp*2.25 : temp;
                        return weight;
                    });  
}

function toolTipTransitions(self)
{
  d3.selectAll(".mouseover_connections").transition()
                      .duration(500)
                      .style("opacity", 0);
  
  self.transition()
        .duration(1000)
        .attr("r", FIELD_DATA_R)
        .style("opacity", GRID_OPACITY)
}


function toolTipCleanup()
{
  
  d3.selectAll(".mouseover_connections").remove();
  d3.selectAll(".tool_tip_info").remove();
  d3.selectAll(".neighbor_info").remove();
  
}


function selectNeighbors(d, transition)
{
  var neighbor, neighbors = d[3]
  var new_radius, new_font_size;
  
  new_radius = (transition == "mouseover") ? DATA_POINT_R*1.5 : DATA_POINT_R;
  new_font_size = (transition == "mouseover") ? 12*1.5 : 12;
  
  for (var i=0; i < neighbors.length; i++)
  {
    neighbor_index = neighbors[i]['neighbor']['id'];
    
    d3.select("#training_data_id_" + neighbor_index)
          .transition()
            .duration(400)
            .attr("r", new_radius);
    
    
    d3.select("#training_data_text_id_" + neighbor_index)
          .transition()
            .duration(400)
            .attr("font-size", new_font_size);
    
  }
}




function plotField()
{
  
  d3.selectAll(".field_circles").remove();
  
  // Plot Data
  SVG_back_layer.selectAll("circle")
                  .data(field_data)
                  .enter().append("circle")
                    .attr("class", "field_circles")
                    .attr("id", function(d, i) { return "circle_"+i; })
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
                    .attr("r", 0)
                    .style("fill", function(d, i)
                    {
                      field_color = d[2];
                      return field_color;
                    })
                    .style("opacity", 0)
                    .style("stroke", function(d)
                    {
                      if (data_stroke_on)
                      {
                        return "black";
                      }
                      else
                      {
                        return d[2];
                      }
                    })
                    .on("mouseover", function(d, i) 
                    {   
              
                        var sel = d3.select(this);
                        sel.moveToFront();
    
                        selectNeighbors(d, "mouseover");
                        
                        makeNeighborConnections(d, border=false);
                        makeNeighborConnections(d, border=true);
                        
                        
    
                        d3.selectAll(".mouseover_connections").transition()
                              .duration(500)
                              .style("opacity", 1);
  
                        d3.select(this).transition()
                              .duration(200)  
                              .style("stroke", "black")
                              .attr("r", FIELD_DATA_R*3.5)
                              .style("opacity", 1);

                    })
                    .on("mouseout", function(d) 
                    { 
                        selectNeighbors(d, "mouseout");
                        var self = d3.select(this);
                        toolTipTransitions(self);
                        toolTipCleanup();
    
                        d3.select(this).transition()
                              .duration(200)
                              .style("stroke", function(d)
                              {
                                if (data_stroke_on)
                                {
                                  return "black";
                                }
                                else
                                {
                                  return d[2];
                                }
                              })
                              .attr("r", FIELD_DATA_R)
                              .style("opacity", GRID_OPACITY);
                        


                    });
  
  
  d3.selectAll(".field_circles")
                .transition()
                  .duration(1500)
                  .attr("r", FIELD_DATA_R)
                  .style("opacity", GRID_OPACITY);
  
}



function classify()
{
  var test_datum, training_datum;
  var test_x, test_y, train_x, train_y;
  var train_color, distance;
  var unsorted_distances, sorted_distances;
  var attributes;
  var k_nearest_neighbors;
  var red_count, blue_count;
  var neighbor, neighbor_color, test_color;
  
 
  //  Test Data
  for (var i=0; i < field_data.length; i++)
  {
    
    // Declare the data
    test_datum = field_data[i];
    test_x = test_datum[0];
    test_y = test_datum[1];
    
    
    // Gather the unsorted distances
    unsorted_distances = [];
    for (var j=0; j < training_data.length; j++)
    {
      training_datum = training_data[j];
      train_x = training_datum[0];
      train_y = training_datum[1];
      train_color = training_datum[2];
      
      distance = Math.sqrt( (test_x - train_x)**2 + (test_y - train_y)**2)
      
      // Find max distance for use with scaling
      max_distance = 0;
      if (distance > max_distance)
      {
        max_distance = distance;
      }
      
      attributes = {"color": undefined, 
                    "distance": undefined, 
                    "neighbor": undefined}; 
      
      attributes["color"] = train_color;
      attributes["distance"] = distance;
      attributes["neighbor"] = { "id": j, "data": training_datum };
      unsorted_distances.push(attributes)
     
    }
    
    // Sort the distance
    sorted_distances = unsorted_distances.sort( function(a, b)
                           {
                              return a["distance"] - b["distance"];   
                           });
    
    
    // Pick the k nearest neighbors
    k_nearest_neighbors = sorted_distances.slice(0, K);
    field_data[i].push(k_nearest_neighbors);
    
    // Generate count
    red_count = 0;
    blue_count = 0;
    for (var j=0; j < k_nearest_neighbors.length; j++)
    {
      neighbor = k_nearest_neighbors[j];
      neighbor_color = neighbor["color"];
      if (neighbor_color == RED)
      {
        red_count++;
      }
      else if (neighbor_color == BLUE)
      {
        blue_count++;
      }
    }
    
    
    // Classify the color
    if (red_count > blue_count)
    {
      test_color = RED;
    }
    else if (blue_count > red_count)
    {
      test_color = BLUE;
    }
    else
    {
      test_color = INDETERMINED_COLOR;
    }
    
    // Set the color
    field_data[i][2] = test_color;
  }
}



  
 

    






