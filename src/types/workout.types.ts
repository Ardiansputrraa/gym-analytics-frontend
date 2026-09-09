export type WorkoutStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type ExerciseType = 'STRENGTH' | 'CARDIO_TREADMILL' | 'CARDIO_GENERIC';

export type MuscleGroupCategory =
  | 'CHEST'
  | 'BACK'
  | 'LEGS'
  | 'SHOULDERS'
  | 'BICEPS'
  | 'TRICEPS'
  | 'CORE'
  | 'CARDIO'
  | 'FULL_BODY';

export type EquipmentCategory =
  | 'BARBELL'
  | 'DUMBBELL'
  | 'CABLE'
  | 'MACHINE'
  | 'SMITH'
  | 'BODYWEIGHT'
  | 'TREADMILL'
  | 'STATIONARY_BIKE'
  | 'STAIR_MASTER'
  | 'OTHER';

export interface ExerciseMaster {
  id: string;
  name: string;
  primaryMuscle: MuscleGroupCategory;
  primaryMuscleName: string;
  equipment: EquipmentCategory;
  equipmentName: string;
  exerciseType?: ExerciseType;
  description?: string;
  isCustom?: boolean;
}

export interface WorkoutSetItem {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  durationSeconds?: number;
  restSeconds?: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  isCompleted: boolean;
  isPr?: boolean;

  // Specific metrics for Treadmill / Cardio exercises
  durationMinutes?: number;
  inclinePercentage?: number;
  speedKmh?: number;
  distanceKm?: number;
  caloriesBurned?: number;
  paceMinPerKm?: string;
}

export interface WorkoutExerciseItem {
  id: string;
  exerciseId?: string;
  exerciseName: string;
  muscleGroupName: string;
  muscleGroup: MuscleGroupCategory;
  equipment: EquipmentCategory;
  equipmentName: string;
  exerciseType?: ExerciseType;
  orderIndex: number;
  notes?: string;
  sets: WorkoutSetItem[];
}

export interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  status: WorkoutStatus;
  startedAt?: string;
  completedAt?: string;
  totalDurationSeconds: number;
  activeSeconds: number;
  restSeconds: number;
  totalVolumeKg: number;
  estimatedCaloriesBurned?: number;
  exercises: WorkoutExerciseItem[];
}

