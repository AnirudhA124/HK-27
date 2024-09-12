document.addEventListener('DOMContentLoaded', function() {
    const clickToUpload = document.getElementById('clickToUpload');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const redirectChat = document.getElementById('redirectChat');
  
    clickToUpload.addEventListener('click', function() {
      fileInput.click();
    });
  
    fileInput.addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
        fileInfo.textContent = `Selected file: ${file.name}`;
        uploadFile(file);
      }
    });
  
    function uploadFile(file) {
      const formData = new FormData();
      formData.append('file', file);
  
      fetch('http://127.0.0.1:5000/upload', {  // URL of your Flask backend
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(data => {
        console.log('File uploaded successfully:', data);
        // Store the file identifier if needed
        localStorage.setItem('fileId', data.fileId);
      })
      .catch(error => {
        console.error('Error uploading file:', error);
      });
    }
  
    redirectChat.addEventListener('click', function() {
      window.location.href = './chat.html';
    });
  });