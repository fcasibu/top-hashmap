function HashMap(capacity) {
  const LOAD_FACTOR = 0.75;
  let _buckets = Array.from({ length: capacity }, () => LinkedList());
  let size = 0;

  function set(key, value) {
    const node = getWithCallback(key);

    if (node) {
      node.value = value;
      return;
    }

    const index = getIndexOfKey(key);

    _buckets[index].append(Node(key, value));
    size += 1;

    if (hasHighLoadFactor()) resize();
  }

  function get(key) {
    return getWithCallback(key);
  }

  function has(key) {
    return Boolean(getWithCallback(key));
  }

  function remove(key) {
    return getWithCallback(key, (_, i, bucket) => {
      bucket.remove(i);
      size -= 1;
      return true;
    });
  }

  function clear() {
    _buckets = Array.from({ length: capacity }, () => LinkedList());
    size = 0;
  }

  function keys() {
    return collect((node) => node.key);
  }

  function values() {
    return collect((node) => node.value);
  }

  function entries() {
    return collect((node) => [node.key, node.value]);
  }

  function getWithCallback(key, callback = () => true) {
    const bucket = getBucketOfKey(key);

    if (!bucket) return null;

    const node = bucket.search((currentNode, index) =>
      currentNode.key === key ? callback(currentNode, index, bucket) : null,
    );

    return node;
  }

  function getBucketOfKey(key) {
    return _buckets[getIndexOfKey(key)];
  }

  function getIndexOfKey(key) {
    const index = hash(key);

    if (isOutOfBounds(index))
      throw new Error("Trying to access index out of bound");

    return index;
  }

  function resize() {
    const oldBuckets = _buckets;
    _buckets = Array.from({ length: _buckets.length * 2 }, () => LinkedList());
    const oldSize = size;
    size = 0;

    oldBuckets.forEach((bucket) =>
      bucket?.search((node) => set(node.key, node.value)),
    );
    size = oldSize;
  }

  function collect(callback) {
    const result = [];
    _buckets.forEach((bucket) =>
      bucket?.search((currentNode) => {
        if (currentNode.key) result.push(callback(currentNode));
      }),
    );

    return result;
  }

  function isOutOfBounds(index) {
    return index < 0 || index >= _buckets.length;
  }

  function hasHighLoadFactor() {
    return size / _buckets.length > LOAD_FACTOR;
  }

  // https://theartincode.stanis.me/008-djb2/
  function hash(key) {
    const stringKey = String(key);
    let hash = 5381;

    for (const char of stringKey) {
      hash = (hash * 33) ^ char.charCodeAt(); // https://gist.github.com/eplawless/52813b1d8ad9af510d85?permalink_comment_id=3367765#gistcomment-3367765
    }

    return Math.abs(hash) % _buckets.length;
  }

  return Object.freeze({
    get length() {
      return size;
    },
    get buckets() {
      return _buckets;
    },
    getIndexOfKey,
    set,
    get,
    has,
    remove,
    clear,
    keys,
    values,
    entries,
  });
}
