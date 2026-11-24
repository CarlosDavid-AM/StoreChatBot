const ChatStorage = {
    CONVERSATIONS_KEY: 'electro_chat_conversations',
    ACTIVE_ID_KEY: 'electro_active_conversation_id',
    ACTIVE_THREAD_KEY: 'electro_active_thread_id',

    getConversations() {
        try {
            const data = localStorage.getItem(this.CONVERSATIONS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    saveConversations(conversations) {
        try {
            localStorage.setItem(this.CONVERSATIONS_KEY, JSON.stringify(conversations));
        } catch (e) {
            // Sin logs segun restricciones
        }
    },

    getConversation(id) {
        const conversations = this.getConversations();
        return conversations.find(c => c.id === id) || null;
    },

    getActiveConversationId() {
        return localStorage.getItem(this.ACTIVE_ID_KEY) || null;
    },

    setActiveConversationId(id) {
        if (id) {
            localStorage.setItem(this.ACTIVE_ID_KEY, id);
        } else {
            localStorage.removeItem(this.ACTIVE_ID_KEY);
        }
    },

    getActiveThreadId() {
        return localStorage.getItem(this.ACTIVE_THREAD_KEY) || '';
    },

    setActiveThreadId(threadId) {
        if (threadId) {
            localStorage.setItem(this.ACTIVE_THREAD_KEY, threadId);
        } else {
            localStorage.setItem(this.ACTIVE_THREAD_KEY, '');
        }
    },

    createConversation(initialTitle = 'Nueva conversación') {
        const id = 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        const newConv = {
            id: id,
            thread_id: '',
            title: initialTitle,
            messages: [],
            updatedAt: Date.now()
        };

        const conversations = this.getConversations();
        conversations.unshift(newConv);
        this.saveConversations(conversations);
        this.setActiveConversationId(id);
        this.setActiveThreadId('');
        return newConv;
    },

    updateConversationThread(id, threadId) {
        const conversations = this.getConversations();
        const conv = conversations.find(c => c.id === id);
        if (conv) {
            conv.thread_id = threadId || '';
            conv.updatedAt = Date.now();
            this.saveConversations(conversations);
            this.setActiveThreadId(threadId || '');
        }
    },

    addMessage(id, role, text) {
        const conversations = this.getConversations();
        const conv = conversations.find(c => c.id === id);
        if (conv) {
            conv.messages.push({
                role: role,
                text: text,
                timestamp: Date.now()
            });

            if (conv.messages.length === 1 && role === 'user') {
                conv.title = text.length > 30 ? text.substring(0, 30) + '...' : text;
            }

            conv.updatedAt = Date.now();
            this.saveConversations(conversations);
        }
    },

    deleteConversation(id) {
        let conversations = this.getConversations();
        conversations = conversations.filter(c => c.id !== id);
        this.saveConversations(conversations);

        if (this.getActiveConversationId() === id) {
            this.setActiveConversationId(null);
            this.setActiveThreadId('');
        }
    }
};
