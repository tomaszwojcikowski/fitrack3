/**
 * Seed data for "The 20-Week Integrated Strength Program (V19: Pro Edition)"
 * This file contains all exercises, templates, blocks, and program data
 */

import { 
  db,
  addExercise,
  addExerciseInstance,
  addWorkoutTemplate,
  addMobilityFlow,
  addBlock,
  addProgram
} from './database.js';

/**
 * Seed the 20-week program data
 * This function creates all exercises, templates, blocks, and the program itself
 */
export const seed20WeekProgram = async () => {
  // Check if the 20-week program already exists
  const existingProgram = await db.programs
    .where('name')
    .equals('20-Week Integrated Strength Program')
    .first();
  
  if (existingProgram) {
    console.log('20-Week Program already seeded');
    return existingProgram.id;
  }

  console.log('Seeding 20-Week Integrated Strength Program...');

  // Step 1: Create all unique exercises
  const exercises = await createExercises();
  
  // Step 2: Create mobility flows
  const flows = await createMobilityFlows();
  
  // Step 3: Create workout templates for all 20 weeks
  const templates = await createWorkoutTemplates(exercises, flows);
  
  // Step 4: Create the program with blocks and schedule
  const programId = await create20WeekProgram(templates);
  
  console.log('20-Week Program seeded successfully!');
  return programId;
};

/**
 * Create all unique exercises used in the 20-week program
 */
