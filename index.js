function Node(key, value) {
  return {
    key,
    value,
  };
}

function HashMap(capacity) {
  const LOAD_FACTOR = 0.75;
  let buckets = Array(capacity);
  let size = 0;

  const set = (key, value) => {
    const index = hash(key);

    if (isOutOfBounds(index)) {
      throw new Error("Trying to access index out of bound");
    }

    const found = getWithCallback(key, (node) => {
      node.value = value;
      return true;
    });

    if (!found) {
      (buckets[index] ??= []).push(Node(key, value));
      size += 1;
    }

    if (hasHighLoadFactor()) {
      resize();
    }
  };

  const get = (key) => getWithCallback(key, (node) => node.value);

  const has = (key) => Boolean(get(key));

  const remove = (key) =>
    getWithCallback(key, (_, i, bucket) => {
      bucket.splice(i, 1);
      size -= 1;
    });

  const clear = () => {
    buckets = Array(buckets.length);
    size = 0;
  };

  const keys = () => flatten().map((node) => node.key);

  const values = () => flatten().map((node) => node.value);

  const entries = () => flatten().map((node) => [node.key, node.value]);

  const getWithCallback = (key, callback) => {
    const bucket = getBucketOfKey(key);

    if (!bucket) return null;

    for (let i = 0; i < bucket.length; ++i) {
      const node = bucket[i];
      if (node.key === key) {
        return callback(node, i, bucket);
      }
    }

    return null;
  };

  const getBucketOfKey = (key) => {
    const index = hash(key);

    if (isOutOfBounds(index)) {
      throw new Error("Trying to access index out of bound");
    }

    return buckets[index];
  };

  const resize = () => {
    const oldBuckets = buckets;
    buckets = Array(buckets.length * 2);

    oldBuckets.forEach((bucket) =>
      bucket?.forEach((node) => set(node.key, node.value)),
    );
  };

  const flatten = () => buckets.flat(2).filter(Boolean);

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
      return buckets.reduce(
        (count, bucket) => count + (bucket?.length ?? 0),
        0,
      );
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
map.clear();
console.log(map.values());
console.log(map.keys());
console.log(map.entries());
