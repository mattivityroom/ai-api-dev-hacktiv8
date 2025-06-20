const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';
  appendMessage('bot', 'Gemini is thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    });

    const thinkingMessage = chatBox.lastChild;
    if (thinkingMessage && thinkingMessage.classList.contains('bot') && thinkingMessage.textContent.includes('thinking...')) {
      chatBox.removeChild(thinkingMessage);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    appendMessage('bot', data.output); // Assuming the server responds with { reply: "bot's message" }
  } catch (error) {
    console.error('Error fetching from /api/chat:', error);
    appendMessage('bot', 'Sorry, I encountered an error. Please try again.');
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);

  if (sender === 'bot') {
    // Parse markdown untuk pesan bot
    msg.innerHTML = marked.parse(text);
  } else {
    // Tetap gunakan textContent untuk pesan user (untuk keamanan)
    msg.textContent = text;
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
