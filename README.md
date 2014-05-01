# persisted-map

> Lightweight map that persists to web storage.


## Examples

Creating

```js

// persisted to local storage under key 'my-map'
var map = persistedMap.create('my-map');

// persisted to session storage
var map = persistedMap.create('my-map', 'session');

// expire entries in 10 minutes
var map = persistedMap.create('my-map', 'local', 10*60*1000);

```

Operations

```js

map.put('foo', 'bar');
map.put('hello', 'world');

map.get('foo');		// 'bar'
map.get('hello');	// 'world'

map.size();			// 2

map.keys();			// ["foo", "hello"]

map.remove('foo');

map.clear();

map.put('expireMe', 'noo', 5*60*1000);	// expiry entry in 5 minutes


```


## Installation

  With [bower](http://bower.io):

    $ bower install [to be added]

  With a stand-alone build:

    <script src='persisted.map.min.js'></script>



## Running tests and build

  Install dependencies:

     $ npm install

  Run all tests and build once:

    $ grunt ci

  Development mode:

    $ grunt test-server

    $ grunt develop


## License

  MIT



