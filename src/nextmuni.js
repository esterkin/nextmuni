    /*

    Author: Edward Sterkin
    April 5, 2014
    
    */        

    var routeSelected; //route currently selected;
    var stopTagSelected; //stopTag associated with stop currently selected;
    var stopSelected //name of stop current selected
    var stops; //xml containing all the <stop> elements for a route 
    var stopsmap = {}; //stop tag -> stop title lookup table
    var directionTags; //contains <direction> elements
    var xmldata = {}; //xml data for a particular route
    var listlat; //lat of currently displayed stop 
    var listlon; // lon of currently displayed stop 
    var map; //leaflet map 
    var marker; //currently displayed stop marker
    var routexml; //xml containing directions and stops
    var agency = "sf-muni";
    var nextBusURL = "http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=";

    //arrays used to preserve output order

    var routesarray = []; 
    var directionsarray = []; 


    function Route(tag, title) { //Route object
        this.tag = tag; //routes tag e.g. 38AX
        this.title = title; //routes title e.g. 38AX-Geary A Express
    }

    function Direction(tag, title) { //Direciton object 
        this.tag = tag; //e.g. 02_IB3 
        this.title = title; //e.g. Inbound to Downtown
    }

    function Stop(tag, title) {
        this.tag = tag;
        this.title = title;
    }

    function loadRoutes(nextBusURL,agency) {

        $.ajax({
            url: nextBusURL + agency,
            type: 'GET',
            dataType: "xml",
            success: function (data) {
                listRouteTitles(data);
            }
        });

    }

    function listRouteTitles(xml) { //sets the 'Route' dropdown menu

        var routes = $(xml).find('route'); //get all the <route> elements from XML

        $(routes).each(function (index) {

            //loop through the <route> elements building a route object and adding it to the array of route objects

            routesarray.push(new Route($(this).attr('tag'), $(this).attr('title')));

        });

        for (var i = 0; i < routesarray.length; i++) {
            var r = routesarray[i];
            $("#routes").append($("<option></option>") //create <option> elements in <select> elem
                .attr("value", r["tag"])
                .text(r["title"]));

        }

        routeSelected = $('#routes').val() // set which route is currently selected 
        loadDirectionsAndStops(routeSelected, listDirections); //pass selected route to loadDirectionsAndStops()
    }

    function loadDirectionsAndStops(routeSelected, successCallback) {

        var url = "http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=" + agency + "&r=" + routeSelected;

        $.ajax({
            url: url,
            type: 'GET',
            dataType: "xml",
            success: function (data) {
                routexml = data;
                //listDirections(data);
                successCallback(data);

            }

        })
            .fail(function () {
                console.log("XML load error");
            })

        ;
    }

    function listDirections(xml) {  //sets the 'Direction' dropdown menu
        xmldata = xml;
        stopsmap = {};
        directionsarray = [];

        directionTags = $(xml).find('route').children('direction');

        $(directionTags).each(function (index) {

            //{tag, title}
            directionsarray.push(new Direction($(this).attr('tag'), $(this).attr('title')));

        });

        for (var i = 0; i < directionsarray.length; i++) {
            var direction = directionsarray[i];

            $("#directions").append($("<option></option>") //create <option> elements in <select> elem
                .attr("value", direction["tag"])
                .text(direction["title"]));

        }

        listStops(xml);
    }

    function listStops(xml) { //sets the 'Stop' dropdown menu

        //stops selector 

        stops = $(xml).find('route').children('stop'); //modified prev: var stops = ...

        $(stops).each(function (index) { //put all stops for the route in stopsarray

            stopsmap[$(this).attr('tag')] = $(this).attr('title');
            //function like stop tag -> stop title lookup table 

        });

        //display stops given direction 

        var direction_select_index = $("#directions")[0].selectedIndex;
        var direction_stops = $(directionTags[direction_select_index]).children('stop'); //contains only <stop> element with single 'tag' attribute
        //console.log(direction_stops);

        $(direction_stops).each(function (index) {

            $('#stops').append($("<option></option>")
                .attr("value", $(this).attr('tag'))
                .text(stopsmap[$(this).attr('tag')]));

        });

        var stops_select_index = $("#stops")[0].selectedIndex;


        stopTagSelected = $('#stops').val()

        //console.log("stopTagSelected " + stopTagSelected);

        loadPredictions(routeSelected, stopTagSelected);

        setLatLon(xml);
    }

    function loadPredictions() {

        var url = "http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=sf-muni&r=" + routeSelected + "&s=" + stopTagSelected + "&useShortTitles=true";

        console.log(url);
        $.ajax({
            url: url,
            type: 'GET',
            dataType: "xml",
            success: function (data) {
                listPredictions(data);
            }
        });
    }

    function listPredictions(xml) {

        var limit = 2; //limit to 3 predictions
        var predictionsarray = new Array();

        var title = "NextMuni: "; //update browser title
        var titleCount = 0; //display only two times in the title

        $("#predictions").empty();

        var predictions = $(xml).find('prediction');

        var count = 0;

        $(predictions).each(function (index) {

            if(count>limit){
               return;
            }
                 
            predictionsarray.push($(this).attr('minutes'));
            count++;

        });

        if(predictionsarray.length == 0){ //if no predictions available 

            $('#predictions')
                .text("Times not available");
            title = "NextMuni";

        }

        predictionsarray = predictionsarray.sort(sortNumber); //sort by fastest prediction

        for(var i=0;i<predictionsarray.length;i++){

            if(predictionsarray[i] == 0){
                 $('#predictions').append($("<li></li>")
                .text("Arriving"));
                 title += "Arriving "
            }
            else{
                var min = predictionsarray[i];
                $('#predictions').append($("<li></li>")
                .text(min + " min"));

                if(titleCount==0){
                    title += min + " ";
                }  

                else if(titleCount<2){
                    title += "& " + min + " min ";
                }   
            }
            titleCount++;
        }

        document.title = title; 
    }

    function setLatLon() {


        var selectedStop = $(routexml).find("[tag='" + stopTagSelected + "']");
        
        listlat = selectedStop.attr('lat');
        listlon = selectedStop.attr('lon');

        dropMarker(listlat, listlon);

    }

    function initializeMap() {

        map = L.map('map').setView([37.7577, -122.4376], 16);

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

    }

    function dropMarker(lat, lng) {
        if (marker) {
            map.removeLayer(marker);
        }
        marker = new L.Marker([lat, lng]);
        map.addLayer(marker);
        map.panTo(new L.LatLng(lat, lng));
    }

    function getLocation() {
        navigator.geolocation.getCurrentPosition(storeUserLoc, handle_geolocation_error);
    }

    function storeUserLoc(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        // console.log(latitude);
        // console.log(longitude);
        loadNearestStops(latitude, longitude, displayNearestStops);
    }

    function handle_geolocation_error(err) {
        if (err.code == 1) {
            console.log("geolocation error");
        }
    }

    function loadNearestStops(lat, lon, successCallback) {

        var neareststopsurl = "http://sfnextmuni.herokuapp.com/nearby/" + lat + "/" + lon;

        $.ajax({
            url: neareststopsurl,
            type: 'GET',
            dataType: "json",
            success: function (data) {

                successCallback(data);
                
            }

        });

    }

    function displayNearestStops(data){

        var limit = 2; //limit the number of nearby stops found to 3
        var count = 0;

        $("#nearbystopstitle")
                .text("Stops Near You");

                for (var key in data) {
                    if(count>limit)
                        break;
                    else if (data.hasOwnProperty(key)) {

                        console.log(key);

                        $("#nearbystops").append($("<li></li>")
                            .text(key));
                        count++;

                    }
                }

    }

    function sortNumber(a,b) { //compares two numbers (used for sorting)
         return a - b;
    }

