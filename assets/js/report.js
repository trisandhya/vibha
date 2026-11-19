window.VIBHAReport = (() => {
  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function downloadJson(session) {
    download(
      "vibha-blueprint.json",
      JSON.stringify(session, null, 2),
      "application/json"
    );
  }

  function downloadText(session, translate) {
    const lines = [
      "VIBHA - My Reflection",
      `Date: ${session.createdDate}`,
      "",
      ...Object.entries(session.result).map(
        ([dimension, score]) => `${translate(dimension)}: ${score}`
      ),
      "",
      session.reflection
    ];
    download("vibha-reflection.txt", lines.join("\n"), "text/plain");
  }

  return { downloadJson, downloadText };
})();
