/**
 * Console welcome mat — prints a maker's signature when someone opens
 * DevTools. Purely cosmetic; no behavior, no data.
 */
export function printSignature() {
  const art = [
    "",
    "   ╔═╗╔╦╗╔═╗╔╦╗╔═╗  ╔═╗╔═╗  ╔═╗╔═╗╦ ╦╔═╗╔═╗",
    "   ╚═╗ ║ ╠═╣ ║ ║╣   ║ ║╠╣   ╠═╣╚═╗╠═╣║╣ ╚═╗",
    "   ╚═╝ ╩ ╩ ╩ ╩ ╚═╝  ╚═╝╚    ╩ ╩╚═╝╩ ╩╚═╝╚═╝",
    "",
    "   You made it. Nice to see a fellow tinkerer.",
    "",
  ].join("\n");

  console.log(`%c${art}`, "color: #ef4444; font-family: monospace;");
  console.log(
    "%cStateOfAshes — Built with grit.",
    "color: #ef4444; font-weight: bold; font-size: 14px;"
  );
}
