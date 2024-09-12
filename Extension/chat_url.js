document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('sendButton');
    const textbox = document.getElementById('textbox');
    const chatContainer = document.querySelector('.options');

    function addMessage(content, isUser) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add(isUser ? 'userchat' : 'botchat');

        const messageText = document.createElement('div');
        messageText.classList.add(isUser ? 'container1' : 'container2');
        messageText.innerHTML = `${isUser ? 'You' : 'Bot'}: ${content}`;

        messageContainer.appendChild(messageText);
        chatContainer.appendChild(messageContainer);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function sendMessage() {
        const question = textbox.value.trim();
        if (question) {
            addMessage(question, true);
            textbox.value = '';

            fetch('http://127.0.0.1:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question }),
            })
            .then(response => response.json())
            .then(data => {
                addMessage(data.answer, false);
            })
            .catch(error => {
                console.error('Error:', error);
                addMessage('Sorry, there was an error processing your request.', false);
            });
        } else {
            console.log('Message is empty');
        }
    }

    sendButton.addEventListener('click', sendMessage);

    textbox.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
});