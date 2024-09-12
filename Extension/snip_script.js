// DOM elements
const fileInput = document.getElementById('fileInput');
const clickToUpload = document.getElementById('clickToUpload');
const fileInfo = document.getElementById('fileInfo');
const redirectChat = document.getElementById('redirectChat');

// Event listener for the "Click here to Upload" text
clickToUpload.addEventListener('click', () => {
    fileInput.click();
});

// Event listener for file selection
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        fileInfo.textContent = `Selected file: ${file.name}`;
        uploadImage(file);
    }
});

// Function to upload the image to the Flask backend
function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',  // Include credentials
        headers: {
            'Accept': 'application/json',
        },
    })
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        fileInfo.textContent = 'Image uploaded successfully!';
        redirectChat.disabled = false;
    })
    .catch((error) => {
        console.error('Error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        });
    });
}

// Event listener for the chat button
redirectChat.addEventListener('click', () => {
    window.location.href = './snip_chat.html';
});

// Drag and drop functionality
const dropZone = document.querySelector('.add_doc');

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '#4a4b4a';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.backgroundColor = '#3c3d3c';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '#3c3d3c';
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
        fileInfo.textContent = `Selected file: ${file.name}`;
        uploadImage(file);
    } else {
        fileInfo.textContent = 'Please drop a valid JPG or PNG image.';
    }
});