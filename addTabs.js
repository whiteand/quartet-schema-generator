const TAB = ["", "  ", "    "];
module.exports = function addTabs(code, n = 1) {
  const tab = TAB[n];
  return tab + code.replace(/\n/g, "\n" + tab);
};
