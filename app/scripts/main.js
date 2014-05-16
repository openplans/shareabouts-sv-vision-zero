/*globals jQuery, L, google, Handlebars, Spinner, wax, Swag, Backbone */

var Shareabouts = Shareabouts || {};

(function(NS, $) {
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
    datasetUrl: 'http://data.shareabouts.org/api/v2/nycdot/datasets/vz-dev/places',
  };

  NS.Router = Backbone.Router.extend({
    routes: {
      ':id': 'showPlace'
    },

    showPlace: function(id) {
      var placeModel = new NS.PlaceModel({id: id});
      placeModel.urlRoot = NS.Config.datasetUrl;

      placeModel.fetch({
        success: function(model, response, options) {
          loadStreetView([model.get('intersection_lat'),
            model.get('intersection_lng')], model.get('intersection_id'),
            model);
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

    $(NS.streetview).on('showplace', function(evt, view) {
      NS.router.navigate(view.model.id.toString());
    });

    $(NS.streetview).on('closeplace', function(evt, view) {
      NS.router.navigate('');
    });

    $(NS.streetview).on('showplacesurvey', function(evt, view) {
      var spinner = new Spinner(NS.smallSpinnerOptions).spin(view.$('.form-spinner')[0]);
    });

    $(NS.streetview).on('showplaceform', function(evt, view) {
      // Set the intersection information on the form when it is shown
      view.$('[name="intersection_id"]').val(intersectionId);
      view.$('[name="intersection_lat"]').val(intersectionLatLng[0]);
      view.$('[name="intersection_lng"]').val(intersectionLatLng[1]);
    });

    if (lookAtPlaceModel) {
      // origin
      panoPosition = NS.streetview.panorama.getPosition();
      // from the origin to the place
      heading = google.maps.geometry.spherical.computeHeading(panoPosition,
        new google.maps.LatLng(lookAtPlaceModel.get('geometry').coordinates[1],
          lookAtPlaceModel.get('geometry').coordinates[0]));

      // look at the place
      NS.streetview.panorama.setPov({heading: heading, pitch: NS.streetview.panorama.getPov().pitch});
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

    wax.tilejson('http://a.tiles.mapbox.com/v3/openplans.vision-zero-places.json', function(tilejson) {
      map.overlayMapTypes.push(new wax.g.connector(tilejson));
      wax.g.interaction()
        .map(map)
        .tilejson(tilejson)
        .on({
          on: function(obj) {
            map.setOptions({ draggableCursor: 'pointer' });
            if (obj.e.type === 'click') {
              loadStreetView([obj.data.YCOORD, obj.data.XCOORD], obj.data.NodeID_1);
            }
          },
          off: function(evt) {
            map.setOptions({ draggableCursor: 'url(http://maps.google.com/mapfiles/openhand.cur), move' });
          }
        });
    });

    google.maps.event.addListener(map, 'zoom_changed', function() {
      $('.zoom-in-msg').toggleClass('is-hidden', (map.getZoom() >= 15));
    });

    $(document).on('click', '.close-streetview-button', function(evt) {
      // Show the map container
      $('.shareabouts-streetview-container').removeClass('active');
      $('.shareabouts-streetview').empty();
      $('.shareabouts-location-map-container').addClass('active');
      // Resize the map to make sure it's the right size
      google.maps.event.trigger(map, 'resize');

      // Remove any event handlers
      $(NS.streetview).off();
    });
  }

  function initUser() {
    $.ajax({
      url: 'http://data.shareabouts.org/api/v2/users/current',
      xhrFields: {
        withCredentials: true
      },
      success: function(userData) {
        if (userData) {
          console.log(userData);
          $('.shareabouts-authentication').html('<a href="http://data.shareabouts.org/api/v2/users/logout/">Log Out</a>');
        } else {
          console.log('No user data');
        }
      }
    });
  };

  $(function() {
    initUser();
    initMap();

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

    $(document).on('click', '.reply-link', function(evt) {
      evt.preventDefault();
      $('.survey-comment')
        .focus()
        .get(0).scrollIntoView();
    });

    NS.router = new NS.Router();
    Backbone.history.start({root: window.location.pathname});
  });
}(Shareabouts, jQuery));