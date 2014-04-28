persistent-map
==============

> Lightweight map that persists to web storage.

## Build and test

``js
grunt ci
``

## Examples

Create

```js

// create a map that is persisted to key 'my-map' in local storage.
var map = persistantMap.create('my-map');

// create a map that is persisted to key 'my-session-map' in session storage.
var map = persistantMap.create('my-session-map', 'session');
```

Put and get

```js
map.put('foo', 'bar');

map.get('foo');	// 'bar'
```

Remove

```js
map.put('foo', 'bar');

map.remove('foo');

map.get('foo');	// undefined
```

Size

```js
map.put('foo', 'bar');
map.put('hello', 'world');

map.size();	// 2

```

Clear

```js

map.clear();

```


