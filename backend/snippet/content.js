chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'capture') {
    chrome.runtime.sendMessage({ action: 'capture' }, (response) => {
      const { image } = response;
      const { startX, startY, endX, endY } = message.selectionArea;

      const img = new Image();
      img.src = image;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size based on the selected area
        canvas.width = Math.abs(endX - startX);
        canvas.height = Math.abs(endY - startY);

        // Draw the cropped area of the image onto the canvas
        ctx.drawImage(
          img,
          Math.min(startX, endX), Math.min(startY, endY),
          canvas.width, canvas.height,
          0, 0,
          canvas.width, canvas.height
        );

        // Convert the canvas content to a data URL (image/png)
        const croppedImageUrl = canvas.toDataURL('image/png');

        // Send the cropped image data to the background script
        chrome.runtime.sendMessage({ 
          action: 'download', 
          imageData: croppedImageUrl 
        });
      };
    });
  }
});