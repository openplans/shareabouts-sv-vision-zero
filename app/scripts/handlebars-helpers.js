/*global Handlebars _ moment */

var Shareabouts = Shareabouts || {};

(function(NS) {

  Handlebars.registerHelper('place_type_label', function(typeName) {
    var placeType = NS.Config.placeTypes[typeName];
    return placeType ? (placeType.label || typeName) : '';
  });

}(Shareabouts));