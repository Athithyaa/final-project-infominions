function addLayer(name) {
    $("<div>" + name + "</div>").insertBefore("#out");
    $(".container").shapeshift({maxColumns: 1,selector: "*:not('.excl')"});
}

$(document).ready(function () {
    $(".container").shapeshift({maxColumns: 1,selector: "*:not('.excl')"});
    var cnt = 0;
    $("#layerbutton").click(function () {
        cnt+=1;
        if(cnt <= 3)
            addLayer($("#layerpicker").val());
    })

});