/*globals jQuery L */

var Shareabouts = Shareabouts || {};

(function(NS, $) {

  // var $map = $('.shareabouts-streetview-map'),
  //     map = L.mapbox.map($map.get(0), 'examples.map-9ijuk24y')
  //       .setView([40.719941, -73.996010], 14),

  //     intersectionTiles = L.mapbox.tileLayer('openplans.nyc-intersections').addTo(map),
  //     intersectionGridLayer = L.mapbox.gridLayer('openplans.nyc-intersections').addTo(map);

  // intersectionGridLayer.on('click', function() {
  //   console.log(arguments);
  // });

      Shareabouts = Shareabouts || {};

      Shareabouts.smallSpinnerOptions = {
        lines: 13, length: 0, width: 3, radius: 10, corners: 1, rotate: 0,
        direction: 1, color: '#000', speed: 1, trail: 60, shadow: false,
        hwaccel: false, className: 'spinner', zIndex: 2e9, top: 'auto',
        left: 'auto'
      };

      Shareabouts.Config = {
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
      }

      function loadStreetView(lat, lng) {
        var sa = new Shareabouts.StreetView({
          el: '.shareabouts-streetview',
          map: {
            center: [lat, lng],
            maxDistance: '100m'
          },
          placeStyles: [
            {
              condition: '"{{location_type}}" == "doublepark"',
              icon: {
                url: 'styles/images/markers/marker-doublepark.png'
              },
              focusIcon: {
                url: 'styles/images/markers/marker-doublepark.png',
                scaledSize: new google.maps.Size(81, 120)
              }
            },
            {
              condition: '"{{location_type}}" == "jaywalking"',
              icon: {
                url: 'styles/images/markers/marker-jaywalking.png'
              },
              focusIcon: {
                url: 'styles/images/markers/marker-jaywalking.png',
                scaledSize: new google.maps.Size(81, 120)
              }
            },
            {
              condition: '"{{location_type}}" == "longcross"',
              icon: {
                url: 'styles/images/markers/marker-longcross.png'
              },
              focusIcon: {
                url: 'styles/images/markers/marker-longcross.png',
                scaledSize: new google.maps.Size(81, 120)
              }
            },
            {
              condition: '"{{location_type}}" == "longwait"',
              icon: {
                url: 'styles/images/markers/marker-longwait.png'
              },
              focusIcon: {
                url: 'styles/images/markers/marker-longwait.png',
                scaledSize: new google.maps.Size(81, 120)
              }
            },
            {
              condition: '"{{location_type}}" == "notime"',
              icon: {
                url: 'styles/images/markers/marker-notime.png'
              },
              focusIcon: {
                url: 'styles/images/markers/marker-notime.png',
                scaledSize: new google.maps.Size(81, 120)
              }
            },
            {
              condition: '"{{location_type}}" == "redlight"',
              icon: {
                url: 'styles/images/markers/marker-redlight.png'
              },
              focusIcon: {
                url: 'styles/images/markers/marker-redlight.png',
                scaledSize: new google.maps.Size(81, 120)
              }
            },
            {
              condition: '"{{location_type}}" == "speeding"',
              icon: {
                url: 'styles/images/markers/marker-speeding.png'
              },
              focusIcon: {
                url: 'styles/images/markers/marker-speeding.png',
                scaledSize: new google.maps.Size(81, 120)
              }
            },
            {
              condition: '"{{location_type}}" == "visibility"',
              icon: {
                url: 'styles/images/markers/marker-visibility.png'
              },
              focusIcon: {
                url: 'styles/images/markers/marker-visibility.png',
                scaledSize: new google.maps.Size(81, 120)
              }
            },
            {
              condition: '"{{location_type}}" == "yield"',
              icon: {
                url: 'styles/images/markers/marker-yield.png'
              },
              focusIcon: {
                url: 'styles/images/markers/marker-yield.png',
                scaledSize: new google.maps.Size(81, 120)
              }
            },
            {
              condition: '"{{location_type}}" == "bike"',
              icon: {
                url: 'styles/images/markers/marker-bike.png'
              },
              focusIcon: {
                url: 'styles/images/markers/marker-bike.png',
                scaledSize: new google.maps.Size(81, 120)
              }
            },
            {
              condition: '"{{location_type}}" == "other"',
              icon: {
                url: 'styles/images/markers/marker-unknown.png'
              },
              focusIcon: {
                url: 'styles/images/markers/marker-unknown.png',
                scaledSize: new google.maps.Size(81, 120)
              }
            },
            {
              condition: 'true',
              newIcon: {
                url: 'styles/images/marker-plus-shadowed.png',
                anchor: new google.maps.Point(42, 80)
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
          spinner = new Spinner(Shareabouts.smallSpinnerOptions).spin(view.$('.form-spinner')[0]);
        })
      }

      loadStreetView(40.7210690835, -73.9981985092);

  $(document).delegate('.place-type-selector','click',function(evt){
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


      // Make a new map, and recenter when we click.
      map = L.map($('.shareabouts-location-map').get(0), {center: [40.7210690835, -73.9981985092], zoom: 14});
      layerOptions = {
        url: 'http://{s}.tiles.mapbox.com/v3/openplans.map-dmar86ym/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors, CC-BY-SA. <a href="http://mapbox.com/about/maps" target="_blank">Terms &amp; Feedback</a>'
      };
      L.tileLayer(layerOptions.url, layerOptions).addTo(map);

      map.on('click', function(evt) {
        var lat = evt.latlng.lat,
            lng = evt.latlng.lng;

        loadStreetView(lat, lng);
      })


}(Shareabouts, jQuery));