async function createExercises() {
  const exerciseList = [
    // Pulling exercises
    {
      name: 'Pull-ups',
      muscleGroup: 'Back',
      type: 'Compound',
      equipment: 'Bodyweight',
      instructions: 'Start from dead hang, pull until chin is over bar, lower with control',
      coachNotes: 'Focus on scapular engagement. Avoid kipping unless specified.'
    },
    {
      name: 'Weighted Pull-ups',
      muscleGroup: 'Back',
      type: 'Compound',
      equipment: 'Weight Belt',
      instructions: 'Pull-ups with additional weight attached to belt or dip belt',
      coachNotes: 'Use a weight you can control perfectly. Progress weight gradually.'
    },
    {
      name: 'Mixed-Grip Pull-ups',
      muscleGroup: 'Back',
      type: 'Compound',
      equipment: 'Bodyweight',
      instructions: 'One hand pronated, one supinated. Switch grip each set.',
      coachNotes: 'This prepares you for archer pull-ups. Focus on even pulling.'
    },
    {
      name: 'Archer Pull-up Negatives',
      muscleGroup: 'Back',
      type: 'Compound',
      equipment: 'Bodyweight',
      instructions: 'Pull-up with one arm extended, slow negative (3-5s)',
      coachNotes: 'This is the gateway to one-arm pull-ups. Control is everything.'
    },
    {
      name: 'Offset Pull-ups (Band Assist)',
      muscleGroup: 'Back',
      type: 'Compound',
      equipment: 'Resistance Band',
      instructions: 'One hand on bar, other hand on resistance band for assistance',
      coachNotes: 'Main arm does most of the work. Band provides minimal help.'
    },
    {
      name: 'Ring Rows',
      muscleGroup: 'Back',
      type: 'Compound',
      equipment: 'Rings',
      instructions: 'Horizontal pulling on rings, body straight, pull chest to rings',
      coachNotes: 'Adjust difficulty by changing foot position. Lower is harder.'
    },
    {
      name: 'Archer Row Negatives',
      muscleGroup: 'Back',
      type: 'Compound',
      equipment: 'Rings',
      instructions: 'Row with one arm extended, focus on slow negative',
      coachNotes: 'Prepares for full archer rows. Keep body straight.'
    },
    {
      name: 'Archer Rows (Assisted)',
      muscleGroup: 'Back',
      type: 'Compound',
      equipment: 'Rings',
      instructions: 'Archer row with opposite arm providing minimal assistance',
      coachNotes: 'Progress from negatives to assisted to full archers.'
    },
    {
      name: 'Banded Straight Arm Pulldowns',
      muscleGroup: 'Back',
      type: 'Isolation',
      equipment: 'Resistance Band',
      instructions: 'Arms straight, pull band down to hips, focus on lat activation',
      coachNotes: 'This is activation work. Light band, focus on feeling the lats.'
    },
    
    // Pushing exercises
    {
      name: 'Ring Push-ups',
      muscleGroup: 'Chest',
      type: 'Compound',
      equipment: 'Rings',
      instructions: 'Push-ups on rings, rings at chest height when at bottom',
      coachNotes: 'Rings add instability. Keep body straight, control the descent.'
    },
    {
      name: 'Ring Push-ups (RTO)',
      muscleGroup: 'Chest',
      type: 'Compound',
      equipment: 'Rings',
      instructions: 'Push-ups with rings turned out at the top position',
      coachNotes: 'This is significantly harder. Turn rings out only at the top.'
    },
    {
      name: 'Weighted Push-ups (on Parallettes/Bars)',
      muscleGroup: 'Chest',
      type: 'Compound',
      equipment: 'Parallettes, Weight Vest',
      instructions: 'Push-ups with weight vest or plate on back',
      coachNotes: 'Parallettes allow deeper range of motion and wrist comfort.'
    },
    {
      name: 'Pseudo-Planche Push-ups',
      muscleGroup: 'Chest',
      type: 'Advanced',
      equipment: 'Parallettes',
      instructions: 'Push-up with significant forward lean, shoulders in front of hands',
      coachNotes: 'This is a straight-arm strength builder. Lean is key.'
    },
    {
      name: 'Dips',
      muscleGroup: 'Chest',
      type: 'Compound',
      equipment: 'Parallel Bars',
      instructions: 'Lower until upper arms parallel to ground, push back up',
      coachNotes: 'Control the negative. Only go as deep as shoulders feel comfortable.'
    },
    {
      name: 'Weighted Dips',
      muscleGroup: 'Chest',
      type: 'Compound',
      equipment: 'Weight Belt',
      instructions: 'Dips with additional weight on belt',
      coachNotes: 'Progress weight gradually. Protect your shoulders.'
    },
    {
      name: 'Ring Dips',
      muscleGroup: 'Chest',
      type: 'Compound',
      equipment: 'Rings',
      instructions: 'Dips on rings with rings turned out',
      coachNotes: 'Much harder than bar dips due to instability.'
    },
    
    // Lower body
    {
      name: 'Bulgarian Split Squat',
      muscleGroup: 'Legs',
      type: 'Compound',
      equipment: 'Bench, Dumbbells',
      instructions: 'Rear foot elevated, lower front leg to 90 degrees',
      coachNotes: 'Control 3s negative. Only go as deep as knee feels 100% pain-free.'
    },
    {
      name: 'Cossack Squats',
      muscleGroup: 'Legs',
      type: 'Compound',
      equipment: 'Bodyweight',
      instructions: 'Wide stance, shift weight to one leg, other leg straight',
      coachNotes: 'Focus on depth and mobility. Great for hip health.'
    },
    
    // Core exercises
    {
      name: 'Hollow Body Rocks',
      muscleGroup: 'Core',
      type: 'Isolation',
      equipment: 'Bodyweight',
      instructions: 'Hollow body position, rock back and forth',
      coachNotes: 'Lower back pressed to floor. Small controlled rocks.'
    },
    {
      name: 'Hollow Body Hold',
      muscleGroup: 'Core',
      type: 'Isolation',
      equipment: 'Bodyweight',
      instructions: 'Hollow body position, hold static',
      coachNotes: 'Arms and legs off ground, lower back pressed to floor.'
    },
    {
      name: 'L-Sit Progression',
      muscleGroup: 'Core',
      type: 'Advanced',
      equipment: 'Parallettes',
      instructions: 'Progress from tuck to single-leg to full L-sit',
      coachNotes: 'Push shoulders down. Progress when you can hold for all prescribed time.'
    },
    {
      name: 'L-Sit Pull-ups (Tuck)',
      muscleGroup: 'Back',
      type: 'Advanced',
      equipment: 'Bodyweight',
      instructions: 'Pull-ups while holding tuck L-sit position',
      coachNotes: 'Keep core engaged throughout. Start with tuck.'
    },
    {
      name: 'L-Sit Pull-ups (Single Leg)',
      muscleGroup: 'Back',
      type: 'Advanced',
      equipment: 'Bodyweight',
      instructions: 'Pull-ups with one leg extended',
      coachNotes: 'Alternate legs each set.'
    },
    {
      name: 'L-Sit Pull-ups (Full)',
      muscleGroup: 'Back',
      type: 'Advanced',
      equipment: 'Bodyweight',
      instructions: 'Pull-ups with full L-sit position',
      coachNotes: 'Both legs extended at 90 degrees. Ultimate core-pull combo.'
    },
    {
      name: 'Hanging Knee Raises',
      muscleGroup: 'Core',
      type: 'Compound',
      equipment: 'Pull-up Bar',
      instructions: 'Hang from bar, raise knees to chest, slow controlled',
      coachNotes: 'Avoid swinging. Control the movement.'
    },
    {
      name: 'Hanging Leg Raises',
      muscleGroup: 'Core',
      type: 'Compound',
      equipment: 'Pull-up Bar',
      instructions: 'Hang from bar, raise straight legs to 90 degrees',
      coachNotes: 'Can do tuck or straight legs based on strength.'
    },
    {
      name: 'Hanging Windshield Wipers (Bent)',
      muscleGroup: 'Core',
      type: 'Advanced',
      equipment: 'Pull-up Bar',
      instructions: 'Legs raised, rotate side to side',
      coachNotes: 'Bent knees make it easier. Great for obliques.'
    },
    {
      name: 'Hanging Windshield Wipers (Straight)',
      muscleGroup: 'Core',
      type: 'Advanced',
      equipment: 'Pull-up Bar',
      instructions: 'Straight legs raised, rotate side to side',
      coachNotes: 'Advanced movement. Control is crucial.'
    },
    {
      name: 'Toes-to-Bar (Strict)',
      muscleGroup: 'Core',
      type: 'Advanced',
      equipment: 'Pull-up Bar',
      instructions: 'Hang from bar, touch toes to bar, no kipping',
      coachNotes: 'This is strict, no momentum. Very challenging.'
    },
    {
      name: 'Ab Wheel Rollouts (Knees)',
      muscleGroup: 'Core',
      type: 'Compound',
      equipment: 'Ab Wheel',
      instructions: 'From knees, roll out while maintaining hollow body',
      coachNotes: 'Don\'t let hips sag. Roll out as far as you can control.'
    },
    {
      name: 'Plank Drags',
      muscleGroup: 'Core',
      type: 'Compound',
      equipment: 'Weight Plate',
      instructions: 'In plank position, drag weight from side to side',
      coachNotes: 'Keep hips level. Great anti-rotation work.'
    },
    {
      name: 'Side Plank',
      muscleGroup: 'Core',
      type: 'Isolation',
      equipment: 'Bodyweight',
      instructions: 'Side plank position, hold or add hip dips',
      coachNotes: 'Body in straight line. Can add hip dips for extra work.'
    },
    {
      name: 'Side Plank Crunches',
      muscleGroup: 'Core',
      type: 'Isolation',
      equipment: 'Bodyweight',
      instructions: 'Side plank with top elbow to knee crunch',
      coachNotes: 'Targets obliques. Controlled movement.'
    },
    {
      name: 'Plank with Shoulder Taps',
      muscleGroup: 'Core',
      type: 'Compound',
      equipment: 'Bodyweight',
      instructions: 'Hold plank, alternate tapping opposite shoulders',
      coachNotes: 'Keep hips still. Great anti-rotation exercise.'
    },
    {
      name: 'Bird-Dog',
      muscleGroup: 'Core',
      type: 'Isolation',
      equipment: 'Bodyweight',
      instructions: 'On all fours, extend opposite arm and leg',
      coachNotes: 'Focus on stability. Great for lower back health.'
    },
    {
      name: 'Arch Body Rocks',
      muscleGroup: 'Back',
      type: 'Isolation',
      equipment: 'Bodyweight',
      instructions: 'Face down, arch position (superman), rock',
      coachNotes: 'Counterbalance to hollow body. Posterior chain activation.'
    },
    {
      name: 'Arch Body Hold',
      muscleGroup: 'Back',
      type: 'Isolation',
      equipment: 'Bodyweight',
      instructions: 'Face down, arch position, hold static',
      coachNotes: 'Squeeze glutes and engage posterior chain.'
    },
    {
      name: 'Russian Twists',
      muscleGroup: 'Core',
      type: 'Isolation',
      equipment: 'Bodyweight',
      instructions: 'Seated, lean back, rotate torso side to side',
      coachNotes: 'Can hold weight for added difficulty. Control the rotation.'
    },
    {
      name: 'Seated Windshield Wipers',
      muscleGroup: 'Core',
      type: 'Isolation',
      equipment: 'Bodyweight',
      instructions: 'Seated, legs extended, rotate legs side to side',
      coachNotes: 'Slow and controlled. Great for obliques.'
    },
    {
      name: 'L-Sit Flutter Kicks',
      muscleGroup: 'Core',
      type: 'Advanced',
      equipment: 'Parallettes',
      instructions: 'Hold L-sit position with small flutter kicks',
      coachNotes: 'Maintain L-sit position while adding flutter kicks.'
    },
    {
      name: 'Renegade Rows',
      muscleGroup: 'Core',
      type: 'Compound',
      equipment: 'Dumbbells',
      instructions: 'In plank on dumbbells, row one arm at a time',
      coachNotes: 'Keep hips level. Can do bodyweight or light weight.'
    },
    {
      name: 'Dragon Flag Negatives',
      muscleGroup: 'Core',
      type: 'Advanced',
      equipment: 'Bench',
      instructions: 'Lie on bench, raise body to vertical, slow negative',
      coachNotes: 'Can do tucked or single leg. Very advanced.'
    },
    
    // Skill work and warmup movements
    {
      name: 'HSPU',
      muscleGroup: 'Shoulders',
      type: 'Advanced',
      equipment: 'Wall',
      instructions: 'Handstand push-ups against wall',
      coachNotes: 'Progress from pike push-ups if needed. Control the descent.'
    },
    {
      name: 'Crow Stand',
      muscleGroup: 'Core',
      type: 'Skill',
      equipment: 'Bodyweight',
      instructions: 'Hands on ground, knees on elbows, lean forward until feet lift',
      coachNotes: 'Start with weight shifts. Build confidence before full balance.'
    },
    {
      name: 'Wall Handstand Hold',
      muscleGroup: 'Shoulders',
      type: 'Skill',
      equipment: 'Wall',
      instructions: 'Kick up to handstand against wall, hold',
      coachNotes: 'Focus on pushing through shoulders, hollow body position.'
    },
    {
      name: 'Ring Support Hold (RTO)',
      muscleGroup: 'Chest',
      type: 'Skill',
      equipment: 'Rings',
      instructions: 'Support position on rings with rings turned out',
      coachNotes: 'Foundation for ring dips. Turn rings out as much as possible.'
    },
    {
      name: 'Pseudo-Planche Holds',
      muscleGroup: 'Chest',
      type: 'Skill',
      equipment: 'Parallettes',
      instructions: 'Lean forward in push-up position, shoulders in front of hands',
      coachNotes: 'Building straight-arm strength. Hold the lean.'
    },
    {
      name: 'Skin the Cat',
      muscleGroup: 'Shoulders',
      type: 'Skill',
      equipment: 'Pull-up Bar',
      instructions: 'Hang, tuck knees, rotate backwards through shoulders',
      coachNotes: 'Great for shoulder mobility. Go slow, stop if painful.'
    },
    
    // Posterior chain (Workout D)
    {
      name: 'Romanian Deadlift (RDL)',
      muscleGroup: 'Back',
      type: 'Compound',
      equipment: 'Barbell',
      instructions: 'Barbell RDL with focus on hip hinge',
      coachNotes: 'Push hips back, feel hamstring stretch. Don\'t round back.'
    },
    {
      name: 'Barbell/Dumbbell Good Morning',
      muscleGroup: 'Back',
      type: 'Compound',
      equipment: 'Barbell',
      instructions: 'Bar on back, hinge at hips keeping back straight',
      coachNotes: 'This is a hinge, not a squat. Start light.'
    },
    {
      name: 'Single-Leg Romanian Deadlift (SL-RDL)',
      muscleGroup: 'Back',
      type: 'Compound',
      equipment: 'Dumbbell',
      instructions: 'Single leg RDL with dumbbell in opposite hand',
      coachNotes: 'Balance and flat back are key. Great unilateral work.'
    },
    {
      name: 'Weighted Glute Bridge',
      muscleGroup: 'Legs',
      type: 'Isolation',
      equipment: 'Dumbbell',
      instructions: 'Glute bridge with weight on hips, 2s squeeze at top',
      coachNotes: 'Focus on glute squeeze, not lower back.'
    },
    {
      name: 'Nordic Hamstring Negatives',
      muscleGroup: 'Legs',
      type: 'Advanced',
      equipment: 'Bodyweight',
      instructions: 'Kneeling, lower body forward with control',
      coachNotes: 'Extremely challenging. Can substitute with easier variations.'
    },
    {
      name: 'Single-Leg Calf Raises',
      muscleGroup: 'Legs',
      type: 'Isolation',
      equipment: 'Step',
      instructions: 'On step, single leg calf raise to failure',
      coachNotes: 'Full range of motion. Control the negative.'
    },
    {
      name: 'Banded Face Pulls',
      muscleGroup: 'Shoulders',
      type: 'Isolation',
      equipment: 'Resistance Band',
      instructions: 'Pull band to face while externally rotating shoulders',
      coachNotes: 'This is prehab. Focus on external rotation.'
    },
    
    // Warmup/mobility exercises
    {
      name: 'Wrist Mobility',
      muscleGroup: 'Arms',
      type: 'Mobility',
      equipment: 'Bodyweight',
      instructions: 'Wrist circles, flexion, extension',
      coachNotes: 'Essential before any hand-balancing or gymnastics work.'
    },
    {
      name: 'Shoulder CARs',
      muscleGroup: 'Shoulders',
      type: 'Mobility',
      equipment: 'Bodyweight',
      instructions: 'Controlled Articular Rotations for shoulders',
      coachNotes: 'Full range shoulder circles. Slow and controlled.'
    },
    {
      name: 'Cat-Cow',
      muscleGroup: 'Core',
      type: 'Mobility',
      equipment: 'Bodyweight',
      instructions: 'On all fours, alternate between cat and cow positions',
      coachNotes: 'Great for spinal mobility. Breathe with the movement.'
    },
    {
      name: 'Spiderman Lunge w/ T-Spine Rotation',
      muscleGroup: 'Legs',
      type: 'Mobility',
      equipment: 'Bodyweight',
      instructions: 'Lunge position, rotate torso toward front leg',
      coachNotes: 'Opens hips and thoracic spine. Great dynamic warmup.'
    },
    {
      name: 'Deep Squat Hold',
      muscleGroup: 'Legs',
      type: 'Mobility',
      equipment: 'Bodyweight',
      instructions: 'Bodyweight squat, hold at bottom position',
      coachNotes: 'Work on depth and comfort. Can hold onto support if needed.'
    },
    {
      name: 'Glute Bridge',
      muscleGroup: 'Legs',
      type: 'Activation',
      equipment: 'Bodyweight',
      instructions: 'Lie on back, drive through heels, squeeze glutes at top',
      coachNotes: 'Warmup activation. 2s squeeze at top.'
    },
    {
      name: 'Banded Side-Steps',
      muscleGroup: 'Legs',
      type: 'Activation',
      equipment: 'Resistance Band',
      instructions: 'Band around knees, sidestep maintaining tension',
      coachNotes: 'Activates glute medius. Great for knee health.'
    },
    {
      name: 'Bodyweight Good Mornings',
      muscleGroup: 'Back',
      type: 'Activation',
      equipment: 'Bodyweight',
      instructions: 'Hip hinge pattern, bodyweight only',
      coachNotes: 'Practice the hinge pattern. Warmup for posterior chain.'
    },
    
    // Stretches (Ponder phase)
    {
      name: 'Dead Hang',
      muscleGroup: 'Back',
      type: 'Stretch',
      equipment: 'Pull-up Bar',
      instructions: 'Hang from bar, relax shoulders, decompress spine',
      coachNotes: 'Great for shoulder and spine health. Just hang and breathe.'
    },
    {
      name: 'Wrist/Forearm Stretches',
      muscleGroup: 'Arms',
      type: 'Stretch',
      equipment: 'Bodyweight',
      instructions: 'Various wrist and forearm stretches',
      coachNotes: 'Essential after rings, HSPU, or L-sits.'
    },
    {
      name: 'Child\'s Pose w/ Lat Stretch',
      muscleGroup: 'Back',
      type: 'Stretch',
      equipment: 'Bodyweight',
      instructions: 'Child\'s pose with arms extended, feel lat stretch',
      coachNotes: 'Walk hands to side for deeper lat stretch.'
    },
    {
      name: 'Chest Stretch',
      muscleGroup: 'Chest',
      type: 'Stretch',
      equipment: 'Doorway/Rings',
      instructions: 'Stretch pecs on doorway or rings',
      coachNotes: 'Essential after pushing work.'
    },
    {
      name: 'Tricep/Chest "Dip" Stretch',
      muscleGroup: 'Arms',
      type: 'Stretch',
      equipment: 'Parallel Bars',
      instructions: 'Support position on bars, sink into stretch',
      coachNotes: 'Gentle stretch after dips.'
    },
    {
      name: 'Couch Stretch',
      muscleGroup: 'Legs',
      type: 'Stretch',
      equipment: 'Couch/Wall',
      instructions: 'Rear leg on couch, front leg in lunge, stretch hip flexor',
      coachNotes: 'Essential for Bulgarian split squats. Great for hip health.'
    },
    {
      name: 'Pigeon Stretch',
      muscleGroup: 'Legs',
      type: 'Stretch',
      equipment: 'Bodyweight',
      instructions: 'Front leg bent, rear leg extended, sink into hip stretch',
      coachNotes: 'Deep glute stretch. Hold for extended time.'
    },
    {
      name: 'Seated Forward Fold',
      muscleGroup: 'Legs',
      type: 'Stretch',
      equipment: 'Bodyweight',
      instructions: 'Seated, legs extended, fold forward',
      coachNotes: 'Hamstring stretch. Breathe into it.'
    },
    {
      name: 'Wall Calf Stretch',
      muscleGroup: 'Legs',
      type: 'Stretch',
      equipment: 'Wall',
      instructions: 'Front of foot on wall, lean in to stretch calf',
      coachNotes: 'Both straight and bent knee versions.'
    },
    {
      name: 'Bicep Stretch',
      muscleGroup: 'Arms',
      type: 'Stretch',
      equipment: 'Wall',
      instructions: 'Arm extended on wall, rotate body away',
      coachNotes: 'After heavy pulling work.'
    },
    {
      name: 'Seated Spinal Twist',
      muscleGroup: 'Core',
      type: 'Stretch',
      equipment: 'Bodyweight',
      instructions: 'Seated, rotate torso, use opposite elbow for leverage',
      coachNotes: 'Great for obliques and spine mobility.'
    },
    {
      name: '"Archer" Lat Stretch',
      muscleGroup: 'Back',
      type: 'Stretch',
      equipment: 'Bodyweight',
      instructions: 'Seated, side bend to stretch lat',
      coachNotes: 'Specific for archer pull-up work.'
    },
    {
      name: 'Wall Slides',
      muscleGroup: 'Shoulders',
      type: 'Mobility',
      equipment: 'Wall',
      instructions: 'Back against wall, slide arms up and down',
      coachNotes: 'Great for scapular health.'
    },
    {
      name: 'Scapular Pull-ups',
      muscleGroup: 'Back',
      type: 'Activation',
      equipment: 'Pull-up Bar',
      instructions: 'Hang, pull scapula down without bending arms',
      coachNotes: 'Activation for pulling movements.'
    }
  ];

  // Add exercises and create a map of name to ID
  const exerciseMap = {};
  for (const exercise of exerciseList) {
    // Check if exercise already exists
    const existing = await db.exercises.where('name').equals(exercise.name).first();
    if (existing) {
      exerciseMap[exercise.name] = existing.id;
    } else {
      const id = await addExercise(exercise);
      exerciseMap[exercise.name] = id;
    }
  }

  return exerciseMap;
}