// Master Pre-populated Library of Gym Exercises across all Equipment & Muscle Groups
export const MASTER_EXERCISES_LIBRARY: ExerciseMaster[] = [
  // CHEST (DADA)
  { id: 'ex-bench-press', name: 'Barbell Bench Press', primaryMuscle: 'CHEST', primaryMuscleName: 'Dada', equipment: 'BARBELL', equipmentName: 'Barbell' },
  { id: 'ex-incline-db-press', name: 'Incline Dumbbell Press', primaryMuscle: 'CHEST', primaryMuscleName: 'Dada', equipment: 'DUMBBELL', equipmentName: 'Dumbbell' },
  { id: 'ex-flat-db-press', name: 'Flat Dumbbell Press', primaryMuscle: 'CHEST', primaryMuscleName: 'Dada', equipment: 'DUMBBELL', equipmentName: 'Dumbbell' },
  { id: 'ex-incline-barbell-press', name: 'Incline Barbell Bench Press', primaryMuscle: 'CHEST', primaryMuscleName: 'Dada', equipment: 'BARBELL', equipmentName: 'Barbell' },
  { id: 'ex-cable-chest-fly', name: 'Cable Chest Fly (High to Low)', primaryMuscle: 'CHEST', primaryMuscleName: 'Dada', equipment: 'CABLE', equipmentName: 'Cable' },
  { id: 'ex-pec-deck-fly', name: 'Pec Deck / Chest Fly Machine', primaryMuscle: 'CHEST', primaryMuscleName: 'Dada', equipment: 'MACHINE', equipmentName: 'Mesin' },
  { id: 'ex-smith-incline-press', name: 'Smith Machine Incline Press', primaryMuscle: 'CHEST', primaryMuscleName: 'Dada', equipment: 'SMITH', equipmentName: 'Smith Machine' },
  { id: 'ex-chest-dips', name: 'Chest Dips (Bodyweight / Weighted)', primaryMuscle: 'CHEST', primaryMuscleName: 'Dada', equipment: 'BODYWEIGHT', equipmentName: 'Bodyweight' },
  { id: 'ex-push-ups', name: 'Standard Push-Ups', primaryMuscle: 'CHEST', primaryMuscleName: 'Dada', equipment: 'BODYWEIGHT', equipmentName: 'Bodyweight' },

  // BACK (PUNGGUNG)
  { id: 'ex-lat-pulldown', name: 'Wide-Grip Lat Pulldown', primaryMuscle: 'BACK', primaryMuscleName: 'Punggung', equipment: 'CABLE', equipmentName: 'Cable' },
  { id: 'ex-seated-cable-row', name: 'Seated Cable Row', primaryMuscle: 'BACK', primaryMuscleName: 'Punggung', equipment: 'CABLE', equipmentName: 'Cable' },
  { id: 'ex-barbell-row', name: 'Barbell Bent-Over Row', primaryMuscle: 'BACK', primaryMuscleName: 'Punggung', equipment: 'BARBELL', equipmentName: 'Barbell' },
  { id: 'ex-tbar-row', name: 'T-Bar Row Machine', primaryMuscle: 'BACK', primaryMuscleName: 'Punggung', equipment: 'MACHINE', equipmentName: 'Mesin' },
  { id: 'ex-pull-ups', name: 'Pull-Ups / Chin-Ups', primaryMuscle: 'BACK', primaryMuscleName: 'Punggung', equipment: 'BODYWEIGHT', equipmentName: 'Bodyweight' },
  { id: 'ex-single-arm-db-row', name: 'One-Arm Dumbbell Row', primaryMuscle: 'BACK', primaryMuscleName: 'Punggung', equipment: 'DUMBBELL', equipmentName: 'Dumbbell' },
  { id: 'ex-deadlift', name: 'Conventional Barbell Deadlift', primaryMuscle: 'BACK', primaryMuscleName: 'Punggung', equipment: 'BARBELL', equipmentName: 'Barbell' },
  { id: 'ex-hyperextension', name: 'Back Hyperextension (Lower Back)', primaryMuscle: 'BACK', primaryMuscleName: 'Punggung', equipment: 'BODYWEIGHT', equipmentName: 'Bodyweight' },

  // BICEPS (LENGAN DEPAN)
  { id: 'ex-db-bicep-curl', name: 'Standing Dumbbell Bicep Curl', primaryMuscle: 'BICEPS', primaryMuscleName: 'Biceps', equipment: 'DUMBBELL', equipmentName: 'Dumbbell' },
  { id: 'ex-incline-db-curl', name: 'Incline Dumbbell Bicep Curl', primaryMuscle: 'BICEPS', primaryMuscleName: 'Biceps', equipment: 'DUMBBELL', equipmentName: 'Dumbbell' },
  { id: 'ex-hammer-curl', name: 'Dumbbell Hammer Curl', primaryMuscle: 'BICEPS', primaryMuscleName: 'Biceps', equipment: 'DUMBBELL', equipmentName: 'Dumbbell' },
  { id: 'ex-cable-hammer-curl', name: 'Cable Rope Hammer Curl', primaryMuscle: 'BICEPS', primaryMuscleName: 'Biceps', equipment: 'CABLE', equipmentName: 'Cable' },
  { id: 'ex-barbell-curl', name: 'EZ-Bar / Straight Barbell Curl', primaryMuscle: 'BICEPS', primaryMuscleName: 'Biceps', equipment: 'BARBELL', equipmentName: 'Barbell' },
  { id: 'ex-preacher-curl', name: 'Preacher Curl (Machine / EZ-Bar)', primaryMuscle: 'BICEPS', primaryMuscleName: 'Biceps', equipment: 'MACHINE', equipmentName: 'Mesin' },
  { id: 'ex-concentration-curl', name: 'Concentration Dumbbell Curl', primaryMuscle: 'BICEPS', primaryMuscleName: 'Biceps', equipment: 'DUMBBELL', equipmentName: 'Dumbbell' },

  // TRICEPS (LENGAN BELAKANG)
  { id: 'ex-cable-tricep-pushdown', name: 'Cable Tricep Pushdown (Straight/V-Bar)', primaryMuscle: 'TRICEPS', primaryMuscleName: 'Triceps', equipment: 'CABLE', equipmentName: 'Cable' },
  { id: 'ex-rope-pushdown', name: 'Cable Rope Overhead Tricep Extension', primaryMuscle: 'TRICEPS', primaryMuscleName: 'Triceps', equipment: 'CABLE', equipmentName: 'Cable' },
  { id: 'ex-skull-crusher', name: 'EZ-Bar Skull Crusher (Lying)', primaryMuscle: 'TRICEPS', primaryMuscleName: 'Triceps', equipment: 'BARBELL', equipmentName: 'Barbell' },
  { id: 'ex-db-overhead-tricep', name: 'Seated Dumbbell Overhead Tricep Extension', primaryMuscle: 'TRICEPS', primaryMuscleName: 'Triceps', equipment: 'DUMBBELL', equipmentName: 'Dumbbell' },
  { id: 'ex-bench-dips', name: 'Tricep Bench Dips', primaryMuscle: 'TRICEPS', primaryMuscleName: 'Triceps', equipment: 'BODYWEIGHT', equipmentName: 'Bodyweight' },

  // SHOULDERS (BAHU)
  { id: 'ex-db-shoulder-press', name: 'Seated Dumbbell Shoulder Press', primaryMuscle: 'SHOULDERS', primaryMuscleName: 'Bahu', equipment: 'DUMBBELL', equipmentName: 'Dumbbell' },
  { id: 'ex-overhead-press', name: 'Standing Overhead Barbell Press (OHP)', primaryMuscle: 'SHOULDERS', primaryMuscleName: 'Bahu', equipment: 'BARBELL', equipmentName: 'Barbell' },
  { id: 'ex-lateral-raise', name: 'Dumbbell Lateral Raise (Side Delts)', primaryMuscle: 'SHOULDERS', primaryMuscleName: 'Bahu', equipment: 'DUMBBELL', equipmentName: 'Dumbbell' },
  { id: 'ex-cable-lateral-raise', name: 'Cable Lateral Raise', primaryMuscle: 'SHOULDERS', primaryMuscleName: 'Bahu', equipment: 'CABLE', equipmentName: 'Cable' },
  { id: 'ex-face-pull', name: 'Cable Face Pull (Rear Delts & Traps)', primaryMuscle: 'SHOULDERS', primaryMuscleName: 'Bahu', equipment: 'CABLE', equipmentName: 'Cable' },
  { id: 'ex-reverse-pec-deck', name: 'Reverse Pec Deck (Rear Delt Fly)', primaryMuscle: 'SHOULDERS', primaryMuscleName: 'Bahu', equipment: 'MACHINE', equipmentName: 'Mesin' },
  { id: 'ex-db-front-raise', name: 'Dumbbell Front Raise', primaryMuscle: 'SHOULDERS', primaryMuscleName: 'Bahu', equipment: 'DUMBBELL', equipmentName: 'Dumbbell' },

  // LEGS (KAKI & BETIS)
  { id: 'ex-barbell-squat', name: 'Barbell Back Squat', primaryMuscle: 'LEGS', primaryMuscleName: 'Kaki', equipment: 'BARBELL', equipmentName: 'Barbell' },
  { id: 'ex-leg-press', name: 'Incline 45° Leg Press Machine', primaryMuscle: 'LEGS', primaryMuscleName: 'Kaki', equipment: 'MACHINE', equipmentName: 'Mesin' },
  { id: 'ex-leg-extension', name: 'Leg Extension Machine (Quads)', primaryMuscle: 'LEGS', primaryMuscleName: 'Kaki', equipment: 'MACHINE', equipmentName: 'Mesin' },
  { id: 'ex-lying-leg-curl', name: 'Lying Leg Curl Machine (Hamstrings)', primaryMuscle: 'LEGS', primaryMuscleName: 'Kaki', equipment: 'MACHINE', equipmentName: 'Mesin' },
  { id: 'ex-romanian-deadlift', name: 'Romanian Deadlift (RDL)', primaryMuscle: 'LEGS', primaryMuscleName: 'Kaki', equipment: 'BARBELL', equipmentName: 'Barbell' },
  { id: 'ex-db-lunges', name: 'Walking Dumbbell Lunges', primaryMuscle: 'LEGS', primaryMuscleName: 'Kaki', equipment: 'DUMBBELL', equipmentName: 'Dumbbell' },
  { id: 'ex-calf-raise', name: 'Standing / Seated Calf Raise', primaryMuscle: 'LEGS', primaryMuscleName: 'Kaki', equipment: 'MACHINE', equipmentName: 'Mesin' },
  { id: 'ex-smith-squat', name: 'Smith Machine Squat', primaryMuscle: 'LEGS', primaryMuscleName: 'Kaki', equipment: 'SMITH', equipmentName: 'Smith Machine' },

  // CORE (PERUT & PINGGANG)
  { id: 'ex-hanging-leg-raise', name: 'Hanging Leg Raise / Knee Raise', primaryMuscle: 'CORE', primaryMuscleName: 'Perut', equipment: 'BODYWEIGHT', equipmentName: 'Bodyweight' },
  { id: 'ex-cable-crunch', name: 'Kneeling Cable Crunch', primaryMuscle: 'CORE', primaryMuscleName: 'Perut', equipment: 'CABLE', equipmentName: 'Cable' },
  { id: 'ex-plank', name: 'Core Plank Hold', primaryMuscle: 'CORE', primaryMuscleName: 'Perut', equipment: 'BODYWEIGHT', equipmentName: 'Bodyweight' },
  { id: 'ex-ab-roller', name: 'Ab Wheel Rollout', primaryMuscle: 'CORE', primaryMuscleName: 'Perut', equipment: 'OTHER', equipmentName: 'Lainnya' },

  // CARDIO (KARDIO, TREADMILL & ENDURANCE)
  {
    id: 'ex-treadmill-incline-walk',
    name: 'Treadmill Incline Fat Burn (12-3-30 Walk)',
    primaryMuscle: 'CARDIO',
    primaryMuscleName: 'Kardio',
    equipment: 'TREADMILL',
    equipmentName: 'Treadmill',
    exerciseType: 'CARDIO_TREADMILL',
    description: 'Jalan nanjak konsisten (Incline 10-12%, Speed 4.8 km/h, 30 menit) membakar lemak maksimal tanpa membebani lutut.',
  },
  {
    id: 'ex-treadmill-running',
    name: 'Treadmill Running / Jogging',
    primaryMuscle: 'CARDIO',
    primaryMuscleName: 'Kardio',
    equipment: 'TREADMILL',
    equipmentName: 'Treadmill',
    exerciseType: 'CARDIO_TREADMILL',
    description: 'Lari stabil di atas treadmill dengan pengaturan kecepatan dan kemiringan.',
  },
  {
    id: 'ex-treadmill-sprint-hiit',
    name: 'Treadmill HIIT Sprint Intervals',
    primaryMuscle: 'CARDIO',
    primaryMuscleName: 'Kardio',
    equipment: 'TREADMILL',
    equipmentName: 'Treadmill',
    exerciseType: 'CARDIO_TREADMILL',
    description: 'Sesi interval lari sprint cepat diselingi pemulihan jalan santai.',
  },
  {
    id: 'ex-stair-master',
    name: 'StairMaster / StepMill (Tangga Nanjak)',
    primaryMuscle: 'CARDIO',
    primaryMuscleName: 'Kardio',
    equipment: 'STAIR_MASTER',
    equipmentName: 'StairMaster',
    exerciseType: 'CARDIO_GENERIC',
    description: 'Mesin tangga berjalan melatih glutes, paha, dan sistem kardiovaskular.',
  },
  {
    id: 'ex-stationary-bike',
    name: 'Stationary Spin Bike (Sepeda Statis)',
    primaryMuscle: 'CARDIO',
    primaryMuscleName: 'Kardio',
    equipment: 'STATIONARY_BIKE',
    equipmentName: 'Sepeda Statis',
    exerciseType: 'CARDIO_GENERIC',
    description: 'Gowes sepeda gym dengan resistensi terukur.',
  },
];
