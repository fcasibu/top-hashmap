function Visualization(hashmap, containerSelector) {
  const container = d3.select(containerSelector);
  const svg = container.append("svg");
  const bucketWidth = 50;
  const bucketHeight = 50;
  const nodeRadius = 10;
  const timeouts = new Set();
  const tooltip = Tooltip(container);
  let svgWidth = 100;
  renderHashmap();

  function renderHashmap() {
    hashmap.buckets.forEach((bucket, i) => renderBucket(bucket, i));
  }

  function renderBucket(bucket, index) {
    if (!bucket) return;

    const bucketYPosition = index * (bucketWidth + 10);
    svg
      .append("rect")
      .attr("class", "bucket")
      .attr("data-bucket", index)
      .attr("width", bucketWidth)
      .attr("height", bucketHeight)
      .attr("x", 0)
      .attr("y", bucketYPosition);

    svg.attr("height", bucketYPosition + bucketHeight);
    renderNodes(bucket, index);
  }

  function renderNodes(bucket, bucketIndex) {
    let xPosition = bucketWidth;

    bucket.search((node, nodeIndex) => {
      const cx = xPosition;
      const cy = bucketIndex * (bucketHeight + 10) + bucketHeight / 2;
      svgWidth = Math.max(cx, svgWidth);
      svg.attr("width", svgWidth + nodeRadius);

      svg
        .append("circle")
        .on("mouseenter", () => {
          const tooltipContent = `Key: ${node.key}<br>Value: ${node.value}`;
          tooltip.create(cx, cy, tooltipContent);
        })
        .on("mouseleave", () => tooltip.remove())
        .attr("class", `node`)
        .attr("data-bucket", bucketIndex)
        .attr("data-node", nodeIndex)
        .attr("r", nodeRadius)
        .attr("cx", cx)
        .attr("cy", cy);

      const isLastNode = nodeIndex === bucket.size - 1;

      if (!isLastNode) {
        const lineLength = 8;
        const lineStart = cx + 11;

        svg
          .append("line")
          .attr("y1", cy)
          .attr("y2", cy)
          .attr("x1", lineStart)
          .attr("x2", lineStart + lineLength);
      }

      xPosition += 30;
    });
  }

  function updateHashMapVisualization() {
    timeouts.forEach((timeout) => {
      clearTimeout(timeout);
      tooltip.remove();
    });

    svg.selectAll("*").remove();
    renderHashmap();
  }

  function highlightBucket(key) {
    const index = hashmap.getIndexOfKey(key);
    const bucketRect = svg.select(`.bucket[data-bucket="${index}"]`);
    bucketRect.node().scrollIntoView({ block: "center" });

    bucketRect
      .style("fill", "orange")
      .transition()
      .delay(500)
      .style("fill", "lightblue");
  }

  function highlightNode(key) {
    highlightBucket(key);
    const index = hashmap.getIndexOfKey(key);
    const bucket = hashmap.buckets[index];
    const DELAY = 5000;

    bucket.search((node, nodeIndex) => {
      if (node.key === key) {
        const circle = svg.select(
          `[data-bucket="${index}"][data-node="${nodeIndex}"]`,
        );

        circle.node().scrollIntoView({ inline: "center", block: "center" });

        const cx = circle.node().cx.baseVal.value;
        const cy = circle.node().cy.baseVal.value;

        const tooltipContent = `Key: ${node.key}<br>Value: ${node.value}`;
        tooltip.create(cx, cy, tooltipContent);

        circle
          .style("fill", "orange")
          .transition()
          .delay(DELAY)
          .style("fill", "lightgreen");

        const timeout = setTimeout(() => {
          tooltip.remove();
        }, DELAY);

        timeouts.add(timeout);
      }
    });
  }

  return Object.freeze({
    set(key, value) {
      hashmap.set(key, value);
      updateHashMapVisualization();
      highlightNode(key);
    },

    get(key) {
      const node = hashmap.get(key);

      if (node !== null) {
        highlightNode(key);
      }

      return node;
    },

    remove(key) {
      const node = hashmap.remove(key);
      updateHashMapVisualization(hashmap);
      highlightNode(key);
      return node;
    },

    clear() {
      hashmap.clear();
      updateHashMapVisualization(hashmap);
    },
  });
}

function Tooltip(container) {
  let tooltip = null;

  function create(x, y, content) {
    remove();
    const { scrollTop, scrollHeight, scrollWidth, scrollLeft } =
      container.node();

    tooltip = container
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("top", `${(y % scrollHeight) - scrollTop + 20}px`)
      .style("left", `${(x % scrollWidth) - scrollLeft}px`)
      .html(content);
  }

  function remove() {
    if (!tooltip) return;

    tooltip.remove();
    tooltip = null;
  }

  return Object.freeze({
    create,
    remove,
  });
}

const hashmap = HashMap(16);

Array.from({ length: 10 }, (_, i) => {
  hashmap.set("key" + i, i);
});

const visualization = Visualization(hashmap, ".container");

const output = document.querySelector(".output");
const keyInput = document.querySelector(".key-input");
const valueInput = document.querySelector(".value-input");
const controlPanel = document.querySelector(".control-panel");

controlPanel.addEventListener("click", (event) => {
  const action = event.target.dataset.action;
  if (!action) return;

  const key = keyInput.value;
  const value = valueInput.value;

  try {
    switch (action) {
      case "set":
        {
          if (!(key && value)) {
            throw new Error("Key and Value is required.");
          }

          visualization.set(key, value);
        }
        break;
      case "get":
        {
          if (!key) {
            throw new Error("Key is required./");
          }

          const node = visualization.get(key);

          if (!node) {
            throw new Error(`Key ${key} does not exist.`);
          }

          output.textContent = `Key: ${node.key}, Value: ${node.value}`;
        }
        break;

      case "remove":
        {
          if (!key) {
            throw new Error("Key is required./");
          }

          const node = visualization.remove(key);

          if (!node) {
            throw new Error(`Key ${key} does not exist.`);
          }
        }
        break;

      case "clear":
        {
          visualization.clear();
        }
        break;

      default: {
        throw new Error(`Unexpected action: ${action}`);
      }
    }
  } catch (e) {
    output.textContent = e.message;
  }
});