/**
 * Create mobility flows library
 */
async function createMobilityFlows() {
  const flows = [
    {
      name: 'Flow 1: Squat/Lunge',
      flowNumber: 1,
      description: 'Deep Squat → Spiderman Lunge → Downward Dog → Plank → Slow Push-up → Upward Dog → Downward Dog → Deep Squat → Stand',
      duration: '10-15 min'
    },
    {
      name: 'Flow 2: Beast to Plank',
      flowNumber: 2,
      description: 'Quadruped → Beast (knees 1" off ground) → Plank → Pike to Downward Dog → Spinal wave to Upward Dog → Plank → Beast → Knees down',
      duration: '10-15 min'
    },
    {
      name: 'Flow 3: Cossack/Lunge',
      flowNumber: 3,
      description: 'Wide stance → Cossack Squat (L) → Low Lunge (L) → Plank → Downward Dog → Low Lunge (R) → Cossack Squat (R) → Center',
      duration: '10-15 min'
    },
    {
      name: 'Flow 4: Spinal Wave',
      flowNumber: 4,
      description: 'Standing roll down → Walk to Plank → Segmental Cat-Cows → Downward Dog → Spinal Waves → Walk back → Roll up',
      duration: '10-15 min'
    },
    {
      name: 'Flow 5: Freestyle',
      flowNumber: 5,
      description: 'Combine movements from above flows. Focus on tight areas. Move continuously with breath.',
      duration: '10-15 min'
    },
    {
      name: 'Flow 6: Thoracic & Shoulder',
      flowNumber: 6,
      description: 'Quadruped → Cat-Cow (5x) → Thread the Needle (5x each) → Scapular Push-ups (10x) → Prone Snow Angels (10x) → Child\'s Pose',
      duration: '10-15 min'
    },
    {
      name: 'Flow 7: Hip Opener',
      flowNumber: 7,
      description: 'Deep Squat Hold (1min) → Spiderman Lunges (10x) → Cossack Squats (10x) → 90/90 stretch (30s each) → Frog Stretch (1min) → Pigeon (30s each)',
      duration: '10-15 min'
    },
    {
      name: 'Flow 8: Spinal Decompression',
      flowNumber: 8,
      description: 'Dead Hang (1min or 3x20s) → Segmental Cat-Cow (10x) → Seal Stretch (1min) → Supine Twist (1min each) → Child\'s Pose (1min)',
      duration: '10-15 min'
    }
  ];

  const flowMap = {};
  for (const flow of flows) {
    // Check if flow already exists
    const existing = await db.mobilityFlows.where('name').equals(flow.name).first();
    if (existing) {
      flowMap[flow.name] = existing.id;
    } else {
      const id = await addMobilityFlow(flow);
      flowMap[flow.name] = id;
    }
  }

  return flowMap;
}

/**
 * Generic template creator from workout data
 */
async function createTemplate(name, workoutData, exercises, flows) {
  const templateId = await addWorkoutTemplate({
    name: name,
    exerciseIds: []
  });
  
  // Add prepare phase
  if (workoutData.prepare) {
    await addExercises(templateId, workoutData.prepare.map(ex => ({
      ...ex,
      exerciseId: exercises[ex.exercise]
    })), 'prepare');
  }
  
  // Add practice phase
  if (workoutData.practice) {
    await addExercises(templateId, workoutData.practice.map(ex => ({
      ...ex,
      exerciseId: exercises[ex.exercise]
    })), 'practice');
  }
  
  // Add perform phase
  if (workoutData.perform) {
    await addExercises(templateId, workoutData.perform.map(ex => ({
      ...ex,
      exerciseId: exercises[ex.exercise]
    })), 'perform');
  }
  
  // Add ponder phase
  if (workoutData.ponder) {
    await addExercises(templateId, workoutData.ponder.map(ex => ({
      ...ex,
      exerciseId: exercises[ex.exercise]
    })), 'ponder');
  }
  
  return templateId;
}

/**
 * Get workout data definitions for all 20 weeks
 */
