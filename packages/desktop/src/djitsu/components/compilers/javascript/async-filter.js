// Async filter from: https://advancedweb.hu/how-to-use-async-functions-with-array-filter-in-javascript/#:~:text=Async%20filter%20with%20reduce
export const asyncFilter = async (arr, predicate) =>
  arr.reduce(
    async (memo, e) => ((await predicate(e)) ? [...(await memo), e] : memo),
    []
  )

export default asyncFilter
