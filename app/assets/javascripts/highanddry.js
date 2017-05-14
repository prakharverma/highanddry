var map;
var currentPositionMarker;
var bounds;
var poiMarker = [];

//Function to put left navbar button over map
function LeftControl(controlDiv, map) {
    // Set CSS
    var controlUI = document.createElement('div');
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginTop = '20px';
    controlUI.style.marginLeft = '20px';

    controlDiv.appendChild(controlUI);

    // Set CSS for interior.
    var controlText = document.createElement('div');
    controlText.innerHTML = "<i class='fa fa-bars fa-3x'></i>";
    controlUI.appendChild(controlText);

    // Setup the click event listener
    controlUI.addEventListener('click', function() {
        document.getElementById("sidenav").style.width = "250px";
    });
}

function setLanLngForForm(){
    markerPosition = currentPositionMarker.getPosition();
    document.getElementById('getBarForm_lat').value = markerPosition.lat()
    document.getElementById('getBarForm_long').value =  markerPosition.lng()
}


function initMap() {
    var myStyles =[
        {
            featureType: "poi",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        }
    ];

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 18.5560509, lng: 73.8897929},
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles:myStyles,
        mapTypeControl: false
    });

    // constructor passing in this DIV for left navbar.
    var navbarControlDiv = document.createElement('div');
    var leftControl = new LeftControl(navbarControlDiv, map);
    navbarControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(navbarControlDiv);


    // For Searcg bar
    bounds = new google.maps.LatLngBounds();
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    currentPositionMarker = new google.maps.Marker({
        position:  {lat: 18.5560509, lng: 73.8897929},
        title: 'Your Location',
        map: map
    });

    setLanLngForForm();


    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 1) {
            bounds = new google.maps.LatLngBounds();

            currentPositionMarker.setMap(null);

            currentPositionMarker = new google.maps.Marker({
                position:  places[0].geometry.location,
                title: places[0].name,
                map: map
            });

            setLanLngForForm();

            bounds.union(places[0].geometry.viewport)
            map.fitBounds(bounds);

        }
        else{
            return;
        }
    });

        // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(pos);
            map.setZoom(17);

            currentPositionMarker.setPosition(pos);

            setLanLngForForm();

        });
    }
    google.maps.event.addListener(map, 'click', function(event) {
        currentPositionMarker.setPosition(event.latLng);
        setLanLngForForm();

    });

}


function bindInfoWindow(marker, map, infowindow, html) {

    marker.addListener('click', function () {
        infowindow.setContent(html);
        infowindow.open(map, this);
    });
}

function parseJson(poijson){
    //poijson = "[" + poijson + "]"
    poijson = JSON.stringify(poijson)

    //remove previous POI marker
    for (var i = 0; i < poiMarker.length; i++) {
        poiMarker[i].setMap(null);
    }

    //validation
    if (poijson =="[]"){
        alert("Sorry. No Booze Point found near you.")
        return;
    }

    obj = JSON.parse(poijson);

    poiMarker = [];
    bounds = new google.maps.LatLngBounds();

    var icon = {url:'/img/wine-glass.png', scaledSize: new google.maps.Size(15, 15)};
    for (var i = 0; i < obj.length; i++) {
        var poi = obj[i];
        var markerPOI = new google.maps.Marker({
            position: new google.maps.LatLng(poi['lat'], poi['lng']),
            map: map,
            icon: icon,
            title: poi['name']
        });

        poiMarker.push(markerPOI);

        bounds.extend(new google.maps.LatLng(poi['lat'], poi['lng']));

         var infoWindow = new google.maps.InfoWindow();

        // add an event listener for this marker
        bindInfoWindow(markerPOI, map, infoWindow, "<b>" + poi['name'] + "</b><br>" + poi['vicinity']);

    }

    map.fitBounds(bounds);
    map.setZoom(14);
}


/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("sidenav").style.width = "0";
}