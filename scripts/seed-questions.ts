import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { initialQuestions, generateIncorrectAnswers } from '../lib/questions';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// This script should be run with environment variables set
// You can run it with: npm run seed
// Make sure .env.local is configured with Firebase service account credentials

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PROJECT_ID) {
  console.error('Missing Firebase Admin credentials in environment variables.');
  console.error('Please ensure .env.local contains:');
  console.error('- FIREBASE_PROJECT_ID');
  console.error('- FIREBASE_PRIVATE_KEY');
  console.error('- FIREBASE_CLIENT_EMAIL');
  process.exit(1);
}

const firebaseConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
};

async function seedQuestions() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const questionsRef = db.collection('questions');

    console.log('Seeding questions to Firestore...');

    // Check if questions already exist
    const existingSnapshot = await questionsRef.get();
    if (!existingSnapshot.empty) {
      console.log(`Found ${existingSnapshot.size} existing questions. Skipping seed.`);
      console.log('To re-seed, delete existing questions from Firestore first.');
      process.exit(0);
    }

    // Add each question to Firestore with enhanced incorrect answers
    for (const question of initialQuestions) {
      // Generate additional incorrect answers if we have less than 3
      const enhancedIncorrectAnswers = 
        question.incorrectAnswers.length >= 3
          ? question.incorrectAnswers
          : generateIncorrectAnswers(question.correctAnswer, question.incorrectAnswers, 3);

      const docRef = questionsRef.doc();
      await docRef.set({
        ...question,
        incorrectAnswers: enhancedIncorrectAnswers,
        createdAt: new Date().toISOString(),
      });
      console.log(`Added question: ${question.question.substring(0, 50)}...`);
    }

    console.log(`Successfully seeded ${initialQuestions.length} questions!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding questions:', error);
    process.exit(1);
  }
}

seedQuestions();

