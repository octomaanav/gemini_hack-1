import { db } from "./index.js";
import { curricula, classes, subjects, gradeSubjects, chapters } from "./schema.js";
import { eq, and } from "drizzle-orm";

// =============================================================================
// SUBJECT DATA
// =============================================================================

const subjectData = [
  // Science subjects
  { slug: "physics", name: "Physics", description: "Study of matter, energy, and their interactions" },
  { slug: "chemistry", name: "Chemistry", description: "Study of substances and their properties" },
  { slug: "biology", name: "Biology", description: "Study of living organisms" },
  { slug: "science", name: "Science", description: "Combined Physics, Chemistry, and Biology" },
  
  // Mathematics
  { slug: "mathematics", name: "Mathematics", description: "Study of numbers, quantities, and shapes" },
  
  // Languages
  { slug: "english", name: "English", description: "Language and Literature" },
  { slug: "hindi", name: "Hindi", description: "Language and Literature" },
  
  // Social Sciences
  { slug: "social-science", name: "Social Science", description: "History, Geography, Civics, Economics" },
  { slug: "history", name: "History", description: "World and Indian History" },
  { slug: "geography", name: "Geography", description: "Physical and Human Geography" },
  { slug: "political-science", name: "Political Science", description: "Government and Politics" },
  { slug: "economics", name: "Economics", description: "Micro and Macro Economics" },
  
  // Commerce
  { slug: "accountancy", name: "Accountancy", description: "Financial and Corporate Accounting" },
  { slug: "business-studies", name: "Business Studies", description: "Business Management and Organization" },
  
  // Other
  { slug: "computer-science", name: "Computer Science", description: "Programming, Data Structures" },
  { slug: "psychology", name: "Psychology", description: "Human Behavior and Mind" },
  { slug: "sociology", name: "Sociology", description: "Study of Society" },
];

// =============================================================================
// CURRICULUM DATA
// =============================================================================

const curriculumData = [
  {
    slug: "cbse",
    name: "CBSE",
    description: "Central Board of Secondary Education",
    grades: [
      { slug: "class-9", name: "Class 9", description: "Secondary School - Year 1", sortOrder: 1 },
      { slug: "class-10", name: "Class 10", description: "Secondary School - Year 2 (Board Exams)", sortOrder: 2 },
      { slug: "class-11", name: "Class 11", description: "Senior Secondary - Year 1", sortOrder: 3 },
      { slug: "class-12", name: "Class 12", description: "Senior Secondary - Year 2 (Board Exams)", sortOrder: 4 },
    ],
  },
  {
    slug: "icse",
    name: "ICSE/ISC",
    description: "Indian Certificate of Secondary Education",
    grades: [
      { slug: "class-9", name: "Class 9", description: "Secondary School - Year 1", sortOrder: 1 },
      { slug: "class-10", name: "Class 10", description: "ICSE Board Exams", sortOrder: 2 },
      { slug: "class-11", name: "Class 11", description: "ISC - Year 1", sortOrder: 3 },
      { slug: "class-12", name: "Class 12", description: "ISC Board Exams", sortOrder: 4 },
    ],
  },
  {
    slug: "state",
    name: "State Board",
    description: "Various State Education Boards",
    grades: [
      { slug: "class-9", name: "Class 9", description: "Secondary School - Year 1", sortOrder: 1 },
      { slug: "class-10", name: "Class 10", description: "SSC/SSLC Board Exams", sortOrder: 2 },
      { slug: "class-11", name: "Class 11", description: "Higher Secondary - Year 1", sortOrder: 3 },
      { slug: "class-12", name: "Class 12", description: "HSC Board Exams", sortOrder: 4 },
    ],
  },
  {
    slug: "ib",
    name: "IB",
    description: "International Baccalaureate",
    grades: [
      { slug: "myp-4", name: "MYP Year 4", description: "Middle Years Programme", sortOrder: 1 },
      { slug: "myp-5", name: "MYP Year 5", description: "Middle Years Programme", sortOrder: 2 },
      { slug: "dp-1", name: "DP Year 1", description: "Diploma Programme", sortOrder: 3 },
      { slug: "dp-2", name: "DP Year 2", description: "Diploma Programme", sortOrder: 4 },
    ],
  },
];

