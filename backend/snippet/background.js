chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Capture the visible part of the current tab
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
    const ctx = canvas.getContext('2d');

    // Set canvas size to the cropped area size
    canvas.width = width;
    canvas.height = height;

    // Calculate the device pixel ratio (to account for browser zoom)
    const dpr = window.devicePixelRatio || 1;
    const adjustedLeft = left * dpr;
    const adjustedTop = top * dpr;
    const adjustedWidth = width * dpr;
    const adjustedHeight = height * dpr;

    // Account for page scrolling offsets
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollAdjustedLeft = adjustedLeft - scrollX * dpr;
    const scrollAdjustedTop = adjustedTop - scrollY * dpr;

    // Draw the cropped part of the image on the canvas
    ctx.drawImage(
      img, // Source image
      scrollAdjustedLeft, scrollAdjustedTop, adjustedWidth, adjustedHeight, // Cropping coordinates from source image
      0, 0, width, height // Drawing on the canvas at (0, 0) with size width x height
    );

    // Convert the cropped canvas to Blob
    canvas.toBlob((blob) => {
      const formData = new FormData();
      formData.append('image', blob, 'screenshot.png');

      // Send the cropped image to the Flask API for OCR
      fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        console.log('Text extracted from image:', data.text); // Log the extracted text
      })
      .catch(error => {
        console.error('Error:', error);
      });
    });
  };
}