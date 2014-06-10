/*global Handlebars _ moment */

var Shareabouts = Shareabouts || {};

(function(NS) {

  Handlebars.registerHelper('place_type_label', function(typeName) {
    var placeType = NS.Config.placeTypes[typeName];
    return placeType ? (placeType.label || typeName) : '';
  });

  Handlebars.registerHelper('user_token', function(typeName) {
    return NS.auth.getUserToken();
  });

  Handlebars.registerHelper('has_user_submitted', function(collection, options) {
    var userToken = NS.auth.getUserToken(),
        userSubmission = _.find(collection, function(model) { return model.user_token === userToken; });

    return (!!userSubmission ? options.fn(this) : options.inverse(this));
  })

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

  Handlebars.registerHelper('intersection_info', function() {
    return format_intersection_data(this);
  });

  Handlebars.registerHelper('if_crash_data', function(options) {
    if (this['P_Inj'] != 0 ||
        this['B_Inj'] != 0 ||
        this['M_Inj'] != 0 ||
        this['P_Sev'] != 0 ||
        this['B_Sev'] != 0 ||
        this['M_Sev'] != 0 ||
        this['P_Fat'] != 0 ||
        this['B_Fat'] != 0 ||
        this['M_Fat'] != 0) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  })

  // =====================================================================
  // The following were translated from Python. The original script is at:
  // https://gist.github.com/fitnr/ef8c05e9e5a854bb7fba

  function write_highcrash(street, borough, class_, undefined) {
    // TODO: precompile this template with all the rest.
    var highcrash = "{{street}} is a pedestrian high crash corridor ({{class}} for pedestrian deaths and serious injuries per mile in {{borough}})";
    var template;

    if (class_ === '' || class_ === ' ' || class_ === undefined) {
      return "";
    }

    context = {
      "street": street,
      "class": class_.toLowerCase(),
      "borough": borough
    }

    if (context['class'].indexOf('top') > -1) {
      template = Handlebars.compile(highcrash);
    } else {
      return "";
    }

    return template(context);
  }


  function write_stats(intersection, fatal, injuries, severe) {
    var deaths, conjuct;

    var phrase = "At {{intersection}} between 2008 and 2012, traffic crashes caused{{deaths}}{{conjuct}}{{injuries}}{{severe}}."
    var severe_clause = ""

    // Do nothing
    if (fatal === 0 && injuries === 0) {
      return '';
    }

    // fatalities
    if (fatal == 0) {
      deaths = "";
    } else if (fatal === 1) {
      deaths = " one death";
    } else {
      deaths = " " + fatal + " deaths";
    }

    if (fatal > 0 && injuries > 0){
      conjuct = " and";
    } else {
      conjuct = "";
    }

    // injuries
    if (injuries === 0) {
      injuries = severe_clause = "";
    }

    else if (injuries === 1) {
      injuries = " one injury";

      if (severe === 1) {
        severe_clause = ", which was severe";
      }

    } else {
      injuries = " " + injuries + " injuries"

      if (severe === 0) {
        ;
      } else if (severe === injuries) {
        severe_clause = ", all of which were severe";
      } else {
        severe_clause = ", " + severe + " of which were severe";
      }
    }

    // TODO: precompile this template with all the rest.
    var template = Handlebars.compile(phrase);
    return template({
      intersection: intersection,
      deaths: deaths,
      conjuct: conjuct,
      injuries: injuries,
      severe: severe_clause
    });
  }


  function format_intersection_data(data) {
    var mainstreet = data['P_HCC_STREETNAME'];
    var borough = data['borough'];
    var class_ = data['P_HCC_CLASS'];

    // Is this a high crash corridor? write the text
    var hcc_text = write_highcrash(mainstreet, borough, class_)

    return hcc_text
  }

}(Shareabouts));
