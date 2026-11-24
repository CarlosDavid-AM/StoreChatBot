document.addEventListener('DOMContentLoaded', () => {
    // Referencias DOM
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const btnToggleSidebar = document.getElementById('btnToggleSidebar');
    const btnNewChat = document.getElementById('btnNewChat');
    const conversationsList = document.getElementById('conversationsList');
    const chatViewport = document.getElementById('chatViewport');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const messagesList = document.getElementById('messagesList');
    const chatInput = document.getElementById('chatInput');
    const btnSend = document.getElementById('btnSend');
    const suggestionCards = document.querySelectorAll('.suggestion-card');

    // Estado en memoria
    let currentConversationId = null;
    let currentThreadId = '';
    let isProcessing = false;

    // Inicializar aplicación
    init();

    function init() {
        renderConversations();

        const activeId = ChatStorage.getActiveConversationId();
        if (activeId && ChatStorage.getConversation(activeId)) {
            loadConversation(activeId);
        } else {
            startNewChat();
        }

        bindEvents();
    }

    function bindEvents() {
        btnNewChat.addEventListener('click', () => {
            startNewChat();
            closeSidebarMobile();
        });

        if (btnToggleSidebar) {
            btnToggleSidebar.addEventListener('click', toggleSidebarMobile);
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', closeSidebarMobile);
        }

        btnSend.addEventListener('click', handleSendMessage);

        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });

        chatInput.addEventListener('input', () => {
            adjustTextareaHeight();
            toggleSendButtonState();
        });

        suggestionCards.forEach(card => {
            card.addEventListener('click', () => {
                const prompt = card.getAttribute('data-prompt');
                if (prompt) {
                    chatInput.value = prompt;
                    adjustTextareaHeight();
                    toggleSendButtonState();
                    handleSendMessage();
                }
            });
        });
    }

    function toggleSidebarMobile() {
        sidebar.classList.toggle('open');
    }

    function closeSidebarMobile() {
        sidebar.classList.remove('open');
    }

    function adjustTextareaHeight() {
        chatInput.style.height = 'auto';
        const newHeight = Math.min(chatInput.scrollHeight, 180);
        chatInput.style.height = (newHeight > 24 ? newHeight : 24) + 'px';
    }

    function toggleSendButtonState() {
        const hasText = chatInput.value.trim().length > 0;
        btnSend.disabled = !hasText || isProcessing;
    }

    function startNewChat() {
        currentConversationId = null;
        currentThreadId = '';
        ChatStorage.setActiveConversationId(null);
        ChatStorage.setActiveThreadId('');

        messagesList.innerHTML = '';
        welcomeScreen.style.display = 'flex';
        renderConversations();

        chatInput.value = '';
        adjustTextareaHeight();
        toggleSendButtonState();
        chatInput.focus();
    }

    function loadConversation(id) {
        const conv = ChatStorage.getConversation(id);
        if (!conv) {
            startNewChat();
            return;
        }

        currentConversationId = conv.id;
        currentThreadId = conv.thread_id || '';
        ChatStorage.setActiveConversationId(conv.id);
        ChatStorage.setActiveThreadId(currentThreadId);

        messagesList.innerHTML = '';

        if (conv.messages.length === 0) {
            welcomeScreen.style.display = 'flex';
        } else {
            welcomeScreen.style.display = 'none';
            conv.messages.forEach(msg => {
                renderMessageRow(msg.role, msg.text);
            });
            scrollToBottom();
        }

        renderConversations();
        chatInput.focus();
    }

    function renderConversations() {
        const conversations = ChatStorage.getConversations();
        conversationsList.innerHTML = '';

        conversations.forEach(conv => {
            const li = document.createElement('li');
            li.className = 'conversation-item' + (conv.id === currentConversationId ? ' active' : '');

            li.innerHTML = `
                <div class="conversation-info">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span class="conversation-title">${escapeHTML(conv.title)}</span>
                </div>
                <button class="btn-delete-conv" title="Eliminar conversación" data-id="${conv.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            `;

            li.addEventListener('click', (e) => {
                if (e.target.closest('.btn-delete-conv')) {
                    e.stopPropagation();
                    deleteChat(conv.id);
                } else {
                    loadConversation(conv.id);
                    closeSidebarMobile();
                }
            });

            conversationsList.appendChild(li);
        });
    }

    function deleteChat(id) {
        ChatStorage.deleteConversation(id);
        if (currentConversationId === id) {
            startNewChat();
        } else {
            renderConversations();
        }
    }

    async function handleSendMessage() {
        const text = chatInput.value.trim();
        if (!text || isProcessing) return;

        // Si es una conversación nueva, crear registro en storage
        if (!currentConversationId) {
            const newConv = ChatStorage.createConversation(text);
            currentConversationId = newConv.id;
            currentThreadId = '';
        }

        // Ocultar pantalla de bienvenida
        welcomeScreen.style.display = 'none';

        // Renderizar mensaje del usuario
        renderMessageRow('user', text);
        ChatStorage.addMessage(currentConversationId, 'user', text);

        // Limpiar input
        chatInput.value = '';
        adjustTextareaHeight();
        toggleSendButtonState();
        scrollToBottom();

        // Estado procesando
        isProcessing = true;
        btnSend.disabled = true;
        const typingElement = renderTypingIndicator();
        scrollToBottom();

        try {
            // Llamar al API con el thread_id actual
            const data = await ChatAPI.sendMessage(text, currentThreadId);

            // Remover indicador de escritura
            removeTypingIndicator(typingElement);

            // Actualizar thread_id si la respuesta contiene uno
            if (data && data.thread_id) {
                currentThreadId = data.thread_id;
                ChatStorage.updateConversationThread(currentConversationId, currentThreadId);
            }

            // Renderizar respuesta del bot
            const respuestaBot = data && data.respuesta ? data.respuesta : 'No se recibió una respuesta válida.';
            renderMessageRow('assistant', respuestaBot);
            ChatStorage.addMessage(currentConversationId, 'assistant', respuestaBot);

            // Actualizar lista lateral con el título o última actividad
            renderConversations();
            scrollToBottom();
        } catch (error) {
            removeTypingIndicator(typingElement);
            renderMessageRow('assistant', '⚠️ Hubo un inconveniente al comunicarse con el servidor. Por favor verifica que el servicio esté disponible en el puerto 3000.');
            scrollToBottom();
        } finally {
            isProcessing = false;
            toggleSendButtonState();
            chatInput.focus();
        }
    }

    function renderMessageRow(role, content) {
        const row = document.createElement('div');
        row.className = `message-row ${role}`;

        const isUser = role === 'user';
        const avatarHTML = isUser
            ? `<div class="avatar user-avatar">
                 <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                   <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                   <circle cx="12" cy="7" r="4"></circle>
                 </svg>
               </div>`
            : `<div class="avatar bot-avatar">
                 <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                   <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                   <circle cx="12" cy="5" r="2"></circle>
                   <path d="M12 7v4"></path>
                   <line x1="8" y1="16" x2="8" y2="16"></line>
                   <line x1="16" y1="16" x2="16" y2="16"></line>
                 </svg>
               </div>`;

        const formattedContent = isUser ? escapeHTML(content) : formatBotMessage(content);

        row.innerHTML = `
            <div class="message-content-wrapper">
                ${avatarHTML}
                <div class="message-body">${formattedContent}</div>
            </div>
        `;

        messagesList.appendChild(row);
    }

    function renderTypingIndicator() {
        const row = document.createElement('div');
        row.className = 'message-row assistant typing-row';
        row.innerHTML = `
            <div class="message-content-wrapper">
                <div class="avatar bot-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                        <circle cx="12" cy="5" r="2"></circle>
                        <path d="M12 7v4"></path>
                        <line x1="8" y1="16" x2="8" y2="16"></line>
                        <line x1="16" y1="16" x2="16" y2="16"></line>
                    </svg>
                </div>
                <div class="message-body">
                    <div class="typing-dots">
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                    </div>
                </div>
            </div>
        `;
        messagesList.appendChild(row);
        return row;
    }

    function removeTypingIndicator(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    function scrollToBottom() {
        chatViewport.scrollTop = chatViewport.scrollHeight;
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatBotMessage(text) {
        if (!text) return '';
        const escaped = escapeHTML(text);

        // Convertir formato simple a HTML
        const lines = escaped.split('\n');
        let html = '';
        let inList = false;

        lines.forEach(line => {
            const trimmed = line.trim();

            // Negritas **texto**
            let parsedLine = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            // Listas con guion o viñeta
            if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                html += `<li>${parsedLine.substring(2)}</li>`;
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                if (parsedLine.length > 0) {
                    html += `<p>${parsedLine}</p>`;
                }
            }
        });

        if (inList) {
            html += '</ul>';
        }

        return html || `<p>${escaped}</p>`;
    }
});