// =============================================================================
// GRADE-SUBJECT MAPPINGS
// =============================================================================

const class9_10Subjects = ["science", "mathematics", "social-science", "english", "hindi"];
const class11_12Subjects = [
  "physics", "chemistry", "biology", "mathematics", "computer-science", "english",
  "accountancy", "business-studies", "economics",
  "history", "geography", "political-science", "psychology", "sociology",
];

const gradeSubjectMappings: Record<string, Record<string, string[]>> = {
  "cbse": {
    "class-9": class9_10Subjects,
    "class-10": class9_10Subjects,
    "class-11": class11_12Subjects,
    "class-12": class11_12Subjects,
  },
  "icse": {
    "class-9": class9_10Subjects,
    "class-10": class9_10Subjects,
    "class-11": class11_12Subjects,
    "class-12": class11_12Subjects,
  },
  "state": {
    "class-9": class9_10Subjects,
    "class-10": class9_10Subjects,
    "class-11": class11_12Subjects,
    "class-12": class11_12Subjects,
  },
  "ib": {
    "myp-4": class9_10Subjects,
    "myp-5": class9_10Subjects,
    "dp-1": class11_12Subjects,
    "dp-2": class11_12Subjects,
  },
};

// =============================================================================
// CHAPTER DATA (CBSE Class 11 as example - can be expanded)
// =============================================================================

type ChapterData = { slug: string; name: string; description: string }[];