function getWorkoutDataDefinitions() {
  const warmup = () => [
    { exercise: 'Wrist Mobility' },
    { exercise: 'Shoulder CARs' },
    { exercise: 'Cat-Cow', reps: '10' },
    { exercise: 'Spiderman Lunge w/ T-Spine Rotation', reps: '5/side' },
    { exercise: 'Deep Squat Hold', time: '1-2 min' },
    { exercise: 'Banded Straight Arm Pulldowns', sets: '2', reps: '12-15', notes: 'Light, focus on lat activation' }
  ];
  
  const ponderDay1 = () => [
    { exercise: 'Dead Hang', sets: '2', time: '30s' },
    { exercise: 'Wrist/Forearm Stretches', time: '1 min', notes: 'Essential after rings/HSPU' },
    { exercise: 'Child\'s Pose w/ Lat Stretch', time: '1 min' },
    { exercise: 'Chest Stretch', time: '1 min', notes: 'On rings or doorway' }
  ];
  
  const ponderDay3 = () => [
    { exercise: 'Dead Hang', sets: '2', time: '30s' },
    { exercise: 'Tricep/Chest "Dip" Stretch', time: '1 min' },
    { exercise: 'Couch Stretch', time: '1 min/side', notes: 'Essential for Bulgarian Split Squats' },
    { exercise: 'Wrist/Forearm Stretches', time: '1 min' }
  ];
  
  return {
    // Block 1: Foundation (Weeks 1-4)
    '1_1': {
      name: 'Week 1 Day 1: Pull Volume',
      prepare: warmup(),
      practice: [{ exercise: 'HSPU', label: 'Block 1 Skill A', sets: '3', reps: '3-4', rest: '60-90s' }],
      perform: [
        { exercise: 'Pull-ups', label: 'A1', sets: '5x(1,2,3)', reps: 'Ladder', rest: '90-120s', notes: 'Ladder: 1,2,3 reps with 15s rest between' },
        { exercise: 'Ring Rows', label: 'B1', sets: '3', reps: '15', rest: '30-60s', notes: 'Feet on floor' },
        { exercise: 'Ring Push-ups', label: 'B2', sets: '3', reps: '10', rest: '90-120s' },
        { exercise: 'Hollow Body Rocks', label: 'C1', sets: '3', time: '30s', rest: '60s' }
      ],
      ponder: ponderDay1()
    },
    '1_2': {
      name: 'Week 1 Day 2: Active Recovery & Core',
      prepare: [],
      practice: [],
      perform: [
        { exercise: 'Hanging Knee Raises', label: 'Core', sets: '3 rounds', reps: '15', notes: 'Slow, controlled' },
        { exercise: 'Arch Body Rocks', label: 'Core', sets: '3 rounds', time: '30-45s' },
        { exercise: 'Side Plank', label: 'Core', sets: '3 rounds', time: '30-45s/side' },
        { exercise: 'Bird-Dog', label: 'Core', sets: '3 rounds', time: '45s', notes: 'Slow & controlled' }
      ],
      ponder: [{ exercise: 'Deep Squat Hold', time: '2 min', notes: 'Mobility flow - see library' }]
    },
    '1_3': {
      name: 'Week 1 Day 3: Full Body Intensity',
      prepare: warmup(),
      practice: [{ exercise: 'Crow Stand', label: 'Block 1 Skill B', sets: '3', time: '10-20s', rest: '60-90s' }],
      perform: [
        { exercise: 'Weighted Pull-ups', label: 'A1', sets: '5', reps: '5', weight: '10kg', rest: '120s' },
        { exercise: 'Dips', label: 'B1', sets: '3', reps: '12', rest: '30-60s' },
        { exercise: 'Bulgarian Split Squat', label: 'B2', sets: '3', reps: '8-10/leg', weight: 'Bodyweight', rest: '90-120s', notes: '3s negative, pain-free depth' },
        { exercise: 'L-Sit Progression', label: 'C1', sets: '4', time: '20s', rest: '60s', notes: 'Start with tuck' }
      ],
      ponder: ponderDay3()
    },
    // Week 2
    '2_1': {
      name: 'Week 2 Day 1: Pull Volume',
      prepare: warmup(),
      practice: [{ exercise: 'HSPU', label: 'Block 1 Skill A', sets: '3', reps: '3-4', rest: '60-90s' }],
      perform: [
        { exercise: 'Pull-ups', label: 'A1', sets: '6x(1,2,3)', reps: 'Ladder', rest: '90-120s' },
        { exercise: 'Ring Rows', label: 'B1', sets: '3', reps: '18', rest: '30-60s', notes: 'Feet on floor' },
        { exercise: 'Ring Push-ups', label: 'B2', sets: '3', reps: '12', rest: '90-120s' },
        { exercise: 'Hollow Body Rocks', label: 'C1', sets: '3', time: '35s', rest: '60s' }
      ],
      ponder: ponderDay1()
    },
    '2_2': {
      name: 'Week 2 Day 2: Active Recovery & Core',
      prepare: [],
      practice: [],
      perform: [
        { exercise: 'Hanging Knee Raises', label: 'Core', sets: '3 rounds', reps: '15', notes: 'Slow, controlled' },
        { exercise: 'Arch Body Rocks', label: 'Core', sets: '3 rounds', time: '30-45s' },
        { exercise: 'Side Plank', label: 'Core', sets: '3 rounds', time: '30-45s/side' },
        { exercise: 'Bird-Dog', label: 'Core', sets: '3 rounds', time: '45s' }
      ],
      ponder: [{ exercise: 'Deep Squat Hold', time: '2 min', notes: 'Mobility flow - see library' }]
    },
    '2_3': {
      name: 'Week 2 Day 3: Full Body Intensity',
      prepare: warmup(),
      practice: [{ exercise: 'Crow Stand', label: 'Block 1 Skill B', sets: '3', time: '10-20s', rest: '60-90s' }],
      perform: [
        { exercise: 'Weighted Pull-ups', label: 'A1', sets: '5', reps: '5', weight: '11.5kg', rest: '120s' },
        { exercise: 'Dips', label: 'B1', sets: '3', reps: '15', rest: '30-60s' },
        { exercise: 'Bulgarian Split Squat', label: 'B2', sets: '3', reps: '10-12/leg', weight: 'Bodyweight', rest: '90-120s' },
        { exercise: 'L-Sit Progression', label: 'C1', sets: '4', time: '22s', rest: '60s' }
      ],
      ponder: ponderDay3()
    },
    // Week 3
    '3_1': {
      name: 'Week 3 Day 1: Pull Volume',
      prepare: warmup(),
      practice: [{ exercise: 'HSPU', label: 'Block 1 Skill A', sets: '3', reps: '3-4', rest: '60-90s' }],
      perform: [
        { exercise: 'Pull-ups', label: 'A1', sets: '7x(1,2,3)', reps: 'Ladder', rest: '90-120s' },
        { exercise: 'Ring Rows', label: 'B1', sets: '3', reps: '20', rest: '30-60s', notes: 'Feet on floor' },
        { exercise: 'Ring Push-ups', label: 'B2', sets: '3', reps: '15', rest: '90-120s' },
        { exercise: 'Hollow Body Rocks', label: 'C1', sets: '3', time: '40s', rest: '60s' }
      ],
      ponder: ponderDay1()
    },
    '3_2': {
      name: 'Week 3 Day 2: Active Recovery & Core',
      prepare: [],
      practice: [],
      perform: [
        { exercise: 'Hanging Knee Raises', label: 'Core', sets: '3 rounds', reps: '15' },
        { exercise: 'Arch Body Rocks', label: 'Core', sets: '3 rounds', time: '30-45s' },
        { exercise: 'Side Plank', label: 'Core', sets: '3 rounds', time: '30-45s/side' },
        { exercise: 'Bird-Dog', label: 'Core', sets: '3 rounds', time: '45s' }
      ],
      ponder: [{ exercise: 'Deep Squat Hold', time: '2 min', notes: 'Mobility flow' }]
    },
    '3_3': {
      name: 'Week 3 Day 3: Full Body Intensity',
      prepare: warmup(),
      practice: [{ exercise: 'Crow Stand', label: 'Block 1 Skill B', sets: '3', time: '10-20s', rest: '60-90s' }],
      perform: [
        { exercise: 'Weighted Pull-ups', label: 'A1', sets: '5', reps: '5', weight: '12.5kg', rest: '120s' },
        { exercise: 'Weighted Dips', label: 'B1', sets: '3', reps: '5', weight: '5kg', rest: '30-60s' },
        { exercise: 'Bulgarian Split Squat', label: 'B2', sets: '3', reps: '8/leg', weight: '4-6kg', rest: '90-120s' },
        { exercise: 'L-Sit Progression', label: 'C1', sets: '4', time: '25s', rest: '60s', notes: 'Try next step if ready' }
      ],
      ponder: ponderDay3()
    },
    // Week 4 (Deload)
    '4_1': {
      name: 'Week 4 Day 1: Pull Volume (Deload)',
      prepare: warmup(),
      practice: [{ exercise: 'HSPU', label: 'Block 1 Skill A', sets: '2', reps: '3-4', rest: '60-90s', notes: 'Lighter' }],
      perform: [
        { exercise: 'Pull-ups', label: 'A1', sets: '4x(1,2,3)', reps: 'Ladder', rest: '90-120s' },
        { exercise: 'Ring Rows', label: 'B1', sets: '2', reps: '15', rest: '30-60s' },
        { exercise: 'Ring Push-ups', label: 'B2', sets: '2', reps: '10', rest: '90-120s' },
        { exercise: 'Hollow Body Rocks', label: 'C1', sets: '2', time: '20s', rest: '60s' }
      ],
      ponder: [
        { exercise: 'Dead Hang', sets: '2', time: '20s' },
        { exercise: 'Child\'s Pose w/ Lat Stretch', time: '1 min' },
        { exercise: 'Chest Stretch', time: '30s/side' }
      ]
    },
    '4_2': {
      name: 'Week 4 Day 2: Active Recovery & Core (Deload)',
      prepare: [],
      practice: [],
      perform: [
        { exercise: 'Hanging Knee Raises', label: 'Core', sets: '2 rounds', reps: '15' },
        { exercise: 'Side Plank', label: 'Core', sets: '2 rounds', time: '30s/side' }
      ],
      ponder: [{ exercise: 'Deep Squat Hold', time: '2 min' }]
    },
    '4_3': {
      name: 'Week 4 Day 3: Full Body Intensity (Deload)',
      prepare: warmup(),
      practice: [{ exercise: 'Crow Stand', label: 'Block 1 Skill B', sets: '2', time: '10-20s' }],
      perform: [
        { exercise: 'Weighted Pull-ups', label: 'A1', sets: '3', reps: '5', weight: '8kg', rest: '120s' },
        { exercise: 'Dips', label: 'B1', sets: '2', reps: '10', rest: '30-60s' },
        { exercise: 'Bulgarian Split Squat', label: 'B2', sets: '2', reps: '8/leg', weight: 'Bodyweight', rest: '90-120s' },
        { exercise: 'L-Sit Progression', label: 'C1', sets: '3', time: '15s', rest: '60s' }
      ],
      ponder: [
        { exercise: 'Dead Hang', sets: '2', time: '20s' },
        { exercise: 'Couch Stretch', time: '1 min/side' },
        { exercise: 'Wrist/Forearm Stretches', time: '30s' }
      ]
    },
    
    // Block 2: Intensification (Weeks 5-8) - Higher intensity, EMOM protocols
    '5_1': {
      name: 'Week 5 Day 1: Pull Volume (EMOM)',
      prepare: warmup(),
      practice: [{ exercise: 'Wall Handstand Hold', label: 'Block 2 Skill A', sets: '3', time: '20-30s', rest: '60-90s' }],
      perform: [
        { exercise: 'Pull-ups', label: 'A1', sets: '8', reps: '4', notes: 'EMOM: 4 reps every minute for 8 minutes', rest: 'EMOM' },
        { exercise: 'Ring Rows', label: 'B1', sets: '3', reps: '10', rest: '30-60s', notes: 'Feet elevated' },
        { exercise: 'Ring Push-ups', label: 'B2', sets: '3', reps: '10', rest: '90-120s', notes: 'Feet elevated' },
        { exercise: 'Ab Wheel Rollouts (Knees)', label: 'C1', sets: '3', reps: '10', rest: '60s' }
      ],
      ponder: ponderDay1()
    },
    '5_2': {
      name: 'Week 5 Day 2: Active Recovery & Core (Variation 2)',
      prepare: [],
      practice: [],
      perform: [
        { exercise: 'Hanging Leg Raises', label: 'Core', sets: '3 rounds', reps: '10-15' },
        { exercise: 'Side Plank Crunches', label: 'Core', sets: '3 rounds', time: '30s/side' },
        { exercise: 'Plank with Shoulder Taps', label: 'Core', sets: '3 rounds', time: '45s' },
        { exercise: 'Seated Windshield Wipers', label: 'Core', sets: '3 rounds', time: '45s' }
      ],
      ponder: [{ exercise: 'Deep Squat Hold', time: '2 min', notes: 'Mobility flow' }]
    },
    '5_3': {
      name: 'Week 5 Day 3: Full Body Intensity',
      prepare: warmup(),
      practice: [{ exercise: 'Ring Support Hold (RTO)', label: 'Block 2 Skill B', sets: '3', time: '15-20s', rest: '60-90s' }],
      perform: [
        { exercise: 'Weighted Pull-ups', label: 'A1', sets: '5', reps: '5', weight: '14kg', rest: '120s' },
        { exercise: 'Weighted Dips', label: 'B1', sets: '3', reps: '5', weight: '7.5kg', rest: '30-60s' },
        { exercise: 'Bulgarian Split Squat', label: 'B2', sets: '3', reps: '8-10/leg', weight: '8-10kg', rest: '90-120s' },
        { exercise: 'L-Sit Progression', label: 'C1', sets: '4', time: '20s', rest: '60s' }
      ],
      ponder: ponderDay3()
    },
    
    // Weeks 6-8 follow similar patterns with progressive overload
    '6_1': {
      name: 'Week 6 Day 1: Pull Volume (EMOM)',
      prepare: warmup(),
      practice: [{ exercise: 'Wall Handstand Hold', label: 'Block 2 Skill A', sets: '3', time: '20-30s' }],
      perform: [
        { exercise: 'Pull-ups', label: 'A1', sets: '10', reps: '4', notes: 'EMOM: 4 reps every minute', rest: 'EMOM' },
        { exercise: 'Ring Rows', label: 'B1', sets: '3', reps: '12', notes: 'Feet elevated' },
        { exercise: 'Ring Push-ups', label: 'B2', sets: '3', reps: '12', notes: 'Feet elevated' },
        { exercise: 'Ab Wheel Rollouts (Knees)', label: 'C1', sets: '3', reps: '12' }
      ],
      ponder: ponderDay1()
    },
    '6_2': {
      name: 'Week 6 Day 2: Active Recovery & Core',
      prepare: [],
      practice: [],
      perform: [
        { exercise: 'Hanging Leg Raises', label: 'Core', sets: '3 rounds', reps: '10-15' },
        { exercise: 'Side Plank Crunches', label: 'Core', sets: '3 rounds', time: '30s/side' },
        { exercise: 'Plank with Shoulder Taps', label: 'Core', sets: '3 rounds', time: '45s' }
      ],
      ponder: [{ exercise: 'Deep Squat Hold', time: '2 min' }]
    },
    '6_3': {
      name: 'Week 6 Day 3: Full Body Intensity',
      prepare: warmup(),
      practice: [{ exercise: 'Ring Support Hold (RTO)', label: 'Block 2 Skill B', sets: '3', time: '15-20s' }],
      perform: [
        { exercise: 'Weighted Pull-ups', label: 'A1', sets: '5', reps: '5', weight: '15kg', rest: '120s' },
        { exercise: 'Weighted Dips', label: 'B1', sets: '3', reps: '5', weight: '10kg' },
        { exercise: 'Bulgarian Split Squat', label: 'B2', sets: '3', reps: '8-10/leg', weight: '10-12kg' },
        { exercise: 'L-Sit Progression', label: 'C1', sets: '4', time: '22s' }
      ],
      ponder: ponderDay3()
    },
    '7_1': {
      name: 'Week 7 Day 1: Pull Volume (EMOM)',
      prepare: warmup(),
      practice: [{ exercise: 'Wall Handstand Hold', label: 'Block 2 Skill A', sets: '3', time: '20-30s' }],
      perform: [
        { exercise: 'Pull-ups', label: 'A1', sets: '10', reps: '5', notes: 'EMOM: 5 reps every minute', rest: 'EMOM' },
        { exercise: 'Ring Rows', label: 'B1', sets: '3', reps: '15', notes: 'Feet elevated' },
        { exercise: 'Ring Push-ups', label: 'B2', sets: '3', reps: '15', notes: 'Feet elevated' },
        { exercise: 'Ab Wheel Rollouts (Knees)', label: 'C1', sets: '3', reps: '15' }
      ],
      ponder: ponderDay1()
    },
    '7_2': {
      name: 'Week 7 Day 2: Active Recovery & Core',
      prepare: [],
      practice: [],
      perform: [
        { exercise: 'Hanging Leg Raises', label: 'Core', sets: '3 rounds', reps: '10-15' },
        { exercise: 'Side Plank Crunches', label: 'Core', sets: '3 rounds', time: '30s/side' }
      ],
      ponder: [{ exercise: 'Deep Squat Hold', time: '2 min' }]
    },
    '7_3': {
      name: 'Week 7 Day 3: Full Body Intensity',
      prepare: warmup(),
      practice: [{ exercise: 'Ring Support Hold (RTO)', label: 'Block 2 Skill B', sets: '3', time: '15-20s' }],
      perform: [
        { exercise: 'Weighted Pull-ups', label: 'A1', sets: '5', reps: '5', weight: '16kg', rest: '120s', notes: 'New 5x5 PR' },
        { exercise: 'Weighted Dips', label: 'B1', sets: '3', reps: '5', weight: '12.5kg' },
        { exercise: 'Bulgarian Split Squat', label: 'B2', sets: '3', reps: '8-10/leg', weight: '12.5kg' },
        { exercise: 'L-Sit Progression', label: 'C1', sets: '4', time: '25s', notes: 'Try next step' }
      ],
      ponder: ponderDay3()
    },
    '8_1': {
      name: 'Week 8 Day 1: Pull Volume (Deload)',
      prepare: warmup(),
      practice: [{ exercise: 'Wall Handstand Hold', label: 'Block 2 Skill A', sets: '2', time: '20-30s', notes: 'Lighter' }],
      perform: [
        { exercise: 'Pull-ups', label: 'A1', sets: '6', reps: '4', notes: 'EMOM - reduced volume' },
        { exercise: 'Ring Rows', label: 'B1', sets: '2', reps: '10', notes: 'Feet elevated' },
        { exercise: 'Ring Push-ups', label: 'B2', sets: '2', reps: '10', notes: 'Feet elevated' },
        { exercise: 'Ab Wheel Rollouts (Knees)', label: 'C1', sets: '2', reps: '10' }
      ],
      ponder: [{ exercise: 'Dead Hang', sets: '2', time: '20s' }, { exercise: 'Chest Stretch', time: '30s/side' }]
    },
    '8_2': {
      name: 'Week 8 Day 2: Active Recovery & Core (Deload)',
      prepare: [],
      practice: [],
      perform: [
        { exercise: 'Hanging Leg Raises', label: 'Core', sets: '2 rounds', reps: '10' }
      ],
      ponder: [{ exercise: 'Deep Squat Hold', time: '2 min' }]
    },
    '8_3': {
      name: 'Week 8 Day 3: Full Body Intensity (Deload)',
      prepare: warmup(),
      practice: [{ exercise: 'Ring Support Hold (RTO)', label: 'Block 2 Skill B', sets: '2', time: '15-20s' }],
      perform: [
        { exercise: 'Weighted Pull-ups', label: 'A1', sets: '3', reps: '5', weight: '10kg' },
        { exercise: 'Weighted Dips', label: 'B1', sets: '3', reps: '5', weight: '5kg' },
        { exercise: 'Bulgarian Split Squat', label: 'B2', sets: '2', reps: '8/leg', weight: 'Bodyweight' },
        { exercise: 'L-Sit Progression', label: 'C1', sets: '3', time: '15s' }
      ],
      ponder: [{ exercise: 'Dead Hang', sets: '2', time: '20s' }, { exercise: 'Couch Stretch', time: '1 min/side' }]
    },
    
    // Block 3: Pre-Unilateral (Weeks 9-12) - Asymmetrical work, PPPU introduction
    '9_1': {
      name: 'Week 9 Day 1: Pull Volume (Cluster Sets)',
      prepare: warmup(),
      practice: [{ exercise: 'Pseudo-Planche Holds', label: 'Block 3 Skill A', sets: '3', time: '5-10s', rest: '60-90s' }],
      perform: [
        { exercise: 'Pull-ups', label: 'A1', sets: '5', reps: '(3,3,3)', notes: 'Cluster: 3-3-3 with 15s rest between clusters, 2-3min between sets. 45 total reps', rest: '2-3min' },
        { exercise: 'Ring Push-ups', label: 'B1', sets: '3', reps: '15', notes: 'Feet elevated' },
        { exercise: 'Ring Rows', label: 'B2', sets: '3', reps: 'AMRAP-2', notes: 'Feet elevated, stop 2 reps before failure' },
        { exercise: 'Plank Drags', label: 'C1', sets: '3', reps: '10/side', notes: 'With weight' }
      ],
      ponder: ponderDay1()
    },
    '9_2': {
      name: 'Week 9 Day 2: Active Recovery & Core (Variation 3)',
      prepare: [],
      practice: [],
      perform: [
        { exercise: 'Hanging Windshield Wipers (Bent)', label: 'Core', sets: '3 rounds', reps: '10-16 total' },
        { exercise: 'Russian Twists', label: 'Core', sets: '3 rounds', time: '30s' },
        { exercise: 'Hollow Body Hold', label: 'Core', sets: '3 rounds', time: '30-45s' },
        { exercise: 'Side Plank', label: 'Core', sets: '3 rounds', time: '30-45s/side' }
      ],
      ponder: [{ exercise: 'Deep Squat Hold', time: '2 min' }]
    },
    '9_3': {
      name: 'Week 9 Day 3: Full Body Intensity',
      prepare: warmup(),
      practice: [{ exercise: 'Cossack Squats', label: 'Block 3 Skill B', sets: '3', reps: '8-10/leg', notes: 'Bodyweight, focus on depth' }],
      perform: [
        { exercise: 'Mixed-Grip Pull-ups', label: 'A1', sets: '4', reps: '3/side', rest: '120s' },
        { exercise: 'Pseudo-Planche Push-ups', label: 'B1', sets: '3', reps: '5-8', notes: 'Focus on lean' },
        { exercise: 'Bulgarian Split Squat', label: 'B2', sets: '3', reps: '10-12/leg', weight: '10kg' },
        { exercise: 'L-Sit Pull-ups (Tuck)', label: 'C1', sets: '3', reps: '5', notes: 'Or 10s hold + 5 regular pull-ups' }
      ],
      ponder: ponderDay3()
    },
    
    // Weeks 10-12 follow progressive overload patterns
    '10_1': {
      name: 'Week 10 Day 1: Pull Volume (Cluster Sets)',
      prepare: warmup(),
      practice: [{ exercise: 'Pseudo-Planche Holds', label: 'Block 3 Skill A', sets: '3', time: '5-10s' }],
      perform: [
        { exercise: 'Pull-ups', label: 'A1', sets: '5', reps: '(4,3,3)', notes: 'Cluster Sets - 50 total reps' },
        { exercise: 'Ring Push-ups', label: 'B1', sets: '3', reps: '18', notes: 'Feet elevated' },
        { exercise: 'Ring Rows', label: 'B2', sets: '3', reps: 'AMRAP-1' },
        { exercise: 'Plank Drags', label: 'C1', sets: '3', reps: '12/side' }
      ],
      ponder: ponderDay1()
    },
    '10_2': {
      name: 'Week 10 Day 2: Active Recovery & Core',
      prepare: [],
      practice: [],
      perform: [
        { exercise: 'Hanging Windshield Wipers (Bent)', label: 'Core', sets: '3 rounds', reps: '10-16 total' },
        { exercise: 'Russian Twists', label: 'Core', sets: '3 rounds', time: '30s' },
        { exercise: 'Hollow Body Hold', label: 'Core', sets: '3 rounds', time: '30-45s' }
      ],
      ponder: [{ exercise: 'Deep Squat Hold', time: '2 min' }]
    },
    '10_3': {
      name: 'Week 10 Day 3: Full Body Intensity',
      prepare: warmup(),
      practice: [{ exercise: 'Cossack Squats', label: 'Block 3 Skill B', sets: '3', reps: '8-10/leg' }],
      perform: [
        { exercise: 'Mixed-Grip Pull-ups', label: 'A1', sets: '4', reps: '4/side' },
        { exercise: 'Pseudo-Planche Push-ups', label: 'B1', sets: '3', reps: '6-10' },
        { exercise: 'Bulgarian Split Squat', label: 'B2', sets: '3', reps: '10-12/leg', weight: '12.5kg' },
        { exercise: 'L-Sit Pull-ups (Tuck)', label: 'C1', sets: '3', reps: '6' }
      ],
      ponder: ponderDay3()
    },
    '11_1': {
      name: 'Week 11 Day 1: Pull Volume (Cluster Sets)',
      prepare: warmup(),
      practice: [{ exercise: 'Pseudo-Planche Holds', label: 'Block 3 Skill A', sets: '3', time: '5-10s' }],
      perform: [
        { exercise: 'Pull-ups', label: 'A1', sets: '5', reps: '(4,4,3)', notes: 'Cluster Sets - 55 total reps' },
        { exercise: 'Ring Push-ups', label: 'B1', sets: '3', reps: '20', notes: 'Feet elevated' },
        { exercise: 'Ring Rows', label: 'B2', sets: '3', reps: 'AMRAP' },
        { exercise: 'Plank Drags', label: 'C1', sets: '3', reps: '15/side' }
      ],
      ponder: ponderDay1()
    },
    '11_2': {
      name: 'Week 11 Day 2: Active Recovery & Core',
      prepare: [],
      practice: [],
      perform: [
        { exercise: 'Hanging Windshield Wipers (Bent)', label: 'Core', sets: '3 rounds', reps: '10-16 total' },
        { exercise: 'Hollow Body Hold', label: 'Core', sets: '3 rounds', time: '30-45s' }
      ],
      ponder: [{ exercise: 'Deep Squat Hold', time: '2 min' }]
    },
    '11_3': {
      name: 'Week 11 Day 3: Full Body Intensity',
      prepare: warmup(),
      practice: [{ exercise: 'Cossack Squats', label: 'Block 3 Skill B', sets: '3', reps: '8-10/leg' }],
      perform: [
        { exercise: 'Offset Pull-ups (Band Assist)', label: 'A1', sets: '4', reps: '3/side', notes: 'Main arm does most work' },
        { exercise: 'Pseudo-Planche Push-ups', label: 'B1', sets: '3', reps: '8-12' },
        { exercise: 'Bulgarian Split Squat', label: 'B2', sets: '3', reps: '10-12/leg', weight: '14kg' },
        { exercise: 'L-Sit Pull-ups (Tuck)', label: 'C1', sets: '3', reps: '8' }
      ],
      ponder: ponderDay3()
    },
    '12_1': {
      name: 'Week 12 Day 1: Pull Volume (Deload)',
      prepare: warmup(),
      practice: [{ exercise: 'Pseudo-Planche Holds', label: 'Block 3 Skill A', sets: '2', time: '5-10s' }],
      perform: [
        { exercise: 'Pull-ups', label: 'A1', sets: '3', reps: '(3,3,3)', notes: 'Cluster Sets - 27 total reps' },
        { exercise: 'Ring Push-ups', label: 'B1', sets: '2', reps: '12', notes: 'Feet elevated' },
        { exercise: 'Ring Rows', label: 'B2', sets: '2', reps: '10' },
        { exercise: 'Plank Drags', label: 'C1', sets: '2', reps: '8/side' }
      ],
      ponder: [{ exercise: 'Dead Hang', sets: '2', time: '20s' }, { exercise: 'Chest Stretch', time: '30s/side' }]
    },
    '12_2': {
      name: 'Week 12 Day 2: Active Recovery & Core (Deload)',
      prepare: [],
      practice: [],
      perform: [
        { exercise: 'Hanging Windshield Wipers (Bent)', label: 'Core', sets: '2 rounds', reps: '10' }
      ],
      ponder: [{ exercise: 'Deep Squat Hold', time: '2 min' }]
    },
    '12_3': {
      name: 'Week 12 Day 3: Full Body Intensity (Deload)',
      prepare: warmup(),
      practice: [{ exercise: 'Cossack Squats', label: 'Block 3 Skill B', sets: '2', reps: '8-10/leg' }],
      perform: [
        { exercise: 'Mixed-Grip Pull-ups', label: 'A1', sets: '3', reps: '2/side' },
        { exercise: 'Pseudo-Planche Push-ups', label: 'B1', sets: '2', reps: '5' },
        { exercise: 'Bulgarian Split Squat', label: 'B2', sets: '2', reps: '5/leg', weight: 'Bodyweight' },
        { exercise: 'L-Sit Pull-ups (Tuck)', label: 'C1', sets: '2', reps: '4' }
      ],
      ponder: [{ exercise: 'Dead Hang', sets: '2', time: '20s' }]
    },
    
    // Block 4: Accumulation (Weeks 13-16) - Volume work with AMRAP, archer progressions
    '13_1': {
      name: 'Week 13 Day 1: Pull Volume (AMRAP)',
      prepare: warmup(),
      practice: [{ exercise: 'Skin the Cat', label: 'Block 4 Skill A', sets: '3', reps: '3-5', notes: 'Slow' }],
      perform: [
        { exercise: 'Pull-ups', label: 'A1', sets: '3', reps: 'AMRAP-2', notes: 'As many reps as possible minus 2 (Est: 11-13 reps)' },
        { exercise: 'Ring Push-ups (RTO)', label: 'B1', sets: '3', reps: '8', notes: 'Rings turned out' },
        { exercise: 'Archer Row Negatives', label: 'B2', sets: '3', reps: '3-5/side', notes: 'Slow negative' },
        { exercise: 'Ab Wheel Rollouts (Knees)', label: 'C1', sets: '3', reps: '12' }
      ],
      ponder: ponderDay1()
    },
    '13_2': {
      name: 'Week 13 Day 2: Active Recovery & Core (Variation 4)',
      prepare: [],
      practice: [],
      perform: [
        { exercise: 'Toes-to-Bar (Strict)', label: 'Core', sets: '3 rounds', reps: '5-8' },
        { exercise: 'L-Sit Flutter Kicks', label: 'Core', sets: '3 rounds', time: '30s' },
        { exercise: 'Renegade Rows', label: 'Core', sets: '3 rounds', time: '30s', notes: 'Bodyweight or very light' },
        { exercise: 'Arch Body Hold', label: 'Core', sets: '3 rounds', time: '30s' }
      ],
      ponder: [{ exercise: 'Deep Squat Hold', time: '2 min' }]
    },
    '13_3': {
      name: 'Week 13 Day 3: Full Body Intensity',
      prepare: warmup(),
      practice: [{ exercise: 'Ring Dips', label: 'Block 4 Skill B', sets: '3', reps: '5-8', notes: 'Focus on control' }],
      perform: [
        { exercise: 'Weighted Pull-ups', label: 'A1', sets: '5', reps: '5', weight: '16kg', notes: 'Match previous 5x5 PR' },
        { exercise: 'Weighted Dips', label: 'B1', sets: '5', reps: '5', weight: '15kg' },
        { exercise: 'Bulgarian Split Squat', label: 'B2', sets: '3', reps: '8-10/leg', weight: '14kg' },
        { exercise: 'L-Sit Pull-ups (Single Leg)', label: 'C1', sets: '3', reps: '3/leg', notes: 'Or use Tuck L-Sit' }
      ],
      ponder: ponderDay3()
    },
    
    // Weeks 14-16 continue accumulation pattern
    '14_1': {
      name: 'Week 14 Day 1: Pull Volume (AMRAP)',
      prepare: warmup(),
      practice: [{ exercise: 'Skin the Cat', label: 'Block 4 Skill A', sets: '3', reps: '3-5' }],
      perform: [
        { exercise: 'Pull-ups', label: 'A1', sets: '3', reps: 'AMRAP-1', notes: 'Est: 12-14 reps' },
        { exercise: 'Ring Push-ups (RTO)', label: 'B1', sets: '3', reps: '10' },
        { exercise: 'Archer Row Negatives', label: 'B2', sets: '3', reps: '3-5/side' },
        { exercise: 'Ab Wheel Rollouts (Knees)', label: 'C1', sets: '3', reps: '14' }
      ],
      ponder: ponderDay1()
    },
    '14_2': {
      name: 'Week 14 Day 2: Active Recovery & Core',
      prepare: [],
      practice: [],
      perform: [
        { exercise: 'Toes-to-Bar (Strict)', label: 'Core', sets: '3 rounds', reps: '5-8' },
        { exercise: 'L-Sit Flutter Kicks', label: 'Core', sets: '3 rounds', time: '30s' },
        { exercise: 'Arch Body Hold', label: 'Core', sets: '3 rounds', time: '30s' }
      ],
      ponder: [{ exercise: 'Deep Squat Hold', time: '2 min' }]
    },
    '14_3': {
      name: 'Week 14 Day 3: Full Body Intensity',
      prepare: warmup(),
      practice: [{ exercise: 'Ring Dips', label: 'Block 4 Skill B', sets: '3', reps: '5-8' }],
      perform: [
        { exercise: 'Weighted Pull-ups', label: 'A1', sets: '5', reps: '5', weight: '17.5kg', notes: 'New 5RM PR' },
        { exercise: 'Weighted Dips', label: 'B1', sets: '5', reps: '5', weight: '16kg' },
        { exercise: 'Bulgarian Split Squat', label: 'B2', sets: '3', reps: '8-10/leg', weight: '16kg' },
        { exercise: 'L-Sit Pull-ups (Single Leg)', label: 'C1', sets: '3', reps: '4/leg' }
      ],
      ponder: ponderDay3()
    },
    '15_1': {
      name: 'Week 15 Day 1: Pull Volume (AMRAP)',
      prepare: warmup(),
      practice: [{ exercise: 'Skin the Cat', label: 'Block 4 Skill A', sets: '3', reps: '3-5' }],
      perform: [
        { exercise: 'Pull-ups', label: 'A1', sets: '3', reps: 'AMRAP', notes: 'Go to failure. Est: 12-15 reps' },
        { exercise: 'Ring Push-ups (RTO)', label: 'B1', sets: '3', reps: '12' },
        { exercise: 'Archer Rows (Assisted)', label: 'B2', sets: '3', reps: '3-5/side', notes: 'Use other arm to help' },
        { exercise: 'Ab Wheel Rollouts (Knees)', label: 'C1', sets: '3', reps: '16' }
      ],
      ponder: ponderDay1()
    },
    '15_2': {
      name: 'Week 15 Day 2: Active Recovery & Core',
      prepare: [],
      practice: [],
      perform: [
        { exercise: 'Toes-to-Bar (Strict)', label: 'Core', sets: '3 rounds', reps: '5-8' },
        { exercise: 'L-Sit Flutter Kicks', label: 'Core', sets: '3 rounds', time: '30s' }
      ],
      ponder: [{ exercise: 'Deep Squat Hold', time: '2 min' }]
    },
    '15_3': {
      name: 'Week 15 Day 3: Full Body Intensity',
      prepare: warmup(),
      practice: [{ exercise: 'Ring Dips', label: 'Block 4 Skill B', sets: '3', reps: '5-8' }],
      perform: [
        { exercise: 'Weighted Pull-ups', label: 'A1', sets: '5', reps: '5', weight: '18.5kg', notes: 'New 5RM PR' },
        { exercise: 'Weighted Dips', label: 'B1', sets: '5', reps: '5', weight: '17.5kg' },
        { exercise: 'Bulgarian Split Squat', label: 'B2', sets: '3', reps: '8-10/leg', weight: '17.5kg' },
        { exercise: 'L-Sit Pull-ups (Single Leg)', label: 'C1', sets: '3', reps: '5/leg' }
      ],
      ponder: ponderDay3()
    },
    '16_1': {
      name: 'Week 16 Day 1: Pull Volume (Deload)',
      prepare: warmup(),
      practice: [{ exercise: 'Skin the Cat', label: 'Block 4 Skill A', sets: '2', reps: '3-5' }],
      perform: [
        { exercise: 'Pull-ups', label: 'A1', sets: '2', reps: 'AMRAP-3' },
        { exercise: 'Ring Push-ups (RTO)', label: 'B1', sets: '2', reps: '6' },
        { exercise: 'Ring Rows', label: 'B2', sets: '2', reps: '10', notes: 'Feet elevated' },
        { exercise: 'Ab Wheel Rollouts (Knees)', label: 'C1', sets: '2', reps: '10' }
      ],
      ponder: [{ exercise: 'Dead Hang', sets: '2', time: '20s' }]
    },
    '16_2': {
      name: 'Week 16 Day 2: Active Recovery & Core (Deload)',
      prepare: [],
      practice: [],
      perform: [
        { exercise: 'Hanging Knee Raises', label: 'Core', sets: '2 rounds', reps: '10' }
      ],
      ponder: [{ exercise: 'Deep Squat Hold', time: '2 min' }]
    },
    '16_3': {
      name: 'Week 16 Day 3: Full Body Intensity (Deload)',
      prepare: warmup(),
      practice: [{ exercise: 'Ring Dips', label: 'Block 4 Skill B', sets: '2', reps: '5-8' }],
      perform: [
        { exercise: 'Weighted Pull-ups', label: 'A1', sets: '3', reps: '5', weight: '12.5kg' },
        { exercise: 'Weighted Dips', label: 'B1', sets: '3', reps: '5', weight: '12.5kg' },
        { exercise: 'Bulgarian Split Squat', label: 'B2', sets: '2', reps: '8/leg', weight: 'Bodyweight' },
        { exercise: 'L-Sit Pull-ups (Single Leg)', label: 'C1', sets: '2', reps: '2/leg' }
      ],
      ponder: [{ exercise: 'Dead Hang', sets: '2', time: '20s' }]
    },
    
    // Block 5: Peak & Unilateral (Weeks 17-20) - Archer pull-ups as primary lift
    '17_1': {
      name: 'Week 17 Day 1: Pull Volume (EMOM)',
      prepare: warmup(),
      practice: [{ exercise: 'HSPU', label: 'Block 5 Skill A', sets: '4', reps: '4-5', notes: 'Volume' }],
      perform: [
        { exercise: 'Pull-ups', label: 'A1', sets: '10', reps: '6', notes: 'EMOM: 6 reps every minute - 60 total reps' },
        { exercise: 'Weighted Push-ups (on Parallettes/Bars)', label: 'B1', sets: '3', reps: '10', weight: '10kg' },
        { exercise: 'Ring Rows', label: 'B2', sets: '3', reps: 'AMRAP-1', notes: 'Feet elevated' },
        { exercise: 'Hollow Body Rocks', label: 'C1', sets: '3', time: '45s' }
      ],
      ponder: ponderDay1()
    },
    '17_2': {
      name: 'Week 17 Day 2: Active Recovery & Core (Variation 5)',
      prepare: [],
      practice: [],
      perform: [
        { exercise: 'Hanging Windshield Wipers (Bent or Straight)', label: 'Core', sets: '3 rounds', reps: '10-12 total' },
        { exercise: 'Dragon Flag Negatives', label: 'Core', sets: '3 rounds', reps: '3-5', notes: 'Tucked or single leg' },
        { exercise: 'Hollow Body Rocks', label: 'Core', sets: '3 rounds', time: '30-45s' },
        { exercise: 'Ab Wheel Rollouts (Knees)', label: 'Core', sets: '3 rounds', reps: '10-15' }
      ],
      ponder: [{ exercise: 'Deep Squat Hold', time: '2 min' }]
    },
    '17_3': {
      name: 'Week 17 Day 3: Full Body Intensity',
      prepare: warmup(),
      practice: [{ exercise: 'Archer Pull-up Negatives', label: 'Block 5 Skill B', sets: '3', reps: '1/side', notes: 'Use band assist for concentric' }],
      perform: [
        { exercise: 'Archer Pull-up Negatives', label: 'A1', sets: '5', reps: '2/side', notes: '3-5s negative' },
        { exercise: 'Weighted Push-ups (on Parallettes/Bars)', label: 'B1', sets: '5', reps: '5', weight: '12.5kg' },
        { exercise: 'Bulgarian Split Squat', label: 'B2', sets: '3', reps: '8-10/leg', weight: '16kg' },
        { exercise: 'L-Sit Pull-ups (Full)', label: 'C1', sets: '3', reps: '3', notes: 'Use easier variation if needed' }
      ],
      ponder: ponderDay3()
    },
    
    // Weeks 18-20 continue peak phase
    '18_1': {
      name: 'Week 18 Day 1: Pull Volume (EMOM)',
      prepare: warmup(),
      practice: [{ exercise: 'HSPU', label: 'Block 5 Skill A', sets: '4', reps: '4-5' }],
      perform: [
        { exercise: 'Pull-ups', label: 'A1', sets: '10', reps: '7', notes: 'EMOM: 7 reps every minute - 70 total reps' },
        { exercise: 'Weighted Push-ups (on Parallettes/Bars)', label: 'B1', sets: '3', reps: '10', weight: '12.5kg' },
        { exercise: 'Ring Rows', label: 'B2', sets: '3', reps: 'AMRAP', notes: 'Feet elevated' },
        { exercise: 'Hollow Body Rocks', label: 'C1', sets: '3', time: '50s' }
      ],
      ponder: ponderDay1()
    },
    '18_2': {
      name: 'Week 18 Day 2: Active Recovery & Core',
      prepare: [],
      practice: [],
      perform: [
        { exercise: 'Hanging Windshield Wipers (Bent or Straight)', label: 'Core', sets: '3 rounds', reps: '10-12 total' },
        { exercise: 'Dragon Flag Negatives', label: 'Core', sets: '3 rounds', reps: '3-5' },
        { exercise: 'Hollow Body Rocks', label: 'Core', sets: '3 rounds', time: '30-45s' }
      ],
      ponder: [{ exercise: 'Deep Squat Hold', time: '2 min' }]
    },
    '18_3': {
      name: 'Week 18 Day 3: Full Body Intensity',
      prepare: warmup(),
      practice: [{ exercise: 'Archer Pull-up Negatives', label: 'Block 5 Skill B', sets: '3', reps: '1/side' }],
      perform: [
        { exercise: 'Archer Pull-up Negatives', label: 'A1', sets: '5', reps: '3/side', notes: '3-5s negative' },
        { exercise: 'Weighted Push-ups (on Parallettes/Bars)', label: 'B1', sets: '5', reps: '5', weight: '15kg' },
        { exercise: 'Bulgarian Split Squat', label: 'B2', sets: '3', reps: '8-10/leg', weight: '18.5kg' },
        { exercise: 'L-Sit Pull-ups (Full)', label: 'C1', sets: '3', reps: '4' }
      ],
      ponder: ponderDay3()
    },
    '19_1': {
      name: 'Week 19 Day 1: Pull Volume (Deload)',
      prepare: warmup(),
      practice: [{ exercise: 'HSPU', label: 'Block 5 Skill A', sets: '2', reps: '4-5' }],
      perform: [
        { exercise: 'Pull-ups', label: 'A1', sets: '5', reps: '4', notes: 'EMOM: 4 reps - 20 total reps' },
        { exercise: 'Ring Push-ups', label: 'B1', sets: '2', reps: '15', weight: 'Bodyweight' },
        { exercise: 'Ring Rows', label: 'B2', sets: '2', reps: '10', notes: 'Feet on floor' },
        { exercise: 'Hollow Body Rocks', label: 'C1', sets: '2', time: '20s' }
      ],
      ponder: [{ exercise: 'Dead Hang', sets: '2', time: '20s' }]
    },
    '19_2': {
      name: 'Week 19 Day 2: Active Recovery & Core (Deload)',
      prepare: [],
      practice: [],
      perform: [
        { exercise: 'Hanging Knee Raises', label: 'Core', sets: '2 rounds', reps: '10' }
      ],
      ponder: [{ exercise: 'Deep Squat Hold', time: '2 min' }]
    },
    '19_3': {
      name: 'Week 19 Day 3: Full Body Intensity (Deload)',
      prepare: warmup(),
      practice: [{ exercise: 'Archer Pull-up Negatives', label: 'Block 5 Skill B', sets: '2', reps: '1/side', notes: 'Easy' }],
      perform: [
        { exercise: 'Archer Pull-up Negatives', label: 'A1', sets: '3', reps: '1/side', notes: 'Easy' },
        { exercise: 'Dips', label: 'B1', sets: '2', reps: '10', weight: 'Bodyweight' },
        { exercise: 'Bulgarian Split Squat', label: 'B2', sets: '2', reps: '5/leg', weight: 'Bodyweight' },
        { exercise: 'L-Sit Pull-ups (Tuck)', label: 'C1', sets: '2', reps: '3' }
      ],
      ponder: [{ exercise: 'Dead Hang', sets: '2', time: '20s' }]
    },
    '20_1': {
      name: 'Week 20 Day 1: Test Day',
      prepare: warmup(),
      practice: [{ exercise: 'Scapular Pull-ups', label: 'Light activation', sets: '2', reps: '5' }],
      perform: [
        { exercise: 'Pull-ups', label: 'Test 1', sets: '1', reps: 'Max', weight: 'Bodyweight', notes: 'Max Reps Bodyweight Pull-ups. Rest 10-15 min before next test.' },
        { exercise: 'Dips', label: 'Test 2', sets: '1', reps: 'Max', weight: 'Bodyweight', notes: 'Max Reps Bodyweight Dips. Rest 10-15 min before next test.' },
        { exercise: 'Bulgarian Split Squat', label: 'Test 3', sets: '1', reps: 'Max/leg', weight: 'Bodyweight', notes: 'Max Reps per leg' }
      ],
      ponder: [
        { exercise: 'Dead Hang', sets: '2', time: '20s', notes: 'Gentle' },
        { exercise: 'Couch Stretch', time: '1 min/side', notes: 'Gentle' },
        { exercise: 'Chest Stretch', time: '30s/side', notes: 'Gentle' }
      ]
    },
    '20_2': {
      name: 'Week 20 Day 2: Active Recovery',
      prepare: [],
      practice: [],
      perform: [],
      ponder: [{ exercise: 'Deep Squat Hold', time: '2 min', notes: 'Mobility flow only. Light and easy.' }]
    },
    '20_3': {
      name: 'Week 20 Day 3: Test Day',
      prepare: warmup(),
      practice: [{ exercise: 'Pull-ups', label: 'Light activation', sets: '2', reps: '3', notes: 'Light' }],
      perform: [
        { exercise: 'Weighted Pull-ups', label: 'Test 1', sets: '1', reps: '3', weight: 'To be determined', notes: '3-Rep Max (3RM) Weighted Pull-up. Warm up with lighter sets. Rest 10-15 min before next test.' },
        { exercise: 'Weighted Push-ups (on Parallettes/Bars)', label: 'Test 2', sets: '1', reps: '5', weight: 'To be determined', notes: '5-Rep Max (5RM) Weighted Push-up. Warm up with lighter sets.' }
      ],
      ponder: [
        { exercise: 'Dead Hang', sets: '2', time: '20s', notes: 'Gentle' },
        { exercise: 'Chest Stretch', time: '30s/side', notes: 'Gentle. Congratulations! Program complete.' }
      ]
    },
    
    // Optional Workout D variations
    'd_1': {
      name: 'Workout D - Variation 1: Glute Focus',
      prepare: [
        { exercise: 'Cat-Cow', reps: '10-15' },
        { exercise: 'Bird-Dog', reps: '10/side', notes: '3s hold' },
        { exercise: 'Glute Bridge', reps: '15', notes: '2s squeeze at top' },
        { exercise: 'Banded Side-Steps', reps: '20/side' },
        { exercise: 'Bodyweight Good Mornings', reps: '15' }
      ],
      practice: [],
      perform: [
        { exercise: 'Romanian Deadlift (RDL)', label: 'A1', sets: '4', reps: '8-12', rest: '120s', notes: 'Control the weight. Push hips back.' },
        { exercise: 'Weighted Glute Bridge', label: 'B1', sets: '3', reps: '10-15', rest: '30-60s', notes: '2s squeeze at top' },
        { exercise: 'Single-Leg Calf Raises', label: 'B2', sets: '3', reps: '15-20/leg', rest: '90-120s', notes: 'To failure. Full range.' },
        { exercise: 'Banded Face Pulls', label: 'C1', sets: '3', reps: '15-20', rest: '60s', notes: 'Prehab. External rotation.' }
      ],
      ponder: [
        { exercise: 'Pigeon Stretch', time: '1 min/side', notes: 'For glutes' },
        { exercise: 'Seated Forward Fold', time: '1-2 min', notes: 'For hamstrings' },
        { exercise: 'Wall Calf Stretch', time: '1 min/side' }
      ]
    },
    'd_2': {
      name: 'Workout D - Variation 2: Hamstring Focus',
      prepare: [
        { exercise: 'Cat-Cow', reps: '10-15' },
        { exercise: 'Bird-Dog', reps: '10/side', notes: '3s hold' },
        { exercise: 'Glute Bridge', reps: '15', notes: '2s squeeze at top' },
        { exercise: 'Banded Side-Steps', reps: '20/side' },
        { exercise: 'Bodyweight Good Mornings', reps: '15' }
      ],
      practice: [],
      perform: [
        { exercise: 'Barbell/Dumbbell Good Morning', label: 'A1', sets: '4', reps: '10-12', rest: '120s', notes: 'Start light. Hinge at hip.' },
        { exercise: 'Nordic Hamstring Negatives', label: 'B1', sets: '3', reps: '3-6', rest: '30-60s', notes: '3-5s negative. Can substitute with Glute-Ham Raises or Stability Ball Curls (3x10-15)' },
        { exercise: 'Single-Leg Calf Raises', label: 'B2', sets: '3', reps: '15-20/leg', rest: '90-120s', notes: 'To failure' },
        { exercise: 'Banded Face Pulls', label: 'C1', sets: '3', reps: '15-20', rest: '60s', notes: 'Prehab' }
      ],
      ponder: [
        { exercise: 'Pigeon Stretch', time: '1 min/side' },
        { exercise: 'Seated Forward Fold', time: '1-2 min' },
        { exercise: 'Wall Calf Stretch', time: '1 min/side' }
      ]
    },
    'd_3': {
      name: 'Workout D - Variation 3: Unilateral Focus',
      prepare: [
        { exercise: 'Cat-Cow', reps: '10-15' },
        { exercise: 'Bird-Dog', reps: '10/side', notes: '3s hold' },
        { exercise: 'Glute Bridge', reps: '15', notes: '2s squeeze at top' },
        { exercise: 'Banded Side-Steps', reps: '20/side' },
        { exercise: 'Bodyweight Good Mornings', reps: '15' }
      ],
      practice: [],
      perform: [
        { exercise: 'Single-Leg Romanian Deadlift (SL-RDL)', label: 'A1', sets: '4', reps: '8-10/leg', rest: '90-120s', notes: 'Dumbbell in opposite hand. Balance and flat back.' },
        { exercise: 'Weighted Glute Bridge', label: 'B1', sets: '3', reps: '10-15', rest: '30-60s' },
        { exercise: 'Single-Leg Calf Raises', label: 'B2', sets: '3', reps: '15-20/leg', rest: '90-120s' },
        { exercise: 'Banded Face Pulls', label: 'C1', sets: '3', reps: '15-20', rest: '60s' }
      ],
      ponder: [
        { exercise: 'Pigeon Stretch', time: '1 min/side' },
        { exercise: 'Seated Forward Fold', time: '1-2 min' },
        { exercise: 'Wall Calf Stretch', time: '1 min/side' }
      ]
    }
  };
}

