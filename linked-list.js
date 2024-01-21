function Node(key, value) {
  return { key, value, nextNode: null };
}

function LinkedList() {
  let head = null,
    tail = null,
    _size = 0;

  function append(node) {
    if (!head) {
      head = node;
      tail = node;
    } else {
      tail.nextNode = node;
      tail = node;
    }
    _size += 1;
  }

  function remove(index) {
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
  }

  function search(callback) {
    let counter = 0;
    let current = head;

    while (current) {
      if (callback(current, counter)) return current;

      current = current.nextNode;
      counter += 1;
    }

    return null;
  }

  function getNodeAt(index) {
    if (isOutOfBounds(index)) return;

    let current = head;
    let counter = 0;
    while (current && counter < index) {
      current = current.nextNode;
      counter += 1;
    }
    return current;
  }

  function isOutOfBounds(index) {
    return index < 0 || index >= _size;
  }

  return Object.freeze({
    get size() {
      return _size;
    },
    search,
    append,
    remove,
  });
}
