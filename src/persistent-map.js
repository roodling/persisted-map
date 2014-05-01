(function (global, persistedItem, persistedMap) {

	'use strict';

	var modules = {
		global: global
	};

	persistedItem(modules, modules.persistedItem = {});
	persistedMap(modules, global.persistedMap = modules.persistedMap = {});

}(this, function (modules, exports) {


	'use strict';

	var global = modules.global;

	function serialize(data) {
		return JSON.stringify(data);
	}

	function deserialize(data) {
		return JSON.parse(data);
	}

	function getStorage(strategy) {
		return global[strategy + 'Storage'];
	}

	function isSupported(strategy) {
		return !!getStorage(strategy);
	}

	function retrieve(strategy, key) {
		var storage = getStorage(strategy);
		return deserialize(storage.getItem(key)) || {};
	}

	function store(strategy, key, data) {
		var storage = getStorage(strategy);
		storage.setItem(key, serialize(data));
	}

	function clear(strategy, key) {
		var storage = getStorage(strategy);
		storage.removeItem(key);
	}

	var persistedItem = {
		init: function (strategy, key) {
			this.strategy = strategy;
			this.key = key;
		},
		retrieve: function () {
			return retrieve(this.strategy, this.key);
		},
		store: function (data) {
			store(this.strategy, this.key, data);
		},
		clear: function () {
			clear(this.strategy, this.key);
		}

	};

	exports.create = function (strategy, key) {
		if (isSupported(strategy)) {
			var item = Object.create(persistedItem);
			item.init(strategy, key);
			return item;
		}

	};


}, function (modules, exports) {

	'use strict';

	var persistedItem = modules.persistedItem;

	function hasEntryExpired(entry) {
		return entry && entry.expiry && entry.expiry < Date.now();
	}

	function createEntry(value, expiry) {
		return {
			expiry: Date.now() + expiry,
			value: value
		};
	}

	var persistedMap = {
		init: function (persistedItem, expiry) {
			this.peristedItem = persistedItem;
			this.expiry = expiry;
		},

		put: function (key, value, expiry) {
			expiry = expiry || this.expiry;
			var map = this.peristedItem.retrieve();
			map[key] = createEntry(value, expiry);
			this.peristedItem.store(map);
		},
		get: function (key) {
			var map = this.peristedItem.retrieve();
			var entry = map[key];

			if (hasEntryExpired(entry)) {
				this.remove(key);
				return;
			}

			return entry && entry.value;
		},
		size: function () {
			return this.keys().length;
		},
		remove: function (key) {
			var map = this.peristedItem.retrieve();
			delete map[key];
			this.peristedItem.store(map);
		},
		clear: function () {
			this.peristedItem.clear();
		},
		keys: function () {
			var map = this.peristedItem.retrieve();
			return Object.keys(map);
		}
	};


	exports.create = function (key, strategy, expiry) {
		var map;
		var item;

		if (!key) {
			throw new Error('You must provide key.');
		}

		item = persistedItem.create(strategy || 'local', key);

		if (!item) {
			throw new Error('Web storage "' + strategy + '" is not supported.');
		}

		map = Object.create(persistedMap);
		map.init(item, expiry);

		return map;
	};


}));
