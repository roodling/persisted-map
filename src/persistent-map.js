(function (global) {

	'use strict';

	var storages = {};

	function serialize(data) {
		return JSON.stringify(data);
	}

	function deserialize(data) {
		return JSON.parse(data);
	}

	['session', 'local'].forEach(function (strategy) {
		storages[strategy] = {
			isSupported: function () {
				return global[strategy + 'Storage'];
			},
			store: function (name, data) {
				data = data || {};
				global[strategy + 'Storage'].setItem(name, serialize(data));
			},
			retrieve: function (name) {
				return deserialize(global[strategy + 'Storage'].getItem(name)) || {};
			}
		};
	});


	var persistentMap = {
		init: function (name, storage) {
			this.storage = storage;
			this.name = name;
		},
		put: function (key, value) {
			var map = this.storage.retrieve(this.name);
			map[key] = value;
			this.storage.store(this.name, map);
		},
		get: function (key) {
			var map = this.storage.retrieve(this.name);
			return map[key];
		},
		size: function () {
			var map = this.storage.retrieve(this.name);
			return Object.keys(map).length;
		},
		remove: function (key) {
			var map = this.storage.retrieve(this.name);
			delete map[key];
			this.storage.store(this.name, map);
		},
		clear: function () {
			this.storage.store(this.name, {});
		}
	};


	global.persistentMap = {
		create: function (name, strategy) {
			if (!name) {
				console.warn('You must provide a name for the map.');
				return;
			}

			strategy = strategy || 'local';

			if (!storages[strategy].isSupported()) {
				console.warn('Web storage "' + strategy + '" is not supported');
				return;
			}
			var map = Object.create(persistentMap);
			map.init(name, storages[strategy]);
			return map;
		}
	};

}(this));
