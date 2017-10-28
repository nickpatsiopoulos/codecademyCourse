var yaml = require('js-yaml');

const testDogDB = {
  breed: "dachshund",
  sex: "male"
  fixed: true
};

yaml.safeDump (object, {
  'styles': {
    '!!null': 'canonical' // dump null as ~
  },
  'sortKeys': true        // sort object keys
});
