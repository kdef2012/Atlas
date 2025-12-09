
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { 
  analyzeUserActivity, 
  detectMilestones, 
  generateMilestoneCosmetic,
  calculateEvolutionLevel,
} from '../../../src/lib/ai/activity-analyzer';
import { generateCompleteCosmetic } from '../../../src/lib/ai/cosmetic-generator';
import type { UserActivity, GeneratedCosmetic, EvolutionPathData } from '../../../src/lib/ai/activity-analyzer';


// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Triggered when activity stats are updated
 * Detects milestones and generates cosmetics
 */
export const onActivityUpdate = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const userId = context.params.userId;
    const before = change.before.data();
    const after = change.after.data();
    
    // Check if activityStats changed
    const oldActivity = before.activityStats as UserActivity;
    const newActivity = after.activityStats as UserActivity;
    
    if (!oldActivity || !newActivity || JSON.stringify(oldActivity) === JSON.stringify(newActivity)) {
      return null;
    }
    
    // Detect new milestones
    const milestones = detectMilestones(oldActivity, newActivity);
    
    if (milestones.length === 0) {
      console.log(`No new milestones for user ${userId}`);
      return null;
    }
    
    console.log(`User ${userId} reached ${milestones.length} milestone(s)`);
    
    // Generate cosmetics for each milestone
    const generatedCosmetics: any[] = [];
    
    for (const milestone of milestones) {
      try {
        // Generate cosmetic for this milestone
        const cosmetic = await generateMilestoneCosmetic(
          milestone.activity,
          milestone.threshold,
          after.level || 1,
          after.evolutionPath?.primaryPath || 'balanced'
        );
        
        // Generate complete cosmetic with SVG and CSS
        const completeCosmetic = await generateCompleteCosmetic(cosmetic);
        
        generatedCosmetics.push({
          ...completeCosmetic,
          unlockedAt: admin.firestore.FieldValue.serverTimestamp(),
          milestone: {
            activity: milestone.activity,
            threshold: milestone.threshold,
          },
        });
        
        console.log(`Generated cosmetic: ${cosmetic.name}`);
      } catch (error) {
        console.error(`Failed to generate cosmetic for milestone:`, error);
      }
    }
    
    if (generatedCosmetics.length === 0) {
      return null;
    }
    
    // Save generated cosmetics to user document
    const cosmeticsMap: Record<string, any> = {};
    generatedCosmetics.forEach(cosmetic => {
      cosmeticsMap[cosmetic.id] = cosmetic;
    });
    
    await db.collection('users').doc(userId).update({
      [`aiGeneratedCosmetics`]: admin.firestore.FieldValue.merge(cosmeticsMap),
      [`newCosmeticsCount`]: admin.firestore.FieldValue.increment(generatedCosmetics.length),
    });
    
    // Send notification
    await db.collection('notifications').add({
      userId,
      type: 'cosmetics_earned',
      title: `You earned ${generatedCosmetics.length} new cosmetic${generatedCosmetics.length > 1 ? 's' : ''}!`,
      message: generatedCosmetics.map(c => c.name).join(', '),
      cosmetics: generatedCosmetics.map(c => ({ id: c.id, name: c.name })),
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log(`Successfully generated ${generatedCosmetics.length} cosmetics for user ${userId}`);
    
    return null;
  });

/**
 * Scheduled function: Nightly evolution analysis
 * Runs at 2 AM daily to analyze all users and generate suggestions
 */
export const nightlyEvolutionAnalysis = functions.pubsub
  .schedule('0 2 * * *') // 2 AM daily
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('Starting nightly evolution analysis');
    
    // Get all active users (logged in within last 7 days)
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const usersSnapshot = await db.collection('users')
      .where('lastLogTimestamp', '>', weekAgo)
      .get();
    
    console.log(`Analyzing ${usersSnapshot.size} active users`);
    
    let processed = 0;
    let failed = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      try {
        const userId = userDoc.id;
        const userData = userDoc.data();
        
        const activity = userData.activityStats as UserActivity;
        const currentLevel = userData.level || 1;
        
        if (!activity) {
          continue;
        }
        
        // Analyze activity and get suggestions
        const analysis = await analyzeUserActivity(activity, currentLevel);
        
        // Calculate new evolution level
        const newLevel = calculateEvolutionLevel(activity);
        
        // Update user document with analysis
        await db.collection('users').doc(userId).update({
          evolutionPath: analysis.evolutionPath,
          evolutionLevel: newLevel,
          suggestedCosmetics: analysis.suggestedCosmetics,
          lastAnalysisAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        // If level increased, send notification
        if (newLevel > (userData.evolutionLevel || userData.level)) {
          await db.collection('notifications').add({
            userId,
            type: 'level_up',
            title: `Level Up! You're now evolution level ${newLevel}!`,
            message: analysis.motivationalMessage,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        
        processed++;
      } catch (error) {
        console.error(`Failed to analyze user ${userDoc.id}:`, error);
        failed++;
      }
      
      // Rate limiting: wait 1 second between users
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`Nightly analysis complete: ${processed} processed, ${failed} failed`);
    return null;
  });

/**
 * Callable function: Manually trigger evolution analysis for a user
 */
export const triggerEvolutionAnalysis = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }
  
  const userId = context.auth.uid;
  
  try {
    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }
    
    const userData = userDoc.data()!;
    const activity = userData.activityStats as UserActivity;
    const currentLevel = userData.level || 1;
    
    if (!activity) {
      throw new functions.https.HttpsError('failed-precondition', 'No activity data found');
    }
    
    // Analyze activity
    const analysis = await analyzeUserActivity(activity, currentLevel);
    
    // Calculate new level
    const newLevel = calculateEvolutionLevel(activity);
    
    // Update user document
    await db.collection('users').doc(userId).update({
      evolutionPath: analysis.evolutionPath,
      evolutionLevel: newLevel,
      suggestedCosmetics: analysis.suggestedCosmetics,
      lastAnalysisAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return {
      success: true,
      analysis,
      newLevel,
    };
  } catch (error) {
    console.error('Evolution analysis failed:', error);
    throw new functions.https.HttpsError('internal', 'Analysis failed');
  }
});

/**
 * HTTP endpoint: Get evolution status (for dashboard)
 */
export const getEvolutionStatus = functions.https.onRequest(async (req, res) => {
  // CORS
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }
  
  try {
    // Get stats from all users
    const usersSnapshot = await db.collection('users').get();
    
    const stats = {
      totalUsers: usersSnapshot.size,
      evolutionPaths: {} as Record<string, number>,
      averageLevel: 0,
      totalCosmetics: 0,
    };
    
    let totalLevel = 0;
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Count evolution paths
      const path = data.evolutionPath?.primaryPath || 'unknown';
      stats.evolutionPaths[path] = (stats.evolutionPaths[path] || 0) + 1;
      
      // Sum levels
      totalLevel += data.evolutionLevel || data.level || 0;
      
      // Count cosmetics
      const cosmetics = data.aiGeneratedCosmetics || {};
      stats.totalCosmetics += Object.keys(cosmetics).length;
    });
    
    stats.averageLevel = Math.round(totalLevel / stats.totalUsers);
    
    res.json(stats);
  } catch (error) {
    console.error('Failed to get evolution status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

    