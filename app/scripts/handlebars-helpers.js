/*global Handlebars _ moment */

var Shareabouts = Shareabouts || {};

(function(NS) {

  Handlebars.registerHelper('place_type_label', function(typeName) {
    var placeType = NS.Config.placeTypes[typeName];
    return placeType ? (placeType.label || typeName) : '';
  });

  Handlebars.registerHelper('window_location', function(place_id) {
    return window.location;
  });

  Handlebars.registerHelper('place_url', function(place_id, encode, options) {
    var l = window.location,
        url = [l.protocol, '//', l.host, l.pathname, '#', place_id].join('');

    if (!options) {
      options = encode;
      encode = false;
    }

    if (encode) {
      return encodeURIComponent(url);
    }
    return url;
  });

  Handlebars.registerHelper('fromnow', function(datetime) {
    if (datetime) {
      return moment(datetime).fromNow();
    }
    return '';
  });

  Handlebars.registerHelper('debug', function(value) {
    if (typeof(value) === typeof({})) {
      return JSON.stringify(value, null, 4);
    } else {
      return value;
    }
  });

}(Shareabouts));