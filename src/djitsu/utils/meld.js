/**
 * Combine arrays of values into an array of objects labeled using the arrays object provided
 * @param {Object} arrays Labeled arrays in an object; e.g. { id: ['id1', 'id2', ...], kind: ['new', 'old', ...]}
 */
export const meld = (arrays) =>
  ((entries = [], items = entries?.[0]?.[1] ?? []) =>
    items.map((elm, index) =>
      entries.reduce(
        (acc, [label, items = []]) => ({ ...acc, [label]: items[index] }),
        {}
      )
    ))(Object.entries(arrays))

export default meld
