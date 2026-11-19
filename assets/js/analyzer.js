window.VIBHAAnalyzer = (() => {
  function analyze(responses, dimensions) {
    const scores = {};

    dimensions.forEach((dimension) => {
      const values = responses
        .filter((response) => response.dimension === dimension)
        .map((response) => response.value);

      const average = values.length
        ? values.reduce((sum, value) => sum + value, 0) / values.length
        : 0;

      scores[dimension] = Math.round((average / 5) * 100);
    });

    return scores;
  }

  function rank(scores) {
    return Object.entries(scores).sort((a, b) => b[1] - a[1]);
  }

  return { analyze, rank };
})();
