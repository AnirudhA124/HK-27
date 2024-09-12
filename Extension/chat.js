document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('sendButton');
    const textbox = document.getElementById('textbox');
    const chatContainer = document.querySelector('.options');
  
    function sendMessage() {
      const userMessage = textbox.value.trim();
  
      if (userMessage) {
        // Create a new container for the user question
        const userQuestionDiv = document.createElement('div');
        userQuestionDiv.classList.add('container1');
        userQuestionDiv.innerHTML = `
          <div class="added_div">You: ${userMessage}</div>`;
        chatContainer.appendChild(userQuestionDiv);
        textbox.value = '';
  
        // Scroll to the bottom of the chat container
        chatContainer.scrollTop = chatContainer.scrollHeight;
  
        // Send message to server
        fetch('http://127.0.0.1:5000/chat', {  // URL of your Flask backend
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userMessage }),
        })
        .then(response => response.json())
        .then(data => {
          // Create a new container for the bot response
          const botResponseDiv = document.createElement('div');
          botResponseDiv.classList.add('container2');
          botResponseDiv.innerHTML = `
            <div classes ="added_div">Bot: ${data.response}</div>`;
          chatContainer.appendChild(botResponseDiv);
  
          // Scroll to the bottom of the chat container
          chatContainer.scrollTop = chatContainer.scrollHeight;
        })
        .catch(error => {
          console.error('Error:', error);
          const errorDiv = document.createElement('div');
          errorDiv.classList.add('container2');
          errorDiv.innerHTML = `
            <div class="added_div">Bot: Sorry, there was an error processing your request.</div>`;
          chatContainer.appendChild(errorDiv);
        });
      } else {
        console.log('Message is empty');
      }
    }
  
    // Allow sending message with Enter key
    textbox.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  
    // Allow sending message with click on send icon
    sendButton.addEventListener('click', function() {
      sendMessage();
    });
})