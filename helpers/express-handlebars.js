const handlebarsdata = require('handlebars')


handlebarsdata.registerHelper('eq', function(a, b) {
    return a === b;
});


