const { LinkedList, Node } = require("./linked-list");

function HashSet(capacity) {
  const LOAD_FACTOR = 0.75;
  let buckets = Array(capacity);
  let size = 0;

  function add(key) {
    if (has(key)) return;

    const index = getIndexOfKey(key);

    buckets[index] ??= LinkedList();
    buckets[index].append(Node(key, null));
    size += 1;

    if (hasHighLoadFactor()) resize();
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
    buckets = Array(capacity);
    size = 0;
  }

  function keys() {
    return collect((node) => node.key);
  }

  function getWithCallback(key, callback = () => true) {
    const bucket = getBucketOfKey(key);

    if (!bucket) return null;

    const node = bucket.seacrh((currentNode, index) =>
      currentNode.key === key ? callback(currentNode, index, bucket) : null,
    );

    return node;
  }

  function getBucketOfKey(key) {
    return buckets[getIndexOfKey(key)];
  }

  function getIndexOfKey(key) {
    const index = hash(key);

    if (isOutOfBounds(index))
      throw new Error("Trying to access index out of bound");

    return index;
  }

  function resize() {
    const oldBuckets = buckets;
    buckets = Array(buckets.length * 2);
    size = 0;

    oldBuckets.forEach((bucket) => bucket?.search((node) => add(node.key)));
  }

  function collect(callback) {
    const result = [];
    buckets.forEach((bucket) =>
      bucket?.search((currentNode) => {
        if (currentNode.key) result.push(callback(currentNode));
      }),
    );

    return result;
  }

  function isOutOfBounds(index) {
    return index < 0 || index >= buckets.length;
  }

  function hasHighLoadFactor() {
    return size / buckets.length > LOAD_FACTOR;
  }

  function hash(key) {
    const stringKey = String(key);
    let hash = 5381;

    for (const char of stringKey) {
      hash = (hash * 33) ^ char.charCodeAt(); // https://gist.github.com/eplawless/52813b1d8ad9af510d85?permalink_comment_id=3367765#gistcomment-3367765
    }

    return Math.abs(hash) % buckets.length;
  }

  return Object.freeze({
    get length() {
      return size;
    },
    add,
    has,
    remove,
    clear,
    keys,
  });
}

const set = HashSet(10);

Array.from({ length: 100 }, (_, i) => {
  set.add("key" + i);
});

console.log(set.has("key54")); // true
console.log(set.has("key99")); // true
set.remove("key99");
console.log(set.has("key99")); // false
console.log(set.keys());
set.clear();
console.log(set.keys());
