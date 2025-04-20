# Aura Email Frontend

A modern email client application built with React and TypeScript.

## Project Architecture

### Directory Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React Context providers
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and shared logic
├── pages/          # Page components
├── App.tsx         # Main application component
├── main.tsx        # Application entry point
└── index.css       # Global styles
```

### Core Components

#### Contexts
- `UserEmailContext`: Manages the user's email state and ensures email-dependent operations wait for email availability
- Other contexts for managing application-wide state

#### Pages
- `Index.tsx`: Main email client interface
  - Handles email fetching and pagination
  - Manages email list and detail views
  - Implements email composition and reply functionality
- `NotFound.tsx`: 404 error page

#### Components
- `EmailList`: Displays the list of emails
- `EmailDetail`: Shows detailed view of a single email
- `EmailSidebar`: Navigation sidebar
- `ComposeEmail`: Email composition interface
- UI Components:
  - `Button`
  - `Badge`
  - `Toast`
  - `Tooltip`
  - `Carousel`

### API Endpoints

All API calls are made to `http://127.0.0.1:5000`:

#### Authentication & User
- `GET /api/get_user_email`: Fetches the current user's email

#### Email Management
- `GET /api/fetch_emails`: Retrieves emails with filters
  - Query Parameters:
    - `page`: Page number
    - `filter`: Email filter type ('valid_only', 'spam_and_phishing', 'all')
    - `user_email`: User's email address
- `GET /api/fetch_sent_emails`: Gets sent emails
  - Query Parameters:
    - `page`: Page number
    - `user_email`: User's email address
- `POST /api/send_email`: Sends a new email
  - Body:
    - `to`: Recipient email
    - `subject`: Email subject
    - `body`: Email content
    - `user_email`: Sender's email
- `POST /api/delete_email`: Deletes an email
  - Body:
    - `msg_id`: Email ID
    - `user_email`: User's email
- `POST /api/mark_as_read`: Marks an email as read
  - Body:
    - `msg_id`: Email ID
    - `user_email`: User's email
- `POST /api/refresh`: Checks for new emails
  - Body:
    - `user_email`: User's email

#### AI Features
- `POST /api/generate_reply`: Generates AI reply for an email
  - Body:
    - `msg_id`: Email ID
    - `user_email`: User's email
- `POST /api/summarize_email`: Generates email summary
  - Body:
    - `msg_id`: Email ID
    - `user_email`: User's email

### Utilities

#### Context Hooks
- `useUserEmail`: Hook to access user email context
  - Returns: `{ userEmail, setUserEmail, isEmailLoaded }`

#### UI Utilities
- `cn`: Utility function for conditional class names
- `useToast`: Hook for showing toast notifications
- `useEmblaCarousel`: Hook for carousel functionality

#### Email Utilities
- `convertUrlsToLinks`: Converts URLs in email body to clickable links
- `getFilterForPage`: Maps page types to email filters

### Data Flow

1. **Initialization**
   - Application starts and `UserEmailContext` attempts to fetch user email
   - All email-dependent operations wait for `isEmailLoaded` to be true

2. **Email Fetching**
   - Email fetching is triggered when:
     - User email becomes available
     - User changes active page (inbox/spam/all)
     - User changes page number
   - Emails are fetched with appropriate filters based on the current view

3. **State Management**
   - Uses React Context for global state
   - Local state for component-specific data
   - Proper cleanup and error handling implemented

### Error Handling

- Comprehensive error handling for API requests
- User-friendly error messages
- Graceful fallbacks for failed operations
- Toast notifications for success/error feedback

### Key Features

- Email filtering (valid only, spam and phishing, all)
- Pagination support
- Email composition and reply
- AI-powered features:
  - Email summarization
  - AI-generated replies
- Real-time email status updates
- Responsive design
- URL detection and linking in email content
- Spam and phishing detection indicators

## Development

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

### Dependencies
- React
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- Lucide Icons
- Embla Carousel
- Other UI and utility libraries

## Best Practices

- Type safety with TypeScript
- Component reusability
- Proper state management
- Clean code architecture
- Responsive design principles
- Error handling and user feedback
- API request optimization
- Loading state management 