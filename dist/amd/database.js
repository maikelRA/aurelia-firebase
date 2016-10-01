define(['exports', 'bluebird', 'firebase', 'aurelia-dependency-injection', './configuration'], function (exports, _bluebird, _firebase, _aureliaDependencyInjection, _configuration) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.FirebaseDatabase = undefined;

  var _bluebird2 = _interopRequireDefault(_bluebird);

  var _firebase2 = _interopRequireDefault(_firebase);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
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

  var FirebaseDatabase = exports.FirebaseDatabase = function () {
    function FirebaseDatabase(path, listener, filters) {
      _classCallCheck(this, FirebaseDatabase);

      this._query = null;
      this._queryWithFilters = null;
      this._valueMap = new Map();
      this.isLoading = true;
      this.items = [];

      if (!_aureliaDependencyInjection.Container || !_aureliaDependencyInjection.Container.instance) throw Error('Container has not been made global');
      var config = _aureliaDependencyInjection.Container.instance.get(_configuration.Configuration);
      if (!config) throw Error('Configuration has not been set');

      this._query = new _firebase2.default.database().ref(FirebaseDatabase._getChildLocation(path));

      if (filters) this._queryWithFilters = FirebaseDatabase._setQueryFilters(this._query, filters);

      if (typeof listener === 'undefined' || listener === "on") {
        this._listenToQuery(filters ? this._queryWithFilters : this._query);
      } else {
        this._fetchQuery(filters ? this._queryWithFilters : this._query);
      }
    }

    _createClass(FirebaseDatabase, [{
      key: '_fetchQuery',
      value: function _fetchQuery(query) {
        var _this = this;

        query.once('value', function (snapshot) {
          snapshot.forEach(function (childSnapshot, previousKey) {
            _this._onItemAdded(childSnapshot, previousKey);
          });
        });
      }
    }, {
      key: '_listenToQuery',
      value: function _listenToQuery(query) {
        var _this2 = this;

        query.on('child_added', function (snapshot, previousKey) {
          _this2._onItemAdded(snapshot, previousKey);
        });
        query.on('child_removed', function (snapshot) {
          _this2._onItemRemoved(snapshot);
        });
        query.on('child_changed', function (snapshot, previousKey) {
          _this2._onItemChanged(snapshot, previousKey);
        });
        query.on('child_moved', function (snapshot, previousKey) {
          _this2._onItemMoved(snapshot, previousKey);
        });
      }
    }, {
      key: '_stopListeningToQuery',
      value: function _stopListeningToQuery(query) {
        query.off();
      }
    }, {
      key: '_onItemAdded',
      value: function _onItemAdded(snapshot, previousKey) {
        var value = this._valueFromSnapshot(snapshot);
        var index = previousKey !== null ? this.items.indexOf(this._valueMap.get(previousKey)) + 1 : 0;
        this._valueMap.set(value.__firebaseKey__, value);
        this.items.splice(index, 0, value);
      }
    }, {
      key: '_onItemRemoved',
      value: function _onItemRemoved(oldSnapshot) {
        var key = oldSnapshot.key;
        var value = this._valueMap.get(key);

        if (!value) {
          return;
        }

        var index = this.items.indexOf(value);
        this._valueMap.delete(key);
        if (index !== -1) {
          this.items.splice(index, 1);
        }
      }
    }, {
      key: '_onItemChanged',
      value: function _onItemChanged(snapshot, previousKey) {
        var value = this._valueFromSnapshot(snapshot);
        var oldValue = this._valueMap.get(value.__firebaseKey__);

        if (!oldValue) {
          return;
        }

        this._valueMap.delete(oldValue.__firebaseKey__);
        this._valueMap.set(value.__firebaseKey__, value);
        this.items.splice(this.items.indexOf(oldValue), 1, value);
      }
    }, {
      key: '_onItemMoved',
      value: function _onItemMoved(snapshot, previousKey) {
        var key = snapshot.key;
        var value = this._valueMap.get(key);

        if (!value) {
          return;
        }

        var previousValue = this._valueMap.get(previousKey);
        var newIndex = previousValue !== null ? this.items.indexOf(previousValue) + 1 : 0;
        this.items.splice(this.items.indexOf(value), 1);
        this.items.splice(newIndex, 0, value);
      }
    }, {
      key: '_valueFromSnapshot',
      value: function _valueFromSnapshot(snapshot) {
        var value = snapshot.val();
        if (!(value instanceof Object)) {
          value = {
            value: value,
            __firebasePrimitive__: true
          };
        }
        value.__firebaseKey__ = snapshot.key;
        this.isLoading = false;
        return value;
      }
    }, {
      key: 'add',
      value: function add(item) {
        var _this3 = this;

        return new _bluebird2.default(function (resolve, reject) {
          var query = _this3._query.ref().push();
          query.set(item, function (error) {
            if (error) {
              reject(error);
              return;
            }
            resolve(item);
          });
        });
      }
    }, {
      key: 'remove',
      value: function remove(item) {
        if (item === null || item.__firebaseKey__ === null) {
          return _bluebird2.default.reject({ message: 'Unknown item' });
        }
        return this.removeByKey(item.__firebaseKey__);
      }
    }, {
      key: 'getByKey',
      value: function getByKey(key) {
        return this._valueMap.get(key);
      }
    }, {
      key: 'removeByKey',
      value: function removeByKey(key) {
        var _this4 = this;

        return new _bluebird2.default(function (resolve, reject) {
          _this4._query.ref().child(key).remove(function (error) {
            if (error) {
              reject(error);
              return;
            }
            resolve(key);
          });
        });
      }
    }, {
      key: 'clear',
      value: function clear() {
        var _this5 = this;

        return new _bluebird2.default(function (resolve, reject) {
          var query = _this5._query.ref();
          query.remove(function (error) {
            if (error) {
              reject(error);
              return;
            }
            resolve();
          });
        });
      }
    }], [{
      key: '_getChildLocation',
      value: function _getChildLocation(path) {
        if (!path) {
          return '/';
        }

        return Array.isArray(path) ? path.join('/') : path;
      }
    }, {
      key: '_setQueryFilters',
      value: function _setQueryFilters(query, filters) {
        for (var i = 0, keys = Object.keys(filters); i < keys.length; i++) {
          var currentFilter = keys[i];
          var currentValue = filters[keys[i]];
          query = query[currentFilter](currentValue !== true ? currentValue : '');
        }
        return query;
      }
    }]);

    return FirebaseDatabase;
  }();
});