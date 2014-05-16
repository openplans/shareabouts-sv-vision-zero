/*globals jQuery, L, google, Handlebars, Spinner, wax, Swag, Backbone */

var Shareabouts = Shareabouts || {};

(function(NS, $, console) {
  Swag.registerHelpers();

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
    datasetUrl: 'http://data.shareabouts.org/api/v2/nycdot/datasets/vz/places',
  };

  NS.Router = Backbone.Router.extend({
    routes: {
      ':id': 'showPlace'
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
          loadStreetView([lat, lng], model.get('intersection_id'), model);

        },
        error: function() {
          // No place found for this id, clear the id from the url. No history.
          self.navigate('', {replace: true});
        }
      });
    }
  });


  // Allow an optional parameter for focusing on a place
  function loadStreetView(intersectionLatLng, intersectionId, lookAtPlaceModel) {
    var panoPosition, heading;
    // Show the streetview container
    $('.shareabouts-streetview-container').addClass('active');
    $('.shareabouts-location-map-container').removeClass('active');

    NS.streetview = new NS.StreetView({
      el: '.shareabouts-streetview',
      map: {
        center: intersectionLatLng,
        maxDistance: '100m'
      },
      placeStyles: [
        {
          condition: '"{{location_type}}" == "doublepark"',
          icon: {
            url: 'styles/images/markers/marker-doublepark.png',
            scaledSize: new google.maps.Size(48, 57),
            anchor: new google.maps.Point(24, 48)
          },
          focusIcon: {
            url: 'styles/images/markers/marker-doublepark.png',
            anchor: new google.maps.Point(40, 79)
          }
        },
        {
          condition: '"{{location_type}}" == "jaywalking"',
          icon: {
            url: 'styles/images/markers/marker-jaywalking.png',
            scaledSize: new google.maps.Size(48, 57),
            anchor: new google.maps.Point(24, 48)
          },
          focusIcon: {
            url: 'styles/images/markers/marker-jaywalking.png',
            anchor: new google.maps.Point(40, 79)
          }
        },
        {
          condition: '"{{location_type}}" == "longcross"',
          icon: {
            url: 'styles/images/markers/marker-longcross.png',
            scaledSize: new google.maps.Size(48, 57),
            anchor: new google.maps.Point(24, 48)
          },
          focusIcon: {
            url: 'styles/images/markers/marker-longcross.png',
            anchor: new google.maps.Point(40, 79)
          }
        },
        {
          condition: '"{{location_type}}" == "longwait"',
          icon: {
            url: 'styles/images/markers/marker-longwait.png',
            scaledSize: new google.maps.Size(48, 57),
            anchor: new google.maps.Point(24, 48)
          },
          focusIcon: {
            url: 'styles/images/markers/marker-longwait.png',
            anchor: new google.maps.Point(40, 79)
          }
        },
        {
          condition: '"{{location_type}}" == "notime"',
          icon: {
            url: 'styles/images/markers/marker-notime.png',
            scaledSize: new google.maps.Size(48, 57),
            anchor: new google.maps.Point(24, 48)
          },
          focusIcon: {
            url: 'styles/images/markers/marker-notime.png',
            anchor: new google.maps.Point(40, 79)
          }
        },
        {
          condition: '"{{location_type}}" == "redlight"',
          icon: {
            url: 'styles/images/markers/marker-redlight.png',
            scaledSize: new google.maps.Size(48, 57),
            anchor: new google.maps.Point(24, 48)
          },
          focusIcon: {
            url: 'styles/images/markers/marker-redlight.png',
            anchor: new google.maps.Point(40, 79)
          }
        },
        {
          condition: '"{{location_type}}" == "speeding"',
          icon: {
            url: 'styles/images/markers/marker-speeding.png',
            scaledSize: new google.maps.Size(48, 57),
            anchor: new google.maps.Point(24, 48)
          },
          focusIcon: {
            url: 'styles/images/markers/marker-speeding.png',
            anchor: new google.maps.Point(40, 79)
          }
        },
        {
          condition: '"{{location_type}}" == "visibility"',
          icon: {
            url: 'styles/images/markers/marker-visibility.png',
            scaledSize: new google.maps.Size(48, 57),
            anchor: new google.maps.Point(24, 48)
          },
          focusIcon: {
            url: 'styles/images/markers/marker-visibility.png',
            anchor: new google.maps.Point(40, 79)
          }
        },
        {
          condition: '"{{location_type}}" == "yield"',
          icon: {
            url: 'styles/images/markers/marker-yield.png',
            scaledSize: new google.maps.Size(48, 57),
            anchor: new google.maps.Point(24, 48)
          },
          focusIcon: {
            url: 'styles/images/markers/marker-yield.png',
            anchor: new google.maps.Point(40, 79)
          }
        },
        {
          condition: '"{{location_type}}" == "bike"',
          icon: {
            url: 'styles/images/markers/marker-bike.png',
            scaledSize: new google.maps.Size(48, 57),
            anchor: new google.maps.Point(24, 48)
          },
          focusIcon: {
            url: 'styles/images/markers/marker-bike.png',
            anchor: new google.maps.Point(40, 79)
          }
        },
        {
          condition: '"{{location_type}}" == "other"',
          icon: {
            url: 'styles/images/markers/marker-unknown.png',
            scaledSize: new google.maps.Size(48, 57),
            anchor: new google.maps.Point(24, 48)
          },
          focusIcon: {
            url: 'styles/images/markers/marker-unknown.png',
            anchor: new google.maps.Point(40, 79)
          }
        },
        {
          condition: 'true',
          newIcon: {
            url: 'styles/images/marker-plus-shadowed.png',
            anchor: new google.maps.Point(40, 79)
          }
        }
      ],

      datasetUrl: NS.Config.datasetUrl,
      addButtonLabel: 'Share an Issue',
      maxDistance: 25,

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
          zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
          }
        });

    // Map layer with dangerous cooridors and crashes
    var crashDataMapType = new google.maps.ImageMapType({
      getTileUrl: function(coord, zoom) {
        function getRandomInt (min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        var subdomains = ['a', 'b', 'c', 'd'];
        return ['http://', subdomains[getRandomInt(0, 3)], '.tiles.mapbox.com/v3/openplans.i7opnbif/',
            zoom, '/', coord.x, '/', coord.y, '.png'].join('');
      },
      tileSize: new google.maps.Size(256, 256)
    });

    map.overlayMapTypes.push(crashDataMapType);

    // Interactive tile layer hosted on mapbox.com. NOTE: wax is a DEPRECATED
    // library, but still better for styling+interactivity than Fusion Tables.
    wax.tilejson('http://a.tiles.mapbox.com/v3/openplans.vision-zero-places.json', function(tilejson) {
      map.overlayMapTypes.push(new wax.g.connector(tilejson));
      wax.g.interaction()
        .map(map)
        .tilejson(tilejson)
        .on({
          on: function(obj) {
            // On mouse over, including clicks
            map.setOptions({ draggableCursor: 'pointer' });
            if (obj.e.type === 'click') {
              loadStreetView([obj.data.YCOORD, obj.data.XCOORD], obj.data.NodeID_1);
            }
          },
          off: function(evt) {
            // On mouse out
            map.setOptions({ draggableCursor: 'url(http://maps.google.com/mapfiles/openhand.cur), move' });
          }
        });
    });

    // Change the map instructions based on the zoom level
    google.maps.event.addListener(map, 'zoom_changed', function() {
      $('.zoom-in-msg').toggleClass('is-hidden', (map.getZoom() >= 15));
    });

    // Exit button on Street View to dismiss it and return to the map
    $(document).on('click', '.close-streetview-button', function(evt) {
      // Show the map container
      $('.shareabouts-streetview-container').removeClass('active');
      // Empty out the Street View div, for good measure
      $('.shareabouts-streetview').empty();
      // Show the map panel
      $('.shareabouts-location-map-container').addClass('active');
      // Resize the map to make sure it's the right size
      google.maps.event.trigger(map, 'resize');
      // Remove any event handlers - important to prevent zombie street views
      $(NS.streetview).off();
    });
  }

  // Ready set go!
  $(function() {
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
          $('.other-type-instructions').removeClass('is-hidden');
          $('#place-description').prop('required', true);
          $('label[for="place-description"] small').addClass('is-hidden'); // the '(optional)' text
        } else {
          $('.other-type-instructions').addClass('is-hidden');
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

    // Init the router so we can link to places.
    NS.router = new NS.Router();
    Backbone.history.start({root: window.location.pathname});
  });
}(Shareabouts, jQuery, Shareabouts.Util.console));
