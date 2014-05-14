/*globals jQuery, L, google, Handlebars, Spinner, wax, Swag */

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
    }
  };

  function loadStreetView(lat, lng) {
    // Show the streetview container
    $('.shareabouts-streetview-container').addClass('active');
    $('.shareabouts-location-map-container').removeClass('active');

    var sa = new NS.StreetView({
      el: '.shareabouts-streetview',
      map: {
        center: [lat, lng],
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

      datasetUrl: 'http://data.shareabouts.org/api/v2/nycdot/datasets/vz-dev/places',
      addButtonLabel: 'Share an Issue',
      maxDistance: 25,

      // These are template functions that expect geojson.
      templates: {
        'place-summary': Handlebars.compile($('#place-summary').html()),
        'place-detail': Handlebars.compile($('#place-detail').html()),
        'place-form': Handlebars.compile($('#place-form').html()),
        'place-survey': Handlebars.compile($('#place-survey').html()),
        'place-survey-item': Handlebars.compile($('#place-survey-item').html())
      }
    });

    $(sa).on('showplacesurvey', function(evt, view) {
      var spinner = new Spinner(NS.smallSpinnerOptions).spin(view.$('.form-spinner')[0]);
    });
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
              loadStreetView(obj.data.YCOORD, obj.data.XCOORD);
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
  }

  $(function() {
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

    $(document).on('click', '.close-streetview-button', function(evt) {
      // Show the streetview container
      $('.shareabouts-streetview-container').removeClass('active');
      $('.shareabouts-streetview').empty();
      $('.shareabouts-location-map-container').addClass('active');
    });
  });
}(Shareabouts, jQuery));