'use client';

import React, { useEffect, useRef, useState } from 'react';
import { chatbotService, ChatbotMessage, ChatbotConversation } from '@/lib/chatbotService';

interface ChatWindowProps {
  conversation: ChatbotConversation;
  onMessageSent?: (message: ChatbotMessage) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  onMessageSent
}) => {
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation messages
  useEffect(() => {
    const loadConversation = async () => {
      try {
        const data = await chatbotService.getConversationById(conversation.id);
        // Extract messages from the conversation data
        if (data && 'messages' in data) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      }
    };

    loadConversation();
  }, [conversation.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const message = await chatbotService.sendMessage(
        conversation.id,
        inputValue,
        'text'
      );

      setMessages(prev => [...prev, message]);
      setInputValue('');
      onMessageSent?.(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-bold">{conversation.conversationTitle}</h2>
        {conversation.topic && (
          <p className="text-sm text-blue-100 mt-1">Topic: {conversation.topic}</p>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Start the conversation by typing a message below.</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`flex ${msg.senderType === 'student' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.senderType === 'student'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.messageContent}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-t border-red-200 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;

