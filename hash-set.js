const { LinkedList, Node } = require("./linked-list");

function HashSet(capacity) {
  const LOAD_FACTOR = 0.75;
  let buckets = Array(capacity);
  let size = 0;

  const add = (key) => {
    if (hasHighLoadFactor()) resize();
    if (has(key)) return;

    const index = getIndexOfKey(key);

    buckets[index] ??= LinkedList();
    buckets[index].append(Node(key, null));
    size += 1;
  };

  const has = (key) => Boolean(getWithCallback(key, () => true));

  const remove = (key) =>
    getWithCallback(key, (_, i, bucket) => {
      bucket.remove(i);
      size -= 1;
      return true;
    });

  const clear = () => {
    buckets = Array(capacity);
    size = 0;
  };

  const keys = () => collect((node) => node.key);

  const getWithCallback = (key, callback) => {
    const bucket = getBucketOfKey(key);

    if (!bucket) return null;

    const node = bucket.search((currentNode, index) => {
      if (currentNode.key === key) return callback(currentNode, index, bucket);
    });

    return node;
  };

  const getBucketOfKey = (key) => buckets[getIndexOfKey(key)];

  const getIndexOfKey = (key) => {
    const index = hash(key);

    if (isOutOfBounds(index))
      throw new Error("Trying to access index out of bound");

    return index;
  };

  const resize = () => {
    const oldBuckets = buckets;
    buckets = Array(buckets.length * 2);
    size = 0;

    oldBuckets.forEach((bucket) => bucket?.search((node) => add(node.key)));
  };

  const collect = (callback) => {
    const result = [];
    buckets.forEach((bucket) =>
      bucket?.search((currentNode) => {
        if (currentNode.key) result.push(callback(currentNode));
      }),
    );

    return result;
  };

  const isOutOfBounds = (index) => index < 0 || index >= buckets.length;
  const hasHighLoadFactor = () => size / buckets.length > LOAD_FACTOR;

  const hash = (key) => {
    const stringKey = String(key);
    const primeNumber = 31;

    let hashCode = 0;
    for (const char of stringKey) {
      hashCode += hashCode * primeNumber + char.charCodeAt();
    }

    return hashCode % buckets.length;
  };

  return Object.freeze({
    add,
    has,
    remove,
    clear,
    keys,
    get length() {
      return size;
    },
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
