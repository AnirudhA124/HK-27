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
      const formData = new FormData();
      formData.append('image', blob, 'screenshot.png');

      // Send the image to Flask API
      fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        console.log('Text extracted from image:', data.text); // Log the extracted text in browser console
      })
      .catch(error => {
        console.error('Error:', error);
      });
    });
  };
}
