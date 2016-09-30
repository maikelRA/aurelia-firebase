'use strict';

System.register([], function (_export, _context) {
  "use strict";

  var _createClass, ConfigurationDefaults, Configuration;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('ConfigurationDefaults', ConfigurationDefaults = function ConfigurationDefaults() {
        _classCallCheck(this, ConfigurationDefaults);
      });

      _export('ConfigurationDefaults', ConfigurationDefaults);

      ConfigurationDefaults._defaults = {
        apiKey: null,
        authDomain: null,
        databaseURL: null,
        monitorAuthChange: false
      };

      ConfigurationDefaults.defaults = function () {
        var defaults = {};
        Object.assign(defaults, ConfigurationDefaults._defaults);
        return defaults;
      };

      _export('Configuration', Configuration = function () {
        function Configuration(innerConfig) {
          _classCallCheck(this, Configuration);

          this.innerConfig = innerConfig;
          this.values = this.innerConfig ? {} : ConfigurationDefaults.defaults();
        }

        _createClass(Configuration, [{
          key: 'getValue',
          value: function getValue(identifier) {
            if (this.values.hasOwnProperty(identifier) !== null && this.values[identifier] !== undefined) {
              return this.values[identifier];
            }
            if (this.innerConfig !== null) {
              return this.innerConfig.getValue(identifier);
            }
            throw new Error('Config not found: ' + identifier);
          }
        }, {
          key: 'setValue',
          value: function setValue(identifier, value) {
            this.values[identifier] = value;
            return this;
          }
        }, {
          key: 'getApiKey',
          value: function getApiKey() {
            return this.getValue('apiKey');
          }
        }, {
          key: 'setApiKey',
          value: function setApiKey(apiKey) {
            return this.setValue('apiKey', apiKey);
          }
        }, {
          key: 'getAuthDomain',
          value: function getAuthDomain() {
            return this.getValue('authDomain');
          }
        }, {
          key: 'setAuthDomain',
          value: function setAuthDomain(authDomain) {
            return this.setValue('authDomain', authDomain);
          }
        }, {
          key: 'getDatabaseURL',
          value: function getDatabaseURL() {
            return this.getValue('databaseURL');
          }
        }, {
          key: 'setDatabaseURL',
          value: function setDatabaseURL(databaseURL) {
            return this.setValue('databaseURL', databaseURL);
          }
        }, {
          key: 'getMonitorAuthChange',
          value: function getMonitorAuthChange() {
            return this.getValue('monitorAuthChange');
          }
        }, {
          key: 'setMonitorAuthChange',
          value: function setMonitorAuthChange() {
            var monitorAuthChange = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            return this.setValue('monitorAuthChange', monitorAuthChange === true);
          }
        }, {
          key: 'initialize',
          value: function initialize() {
            if (!this.values.apiKey && (!this.values.authDomain || this.values.databaseURL)) {
              throw Error('Configuration has not been set');
            } else {
              firebase.initializeApp(this.values);
            }
          }
        }]);

        return Configuration;
      }());

      _export('Configuration', Configuration);
    }
  };
});