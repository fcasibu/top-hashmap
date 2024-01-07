const { LinkedList, Node } = require("./linked-list");

function HashMap(capacity) {
  const LOAD_FACTOR = 0.75;
  let buckets = Array(capacity);
  let size = 0;

  const set = (key, value) => {
    if (hasHighLoadFactor()) resize();

    const found = getWithCallback(key, (node) => {
      node.value = value;
      return true;
    });

    if (found) return;

    const index = getIndexOfKey(key);

    buckets[index] ??= LinkedList();
    buckets[index].append(Node(key, value));
    size += 1;
  };

  const get = (key) => getWithCallback(key, () => true)?.value ?? null;
  const has = (key) => Boolean(get(key));

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
  const values = () => collect((node) => node.value);
  const entries = () => collect((node) => [node.key, node.value]);

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

    oldBuckets.forEach((bucket) =>
      bucket?.search((node) => set(node.key, node.value)),
    );
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
    set,
    get,
    has,
    remove,
    clear,
    keys,
    values,
    entries,

    get length() {
      return size;
    },
  });
}

const map = HashMap(10);

Array.from({ length: 100 }, (_, i) => {
  map.set("key" + i, i);
});

console.log(map.get("key54")); // 54
console.log(map.get("key99")); // 99
map.remove("key99");
console.log(map.has("key99")); // false
console.log(map.values());
console.log(map.keys());
console.log(map.entries());
console.log(map.length);
map.clear();
console.log(map.values());
console.log(map.keys());
console.log(map.entries());
console.log(map.get("Hey"));
console.log(map.length);
map.set("Hey", "Hey");
console.log(map.length);
