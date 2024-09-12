// Function to send the chat request to the Flask API
async function sendMessage(message) {
    try {
        // Prepare the request payload
        const response = await fetch('http://127.0.0.1:5000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        });

        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        const data = await response.json();

        // Display the response in the transcript-container
        const transcriptContainer = document.getElementById('transcript-container');
        transcriptContainer.innerHTML = `${data.response}`;
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// Call the sendMessage function with the desired message
document.addEventListener('DOMContentLoaded', () => {
    // Replace this with the actual message you want to send
    sendMessage('summarize the content');
});