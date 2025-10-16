'use client';

import React, { useEffect, useState } from 'react';
import { chatbotService, AiTutor, ChatbotConversation } from '@/lib/chatbotService';
import TutorSelector from './TutorSelector';
import ChatWindow from './ChatWindow';

type ViewMode = 'tutor-select' | 'topic-select' | 'chat';

interface TopicSelectProps {
  tutor: AiTutor;
  onStartChat: (topic: string, mode: 'learning' | 'past_paper_solver') => void;
  onBack: () => void;
}

const TopicSelector: React.FC<TopicSelectProps> = ({ tutor, onStartChat, onBack }) => {
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<'learning' | 'past_paper_solver'>('learning');
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!topic.trim()) return;
    
    try {
      setLoading(true);
      await onStartChat(topic, mode);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <button
        onClick={onBack}
        className="mb-4 text-blue-500 hover:text-blue-700 flex items-center gap-2"
      >
        ← Back to Tutors
      </button>

      <h2 className="text-2xl font-bold mb-2 text-gray-800">
        {tutor.tutorName} - {tutor.subjectName}
      </h2>
      <p className="text-gray-600 mb-6">Select a topic and learning mode</p>

      {/* Mode Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Learning Mode
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="learning"
              checked={mode === 'learning'}
              onChange={(e) => setMode(e.target.value as 'learning')}
              className="mr-3"
            />
            <span className="text-gray-700">
              <strong>Interactive Learning</strong> - Get tutoring and explanations
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="past_paper_solver"
              checked={mode === 'past_paper_solver'}
              onChange={(e) => setMode(e.target.value as 'past_paper_solver')}
              className="mr-3"
            />
            <span className="text-gray-700">
              <strong>Past Paper Solver</strong> - Solve exam questions
            </span>
          </label>
        </div>
      </div>

      {/* Topic Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topic or Question
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter the topic you want to learn about or paste a question..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
        />
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        disabled={loading || !topic.trim()}
        className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors font-medium"
      >
        {loading ? 'Starting...' : 'Start Chat'}
      </button>
    </div>
  );
};

export const ChatbotInterface: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('tutor-select');
  const [selectedTutor, setSelectedTutor] = useState<AiTutor | null>(null);
  const [currentConversation, setCurrentConversation] = useState<ChatbotConversation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectTutor = (tutor: AiTutor) => {
    setSelectedTutor(tutor);
    setViewMode('topic-select');
  };

  const handleStartChat = async (topic: string, mode: 'learning' | 'past_paper_solver') => {
    if (!selectedTutor) return;

    try {
      setError(null);
      const conversation = await chatbotService.startConversation(
        selectedTutor.id,
        topic,
        mode
      );
      setCurrentConversation(conversation);
      setViewMode('chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
    }
  };

  const handleBackToTutors = () => {
    setSelectedTutor(null);
    setViewMode('tutor-select');
  };

  const handleBackToTopicSelect = () => {
    setViewMode('topic-select');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Tutoring System</h1>
          <p className="text-gray-600">Get personalized learning support from AI tutors</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Content */}
        {viewMode === 'tutor-select' && (
          <TutorSelector
            onSelectTutor={handleSelectTutor}
            selectedTutorId={selectedTutor?.id}
          />
        )}

        {viewMode === 'topic-select' && selectedTutor && (
          <TopicSelector
            tutor={selectedTutor}
            onStartChat={handleStartChat}
            onBack={handleBackToTutors}
          />
        )}

        {viewMode === 'chat' && currentConversation && (
          <div className="space-y-4">
            <button
              onClick={handleBackToTopicSelect}
              className="text-blue-500 hover:text-blue-700 flex items-center gap-2"
            >
              ← Back to Topic Selection
            </button>
            <div className="h-96">
              <ChatWindow conversation={currentConversation} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotInterface;

