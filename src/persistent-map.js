(function (global, webStorageFactory, mapFactory) {
	'use strict';
	global.persistentMap = mapFactory(webStorageFactory(global));
}(this, function (global) {

	'use strict';

	function serialize(data) {
		return JSON.stringify(data);
	}

	function deserialize(data) {
		return JSON.parse(data);
	}

	var storages = ['session', 'local'].reduce(function (storages, strategy) {

		var storage = window[strategy + 'Storage'];

		storages[strategy] = {
			isSupported: function () {
				return !!storage;
			},
			store: function (key, data) {
				data = data || {};
				storage.setItem(key, serialize(data));
			},
			retrieve: function (key) {
				return deserialize(storage.getItem(key)) || {};
			},
			remove: function (key) {
				storage.removeItem(key);
			}

		};

		return storages;

	}, {});

	return {
		getStorage: function (strategy) {
			return storages[strategy];
		}
	};

}, function (webStorage) {

	'use strict';

	function hasExpired(item) {
		return item && item.expiry && item.expiry < Date.now();
	}

	function createItem(value, expiry) {
		return {
			expiry: Date.now() + expiry,
			value: value
		};
	}

	function getMap(storage, key) {
		return storage.retrieve(key);
	}

	function setMap(storage, key, map) {
		return storage.store(key, map);
	}
	function clearMap(storage, key) {
		return storage.remove(key);
	}

	var persistentMap = {
		init: function (mapKey, storage, expiry) {
			this.storage = storage;
			this.mapKey = mapKey;
			this.expiry = expiry;
		},
		put: function (key, value) {
			var map = getMap(this.storage, this.mapKey);
			map[key] = createItem(value, this.expiry);
			this.storage.store(this.mapKey, map);
		},
		get: function (key) {
			var map = getMap(this.storage, this.mapKey);

			var item = map[key];

			if (hasExpired(item)) {
				this.remove(key);
				return;
			}

			return item && item.value;
		},
		size: function () {
			var map = getMap(this.storage, this.mapKey);
			return Object.keys(map).length;
		},
		remove: function (key) {
			var map = getMap(this.storage, this.mapKey);
			delete map[key];
			setMap(this.storage, this.mapKey, map);
		},
		clear: function () {
			clearMap(this.storage, this.mapKey);
		}
	};


	return {
		create: function (key, strategy, expiry) {
			if (!key) {
				console.warn('You must provide key.');
				return;
			}

			var storage = webStorage.getStorage(strategy || 'local');

			if (!storage || !storage.isSupported()) {
				console.warn('Web storage "' + strategy + '" is not supported');
				return;
			}

			var map = Object.create(persistentMap);
			map.init(key, storage, expiry);
			return map;
		}
	};


}));
