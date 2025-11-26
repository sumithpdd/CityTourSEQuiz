# Sitecore City Tour London - Quiz App

A Next.js quiz application for Sitecore City Tour London, built with React, Firebase, and deployed on Vercel.

## Features

- User registration form (name, company, optional email) with explicit consent + retention notice
- Randomized quiz with 5 questions pulled from an expanding pool sourced from Sitecore Symposium news and sitecore.com platform content
- Firebase Authentication (anonymous for players, email/password for admins)
- Firebase Firestore for storing questions, responses, feedback, and participant data (30-day retention policy)
- Post-quiz feedback form (“Interested in knowing more?” + open questions)
- Admin dashboard (email/password protected) to review users, quiz responses, and feedback
- Modern Sitecore-branded UI with responsive layout and inline results review

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project with Authentication and Firestore enabled
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CityTourSEQuiz
```

2. Install dependencies:
```bash
npm install
```

3. Download logos:
   ```bash
   npm run download-logos
   ```
   This will download the Sitecore logos to the `public` directory.

4. Set up environment variables:
   - Run `npm run setup-env` to automatically create `.env.local` from the service account JSON
   - Or manually create `.env.local` following the template in `ENV_SETUP.md`
   - Get Firebase Web App config from Firebase Console (see `ENV_SETUP.md` for details)
   - Update the placeholder values in `.env.local`
   - Add a comma-separated list to `NEXT_PUBLIC_ADMIN_EMAILS` for the admin dashboard

5. Enable Firebase features:
   - Enable Anonymous Authentication (for participants)
   - Enable Email/Password Authentication (create at least one admin user)
   - Enable Firestore Database
   - Set up Firestore security rules (see below)

6. Configure admin access:
   - Create one or more Firebase Authentication users with Email/Password
   - Add those emails to `NEXT_PUBLIC_ADMIN_EMAILS` (comma separated) in `.env.local`
   - Update Firestore rules with the same admin emails (see Rules section)

7. Run the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) in your browser

## Firebase Setup

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null
        && request.auth.token.email in [
          'admin@example.com' // replace with your admin emails
        ];
    }

    match /users/{userId} {
      allow read, write: if request.auth != null && (request.auth.uid == userId || isAdmin());
    }
    match /quizResponses/{responseId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (request.auth.uid == resource.data.userId || isAdmin());
      allow update, delete: if false;
    }
    match /questions/{questionId} {
      allow read: if true;
      allow write: if false; // Only admins can write
    }
    match /feedback/{feedbackId} {
      allow create: if request.auth != null;
      allow read: if isAdmin();
    }
  }
}
```

### Seeding Questions

To seed questions to Firestore, you can use the seed script:

```bash
npx ts-node scripts/seed-questions.ts
```

Note: Make sure your `.env.local` file has the Firebase configuration set up.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The app will be automatically deployed on every push to the main branch.

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main player experience
│   └── admin/page.tsx      # Admin dashboard (email/password protected)
│   └── globals.css         # Global styles
├── components/
│   ├── UserForm.tsx        # User registration form
│   ├── Quiz.tsx            # Quiz component
│   └── Results.tsx         # Results + feedback form
├── lib/
│   ├── firebase.ts         # Firebase client helpers
│   ├── firebase-admin.ts   # Server-side (seed script/API) helpers
│   ├── config.ts           # Shared config (admin email list)
│   └── questions.ts        # Question data and utilities
├── scripts/
│   ├── seed-questions.ts   # Script to seed questions to Firestore
│   ├── download-logos.js   # Pull Sitecore logos locally
│   ├── create-env.js       # Generate .env.local from service account
│   └── generate-secret.js  # Standalone NextAuth secret generator
└── public/                 # Static assets
```

## Questions

The quiz randomly selects 5 questions from a pool of 20 questions about SitecoreAI, Sitecore Symposium 2025, and Sitecore platform capabilities from [sitecore.com/platform](https://www.sitecore.com/platform). 

### Adding More Questions

Questions can be added in two ways:

1. **Local Questions**: Add questions to the `initialQuestions` array in `lib/questions.ts`
2. **Firestore Questions**: Use the seed script to populate Firestore, or manually add questions to the `questions` collection in Firestore

The app will automatically:
- Fetch questions from Firestore if available
- Fall back to local questions if Firestore is empty
- Randomly select 5 questions for each quiz session
- Generate additional incorrect answers from a pool of Sitecore-related terms if needed

### Question Format

Each question should have:
- `id`: Unique identifier
- `question`: The question text
- `correctAnswer`: The correct answer
- `incorrectAnswers`: Array of incorrect answer options (minimum 3 recommended)
- `imageUrl` (optional): URL to an image if the question requires one

### Getting Questions from Sitecore Docs

To add questions from https://doc.sitecore.com/sai:
1. Review the documentation
2. Create questions based on key concepts
3. Add them to `lib/questions.ts` or seed them to Firestore

## Admin Dashboard & Feedback Flow

- Access `/admin` and sign in with a Firebase Email/Password account listed in `NEXT_PUBLIC_ADMIN_EMAILS`.
- Dashboard shows:
  - **Participants**: names, companies, optional emails, consent status, last quiz score/time.
  - **Quiz Responses**: each play session with score & timestamp.
  - **Feedback**: submissions from the post-quiz form (“Interested in knowing more?” + open questions).
- All participant data is flagged with the 30-day retention reminder; update your operational process to purge Firestore regularly if required.

## Data & Consent Messaging

- Consent checkbox is mandatory before starting the quiz. Copy reads: “This is for fun, data stored for 30 days, no marketing usage.”
- The results screen reiterates thank-you messaging and captures optional follow-up interest plus freeform questions.
- Feedback is stored in the `feedback` collection and shown only to admins.

## Technologies Used

- **Next.js 14** - React framework
- **React 18** - UI library
- **Firebase** - Authentication and Firestore database
- **TypeScript** - Type safety
- **Vercel** - Deployment platform

## License

See LICENSE file for details.
