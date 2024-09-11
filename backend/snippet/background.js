chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  chrome.tabs.captureVisibleTab(null, { format: "png" }, (imageUri) => {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      func: handleImage,
      args: [imageUri, message.left, message.top, message.width, message.height],
    });
  });
});

function handleImage(imageUri, left, top, width, height) {
  const img = new Image();
  img.src = imageUri;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      img, 
      left, top, width, height,
      0, 0, width, height
    );

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'screenshot.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };
}
