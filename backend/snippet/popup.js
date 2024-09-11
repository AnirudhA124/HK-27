document.getElementById("captureBtn").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: startSelection,
  });
});

function startSelection() {
  let selectionBox = document.createElement('div');
  selectionBox.style.position = 'fixed';
  selectionBox.style.border = '2px dashed red';
  selectionBox.style.background = 'rgba(255, 0, 0, 0.1)';
  selectionBox.style.zIndex = '9999';
  document.body.appendChild(selectionBox);

  let startX, startY;
  let isSelecting = false;

  document.addEventListener('mousedown', (e) => {
    startX = e.pageX;
    startY = e.pageY;
    isSelecting = true;
    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
  });

  document.addEventListener('mousemove', (e) => {
    if (isSelecting) {
      selectionBox.style.width = `${Math.abs(e.pageX - startX)}px`;
      selectionBox.style.height = `${Math.abs(e.pageY - startY)}px`;
      selectionBox.style.left = `${Math.min(startX, e.pageX)}px`;
      selectionBox.style.top = `${Math.min(startY, e.pageY)}px`;
    }
  });

  document.addEventListener('mouseup', (e) => {
    isSelecting = false;
    const width = Math.abs(e.pageX - startX);
    const height = Math.abs(e.pageY - startY);
    const left = Math.min(startX, e.pageX);
    const top = Math.min(startY, e.pageY);
    document.body.removeChild(selectionBox);

    chrome.runtime.sendMessage({
      left, top, width, height
    });
  });
}
