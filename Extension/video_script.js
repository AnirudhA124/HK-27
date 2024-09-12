document.addEventListener('DOMContentLoaded', function() {
    const clickToUpload = document.getElementById('clickToUpload');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const redirectChat = document.getElementById('redirectChat');
    const transcriptionContainer = document.querySelector('.options');
  
    // Initially disable the "Click to Chat" button
    redirectChat.disabled = true;
    redirectChat.classList.add('disabled');  // Add a class for disabled styling
  
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
        if (data.error) {
          console.error('Error from server:', data.error);
          fileInfo.textContent = 'Error: ' + data.error;
        } else {
          console.log('File uploaded successfully:', data);
  
          // Enable the "Click to Chat" button once transcription is done
          redirectChat.disabled = false;
          redirectChat.classList.remove('disabled');  // Remove the disabled class for styling
          redirectChat.style.pointerEvents = 'auto';  // Allow clicking
        }
      })
      .catch(error => {
        console.error('Error uploading file:', error);
        fileInfo.textContent = 'Error uploading file';
      });
    }
  
    redirectChat.addEventListener('click', function() {
      window.location.href = './tsummary_result.html';
    });
  });