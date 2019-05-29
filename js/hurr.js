$(document).ready(function () {

//scrollTo Plugin for storm key
$.fn.scrollTo = function( target, options, callback ){
  	if(typeof options == 'function' && arguments.length == 2){ callback = options; options = target; }
  		var settings = $.extend({
    		scrollTarget  : target,
    		offsetTop     : 50,
    		duration      : 500,
    		easing        : 'swing'
  		}, options);
  			return this.each(function(){
    				var scrollPane = $(this);
    				var scrollTarget = (typeof settings.scrollTarget == "number") ? settings.scrollTarget : $(settings.scrollTarget);
    				var scrollY = (typeof scrollTarget == "number") ? scrollTarget : scrollTarget.offset().top + scrollPane.scrollTop() - parseInt(settings.offsetTop);
    				scrollPane.animate({scrollTop : scrollY }, parseInt(settings.duration), settings.easing, function(){
      				if (typeof callback == 'function') { callback.call(this); }
    		});
  });
}

// variables to hold latLng coordinates
var polyline;
var hTrack;
var newTrack;

// empty arrays to hold multiple markers and coordinate sets
var markers = [];
var yrTracks = [];
var stormPath = [];
var thisStormPath = [];
var names = [];
var code = [];
var yrs = [];


//basin latLng coordinates 
latLng = [
	{"lat": 30.751278, "lng": -115.664062 },
	{"lat": 40.580587, "lng": -60.820312 },
	{"lat": -10.314919, "lng": -60.820312 },
	{"lat": -12.21118, "lng": 96.503906 },
	{"lat": -39.368279, "lng": 121.464844 },
	{"lat": -18.312811, "lng": -132.363281 },
	{"lat": -0.35156, "lng": 153.632813 }
];

// set up map variable 
var map;

// load google map to #gmap div
map = new google.maps.Map(document.getElementById('gmap'), {
    zoom: 3,
    center: {lat: 23.133, lng: -82.3833},
    mapTypeId: google.maps.MapTypeId.SATELLITE,
    stylers: [
      { lightness: 50 }
    ]
  });

// change map center 
function pathCenter(newLat, newLng) {
	map.setCenter({
		lat: newLat,
		lng: newLng
	});
}

function resetCenter(reLat, reLng) {
	map.setCenter({
		lat: reLat,
		lng: reLng
	});
}

function addmarker(location) {
       pathMarker = new google.maps.Marker({
        position: location,
        map: map
    });
      markers.push(pathMarker);
      return markers;
}

function setAllMap(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

function addPolyline(path) {
	polyline = new google.maps.Polyline({
		path: path,
		geodesic: true,
		strokeColor: 'yellow',
		strokeOpacity: .7,
		strokeWeight: 2
	});
	polyline.setMap(map);
	yrTracks.push(polyline);
	console.log(yrTracks);
}

function removePolylines() {
	for(var i = 0; i < yrTracks.length; i++) {
		yrTracks[i].setMap(null);
	}
	yrTracks = [];
}

function key() {

var tropDep = $('#hurr').find('.tropDep').length;
var tropStrm = $('#hurr').find('.tropStrm').length;
var hur = $('#hurr').find('.hur').length;
var majHur = $('#hurr').find('.majHur').length;

$('#hurr .tropDep').first().addClass("tropOne");

if(tropDep != 0) {
	$('#key span.tropDep').show();
} else {
	$('#key span.tropDep').hide();
}

if(tropStrm != 0) {
	$('#key span.tropStrm').show();
} else {
	$('#key span.tropStrm').hide();
}

if(hur != 0) {
	$('#key span.hur').show();
} else {
	$('#key span.hur').hide();
}

if(majHur != 0) {
	$('#key span.majHur').show();
} else {
	$('#key span.majHur').hide();
}

}

var basinData = '';

// load North Atlantic JSON data on page load
var file = 'NA.min.json'
// set up variables for text display for current basin and year on page load
var currBasin = 'North Atlantic';
var currYear = '2014';
//hide text display for storm info on load


//set-up variables to be used across all change functions
var i, s, b, y, st;

// select functions (loads data from JSON files and allows users to select years and storms)

// load North American Basin plus 2014 data on page load 
$.getJSON("json/basin/"+file+"", function(json) { 

//load text for current basin and year
$('#b_selected').text(currBasin);
$('#y_selected').text(currYear);

for (i = 0; i < json.year.length; i++) {

var path = [];

var year = json.year.length;
yrs.push(json.year[i]["@attributes"].id);

	if(json.year[i]["@attributes"].id == '2014') {
	names.push({ stName: json.year[i].storm.stormName, stCode: json.year[i].storm.strmID });

		for(p=0;p < json.year[i].storm.latLng.length;p++) {
		var coordinates = new google.maps.LatLng(parseFloat(json.year[i].storm.latLng[p].latitude), parseFloat(json.year[i].storm.latLng[p].longitude));
		path.push(coordinates);
		}
	
		addPolyline(path);
	}

}

// strip out duplicate years so there are only unique values

unique = yrs.filter(function(itm,i,a) {
		return i==yrs.indexOf(itm);
});

// get the length of the unique array to iterate through and push to years dd
var uni = unique.length;

for(y = uni-1;y>=0;y--) {

	$('#years').append($('<option>', {
			value: unique[y],
			'class': unique[y],
			text: unique[y]
		}));
}

names.sort();

var na = names.length;

for(s = 0; s<na; s++) {
// append list of years storms to ul element
$('#storm-toggle').append($('<li>', {
	id: '2013',
	text: names[s].stName,
	'data-code' : names[s].stCode
}));
}

// clear out years display variable
$('#s_selected').empty();



});

// functions for loading new basin data
$('#basin').change(function () {

// clear our all markers from map if previously loaded
setAllMap(null);

removePolylines();

if(newTrack != null) {
newTrack.setMap(null);
}

$('#years, #storm-toggle, #hurr').empty();
//hide years and stormList on selecting new basin
$('#years, .strmList').hide()

//load different json file on selection of new basin
basinData = $(this).val();

switch(basinData) {
		case 'EP.min.json':
		file = 'EP.min.json';
		resetCenter(latLng[0].lat, latLng[0].lng);
		$('#b_selected').text('Eastern Pacific');
		break;
		case 'NA.min.json':
		file = 'NA.min.json';
		resetCenter(latLng[1].lat, latLng[1].lng);
		$('#b_selected').text('North Atlantic');
		break;
		case 'NI.min.json':
		file = 'NI.min.json';
		resetCenter(latLng[3].lat, latLng[3].lng);
		$('#b_selected').text('North Indian');
		break;
		case 'SA.min.json':
		file = 'SA.min.json';
		resetCenter(latLng[2].lat, latLng[2].lng);
		$('#b_selected').text('South Atlantic');
		break;
		case 'SI.min.json':
		file = 'SI.min.json';
		resetCenter(latLng[4].lat, latLng[4].lng);
		$('#b_selected').text('South Indian');
		break;
		case 'SP.min.json':
		file = 'SP.min.json';
		resetCenter(latLng[5].lat, latLng[5].lng);
		basin = 'SP';
		$('#b_selected').text('South Pacific');
		break;
		case 'WP.min.json':
		file = 'WP.min.json';
		resetCenter(latLng[6].lat, latLng[6].lng);
		$('#b_selected').text('Western Pacific');
		break;
	}

// load new basin data from JSON file
$.getJSON("json/basin/"+file+"", function(json){

//set up variables to use in function for storing name/year data from file
var unique = [];
yrs = [];
names = [];

// iterate through loaded JSON file, push all years into yrs array
for (i = 0; i < json.year.length; i++) {
var year = json.year.length;
yrs.push(json.year[i]["@attributes"].id);
}

// strip out duplicate years so there are only unique values
unique = yrs.filter(function(itm,i,a) {
				return i==yrs.indexOf(itm);
			});

// get the length of the unique array to iterate through and push to years dd
var uni = unique.length;

for(y = uni-1;y>=0;y--) {

	$('#years').append($('<option>', {
			value: unique[y],
			'class': unique[y],
			text: unique[y]
		}));
}

//prepend a select prompt to top
$('#years').prepend($('<option>', {
	value: 'Select a year',
	text: 'Select a year',
	selected: 'selected',
	disabled: 'disabled'
}));

$('#years').show();
// clear out years display 
$('#y_selected, #s_selected').empty();


// end $.getJSON function
});
//end basin functions
});

$('#years').change(function(){
$('#storm-toggle, #hurr, #s_selected').empty();
//remove all marker and polylines from map if previously loaded
setAllMap(null);

removePolylines();

if(newTrack != null) {
newTrack.setMap(null);
}

// empty / hide containers for storm data
$('#hurr').empty();


// set up variables to holde names
names = [];


// pass current year to display element
strmYear = $(this).val();
$('#y_selected').text(strmYear);

// get year specific json from file
$.getJSON("json/basin/"+file+"", function(json){ 
$('#orig').empty();

// iterate through JSON file
for (i = 0; i < json.year.length; i++) {
path = [];

// get storm data if it matches selected year
	if(json.year[i]["@attributes"].id == strmYear) {
		names.push({ stName: json.year[i].storm.stormName, stCode: json.year[i].storm.strmID });

// iterate through all latLng arrays for selected year, add to array
			for(p=0;p < json.year[i].storm.latLng.length;p++) {
				var coordinates = new google.maps.LatLng(parseFloat(json.year[i].storm.latLng[p].latitude), parseFloat(json.year[i].storm.latLng[p].longitude));
				path.push(coordinates);
			}
	//add polylines from array to map
	addPolyline(path);
	
	}

}

names.sort();

var na = names.length;

for(s = 0; s<na; s++) {
	//console.log(s);

$('#storm-toggle').append($('<li>', {
	id: strmYear,
	text: names[s].stName,
	'data-code' : names[s].stCode
}));

}

});

$('.strmList').show();
// end years functions
});

//storm name click functions 
$('#storm-toggle').on('click', 'li', function() {

$('#hurr').empty();
// remove markers from map
setAllMap(null);

if(newTrack != null) {
	newTrack.setMap(null);
}

// variables holding specific storm data to load from file on click
var stName = $(this).text();
var stCode = $(this).attr('data-code');
var stYear = $(this).attr('id');

$('#s_selected').text(stName);
$('#y_selected').text(stYear);

$.getJSON("json/basin/"+file+"", function(json){ 

for (i = 0; i < json.year.length; i++) {

	if(stYear == json.year[i]["@attributes"].id && stCode == json.year[i].storm.strmID && stName == json.year[i].storm.stormName) {
	//set up variables to hold storm data for display
	var windSpeed = parseInt(json.year[i].storm.latLng[0].windSpeed);	
	var convSpeed = windSpeed * 1.15078;
	var avgPeriod = json.year[i].storm.latLng[0].avgPeriod;
	var minPressure = json.year[i].storm.latLng[0].minPressure;
	var orgYr = json.year[i].storm.latLng[0].time;
	yr = orgYr.substring(0,4);
	var month = orgYr.substring(5,7);
	var day = orgYr.substring(8,10);
	var time = orgYr.substring(11,19);

	// push data to container on page to display selecte storm origination data
	$('#orig').html('<div id="orgTime"><span class="ti">Storm Formation Date:</span> '+month+'/'+day+'/'+yr+' | <span class="ti">Time:</span> '+time+'</div><div><span class="wS"><span class="ti">Wind Speed:</span> '+Math.ceil(convSpeed)+' mph</span> | <span class="aP"><span class="ti">Averaging Period:</span> '+avgPeriod+' mins</span> | <span class="mP"><span class="ti">Minimum Atmospheric Pressure:</span> '+minPressure+' mbar</span></div>');

	//variable to hold highlighted storm track on click
	var thisStormPath = [];

	for (p = 0; p < json.year[i].storm.latLng.length; p++) {
		
		// get lat long coords for selected storm
		 var thisPath = new google.maps.LatLng(parseFloat(json.year[i].storm.latLng[p].latitude), parseFloat(json.year[i].storm.latLng[p].longitude));

		 // push to thisStormPath array for use
		$.each(thisPath, function(){
			thisStormPath.push(thisPath);
			 });
		// get center of the storm
		var cent = Math.ceil(json.year[i].storm.latLng.length / 2);
		//set center of storm
		pathCenter(parseFloat(json.year[i].storm.latLng[cent].latitude), parseFloat(json.year[i].storm.latLng[cent].longitude));
		// variables to hold each set of specific storm point data
		var thisWindSpeed = parseInt(json.year[i].storm.latLng[p].windSpeed);	
		var thisConvSpeed = thisWindSpeed * 1.15078;
		var thisAvgPeriod = json.year[i].storm.latLng[p].avgPeriod;
		var thisMinPressure = json.year[i].storm.latLng[p].minPressure;
		var thisOrgYr = json.year[i].storm.latLng[p].time;
		var thisYr = thisOrgYr.substring(0,4);
		var thisMonth = thisOrgYr.substring(5,7);
		var thisDay = thisOrgYr.substring(8,10);
		var thisTime = thisOrgYr.substring(11,19);

		// html structre for display stored in data variable
		var dataHtml = '<img src="img/pin.png" class="pin" alt ="pin-button"/><div class="i"><div><span class="info">Date: '+thisMonth+' / '+thisDay+' / '+thisYr+' | Time: '+thisTime+'</div><span class="info">Lat: <span class="lat">'+json.year[i].storm.latLng[p].latitude+'</span></span> | <span class="info">Long: <span class="lon">'+json.year[i].storm.latLng[p].longitude+'</span></span><div><span class="wS"><span class="ti">Wind Speed:</span> '+Math.ceil(thisConvSpeed)+' mph</span> | <span class="aP"><span class="ti">Averaging Period:</span> '+thisAvgPeriod+' mins</span> | <span class="mP"><span class="ti">Minimum Atmospheric Pressure:</span> '+thisMinPressure+' mbar</span></div></div>';

				if(thisConvSpeed < 38) {
					$('#hurr').append($('<div>', {
						"class": 'tropDep strmData',
						"data-code" : p,
						html: dataHtml
					}));
				} else if (thisConvSpeed > 38 && thisConvSpeed < 73) {
					$('#hurr').append($('<div>', {
						"class": 'tropStrm strmData',
						"data-code" : p,
						html: dataHtml
					}));
				} else if (thisConvSpeed > 73 &&  thisConvSpeed < 110) {
					$('#hurr').append($('<div>', {
						"class": 'hur strmData',
						"data-code" : p,
						html: dataHtml
					}));
				} else if(thisConvSpeed > 80) {
					$('#hurr').append($('<div>', {
						"class": 'majHur strmData',
						"data-code" : p,
						html: dataHtml
					}));
				}

// end latLng for loop
	}

	}

}

newTrack = new google.maps.Polyline({
	path: thisStormPath,
	geodesic: false,
	strokeColor: '#cc2000',
	strokeOpacity: 1.0,
	strokeWeight: 5
 });

key();

newTrack.setMap(map);

$.each($('.strmData').click(function(){
		var markerLat = $(this).find('.lat').text();
		var markerLon = $(this).find('.lon').text();
		var latlng = new google.maps.LatLng(parseFloat(markerLat), parseFloat(markerLon));
		addmarker(latlng);
	}));

});

});

// scrolls down #hurr div to first instance of div with that class
$('#key span.tropDep').click(function () {
	$('#hurr').scrollTo('#hurr .tropDep:eq(0)', 5200, {easing: 'elasout'});
});

$('#key span.tropStrm').click(function () {
	$('#hurr').scrollTo('#hurr .tropStrm:eq(0)', 5200, {easing: 'elasout'});
});

$('#key span.hur').click(function () {
	$('#hurr').scrollTo('#hurr .hur:eq(0)', 5200, {easing: 'elasout'});
});

$('#key span.majHur').click(function () {
	$('#hurr').scrollTo('#hurr .majHur:eq(0)', 5200, {easing: 'elasout'});
});

// mobile display functions
$('#mSheader').on('click', function (){
	$('#storm-toggle').toggle();
	
});

$('#hideStorm').on('click', function (){
	$('#orig').toggle();
	if($('#hideStorm').text() == 'Hide Storm Data') {
		$('#hideStorm').text('Show Storm Data');
	} else {
		$('#hideStorm').text('Hide Storm Data');
	}
});

$('#clear').click(function(){
	removePolylines();
	$('#storm-toggle').empty();
	if(newTrack != null) {
		newTrack.setMap(null);
	}
	$('#hurr, #orig, #y_selected, #s_selected').empty();
});

if($('#storm-toggle li').length > 0) {
	$('#sidebar-header').show();
} else {
	$('#sidebar-header').hide();
}

// intializes the google map 
google.maps.event.addDomListener(window, 'load');
});