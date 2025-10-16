# AI Chatbot - Quick Reference Guide

## Quick Start

### Access the Chatbot
```
URL: http://localhost:3000/chatbot
```

### API Base URL
```
Backend: http://localhost:5000/api/chatbot
Frontend Proxy: http://localhost:3000/api/chatbot
```

## API Endpoints

### Tutors
```
GET    /api/chatbot/tutors              # Get all tutors
GET    /api/chatbot/tutors?subject=Math # Filter by subject
GET    /api/chatbot/tutors/:id          # Get tutor by ID
POST   /api/chatbot/tutors              # Create tutor (admin)
```

### Conversations
```
GET    /api/chatbot/conversations              # Get user's conversations
GET    /api/chatbot/conversations?status=active # Filter by status
GET    /api/chatbot/conversations/:id          # Get conversation
POST   /api/chatbot/conversations              # Start conversation
```

### Messages
```
POST   /api/chatbot/conversations/:id/messages # Send message
```

## Request/Response Examples

### Get All Tutors
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/chatbot/tutors
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "tutor-1",
      "tutorName": "Math Master",
      "subjectName": "Mathematics",
      "expertiseLevel": "advanced",
      "isActive": true
    }
  ]
}
```

### Start Conversation
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tutorId": "tutor-1",
    "topic": "Algebra",
    "mode": "learning"
  }' \
  http://localhost:3000/api/chatbot/conversations
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conv-123",
    "tutorId": "tutor-1",
    "topic": "Algebra",
    "mode": "learning",
    "status": "active"
  }
}
```

### Send Message
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messageContent": "What is algebra?",
    "messageType": "text"
  }' \
  http://localhost:3000/api/chatbot/conversations/conv-123/messages
```

## Component Usage

### TutorSelector
```tsx
import TutorSelector from '@/app/components/chatbot/TutorSelector';

<TutorSelector 
  onSelectTutor={(tutor) => console.log(tutor)}
  selectedTutorId="tutor-1"
/>
```

### ChatWindow
```tsx
import ChatWindow from '@/app/components/chatbot/ChatWindow';

<ChatWindow 
  conversation={conversation}
  onMessageSent={(msg) => console.log(msg)}
/>
```

### ChatbotInterface
```tsx
import ChatbotInterface from '@/app/components/chatbot/ChatbotInterface';

<ChatbotInterface />
```

## Service Usage

### Get Tutors
```typescript
import { chatbotService } from '@/lib/chatbotService';

const tutors = await chatbotService.getTutors('Mathematics');
```

### Start Conversation
```typescript
const conversation = await chatbotService.startConversation(
  'tutor-123',
  'Algebra',
  'learning'
);
```

### Send Message
```typescript
const message = await chatbotService.sendMessage(
  'conv-123',
  'What is algebra?',
  'text'
);
```

## Database Models

### AiTutorProfile
```prisma
model AiTutorProfile {
  id              String
  tutorName       String
  subjectName     String
  expertiseLevel  String
  isActive        Boolean
  conversations   ChatbotConversation[]
}
```

### ChatbotConversation
```prisma
model ChatbotConversation {
  id                  String
  tenantId            String
  userId              String
  tutorId             String
  topic               String?
  mode                String
  status              String
  messages            ChatbotMessage[]
}
```

### ChatbotMessage
```prisma
model ChatbotMessage {
  id              String
  conversationId  String
  senderType      String
  messageContent  String
  messageType     String
  conversation    ChatbotConversation
}
```

## Authentication

### Get JWT Token
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "email": "student@school.com",
    "password": "password123"
  }' \
  http://localhost:5000/api/auth/login
```

### Use Token in Requests
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  http://localhost:3000/api/chatbot/tutors
```

## Permissions

### Required Permissions
- `chatbot:read` - Read tutors and conversations
- `chatbot:create` - Create conversations and send messages

### Check User Permissions
```typescript
// In backend middleware
authorize(['chatbot:read'])
authorize(['chatbot:create'])
```

## Error Handling

### Common Errors

**401 Unauthorized**
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid token"
}
```

**403 Forbidden**
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Tutor not found"
}
```

**400 Bad Request**
```json
{
  "success": false,
  "message": "Tutor ID is required"
}
```

## Debugging

### Enable Logging
```typescript
// In chatbotService.ts
console.log('Fetching tutors:', data);
```

### Check Network Requests
```
Browser DevTools → Network tab → Filter by "chatbot"
```

### Check Backend Logs
```bash
cd backend
npm run dev
# Check console output
```

## Common Tasks

### Create a New Tutor
```typescript
const tutor = await chatbotService.createTutor({
  tutorName: 'Physics Expert',
  subjectName: 'Physics',
  expertiseLevel: 'advanced'
});
```

### Get User's Conversations
```typescript
const conversations = await chatbotService.getConversations('active');
```

### Get Conversation with Messages
```typescript
const conversation = await chatbotService.getConversationById('conv-123');
console.log(conversation.messages);
```

## File Locations

```
Backend:
- Controllers: backend/src/controllers/chatbotController.js
- Routes: backend/src/routes/chatbotRoutes.js
- Tests: backend/src/controllers/__tests__/chatbotController.test.js

Frontend:
- API Routes: app/api/chatbot/
- Components: app/components/chatbot/
- Service: lib/chatbotService.ts
- Tests: lib/__tests__/chatbotService.test.ts
- Page: app/(dashboard)/chatbot/page.tsx
```

## Useful Links

- Implementation Guide: `docs/CHATBOT_IMPLEMENTATION_GUIDE.md`
- Validation Checklist: `docs/CHATBOT_VALIDATION_CHECKLIST.md`
- Files Summary: `docs/CHATBOT_FILES_SUMMARY.md`
- Story: `docs/stories/12.story.md`

## Support

For issues:
1. Check the implementation guide
2. Review test files for examples
3. Check browser console for errors
4. Check backend logs
5. Review the validation checklist

---

**Last Updated:** 2025-10-16
**Version:** 1.0

