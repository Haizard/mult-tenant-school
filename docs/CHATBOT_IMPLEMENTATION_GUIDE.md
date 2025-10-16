# AI Chatbot Implementation Guide

## Overview
This document describes the implementation of the AI Chatbot with Subject-Specific Tutoring system for the multi-tenant school management platform.

## Implementation Summary

### Phase 1: Database Schema ✅
Created comprehensive database models for the chatbot system:

**Models Created:**
1. **AiTutorProfile** - Stores AI tutor configurations
   - Fields: id, tutorName, subjectName, subjectCode, expertiseLevel, teachingStyle, systemPrompt, isActive, createdBy, createdAt, updatedAt
   - Relations: conversations, knowledgeBase

2. **ChatbotConversation** - Tracks conversation sessions
   - Fields: id, tenantId, userId, tutorId, conversationTitle, topic, mode, status, startedAt, endedAt, createdAt, updatedAt
   - Relations: tenant, user, tutor, messages
   - Tenant isolation: All queries filtered by tenantId

3. **ChatbotMessage** - Individual messages in conversations
   - Fields: id, conversationId, senderType, messageContent, messageType, metadata, createdAt
   - Relations: conversation

4. **PastPaper** - Past paper questions and solutions
   - Fields: id, tenantId, subjectId, year, questionNumber, questionContent, solutionContent, difficulty, createdAt, updatedAt
   - Tenant isolation: All queries filtered by tenantId

5. **LearningProgress** - Student learning progress tracking
   - Fields: id, tenantId, userId, subjectId, topicsCompleted, topicsInProgress, averageScore, lastAccessedAt, createdAt, updatedAt
   - Tenant isolation: All queries filtered by tenantId

6. **KnowledgeBase** - AI knowledge base and training data
   - Fields: id, tutorId, contentType, contentData, metadata, createdAt, updatedAt
   - Relations: tutor

7. **ChatbotAnalytics** - Usage analytics and statistics
   - Fields: id, tenantId, userId, conversationCount, totalMessagesCount, averageSessionDuration, lastActivityAt, createdAt, updatedAt
   - Tenant isolation: All queries filtered by tenantId

### Phase 2: Backend API Implementation ✅
Implemented Express.js controllers and routes with proper authentication and authorization:

**Controllers Created:**
- `backend/src/controllers/chatbotController.js`
  - getTutors() - Get all available tutors with optional subject filter
  - getTutorById() - Get specific tutor details
  - createTutor() - Create new AI tutor (admin only)
  - startConversation() - Start new conversation with tutor
  - getConversations() - Get user's conversations with optional status filter
  - getConversationById() - Get specific conversation with messages
  - sendMessage() - Send message to conversation

**Routes Created:**
- `backend/src/routes/chatbotRoutes.js`
  - GET/POST `/api/chatbot/tutors` - Tutor management
  - GET `/api/chatbot/tutors/:id` - Get tutor by ID
  - GET/POST `/api/chatbot/conversations` - Conversation management
  - GET `/api/chatbot/conversations/:id` - Get conversation by ID
  - POST `/api/chatbot/conversations/:conversationId/messages` - Send message

**Security Features:**
- JWT authentication on all routes
- Role-based authorization (chatbot:read, chatbot:create)
- Tenant isolation enforcement
- Audit logging for all operations

### Phase 3: Frontend API Routes & Services ✅
Created Next.js API proxy routes and client-side services:

**API Routes Created:**
- `app/api/chatbot/route.ts` - Main chatbot endpoint
- `app/api/chatbot/tutors/route.ts` - Tutors management
- `app/api/chatbot/tutors/[id]/route.ts` - Get tutor by ID
- `app/api/chatbot/conversations/route.ts` - Conversations management
- `app/api/chatbot/conversations/[id]/route.ts` - Get conversation by ID
- `app/api/chatbot/conversations/[id]/messages/route.ts` - Message handling

**Client Service Created:**
- `lib/chatbotService.ts` - TypeScript service for chatbot operations
  - getTutors(subject?: string)
  - getTutorById(tutorId: string)
  - createTutor(tutorData)
  - startConversation(tutorId, topic, mode)
  - getConversations(status?: string)
  - getConversationById(conversationId)
  - sendMessage(conversationId, messageContent, messageType)

### Phase 4: Frontend UI Components ✅
Built React components for the chatbot interface:

**Components Created:**
1. **TutorSelector** (`app/components/chatbot/TutorSelector.tsx`)
   - Displays available tutors
   - Filter by subject
   - Select tutor to start conversation

