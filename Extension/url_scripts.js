document.addEventListener('DOMContentLoaded', () => {
    const redirectButton = document.getElementById('redirectChatURL');
    const textbox = document.getElementById('textbox');

    redirectButton.addEventListener('click', () => {
        const url = textbox.value.trim();
        if (url) {
            fetch('http://127.0.0.1:5000/process_url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.text(); // Read response as text first
            })
            .then(text => {
                if (text.trim() === '') { // Handle empty responses
                    throw new Error('Empty response from server.');
                }

                try {
                    const data = JSON.parse(text); // Parse text as JSON
                    if (data.success) {
                        // Redirect to the chat page with the extracted text
                        window.location.href = `./url_chat.html`;
                    } else {
                        alert('Failed to extract text from the URL. Please try again.');
                    }
                } catch (e) {
                    console.error('Failed to parse JSON:', e);
                    alert('Invalid response format. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert(`An error occurred: ${error.message}. Please try again.`);
            });
        } else {
            alert('Please enter a valid URL.');
        }
    });
});