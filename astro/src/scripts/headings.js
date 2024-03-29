/**
 * Solution found in
   https://stackoverflow.com/questions/75983696/linebreak-in-a-h1-turns-the-element-into-a-voiceover-group
 */
function cleanHeadingsForScreenReaders() {
  document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading) => {
    if (heading.classList.contains("visually-hidden")) return;
    else if (heading.hasAttribute("aria-label")) return;

    const nodes = heading.childNodes;

    if (nodes.length > 1) {
      const screenReaderNode = document.createElement("span");
      screenReaderNode.setAttribute("class", "visually-hidden");
      screenReaderNode.innerText = heading.innerText;

      const wrapper = document.createElement("span");
      wrapper.setAttribute("aria-hidden", "true");

      const children = Array.from(heading.childNodes);
      while (children.length) {
        wrapper.appendChild(children.shift());
      }

      heading.appendChild(wrapper);
      heading.appendChild(screenReaderNode);
    }
  });
}

window.addEventListener("load", cleanHeadingsForScreenReaders);
