
if (!window.elementPickerActive) {
  let currentElement = null;
  window.elementPickerActive = true;
  if (!document.getElementById('picker-style')) {
    const style = document.createElement('style');
    style.id = 'picker-style';
    style.textContent = `
      .highlight_cursor_pointer {
        outline: 3px dashed red !important;
        border: 3px dashed red !important;
        cursor: crosshair !important;
      }
    `;
    document.head.appendChild(style);
  }
  function generateSelector(element) {
    if (element.id) return `#${element.id}`;
    let selector = element.tagName.toLowerCase();
    if (element.className) {
      selector += '.' + element.className.trim().replace(/\s+/g, '.');
    }
    if (document.querySelectorAll(selector).length === 1) {
      return selector;
    }
    const siblings = Array.from(element.parentNode.children);
    const index = siblings.indexOf(element);
    return `${selector}:nth-child(${index + 1})`;
  }
  function highlight_cursor_pointerElement(element) {
    element.classList.add('highlight_cursor_pointer');
  }
  function unhighlight_cursor_pointerElement(element) {
    element.classList.remove('highlight_cursor_pointer');
  }
  function handleMouseOver(e) {
      document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', e => e.preventDefault(), true);
      });
      document.querySelectorAll('div').forEach(link => {
        link.addEventListener('click', e => e.preventDefault(), true);
      });
    if (currentElement) unhighlight_cursor_pointerElement(currentElement);
    currentElement = e.target;
    highlight_cursor_pointerElement(currentElement);
  }
  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const selector = generateSelector(e.target);
    chrome.runtime.sendMessage({
      action: "elementPicked",
      selector: selector,
      url: window.location.href
    });
    document.removeEventListener('mouseover', handleMouseOver, true);
    document.removeEventListener('click', handleClick, true);
    if (currentElement) unhighlight_cursor_pointerElement(currentElement);
    window.elementPickerActive = false;
  }
  document.addEventListener('mouseover', handleMouseOver, true);
  document.addEventListener('click', handleClick, true);
  
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (currentElement) {
      unhighlight_cursor_pointerElement(currentElement);
      currentElement = null;
    }

    // Убираем все обработчики и сбрасываем флаг
    document.removeEventListener('mouseover', handleMouseOver, true);
    document.removeEventListener('click', handleClick, true);
    window.elementPickerActive = false;

    // По желанию: удалить стиль, чтобы убрать crosshair
    const style = document.getElementById('picker-style');
    if (style) style.remove();
  }
});

}