const chaptersBySubject: Record<string, ChapterData> = {
  "physics": [
    { slug: "physical-world", name: "Physical World", description: "Nature of physical laws and scope of physics" },
    { slug: "units-measurements", name: "Units and Measurements", description: "SI units, dimensional analysis, errors" },
    { slug: "motion-straight-line", name: "Motion in a Straight Line", description: "Position, velocity, acceleration, equations of motion" },
    { slug: "motion-plane", name: "Motion in a Plane", description: "Vectors, projectile motion, circular motion" },
    { slug: "laws-motion", name: "Laws of Motion", description: "Newton's laws, friction, circular motion dynamics" },
    { slug: "work-energy-power", name: "Work, Energy and Power", description: "Work-energy theorem, conservation of energy" },
    { slug: "system-particles", name: "System of Particles and Rotational Motion", description: "Center of mass, torque, angular momentum" },
    { slug: "gravitation", name: "Gravitation", description: "Newton's law of gravitation, orbital motion, satellites" },
  ],
  "chemistry": [
    { slug: "basic-concepts", name: "Some Basic Concepts of Chemistry", description: "Mole concept, stoichiometry, atomic mass" },
    { slug: "structure-atom", name: "Structure of Atom", description: "Atomic models, quantum numbers, electronic configuration" },
    { slug: "periodic-table", name: "Classification of Elements and Periodicity", description: "Periodic trends, properties" },
    { slug: "chemical-bonding", name: "Chemical Bonding and Molecular Structure", description: "Ionic, covalent bonds, VSEPR theory" },
    { slug: "states-matter", name: "States of Matter", description: "Gas laws, kinetic theory, liquids and solids" },
    { slug: "thermodynamics", name: "Thermodynamics", description: "Laws of thermodynamics, enthalpy, entropy" },
    { slug: "equilibrium", name: "Equilibrium", description: "Chemical and ionic equilibrium, pH, buffers" },
  ],
  "mathematics": [
    { slug: "sets", name: "Sets", description: "Set theory, operations, Venn diagrams" },
    { slug: "relations-functions", name: "Relations and Functions", description: "Types of relations, functions, graphs" },
    { slug: "trigonometry", name: "Trigonometric Functions", description: "Trigonometric ratios, identities, equations" },
    { slug: "complex-numbers", name: "Complex Numbers and Quadratic Equations", description: "Complex number algebra, quadratic equations" },
    { slug: "linear-inequalities", name: "Linear Inequalities", description: "Solving and graphing linear inequalities" },
    { slug: "permutations", name: "Permutations and Combinations", description: "Counting principles, arrangements, selections" },
    { slug: "binomial-theorem", name: "Binomial Theorem", description: "Binomial expansion, general term" },
    { slug: "sequences-series", name: "Sequences and Series", description: "AP, GP, special series" },
    { slug: "straight-lines", name: "Straight Lines", description: "Slope, equations of lines, distance formulas" },
    { slug: "conic-sections", name: "Conic Sections", description: "Circle, parabola, ellipse, hyperbola" },
  ],
  "biology": [
    { slug: "living-world", name: "The Living World", description: "Characteristics of living organisms, taxonomy" },
    { slug: "biological-classification", name: "Biological Classification", description: "Five kingdom classification" },
    { slug: "plant-kingdom", name: "Plant Kingdom", description: "Classification of plants, life cycles" },
    { slug: "animal-kingdom", name: "Animal Kingdom", description: "Classification of animals, phyla" },
    { slug: "morphology-plants", name: "Morphology of Flowering Plants", description: "Root, stem, leaf, flower structure" },
    { slug: "anatomy-plants", name: "Anatomy of Flowering Plants", description: "Tissues, tissue systems" },
    { slug: "cell-unit-life", name: "Cell: The Unit of Life", description: "Cell structure, organelles" },
    { slug: "biomolecules", name: "Biomolecules", description: "Carbohydrates, proteins, lipids, nucleic acids" },
  ],
  "science": [
    { slug: "matter-surroundings", name: "Matter in Our Surroundings", description: "States of matter, change of state" },
    { slug: "pure-substances", name: "Is Matter Around Us Pure", description: "Mixtures, solutions, separation techniques" },
    { slug: "atoms-molecules", name: "Atoms and Molecules", description: "Atomic theory, molecules, ions" },
    { slug: "structure-atom", name: "Structure of the Atom", description: "Subatomic particles, atomic models" },
    { slug: "cell", name: "The Fundamental Unit of Life", description: "Cell structure and functions" },
    { slug: "tissues", name: "Tissues", description: "Plant and animal tissues" },
    { slug: "motion", name: "Motion", description: "Distance, displacement, velocity, acceleration" },
    { slug: "force-laws-motion", name: "Force and Laws of Motion", description: "Newton's laws, inertia, momentum" },
  ],
  "english": [
    { slug: "reading-comprehension", name: "Reading Comprehension", description: "Unseen passages, note-making" },
    { slug: "writing-skills", name: "Writing Skills", description: "Letter writing, article writing, reports" },
    { slug: "grammar", name: "Grammar", description: "Tenses, clauses, transformation of sentences" },
    { slug: "literature-prose", name: "Literature - Prose", description: "Short stories, essays, extracts" },
    { slug: "literature-poetry", name: "Literature - Poetry", description: "Poems, literary devices, appreciation" },
  ],
  "social-science": [
    { slug: "india-france-revolution", name: "The French Revolution", description: "Causes, events, impact of French Revolution" },
    { slug: "socialism-europe", name: "Socialism in Europe and Russian Revolution", description: "Rise of socialism, Russian Revolution" },
    { slug: "nazism-hitler", name: "Nazism and the Rise of Hitler", description: "Hitler's rise, Nazi ideology, World War II" },
    { slug: "india-size-location", name: "India - Size and Location", description: "India's location, neighbors, size" },
    { slug: "physical-features", name: "Physical Features of India", description: "Mountains, plains, deserts, coastal areas" },
    { slug: "democracy", name: "What is Democracy? Why Democracy?", description: "Features and merits of democracy" },
    { slug: "constitutional-design", name: "Constitutional Design", description: "Making of Indian Constitution" },
  ],
};

// =============================================================================
// SEED FUNCTION
// =============================================================================

