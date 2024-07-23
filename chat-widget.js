class ChatWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          .floating-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
          }
          .chat-widget {
            min-height: 300px;
          }
          .chat-bubble {
            display: flex;
            margin-bottom: 10px;
          }
          .chat-bubble.user {
            justify-content: flex-end;
          }
          .chat-bubble.bot {
            justify-content: flex-start;
          }
          .message {
            max-width: 70%;
            padding: 10px;
            border-radius: 10px;
          }
          .message.user {
            background-color: #3b82f6; /* Tailwind's bg-blue-500 */
            color: white;
            border-top-right-radius: 0;
          }
          .message.bot {
            background-color: #e5e7eb; /* Tailwind's bg-gray-200 */
            color: #1f2937; /* Tailwind's text-gray-900 */
            border-top-left-radius: 0;
          }
        </style>
        <button id="open-chat-btn" class="floating-btn bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none">
          Chat
        </button>
        <div id="chat-widget" class="hidden fixed bottom-20 right-5 w-full max-w-md mx-auto bg-white rounded-lg shadow-lg z-50 chat-widget">
          <div class="flex justify-between items-center bg-blue-500 text-white p-4 rounded-t-lg">
            <span>Chat with Bot</span>
            <button id="close-chat-btn" class="focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div id="chat-box" class="space-y-4 overflow-y-auto max-h-80 mb-4 p-4">
          </div>
          <div class="flex items-center space-x-4 p-4">
            <input id="user-input" type="text" class="w-full px-4 py-2 border rounded-lg focus:outline-none" placeholder="Type your message...">
            <button id="send-btn" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none">Send</button>
          </div>
        </div>
      `;

        this.azureOpenaiEndpoint = "<>";
        this.azureOpenaiApiKey = "<>";

        this.openChatBtn = this.shadowRoot.getElementById('open-chat-btn');
        this.closeChatBtn = this.shadowRoot.getElementById('close-chat-btn');
        this.chatWidget = this.shadowRoot.getElementById('chat-widget');
        this.chatBox = this.shadowRoot.getElementById('chat-box');
        this.userInput = this.shadowRoot.getElementById('user-input');
        this.sendBtn = this.shadowRoot.getElementById('send-btn');



        this.openChatBtn.addEventListener('click', () => {
            this.chatWidget.classList.remove('hidden');
        });

        this.closeChatBtn.addEventListener('click', () => {
            this.chatWidget.classList.add('hidden');
        });

        this.sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        this.userInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        this.appendChatBubble(message, true);
        this.userInput.value = '';
        this.userInput.disabled = true;
        this.sendBtn.disabled = true;

        const myHeaders = new Headers();
        myHeaders.append("api-key", this.azureOpenaiEndpoint);
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "messages": [
                {
                    "content": message,
                    "role": "user"
                }
            ],
            "temperature": 0.7,
            "top_p": 0.95,
            "max_tokens": 800
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        fetch(this.azureOpenaiApiKey, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                console.log(result)
                this.appendChatBubble(result.choices[0].message.content, false);
                this.userInput.disabled = false;
                this.sendBtn.disabled = false;
                this.userInput.focus();
            })
            .catch((error) => console.error(error));
    }

    appendChatBubble(message, isUser) {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${isUser ? 'user' : 'bot'}`;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        messageDiv.innerHTML = message;

        bubble.appendChild(messageDiv);
        this.chatBox.appendChild(bubble);
        this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }
}

customElements.define('chat-widget', ChatWidget);
