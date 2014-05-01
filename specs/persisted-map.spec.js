describe('persistedMap', function () {

	'use strict';

	beforeEach(function () {
		localStorage.clear();
		sessionStorage.clear();
	});

	describe('factory', function () {
		it('should expose persistedMap on global object', function () {
			expect(persistedMap).to.exist;
		});


		describe('create()', function () {
			it('should create new instance', function () {
				var map = persistedMap.create('test');
				expect(map).to.exist;
			});

			it('should create new instance every time', function () {
				var map1 = persistedMap.create('test');
				var map2 = persistedMap.create('test');
				expect(map1).to.not.equal(map2);
			});
			it('should require key', function () {
				expect(function () {
					persistedMap.create();
				}).to.throw('You must provide key.');
			});
			it('should throw error on unsupported strategy', function () {
				expect(function () {
					persistedMap.create('test', 'unsupported');
				}).to.throw('Web storage "unsupported" is not supported.');
			});
		});
	});

	describe('map operations', function () {

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
			},
			getKeys: function () {
				return this.items.map(function (item) {
					return item.key;

				});
			}

		};


		describe('put() and get()', function () {
			var map;
			beforeEach(function () {
				map = persistedMap.create('test');
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
				var map = persistedMap.create('test');
				testHelper.putAll(map);
				expect(map.size()).to.equal(testHelper.items.length);
			});
		});

		describe('remove()', function () {
			var map;
			beforeEach(function () {
				map = persistedMap.create('test');
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
				var map = persistedMap.create('test');
				testHelper.putAll(map);
				map.clear();
				testHelper.assertAllRemoved(map);
			});
		});

		describe('keys()', function () {
			var map;
			beforeEach(function () {
				map = persistedMap.create('test');
			});
			it('should return empty keys', function () {
				var keys = map.keys();
				expect(keys.length).to.equal(0);
			});

			it('should return all keys', function () {
				testHelper.putAll(map);
				var keys = map.keys();
				var testDataKeys = testHelper.getKeys();
				testDataKeys.forEach(function (key){
					expect(keys).to.contain(key);
				});
			});
		});

	});

	describe('expiry', function () {
		describe('global exiry', function () {

			it('should return values which has not expired', function () {

				var map = persistedMap.create('test-local-expiry', 'local', 1000 * 10); // expire in ten seconds
				map.put('foo', 'bar');
				expect(map.get('foo')).to.equal('bar');
			});

			it('should expiry items after expiry', function () {

				var map = persistedMap.create('test-local-expiry', 'local', 1000 * 60 * 10); // expire in ten minutes
				map.put('foo', 'bar');
				var clock = sinon.useFakeTimers(Date.now());

				clock.tick(1000 * 60 * 9); // tick 9 minutes
				expect(map.get('foo')).to.equal('bar'); // still there

				clock.tick(1000 * 60 * 2); // tick 2 minutes
				expect(map.get('foo')).to.be.undefined; // should have expired

				clock.restore();
			});

			it('should never expire if expiry value not provided', function () {

				var clock = sinon.useFakeTimers(0); // set Date.now() to beginning of time
				var map = persistedMap.create('test-local-expiry', 'local'); // expire in ten seconds
				map.put('foo', 'bar');
				clock.restore(); // reset to today

				expect(map.get('foo')).to.equal('bar');

			});
			it('should not return expired values', function () {

				var map = persistedMap.create('test-local-expiry', 'local', -1000); // expired one second ago
				map.put('foo', 'bar');
				expect(map.get('foo')).to.be.undefined;
			});


		});

		describe('expiry per entry', function () {
			it('should expiry', function () {
				var map = persistedMap.create('test');
				map.put('expiryMe', 'nooo',1000 * 60 * 5); // expiry in 5 minutes
				map.put('keepMe', 'phew');
				var clock = sinon.useFakeTimers(Date.now());
				clock.tick(1000 * 60 * 10); // tick 10 minutes
				expect(map.get('expiryMe')).to.be.undefined;
				expect(map.get('keepMe')).to.equal('phew');
			});
		});

	});
	describe('DOM storage', function () {
		it('should store to session storage on configured name', function () {
			var map = persistedMap.create('test-session-storage', 'session');
			map.put('foo', 'bar');

			var stored = JSON.parse(sessionStorage.getItem('test-session-storage'));
			expect(stored['foo'].value).to.equal('bar');
		});

		it('should store to local storage on configured name', function () {
			var map = persistedMap.create('test-local-storage', 'local');
			map.put('foo', 'bar');

			var stored = JSON.parse(localStorage.getItem('test-local-storage'));
			expect(stored['foo'].value).to.equal('bar');
		});
	});


});