export async function seed() {

  try {
    const insertedSubjects = await db
      .insert(subjects)
      .values(subjectData)
      .onConflictDoNothing()
      .returning();
    
    const subjectMap = new Map<string, string>();
    
    if (insertedSubjects.length === 0) {
      const existingSubjects = await db.select().from(subjects);
      existingSubjects.forEach(s => subjectMap.set(s.slug, s.id));
    } else {
      insertedSubjects.forEach(s => subjectMap.set(s.slug, s.id));
    }
    
    
    const classMap = new Map<string, string>();

    for (const curriculum of curriculumData) {
      const [insertedCurriculum] = await db
        .insert(curricula)
        .values({
          slug: curriculum.slug,
          name: curriculum.name,
          description: curriculum.description,
        })
        .onConflictDoNothing()
        .returning();

      let curriculumId = insertedCurriculum?.id;
      
      if (!curriculumId) {
        const [existing] = await db
          .select()
          .from(curricula)
          .where(eq(curricula.slug, curriculum.slug))
          .limit(1);
        curriculumId = existing?.id;
      }

      if (!curriculumId) {
        console.error(`Failed to get curriculum ID for ${curriculum.slug}`);
        continue;
      }

      for (const classItem of curriculum.grades) {
        const [insertedClass] = await db
          .insert(classes)
          .values({
            curriculumId,
            slug: classItem.slug,
            name: classItem.name,
            description: classItem.description,
            sortOrder: classItem.sortOrder,
          })
          .onConflictDoNothing()
          .returning();

        const classId = insertedClass?.id;
        if (classId) {
          classMap.set(`${curriculum.slug}-${classItem.slug}`, classId);
        }
      }
    }
    
    if (classMap.size === 0) {
      const existingClasses = await db
        .select({
          id: classes.id,
          slug: classes.slug,
          curriculumSlug: curricula.slug,
        })
        .from(classes)
        .innerJoin(curricula, eq(curricula.id, classes.curriculumId));
      
      existingClasses.forEach(c => {
        classMap.set(`${c.curriculumSlug}-${c.slug}`, c.id);
      });
    }
    
    const gradeSubjectMap = new Map<string, string>(); // "classId-subjectSlug" -> gradeSubjectId

    for (const [curriculumSlug, gradesMappings] of Object.entries(gradeSubjectMappings)) {
      for (const [gradeSlug, subjectSlugs] of Object.entries(gradesMappings)) {
        const classId = classMap.get(`${curriculumSlug}-${gradeSlug}`);
        if (!classId) {
          console.warn(`Class not found: ${curriculumSlug}-${gradeSlug}`);
          continue;
        }

        for (const subjectSlug of subjectSlugs) {
          const subjectId = subjectMap.get(subjectSlug);
          if (!subjectId) {
            console.warn(`Subject not found: ${subjectSlug}`);
            continue;
          }

          const [inserted] = await db
            .insert(gradeSubjects)
            .values({ classId, subjectId })
            .onConflictDoNothing()
            .returning();

          if (inserted) {
            gradeSubjectMap.set(`${classId}-${subjectSlug}`, inserted.id);
          }
        }
      }
    }

    const existingGradeSubjects = await db
      .select({
        id: gradeSubjects.id,
        classId: gradeSubjects.classId,
        subjectSlug: subjects.slug,
      })
      .from(gradeSubjects)
      .innerJoin(subjects, eq(subjects.id, gradeSubjects.subjectId));
    
    existingGradeSubjects.forEach(gs => {
      gradeSubjectMap.set(`${gs.classId}-${gs.subjectSlug}`, gs.id);
    });
    
    let chapterCount = 0;

    for (const [curriculumSlug, gradesMappings] of Object.entries(gradeSubjectMappings)) {
      for (const [gradeSlug, subjectSlugs] of Object.entries(gradesMappings)) {
        const classId = classMap.get(`${curriculumSlug}-${gradeSlug}`);
        if (!classId) continue;

        for (const subjectSlug of subjectSlugs) {
          const gradeSubjectId = gradeSubjectMap.get(`${classId}-${subjectSlug}`);
          if (!gradeSubjectId) continue;

          const subjectChapters = chaptersBySubject[subjectSlug];
          if (!subjectChapters) continue;

          for (let i = 0; i < subjectChapters.length; i++) {
            const chapter = subjectChapters[i];
            await db
              .insert(chapters)
              .values({
                gradeSubjectId,
                slug: chapter.slug,
                name: chapter.name,
                description: chapter.description,
                sortOrder: i + 1,
              })
              .onConflictDoNothing();
            chapterCount++;
          }
        }
      }
    }
    try {
      const { seedLessons } = await import("./seedLessons.js");
      await seedLessons();
    } catch (error) {
      console.log("Lesson seeding skipped or failed (this is optional)");
    }

  } catch (error) {
    console.error("Seeding failed:", error);
    throw error;
  }
}
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
