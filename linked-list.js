const Node = (key, value) => ({ key, value, nextNode: null });

function LinkedList() {
  let head = null,
    tail = null,
    _size = 0;

  const append = (node) => {
    if (!head) {
      head = node;
      tail = node;
    } else {
      tail.nextNode = node;
      tail = node;
    }
    _size += 1;
  };

  const remove = (index) => {
    if (isOutOfBounds(index)) return;

    if (index === 0) {
      head = head.nextNode;
      if (_size === 1) {
        tail = null;
      }
    } else {
      const previous = getNodeAt(index - 1);
      if (!previous) return;

      const toRemove = previous.nextNode;
      previous.nextNode = toRemove.nextNode;

      if (index === _size - 1) {
        tail = previous;
      }
    }

    _size -= 1;
  };

  const search = (callback) => {
    let counter = 0;
    let current = head;

    while (current) {
      const result = callback(current, counter);
      if (result) return current;

      current = current.nextNode;
      counter += 1;
    }

    return null;
  };

  const getNodeAt = (index) => {
    if (isOutOfBounds(index)) return;

    let current = head;
    let counter = 0;
    while (current && counter < index) {
      current = current.nextNode;
      counter += 1;
    }
    return current;
  };

  const isOutOfBounds = (index) => index < 0 || index >= _size;

  return Object.freeze({
    get size() {
      return _size;
    },
    append,
    remove,
    search,
  });
}

module.exports = {
  LinkedList,
  Node,
};
