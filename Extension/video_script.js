document.addEventListener('DOMContentLoaded', function() {
    const clickToUpload = document.getElementById('clickToUpload');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const redirectTranscribe = document.getElementById('redirectTranscribe');
    const redirectChat = document.getElementById('redirectChat');

    // Initially disable the buttons
    redirectTranscribe.disabled = true;
    redirectChat.disabled = true;

    redirectTranscribe.classList.add('disabled');
    redirectChat.classList.add('disabled'); // Add a class for disabled styling

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

                // Enable the buttons once the file is successfully uploaded
                redirectTranscribe.disabled = false;
                redirectChat.disabled = false;
                
                redirectTranscribe.classList.remove('disabled');
                redirectChat.classList.remove('disabled');
                
                redirectTranscribe.style.pointerEvents = 'auto';
                redirectChat.style.pointerEvents = 'auto';
            }
        })
        .catch(error => {
            console.error('Error uploading file:', error);
            fileInfo.textContent = 'Error uploading file';
        });
    }

    // Handle the Transcribe button click
    redirectTranscribe.addEventListener('click', function() {
        if (!redirectTranscribe.disabled) {
            window.location.href = './chat.html';  // Redirect to chat.html for transcription
        }
    });

    // Handle the Summarize button click
    redirectChat.addEventListener('click', function() {
        if (!redirectChat.disabled) {
            window.location.href = './tsummary_result.html';  // Redirect to summary page
        }
    });
});
