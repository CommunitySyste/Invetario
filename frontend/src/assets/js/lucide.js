import { createIcons, icons } from "lucide";

window.lucide = icons;
window.createIcons = createIcons;

export function setupLucide() {
  createIcons({
    icons,
    "stroke-width": 1.5,
    nameAttr: "data-lucide",
  });
}
