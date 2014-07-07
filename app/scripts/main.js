/*globals jQuery, L, google, Handlebars, Spinner, wax, Swag, Backbone, _ */

var Shareabouts = Shareabouts || {};

(function(NS, $, console) {
  Swag.registerHelpers();

  var minVectorZoom = 16,
      maxVectorZoom = 19,
      preventIntersectionClick = false,
      streetviewVisible = false,
      currentUser;

  // http://mir.aculo.us/2011/03/09/little-helpers-a-tweet-sized-javascript-templating-engine/
  var t = function t(s,d){
   for(var p in d)
     s=s.replace(new RegExp('{{'+p+'}}','g'), d[p]);
   return s;
  };

  // Get the style rule for this feature by evaluating the condition option
  var getStyleRule = function(properties, rules) {
    var self = this,
        len, i, condition;

    for (i=0, len=rules.length; i<len; i++) {
      // Replace the template with the property variable, not the value.
      // this is so we don't have to worry about strings vs nums.
      condition = t(rules[i].condition, properties);

      // Simpler code plus a trusted source; negligible performance hit
      if (eval(condition)) {
        return rules[i];
      }
    }
    return null;
  };

  NS.smallSpinnerOptions = {
    lines: 13, length: 0, width: 3, radius: 10, corners: 1, rotate: 0,
    direction: 1, color: '#000', speed: 1, trail: 60, shadow: false,
    hwaccel: false, className: 'spinner', zIndex: 2e9, top: 'auto',
    left: 'auto'
  };

  NS.Config = {
    placeTypes: {
      'notime': { label: 'Not Enough Time to Cross' },
      'doublepark': { label: 'Double Parking' },
      'longwait': { label: 'Long Wait to Cross' },
      'redlight': { label: 'Red Light Running' },
      'jaywalking': { label: 'Jaywalking' },
      'visibility': { label: 'Poor Visibility' },
      'speeding': { label: 'Speeding' },
      'longcross': { label: 'Long Distance to Cross' },
      'yield': { label: 'Failure to Yield' },
      'bike': { label: 'Cyclist Behavior' },
      'other': { label: 'Other' }
    },
    placeStyles: [
      {
        condition: '"{{location_type}}" == "doublepark"',
        icon: {
          url: 'styles/images/markers/marker-70x124-doublepark.png',
          anchor: new google.maps.Point(35,103)
        },
        focusIcon: {
          url: 'styles/images/markers/marker-76x127-doublepark-focused.png',
          anchor: new google.maps.Point(38,106)
        }
      },
      {
        condition: '"{{location_type}}" == "jaywalking"',
        icon: {
          url: 'styles/images/markers/marker-70x124-jaywalking.png',
          anchor: new google.maps.Point(35,103)
        },
        focusIcon: {
          url: 'styles/images/markers/marker-76x127-jaywalking-focused.png',
          anchor: new google.maps.Point(38,106)

        }
      },
      {
        condition: '"{{location_type}}" == "longcross"',
        icon: {
          url: 'styles/images/markers/marker-70x124-longcross.png',
          anchor: new google.maps.Point(35,103)
        },
        focusIcon: {
          url: 'styles/images/markers/marker-76x127-longcross-focused.png',
          anchor: new google.maps.Point(38,106)

        }
      },
      {
        condition: '"{{location_type}}" == "longwait"',
        icon: {
          url: 'styles/images/markers/marker-70x124-longwait.png',
          anchor: new google.maps.Point(35,103)
        },
        focusIcon: {
          url: 'styles/images/markers/marker-76x127-longwait-focused.png',
          anchor: new google.maps.Point(38,106)

        }
      },
      {
        condition: '"{{location_type}}" == "notime"',
        icon: {
          url: 'styles/images/markers/marker-70x124-notime.png',
          anchor: new google.maps.Point(35,103)
        },
        focusIcon: {
          url: 'styles/images/markers/marker-76x127-notime-focused.png',
          anchor: new google.maps.Point(38,106)

        }
      },
      {
        condition: '"{{location_type}}" == "redlight"',
        icon: {
          url: 'styles/images/markers/marker-70x124-redlight.png',
          anchor: new google.maps.Point(35,103)
        },
        focusIcon: {
          url: 'styles/images/markers/marker-76x127-redlight-focused.png',
          anchor: new google.maps.Point(38,106)

        }
      },
      {
        condition: '"{{location_type}}" == "speeding"',
        icon: {
          url: 'styles/images/markers/marker-70x124-speeding.png',
          anchor: new google.maps.Point(35,103)
        },
        focusIcon: {
          url: 'styles/images/markers/marker-76x127-speeding-focused.png',
          anchor: new google.maps.Point(38,106)

        }
      },
      {
        condition: '"{{location_type}}" == "visibility"',
        icon: {
          url: 'styles/images/markers/marker-70x124-visibility.png',
          anchor: new google.maps.Point(35,103)
        },
        focusIcon: {
          url: 'styles/images/markers/marker-76x127-visibility-focused.png',
          anchor: new google.maps.Point(38,106)

        }
      },
      {
        condition: '"{{location_type}}" == "yield"',
        icon: {
          url: 'styles/images/markers/marker-70x124-yield.png',
          anchor: new google.maps.Point(35,103)
        },
        focusIcon: {
          url: 'styles/images/markers/marker-76x127-yield-focused.png',
          anchor: new google.maps.Point(38,106)

        }
      },
      {
        condition: '"{{location_type}}" == "bike"',
        icon: {
          url: 'styles/images/markers/marker-70x124-bike.png',
          anchor: new google.maps.Point(35,103)
        },
        focusIcon: {
          url: 'styles/images/markers/marker-76x127-bike-focused.png',
          anchor: new google.maps.Point(38,106)

        }
      },
      {
        condition: '"{{location_type}}" == "other"',
        icon: {
          url: 'styles/images/markers/marker-70x124-other.png',
          anchor: new google.maps.Point(35,103)
        },
        focusIcon: {
          url: 'styles/images/markers/marker-76x127-other-focused.png',
          anchor: new google.maps.Point(38,106)

        }
      },
      {
        condition: 'true',
        newIcon: {
          url: 'styles/images/markers/marker-70x124-plus.png',
          anchor: new google.maps.Point(35,103)

        }
      }
    ],
    mapPlaceStyles: [
      {
        condition: '"{{location_type}}" == "doublepark"',
        icon: {
          url: 'styles/images/markers/icon-dot-doublepark.png',
          anchor: new google.maps.Point(16, 16)
        }
      },
      {
        condition: '"{{location_type}}" == "jaywalking"',
        icon: {
          url: 'styles/images/markers/icon-dot-jaywalking.png',
          anchor: new google.maps.Point(16, 16)
        }
      },
      {
        condition: '"{{location_type}}" == "longcross"',
        icon: {
          url: 'styles/images/markers/icon-dot-longcross.png',
          anchor: new google.maps.Point(16, 16)
        }
      },
      {
        condition: '"{{location_type}}" == "longwait"',
        icon: {
          url: 'styles/images/markers/icon-dot-longwait.png',
          anchor: new google.maps.Point(16, 16)
        }
      },
      {
        condition: '"{{location_type}}" == "notime"',
        icon: {
          url: 'styles/images/markers/icon-dot-notime.png',
          anchor: new google.maps.Point(16, 16)
        }
      },
      {
        condition: '"{{location_type}}" == "redlight"',
        icon: {
          url: 'styles/images/markers/icon-dot-redlight.png',
          anchor: new google.maps.Point(16, 16)
        }
      },
      {
        condition: '"{{location_type}}" == "speeding"',
        icon: {
          url: 'styles/images/markers/icon-dot-speeding.png',
          anchor: new google.maps.Point(16, 16)
        }
      },
      {
        condition: '"{{location_type}}" == "visibility"',
        icon: {
          url: 'styles/images/markers/icon-dot-visibility.png',
          anchor: new google.maps.Point(16, 16)
        }
      },
      {
        condition: '"{{location_type}}" == "yield"',
        icon: {
          url: 'styles/images/markers/icon-dot-yield.png',
          anchor: new google.maps.Point(16, 16)
        }
      },
      {
        condition: '"{{location_type}}" == "bike"',
        icon: {
          url: 'styles/images/markers/icon-dot-bike.png',
          anchor: new google.maps.Point(16, 16)
        }
      },
      {
        condition: '"{{location_type}}" == "other"',
        icon: {
          url: 'styles/images/markers/icon-dot-other.png',
          anchor: new google.maps.Point(16, 16)
        }
      }
    ],
    placeColors: {
      'yield': '#fff200',
      'visibility': '#87c440',
      'other': '#ababab',
      'speeding': '#ae4f9e',
      'redlight': '#ed1c24',
      'notime': '#000',
      'longwait': '#f6891f',
      'longcross': '#3062ae',
      'jaywalking': '#ed1d8b',
      'doublepark': '#2b8246',
      'bike': '#00aeef',
    },
    mapStyle: [{"featureType":"water","stylers":[{"saturation":43},{"lightness":-11},{"hue":"#0088ff"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"hue":"#ff0000"},{"saturation":-100},{"lightness":99}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#808080"},{"lightness":54}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#ccdca1"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#767676"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#ece2d9"}]},{"featureType":"poi.park","stylers":[{"visibility":"on"}]},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"off"}]}],
    datasetUrl: 'http://data.shareabouts.org/api/v2/nycdot/datasets/vz/places'
  };

  NS.Router = Backbone.Router.extend({
    routes: {
      ':id': 'showPlace',
      'intersection/:id': 'showIntersection',
      'filter/:locationType': 'filterPlaces',
      '': 'index'
    },

    showPlace: function(id) {
      var self = this,
          placeModel = new NS.PlaceModel({id: id});
      placeModel.urlRoot = NS.Config.datasetUrl;

      // Get the info for this place id
      placeModel.fetch({
        success: function(model, response, options) {
          var lat = model.get('intersection_lat'),
              lng = model.get('intersection_lng');

          // Existing places don't have intersection data, so this is a more
          // graceful fallback.
          if (!lat || !lng) {
            console.warn('Place', id, 'does not have an intersection.');
            self.navigate('', {replace: true});
            return;
          }

          // Show the street view
          loadStreetView([parseFloat(lat), parseFloat(lng)],
            model.get('intersection_id'), model);

        },
        error: function() {
          // No place found for this id, clear the id from the url. No history.
          self.navigate('', {replace: true});
        }
      });
    },

    showIntersection: function(id) {
      var self = this;

      // Get the intersection data file
      $.ajax({
        url: getIntersectionFileUrl(id),
        dataType: 'json',
        success: function(intersection) {
          // Show the street view
          loadStreetView([parseFloat(intersection.lat), parseFloat(intersection.lng)], id);
        },
        error: function() {
          // No place found for this id, clear the id from the url. No history.
          self.navigate('', {replace: true});
        }
      });
    },

    filterPlaces: function(locationType) {
      $('.place-type-li[data-locationtype="'+locationType+'"]').addClass('active');
      NS.filter = {'location_type': locationType};
      resetPlaces();

      // Remove old features
      NS.map.data.forEach(function(feature) {
        NS.map.data.remove(feature);
      });

      // Load new places
      // NOTE: this is currently when the filter is set, regardless of
      // current zoom level. May need refactoring.
      loadMinZoomPlaces();

      // Remove the place raster layer
      NS.map.overlayMapTypes.forEach(function(overlay) {
        if (overlay.name === 'visionzero_places') {
          overlay.setOpacity(0);
        }
      });
    },

    index: function(locationType) {
      // No current filter, but there was one previously
      if (NS.filter) {
        NS.filter = null;
        resetPlaces();

        // Add the place raster layer
        NS.map.overlayMapTypes.forEach(function(overlay) {
          if (overlay.name === 'visionzero_places') {
            overlay.setOpacity(1);
          }
        });
      }
    }
  });

  function getIntersectionFileUrl(intersectionId) {
    var count, i, dataFilePath;

    dataFilePath = 'data/';
    for (count = 0, i = intersectionId.length - 2;
         count < 2; ++i, ++count) {
      dataFilePath += intersectionId[i] + '/';
    }
    dataFilePath += intersectionId + '.json';

    return dataFilePath;
  }

  // Allow an optional parameter for focusing on a place
  function loadStreetView(intersectionLatLng, intersectionId, lookAtPlaceModel) {
    var panoPosition, heading;

    // This global indicates that the streetview is currently visible. This is
    // good for things like hiding the summary infowindow on a small map.
    streetviewVisible = true;

    // Get the intersection data file
    $.ajax({
      url: getIntersectionFileUrl(intersectionId),
      dataType: 'json',
      success: function(intersection) {
        var html = NS.Templates['intersection-detail'](intersection);
        $('.shareabouts-intersection-detail').html(html);
      },
      error: function() {
        $('.shareabouts-intersection-detail').empty();
      }
    });

    // Show the streetview container
    $('.shareabouts-streetview-container').addClass('active');
    $('.shareabouts-location-map-container').removeClass('active');

    NS.streetview = new NS.StreetView({
      el: '.shareabouts-streetview',
      map: {
        center: intersectionLatLng,
        maxDistance: '100m',
        streetViewControl: false
      },
      placeStyles: NS.Config.placeStyles,
      datasetUrl: NS.Config.datasetUrl,
      addButtonLabel: 'Share an Issue',
      maxDistance: 25,
      newPlaceInfoWindow: {
        content: '<strong>Drag me to the spot where the issue occurs.</strong>'
      },
      currentUser: currentUser,

      templates: NS.Templates
    });

    // When the place panel is shown, update the url with the id
    $(NS.streetview).on('showplace', function(evt, view) {
      NS.router.navigate(view.model.id.toString());
    });

    // When the place panel is closed, clear the id from the url
    $(NS.streetview).on('closeplace', function(evt, view) {
      NS.router.navigate('');
    });

    // Init the spinner (not shown) when a place survey is shown. This is
    // necessary since it's JS.
    $(NS.streetview).on('showplacesurvey', function(evt, view) {
      var spinner = new Spinner(NS.smallSpinnerOptions).spin(view.$('.form-spinner')[0]);
    });

    $(NS.streetview).on('showplaceform', function(evt, view) {
      // Set the intersection information on the form when it is shown
      view.$('[name="intersection_id"]').val(intersectionId);
      view.$('[name="intersection_lat"]').val(intersectionLatLng[0]);
      view.$('[name="intersection_lng"]').val(intersectionLatLng[1]);
    });

    // Change the POV if we need to be looking at a marker.
    if (lookAtPlaceModel) {
      // Origin
      panoPosition = NS.streetview.panorama.getPosition();
      // From the origin to the place
      heading = google.maps.geometry.spherical.computeHeading(panoPosition,
        new google.maps.LatLng(lookAtPlaceModel.get('geometry').coordinates[1],
          lookAtPlaceModel.get('geometry').coordinates[0]));

      // Look at the place
      NS.streetview.panorama.setPov({heading: heading, pitch: NS.streetview.panorama.getPov().pitch});
      // Show the panel with details
      NS.streetview.showPlace(lookAtPlaceModel);
    }

    // Center the map on the intersection (making sure the map knows what size
    // it is first)
    resetMap(NS.map, {
      center: {lat: intersectionLatLng[0], lng: intersectionLatLng[1]},
      pan: true
    });

    // Add a marker to the map (or move it if it already exists)
    NS.currentMarker = NS.currentMarker || new google.maps.Marker({});
    NS.currentMarker.setMap(NS.map);
    NS.currentMarker.setPosition({lat: intersectionLatLng[0], lng: intersectionLatLng[1]});

    // Remove the summary info window from the map
    NS.summaryWindow.close();

    // Update the url
    if (!lookAtPlaceModel) {
      NS.router.navigate('intersection/'+intersectionId);
    }
  }

  function resetMap(map, options) {
    options = options || {};
    _.defaults(options, {
      center: map.getCenter(),
      pan: false,
      resize: true
    });

    if (options.resize) {
      google.maps.event.trigger(map, 'resize');
    }

    var centerFunc = _.bind(options.pan ? map.panTo : map.setCenter, map);
    centerFunc(options.center);
  }

  function loadMinZoomPlaces(pageNum) {
    var data = _.extend({}, NS.filter, {page: pageNum});

    $.ajax({
      url: NS.Config.datasetUrl,
      dataType: 'json',
      data: data,
      success: function(geojson) {
        var locationType,i;

        if (geojson.features.length > 0) {
          locationType = geojson.features[0].properties.location_type;
        }

        if (locationType === NS.filter.location_type) {
          NS.map.data.addGeoJson(geojson);

          // if this is the first page and there are more than one
          if (geojson.metadata.page === 1 && geojson.metadata.num_pages > 1) {
            for(i=2; i<=geojson.metadata.num_pages; i++) {
              loadMinZoomPlaces(i);
            }
          }
        }
      }
    });
  }

  // Set the style rules for the data layer
  function setMinZoomPlaceStyle(overrides) {
    NS.map.data.setStyle(function(feature) {
      var style = _.extend({
        icon: {
          clickable: false,
          path: google.maps.SymbolPath.CIRCLE,
          scale: 5,
          fillColor: NS.Config.placeColors[feature.getProperty('location_type')],
          fillOpacity: 0.9,
          strokeColor: '#fff',
          strokeWeight: 1
        }
      }, overrides);

      return style;
    });
  }

  function resetPlaces() {
    var zoom = NS.map.getZoom(),
        center = NS.map.getCenter();

    if (zoom < minVectorZoom) {
      // Zoomed out... clear the collection/map
      NS.mapPlaceCollection.reset();

      if (NS.filter) {
        setMinZoomPlaceStyle({visible: true});
      } else {
        setMinZoomPlaceStyle({visible: false});
      }
    } else {
      // Apply the attribute filter if it exists
      var data = _.extend({
        near: center.lat()+','+center.lng(),
        distance_lt: '800m'
      }, NS.filter);

      setMinZoomPlaceStyle({visible: false});

      // Zoomed in... get some places
      NS.mapPlaceCollection.fetchAllPages({
        data: data
      });
    }
  }

  function initMap() {
    var map = new google.maps.Map($('.shareabouts-location-map').get(0), {
          center: new google.maps.LatLng(40.7210690835, -73.9981985092),
          zoom: 14,
          minZoom: 11,
          maxZoom: 19,
          streetViewControl: false,
          panControl: false,
          mapTypeControl: false,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: NS.Config.mapStyle,
          zoomControl: false
        }),
        markers = {},
        summaryWindow = new google.maps.InfoWindow({
          disableAutoPan: true
        }),
        summaryWindowTid,
        autocomplete = new google.maps.places.Autocomplete(
          document.getElementById('shareabouts-map-search'), {
            bounds: new google.maps.LatLngBounds(
              new google.maps.LatLng(40.742380, -74.006524),
              new google.maps.LatLng(40.765787, -73.964896)),
            componentRestrictions: {country: 'us'},
            types: ['geocode']
          });

    // Make these accessible outside of this function
    NS.map = map;
    NS.mapPlaceCollection = new NS.PlaceCollection();
    NS.summaryWindow = summaryWindow;

    // This has to be set directly, not via the options
    NS.mapPlaceCollection.url = NS.Config.datasetUrl;

    // Bind zoom-in/out to our custom buttons
    $('.shareabouts-zoom-in').click(function(evt) {
      evt.preventDefault();
      map.setZoom(map.getZoom() + 1);
    });
    $('.shareabouts-zoom-out').click(function(evt) {
      evt.preventDefault();
      map.setZoom(map.getZoom() - 1);
    });

    // Set the style rules for the data layer
    setMinZoomPlaceStyle();

    // Map layer with dangerous cooridors and crashes
    var crashDataMapType = new google.maps.ImageMapType({
      name: 'visionzero_crashdata',
      getTileUrl: function(coord, zoom) {
        function getRandomInt (min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        var subdomains = ['a', 'b', 'c', 'd'];
        return ['http://', subdomains[getRandomInt(0, 3)], '.tiles.mapbox.com/v3/openplans.i7opnbif/',
            zoom, '/', coord.x, '/', coord.y, '.png'].join('');
      },
      tileSize: new google.maps.Size(256, 256),
      // https://code.google.com/p/gmaps-api-issues/issues/detail?id=6191
      maxZoom: 19,
      minZoom: 15
    });

    map.overlayMapTypes.push(crashDataMapType);

    // Map layer of places (min zoom levels)
    var placesMapType = new google.maps.ImageMapType({
      name: 'visionzero_places',
      getTileUrl: function(coord, zoom) {
        function getRandomInt (min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        var subdomains = ['a', 'b', 'c', 'd'];
        return ['http://', subdomains[getRandomInt(0, 3)], '.tiles.mapbox.com/v3/openplans.161VisionZeroPlaces/',
            zoom, '/', coord.x, '/', coord.y, '.png'].join('');
      },
      tileSize: new google.maps.Size(256, 256),
      // https://code.google.com/p/gmaps-api-issues/issues/detail?id=6191
      maxZoom: 15,
      minZoom: 11
    });

    map.overlayMapTypes.push(placesMapType);

    // Interactive tile layer hosted on mapbox.com. NOTE: wax is a DEPRECATED
    // library, but still better for styling+interactivity than Fusion Tables.
    // NOTE, that despite the name, this is just the intersections now.
    wax.tilejson('http://a.tiles.mapbox.com/v3/openplans.161VisionZeroIntersections.json', function(tilejson) {
      map.overlayMapTypes.insertAt(1, new wax.g.connector(tilejson));
      wax.g.interaction()
        .map(map)
        .tilejson(tilejson)
        .on({
          on: function(obj) {
            // On mouse over, including clicks
            map.setOptions({ draggableCursor: 'pointer' });
            if (obj.e.type === 'click' && !preventIntersectionClick) {
              // If not a double click
              if (obj.e.detail === 1) {
                loadStreetView([obj.data.YCOORD, obj.data.XCOORD], obj.data.NodeID_1);
              }
            }
          },
          off: function(evt) {
            // On mouse out
            map.setOptions({ draggableCursor: 'url(http://maps.google.com/mapfiles/openhand.cur), move' });
          }
        });
    });

    // Listen for autocomplete selection
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
      var place = autocomplete.getPlace();
      if (!place.geometry) {
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(16);
      }
    });

    // Change the map instructions based on the zoom level
    // Decide if we should switch to vector markers
    google.maps.event.addListener(map, 'zoom_changed', resetPlaces);

    // Fetch places for this new area
    google.maps.event.addListener(map, 'dragend', resetPlaces);

    // On model add, put a new styled marker on the map
    NS.mapPlaceCollection.on('add', function(model, collection) {
      var geom = model.get('geometry'),
          position = new google.maps.LatLng(geom.coordinates[1], geom.coordinates[0]),
          styleRule = getStyleRule(model.toJSON(), NS.Config.mapPlaceStyles),
          marker;

      // Create and cache the map marker
      if (styleRule && !markers[model.id]) {
        markers[model.id] = new google.maps.Marker({
          position: position,
          map: map,
          icon: styleRule.icon
        });

        // Show a summary info window when the user hovers over the marker for
        // at least 500ms
        google.maps.event.addListener(markers[model.id], 'mouseover', function(evt) {
          // Already planning to show another summary. Cancel it.
          if (summaryWindowTid) {
            clearTimeout(summaryWindowTid);
          }

          if (!streetviewVisible) {
            // Show the summary info window in 500ms
            summaryWindowTid = setTimeout(function() {
              // close the shared window if it's already open
              summaryWindow.close();

              // set the window content
              summaryWindow.setOptions({
                content: NS.Templates['place-summary'](model.toJSON())
              });

              // show the window
              summaryWindow.open(map, markers[model.id]);

              // reset the timeout id
              summaryWindowTid = null;
            }, 500);
          }
        });

        // I moused off a marker before it was shown, so cancel it.
        google.maps.event.addListener(markers[model.id], 'mouseout', function(evt) {
          if (summaryWindowTid) {
            clearTimeout(summaryWindowTid);
          }
        });

        // Focus on the place when it's clicked
        google.maps.event.addListener(markers[model.id], 'click', function(evt) {
          // This doesn't really do anything useful.
          evt.stop();

          // Okay. This is global to app. There's a problem with wax (DEPRECATED)
          // where if I click on a Google Marker that the wax interaction fires
          // too. This is bad because the map marker triggers an action (show
          // the place details) first, but then the interaction triggers its
          // action (reload the Streetview). So, we're setting a global flag
          // that tell the wax click handler whether it should trigger its
          // action. After 350ms, we allow it to work normally.
          preventIntersectionClick = true;
          setTimeout(function() {
            preventIntersectionClick = false;
          }, 350);

          // Show the place details
          NS.router.navigate(model.id.toString(), {trigger: true});
        });
      }
    });

    // The collection was cleared, so clear the markers from the map and cache
    NS.mapPlaceCollection.on('reset', function() {
      _.each(markers, function(marker, key) {
        // from the map
        marker.setMap(null);
        // from the cache
        delete markers[key];
      });
    });

    // A filter was applied to a non-empty collection, so remove the other
    // markers individually
    NS.mapPlaceCollection.on('remove', function(model, collection, options) {
      if (markers[model.id]) {
        markers[model.id].setMap(null);
        delete markers[model.id];
      }
    });

    // Exit button on Street View to dismiss it and return to the map
    $(document).on('click', '.close-streetview-button', function(evt) {
      // Show the map container
      $('.shareabouts-streetview-container').removeClass('active');
      // Empty out the Street View div, for good measure
      $('.shareabouts-streetview').empty();
      $('.shareabouts-intersection-detail').empty();
      // Get rid of the map marker
      NS.currentMarker.setMap(null);
      // Show the map panel
      $('.shareabouts-location-map-container').addClass('active');
      // Resize the map to make sure it's the right size
      resetMap(map);
      // Remove any event handlers - important to prevent zombie street views
      $(NS.streetview).off();
      // Set the flag
      streetviewVisible = false;
    });
  }

  // Ready set go!
  $(function() {
    // Hide all of the interactivity
    if (NS.readonly) {
      $('body').addClass('shareabouts-readonly');
    }

    // Init the map
    initMap();

    // Init interactivity on the place type selector in the place form.
    $(document).on('click', '.place-type-selector', function(evt){
      var $target = $(evt.currentTarget),
          $clicked = $(evt.target).closest('li'),
          isOpen = $target.hasClass('is-open'),
          value = $clicked.attr('data-value'),
          $input = $('[name="location_type"]');

      if(isOpen){
        // Set the value of the hidden input
        $input.val(value);

        // Set the selected type as active
        $target.find('li').removeClass('active');
        $clicked.addClass('active');

        // Close the list
        $target.removeClass('is-open');

        if (value === 'other') {
          $('.type-instructions').addClass('is-hidden');
          $('.other-type-instructions').removeClass('is-hidden');
          $('#place-description').prop('required', true);
          $('label[for="place-description"] small').addClass('is-hidden'); // the '(optional)' text
        } else if (value === 'bike') {
          $('.type-instructions').addClass('is-hidden');
          $('.bike-type-instructions').removeClass('is-hidden');
          $('#place-description').prop('required', true);
          $('label[for="place-description"] small').addClass('is-hidden'); // the '(optional)' text
        } else if (value === 'yield') {
          $('.type-instructions').addClass('is-hidden');
          $('.yield-type-instructions').removeClass('is-hidden');
          $('#place-description').prop('required', true);
          $('label[for="place-description"] small').addClass('is-hidden'); // the '(optional)' text
        } else if (value === 'longcross') {
          $('.type-instructions').addClass('is-hidden');
          $('.longcross-type-instructions').removeClass('is-hidden');
          $('#place-description').prop('required', true);
          $('label[for="place-description"] small').addClass('is-hidden'); // the '(optional)' text
        } else if (value === 'speeding') {
          $('.type-instructions').addClass('is-hidden');
          $('.speeding-type-instructions').removeClass('is-hidden');
          $('#place-description').prop('required', true);
          $('label[for="place-description"] small').addClass('is-hidden'); // the '(optional)' text
        } else if (value === 'visibility') {
          $('.type-instructions').addClass('is-hidden');
          $('.visibility-type-instructions').removeClass('is-hidden');
          $('#place-description').prop('required', true);
          $('label[for="place-description"] small').addClass('is-hidden'); // the '(optional)' text
        } else if (value === 'jaywalking') {
          $('.type-instructions').addClass('is-hidden');
          $('.jaywalking-type-instructions').removeClass('is-hidden');
          $('#place-description').prop('required', true);
          $('label[for="place-description"] small').addClass('is-hidden'); // the '(optional)' text
        } else if (value === 'redlight') {
          $('.type-instructions').addClass('is-hidden');
          $('.redlight-type-instructions').removeClass('is-hidden');
          $('#place-description').prop('required', true);
          $('label[for="place-description"] small').addClass('is-hidden'); // the '(optional)' text
        } else if (value === 'longwait') {
          $('.type-instructions').addClass('is-hidden');
          $('.longwait-type-instructions').removeClass('is-hidden');
          $('#place-description').prop('required', true);
          $('label[for="place-description"] small').addClass('is-hidden'); // the '(optional)' text
        } else if (value === 'doublepark') {
          $('.type-instructions').addClass('is-hidden');
          $('.doublepark-type-instructions').removeClass('is-hidden');
          $('#place-description').prop('required', true);
          $('label[for="place-description"] small').addClass('is-hidden'); // the '(optional)' text
        } else if (value === 'notime') {
          $('.type-instructions').addClass('is-hidden');
          $('.notime-type-instructions').removeClass('is-hidden');
          $('#place-description').prop('required', true);
          $('label[for="place-description"] small').addClass('is-hidden'); // the '(optional)' text
        } else {
          $('.type-instructions').addClass('is-hidden');
          $('#place-description').prop('required', false);
          $('label[for="place-description"] small').removeClass('is-hidden'); // the '(optional)' text
        }

        // Make sure to bring the selector back into view
        $('label[for="place-location_type"]').get(0).scrollIntoView();

      } else {
        $target.addClass('is-open');
      }
    });

    // Init interactivity on the reply link on the place form.
    $(document).on('click', '.reply-link', function(evt) {
      evt.preventDefault();
      $('.survey-comment')
        .focus()
        .get(0).scrollIntoView();
    });

    // Init auth menu toggle
    $(document).on('click', '.shareabouts-auth-button', function(evt) {
      evt.preventDefault();
      $('.shareabouts-auth-menu').toggleClass('is-exposed');
    });

    // Init fullscreen toggle
    $(document).on('click', '.shareabouts-fullscreen-button', function(evt) {
      evt.preventDefault();
      $('body').toggleClass('shareabouts-fullscreen');
      google.maps.event.trigger(NS.map, 'resize');
    });

    // Init click events for location type filtering
    $(document).on('click', '.place-type-li', function(evt) {
      var $this = $(this),
          locationType = $this.attr('data-locationtype'),
          $links = $('.place-type-li');

      $links.removeClass('active');

      if (NS.filter && NS.filter.location_type === locationType) {
        NS.router.navigate('/', {trigger: true});
        return;
      }

      $this.addClass('active');
      NS.router.navigate('filter/'+locationType, {trigger: true});
    });

    NS.auth = new Shareabouts.Auth({
      apiRoot: 'http://data.shareabouts.org/api/v2/',
      successPage: 'success.html',
      errorPage: 'error.html'
    });

    $(NS.auth).on('authsuccess', function(evt, data) {
      currentUser = data;
      if (NS.streetview) {
        NS.streetview.setUser(data);
      }
    });

    NS.auth.initUser();

    // Init the router so we can link to places.
    NS.router = new NS.Router();
    Backbone.history.start({root: window.location.pathname});
  });
}(Shareabouts, jQuery, Shareabouts.Util.console));
