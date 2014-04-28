describe('persistentMap', function () {

	'use strict';

	describe('basic map behavior', function () {


		it('should expose persistentMap on global object', function () {
			expect(persistentMap).to.exist;
		});


		describe('create()', function () {
			it('should create new instance', function () {
				var map = persistentMap.create('test');
				expect(map).to.exist;
			});

			it('should create new instance every time', function () {
				var map1 = persistentMap.create('test');
				var map2 = persistentMap.create('test');
				expect(map1).to.not.equal(map2);
			});
		});


		var testHelper = {
			items: [

				// numbers
				{key: 'one', value: 1},
				{key: 'two', value: 2},
				{key: 'three', value: 3},
				{key: 'four', value: 4},


				//string
				{key: 'foo', value: 'bar'},
				{key: 'hello', value: 'world'},

				//objects
				{key: 'obj1', value: {name: 'test'}},
				{key: 'obj2', value: {nr: 10}}


			],
			putAll: function (map) {
				this.items.forEach(function (item) {
					map.put(item.key, item.value);
				});
			},
			removeAll: function (map) {
				this.items.forEach(function (item) {
					map.remove(item.key);
				});
			},
			assertAllPut: function (map) {
				this.items.forEach(function (item) {
					expect(map.get(item.key)).to.deep.equal(item.value);
				});
			},
			assertAllRemoved: function (map) {
				this.items.forEach(function (item) {
					expect(map.get(item.key)).to.be.undefined;
				});
			}

		};


		describe('put() and get()', function () {
			var map;
			beforeEach(function () {
				map = persistentMap.create('test');
			});

			testHelper.items.forEach(function (item) {
				it('should return stored value for [' + item.key + '=' + item.value + '}]', function () {
					var key = item.key;
					var value = item.value;
					map.put(key, value);
					expect(map.get(key)).to.deep.equal(value);
				});
			});
			it('should return stored values for batch', function () {
				testHelper.putAll(map);
				testHelper.assertAllPut(map);
			});

		});


		describe('size()', function () {
			it('should return correct size', function () {
				var map = persistentMap.create('test');
				testHelper.putAll(map);
				expect(map.size()).to.equal(testHelper.items.length);
			});
		});

		describe('remove()', function () {
			var map;
			beforeEach(function () {
				map = persistentMap.create('test');
			});

			it('should remove stored value', function () {

				map.put('foo', 'bar');
				expect(map.get('foo')).to.deep.equal('bar');
				map.remove('foo');
				expect(map.get('foo')).to.be.undefined;
			});

			it('should remove stored value for batch', function () {
				testHelper.putAll(map);
				testHelper.assertAllPut(map);
				testHelper.removeAll(map);
				testHelper.assertAllRemoved(map);
			});
		});

		describe('clear()', function () {
			it('should remove all values', function () {
				var map = persistentMap.create('test');
				testHelper.putAll(map);
				map.clear();
				testHelper.assertAllRemoved(map);
			});
		});

	});

	describe('DOM storage', function () {
		it('should store to session storage on configured name', function () {
			var map = persistentMap.create('test-session-storage', 'session');
			map.put('foo', 'bar');

			var stored = JSON.parse(sessionStorage.getItem('test-session-storage'));
			expect(stored['foo']).to.equal('bar');
		});

		it('should store to local storage on configured name', function () {
			var map = persistentMap.create('test-local-storage', 'local');
			map.put('foo', 'bar');

			var stored = JSON.parse(localStorage.getItem('test-local-storage'));
			console.log('stored', stored);
			expect(stored['foo']).to.equal('bar');
		});
	});


});


