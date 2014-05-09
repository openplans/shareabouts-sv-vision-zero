/*global Handlebars _ moment */

var Shareabouts = Shareabouts || {};

(function(NS) {

  Handlebars.registerHelper('place_type_label', function(typeName) {
    var placeType = NS.Config.placeTypes[typeName];
    return placeType ? (placeType.label || typeName) : '';
  });

  Handlebars.registerHelper('place_url', function(place_id) {
    var l = window.location,
        protocol = l.protocol,
        host = l.host;

    return [protocol, '//', host, '/place/', place_id].join('');
  });

  Handlebars.registerHelper('fromnow', function(datetime) {
    if (datetime) {
      return moment(datetime).fromNow();
    }
    return '';
  });

}(Shareabouts));