/**
 * Create workout templates - This creates all templates for the 20-week program
 */
async function createWorkoutTemplates(exercises, flows) {
  const templates = {};
  const workoutDefs = getWorkoutDataDefinitions();
  
  console.log('Creating workout templates for all 20 weeks...');
  
  // Create templates from definitions (Block 1 for now - Weeks 1-4)
  for (const [key, def] of Object.entries(workoutDefs)) {
    templates[key] = await createTemplate(def.name, def, exercises, flows);
  }
  
  console.log(`Created ${Object.keys(templates).length} workout templates`);
  
  return templates;
}

/**
 * Helper function to add exercise instances in bulk
 */
async function addExercises(templateId, exercisesList, phase) {
  for (const ex of exercisesList) {
    await addExerciseInstance({
      templateId,
      exerciseId: ex.exerciseId,
      phase: phase,
      label: ex.label || '',
      sets: ex.sets || '1',
      reps: ex.reps || '',
      rest: ex.rest || '',
      time: ex.time || '',
      weight: ex.weight || '',
      notes: ex.notes || ''
    });
  }
}

/**
 * Create the 20-week program with blocks and schedule
 */
async function create20WeekProgram(templates) {
  // Create the program
  const programId = await addProgram({
    name: '20-Week Integrated Strength Program',
    description: 'Professional calisthenics program for 40+ athletes. Focus on pulling strength, joint health, and long-term progression.',
    durationWeeks: 20,
    philosophy: 'Quality Over Quantity and Long-Term Joint Health. Every rep should be perfect and pain-free.',
    goals: [
      'Increase pulling strength (max pull-ups, pull-up variations)',
      'Maintain all-around strength (pushing, lower body) while protecting knee health',
      'Build dynamic and static core strength',
      'Maintain posterior chain (hip hinge) strength'
    ],
    schedule: {
      1: { 1: templates['1_1'], 2: templates['1_2'], 3: templates['1_3'] },
      2: { 1: templates['2_1'], 2: templates['2_2'], 3: templates['2_3'] },
      3: { 1: templates['3_1'], 2: templates['3_2'], 3: templates['3_3'] },
      4: { 1: templates['4_1'], 2: templates['4_2'], 3: templates['4_3'] },
      5: { 1: templates['5_1'], 2: templates['5_2'], 3: templates['5_3'] },
      6: { 1: templates['6_1'], 2: templates['6_2'], 3: templates['6_3'] },
      7: { 1: templates['7_1'], 2: templates['7_2'], 3: templates['7_3'] },
      8: { 1: templates['8_1'], 2: templates['8_2'], 3: templates['8_3'] },
      9: { 1: templates['9_1'], 2: templates['9_2'], 3: templates['9_3'] },
      10: { 1: templates['10_1'], 2: templates['10_2'], 3: templates['10_3'] },
      11: { 1: templates['11_1'], 2: templates['11_2'], 3: templates['11_3'] },
      12: { 1: templates['12_1'], 2: templates['12_2'], 3: templates['12_3'] },
      13: { 1: templates['13_1'], 2: templates['13_2'], 3: templates['13_3'] },
      14: { 1: templates['14_1'], 2: templates['14_2'], 3: templates['14_3'] },
      15: { 1: templates['15_1'], 2: templates['15_2'], 3: templates['15_3'] },
      16: { 1: templates['16_1'], 2: templates['16_2'], 3: templates['16_3'] },
      17: { 1: templates['17_1'], 2: templates['17_2'], 3: templates['17_3'] },
      18: { 1: templates['18_1'], 2: templates['18_2'], 3: templates['18_3'] },
      19: { 1: templates['19_1'], 2: templates['19_2'], 3: templates['19_3'] },
      20: { 1: templates['20_1'], 2: templates['20_2'], 3: templates['20_3'] }
    },
    workoutDescriptions: {
      A: 'Pull Volume Day - High rep pulling work with accessories',
      B: 'Full Body Intensity Day - Heavy weighted work and skills',
      C: 'Active Recovery & Core - Core circuit and mobility flow',
      D: 'Optional Posterior Chain - Hinge movements, glutes, calves'
    }
  });
  
  // Create blocks
  const blocks = [
    {
      programId,
      blockNumber: 1,
      name: 'Foundation',
      goals: 'Establish strong volume base. Re-groove perfect form on 5x5s. Introduce Bulgarian Split Squats.',
      skillA: 'HSPU',
      skillB: 'Crow Stand',
      weekStart: 1,
      weekEnd: 4
    },
    {
      programId,
      blockNumber: 2,
      name: 'Intensification',
      goals: 'Push weighted lifts. Introduce density-based volume (EMOM). Progress to feet-elevated ring work.',
      skillA: 'Wall Handstand Hold',
      skillB: 'Ring Support Hold (RTO)',
      weekStart: 5,
      weekEnd: 8
    },
    {
      programId,
      blockNumber: 3,
      name: 'Pre-Unilateral',
      goals: 'Introduce asymmetrical pulling (bridge to Archers). Introduce PPPU for straight-arm strength.',
      skillA: 'Pseudo-Planche Holds',
      skillB: 'Cossack Squats',
      weekStart: 9,
      weekEnd: 12
    },
    {
      programId,
      blockNumber: 4,
      name: 'Accumulation',
      goals: 'Realize new bodyweight volume (AMRAP). Re-introduce weighted pull-ups to set new PRs. Introduce Archer Rows.',
      skillA: 'Skin the Cat',
      skillB: 'Ring Dips',
      weekStart: 13,
      weekEnd: 16
    },
    {
      programId,
      blockNumber: 5,
      name: 'Peak & Unilateral',
      goals: 'Make the Archer Pull-up the primary lift. Peak all lifts.',
      skillA: 'HSPU (Volume)',
      skillB: 'Archer Pull-up (Form Check)',
      weekStart: 17,
      weekEnd: 20
    }
  ];
  
  for (const block of blocks) {
    await addBlock(block);
  }
  
  return programId;
}
