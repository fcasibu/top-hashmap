function Node(key) {
  return {
    key,
  };
}

function HashSet(capacity) {
  const LOAD_FACTOR = 0.75;
  let buckets = Array(capacity);
  let size = 0;

  const add = (key) => {
    if (hasHighLoadFactor()) resize();
    if (has(key)) return;

    const index = hash(key);

    if (isOutOfBounds(index))
      throw new Error("Trying to access index out of bound");

    (buckets[index] ??= []).push(Node(key));
    size += 1;
  };

  const has = (key) => Boolean(getWithCallback(key, () => true));

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

    if (isOutOfBounds(index))
      throw new Error("Trying to access index out of bound");

    return buckets[index];
  };

  const resize = () => {
    const oldBuckets = buckets;
    buckets = Array(buckets.length * 2);

    oldBuckets.forEach((bucket) => bucket?.forEach((node) => add(node.key)));
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
    add,
    has,
    remove,
    clear,
    keys,
    get length() {
      return buckets.reduce(
        (count, bucket) => count + (bucket?.length ?? 0),
        0,
      );
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