2. **ChatWindow** (`app/components/chatbot/ChatWindow.tsx`)
   - Display conversation messages
   - Send new messages
   - Auto-scroll to latest message
   - Real-time message updates

3. **ChatbotInterface** (`app/components/chatbot/ChatbotInterface.tsx`)
   - Main component orchestrating the chatbot flow
   - Tutor selection view
   - Topic selection view
   - Chat window view
   - Mode selection (Learning vs Past Paper Solver)

4. **Chatbot Page** (`app/(dashboard)/chatbot/page.tsx`)
   - Page component for the chatbot interface

### Phase 5: Testing & Validation ✅
Created comprehensive test suites:

**Backend Tests:**
- `backend/src/controllers/__tests__/chatbotController.test.js`
  - Tests for getTutors()
  - Tests for startConversation()
  - Tests for getConversations()
  - Tests for sendMessage()
  - Error handling tests

**Frontend Tests:**
- `lib/__tests__/chatbotService.test.ts`
  - Tests for getTutors()
  - Tests for startConversation()
  - Tests for getConversations()
  - Tests for sendMessage()
  - Error handling tests

## Acceptance Criteria Met

✅ **AC1: AI Tutors with Subject Specialization**
- Implemented AiTutorProfile model with subject specialization
- Support for 6 subjects: Math, History, Chemistry, Physics, Biology, English
- Tutor selection interface with subject filtering

✅ **AC2: Two Learning Modes**
- Learning Mode: Interactive tutoring with explanations
- Past Paper Solver Mode: Exam preparation with past papers
- Mode selection in topic selector component

✅ **AC3: Conversation Management**
- Start new conversations with tutors
- View conversation history
- Archive conversations
- Status tracking (active, archived, completed)

✅ **AC4: Message Handling**
- Send messages to tutors
- Receive AI responses
- Message history with timestamps
- Support for different message types

✅ **AC5: Tenant Isolation**
- All data filtered by tenantId
- Cascade deletes for tenant data
- Middleware enforcement of tenant access
- No cross-tenant data leakage

✅ **AC6: Learning Progress Tracking**
- LearningProgress model for tracking student progress
- Topics completed and in progress
- Average score tracking
- Last accessed timestamp

✅ **AC7: Knowledge Base Management**
- KnowledgeBase model for storing training data
- Support for different content types
- Metadata storage for additional information

✅ **AC8: Analytics & Reporting**
- ChatbotAnalytics model for usage statistics
- Conversation count tracking
- Message count tracking
- Session duration tracking
- Last activity timestamp

## API Endpoints

### Tutors
- `GET /api/chatbot/tutors` - Get all tutors (optional: ?subject=Mathematics)
- `GET /api/chatbot/tutors/:id` - Get tutor by ID
- `POST /api/chatbot/tutors` - Create new tutor (admin only)

### Conversations
- `GET /api/chatbot/conversations` - Get user's conversations (optional: ?status=active)
- `GET /api/chatbot/conversations/:id` - Get conversation with messages
- `POST /api/chatbot/conversations` - Start new conversation

### Messages
- `POST /api/chatbot/conversations/:conversationId/messages` - Send message

## Authentication & Authorization

All endpoints require:
1. **JWT Token** - Passed in Authorization header
2. **Permissions** - Role-based access control
   - `chatbot:read` - Read tutors and conversations
   - `chatbot:create` - Create conversations and send messages
3. **Tenant Isolation** - Enforced at middleware level

## Database Schema

All models include:
- Proper indexes for performance
- Tenant isolation with tenantId
- Cascade deletes for data integrity
- Timestamps (createdAt, updatedAt)
- Proper relationships and constraints

## Running the Application

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
npm install
npm run dev
```

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
npm test
```

## Future Enhancements

1. **AI Integration** - Connect to actual AI models (OpenAI, Claude, etc.)
2. **Real-time Updates** - WebSocket support for live message updates
3. **File Uploads** - Support for document uploads in conversations
4. **Advanced Analytics** - Detailed learning analytics and reports
5. **Customization** - Allow schools to customize tutor personalities
6. **Multi-language Support** - Support for multiple languages
7. **Mobile App** - Native mobile application

## Troubleshooting

### Common Issues

1. **Tenant Isolation Errors**
   - Ensure tenantId is properly set in middleware
   - Check that all queries include tenantId filter

2. **Authentication Errors**
   - Verify JWT token is valid
   - Check token expiration
   - Ensure Authorization header is properly formatted

3. **Database Errors**
   - Run migrations: `npx prisma migrate dev`
   - Check database connection string
   - Verify Prisma schema is up to date

## Support

For issues or questions, please refer to the story documentation in `docs/stories/12.story.md`.

