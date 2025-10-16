'use client';

import React, { useEffect, useState } from 'react';
import { chatbotService, AiTutor } from '@/lib/chatbotService';

interface TutorSelectorProps {
  onSelectTutor: (tutor: AiTutor) => void;
  selectedTutorId?: string;
}

export const TutorSelector: React.FC<TutorSelectorProps> = ({
  onSelectTutor,
  selectedTutorId
}) => {
  const [tutors, setTutors] = useState<AiTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        const data = await chatbotService.getTutors(selectedSubject || undefined);
        setTutors(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tutors');
        setTutors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, [selectedSubject]);

  const subjects = Array.from(new Set(tutors.map(t => t.subjectName)));

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Select Your Tutor</h2>

      {/* Subject Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Subject
        </label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Subjects</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading tutors...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Tutors Grid */}
      {!loading && tutors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tutors.map(tutor => (
            <button
              key={tutor.id}
              onClick={() => onSelectTutor(tutor)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedTutorId === tutor.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <h3 className="font-semibold text-lg text-gray-800">{tutor.tutorName}</h3>
              <p className="text-sm text-gray-600 mt-1">{tutor.subjectName}</p>
              {tutor.subjectCode && (
                <p className="text-xs text-gray-500 mt-1">Code: {tutor.subjectCode}</p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  {tutor.expertiseLevel}
                </span>
                {tutor.teachingStyle && (
                  <span className="text-xs text-gray-600">{tutor.teachingStyle}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && tutors.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          <p>No tutors available for the selected subject.</p>
        </div>
      )}
    </div>
  );
};

export default TutorSelector;

