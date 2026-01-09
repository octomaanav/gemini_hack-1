import { Router } from "express";
import type { Unit, UnitLessons, Book } from "../../types/index.js";
import { callGeminiJson } from "../utils/gemini.js";

export const lessonsRouter = Router();

/**
 * Generate the lesson prompt for a given unit
 */
const getLessonPrompt = (unit: Unit): string => {
  return `You are an expert STEM educator and curriculum designer.

Task:
Generate **detailed lessons** for each section of a unit. Each lesson should be **long enough to fully explain the concept**, include **intuitive explanations, examples, and real-world applications**, and describe any **diagrams** verbally. **Formulas and equations** should be **embedded naturally in explanations** using **LaTeX**, no separate math section. Avoid overly short one-line explanations. Each lesson should be standalone so a student reading it understands the concept completely.

Input JSON:

${JSON.stringify({ unit })}

Output JSON:
{
  "unitTitle": "<unitTitle>",
  "unitDescription": "<unitDescription>",
  "lessons": [
    {
      "sectionId": "<sectionId>",
      "title": "<title>",
      "lessonContent": {
        "introduction": "<brief introduction, motivation for the topic>",
        "coreConcepts": [
          {
            "conceptTitle": "<concept name>",
            "explanation": "<detailed explanation covering the concept, embedding LaTeX for math naturally>",
            "example": "<worked example or real-world application>",
            "diagramDescription": "<description of diagram, if any>"
          },
          ...
        ],
        "summary": ["<key takeaways in bullet points>"],
        "quickCheckQuestions": [
          {"question": "<question>", "answer": "<answer>"},
          ...
        ]
      }
    },
    ...
  ]
}

Instructions:
- Generate a **separate JSON object for each section**, and combine them in a **JSON array**.
- Cover **all learning goals** listed for each section.
- Include multiple **core concepts** if the topic has subtopics.
- Provide **detailed explanations** (200–500 words per section).
- Use **LaTeX for all formulas**, embedded naturally in explanations.
- Include **real-world applications and examples** wherever possible.
- Describe **diagrams verbally** to aid understanding.
- List **common mistakes and misconceptions**.
- Provide **quick-check questions** with answers.
- Output strictly as JSON. Do **not** add any text outside the JSON array.


CRITICAL JSON RULES:
- Output MUST be valid strict JSON parsable by JSON.parse()
- Escape ALL backslashes in LaTeX using double backslashes (\\\\)
- Example: use "\\\\Delta x", "\\\\frac{a}{b}", "\\\\text{m/s}"
- Do NOT output raw LaTeX with single backslashes
- Do NOT include markdown code fences


Here is an example input and output for your reference:

Input JSON (example)
{
  "unitTitle": "Unit 1: Kinematics",
  "unitDescription": "Explore the fundamentals of motion by analyzing and applying multiple representations such as words, diagrams, graphs, and equations. Develop an understanding of objects moving with constant acceleration and common misconceptions about motion.",
  "sections": [
    {
      "sectionId": "1.1",
      "title": "Scalars and Vectors in One Dimension",
      "description": "Introduce scalar and vector quantities and their role in describing motion in one dimension.",
      "learningGoals": [
        "Explain scalars",
        "Explain vectors",
        "Differentiate between scalar and vector quantities",
        "Understand position, distance, and displacement",
        "Operations on vectors",
        "Calculate average speed and average velocity",
        "Understand the role of reference frames"
      ]
    },
    {
      "sectionId": "1.2",
      "title": "Visual Representations of Motion",
      "description": "Use diagrams and graphs to describe motion and extract physical meaning from them.",
      "learningGoals": [
        "Interpret position-time graphs",
        "Interpret velocity-time graphs",
        "Interpret acceleration-time graphs",
        "Find displacement from velocity graphs", 
        "Relate velocity and acceleration graphs"
      ]
    }
  ]
}

Expected Output JSON
{
  "unitTitle": "Unit 1: Kinematics",
  "unitDescription": "Explore the fundamentals of motion by analyzing and applying multiple representations such as words, diagrams, graphs, and equations. Develop an understanding of objects moving with constant acceleration and common misconceptions about motion.",
  "lessons": [
    {
      "sectionId": "1.1",
      "title": "Scalars and Vectors in One Dimension",
      "lessonContent": {
        "introduction": "In this lesson, you will learn about scalar and vector quantities, which are the foundation for describing motion in physics. Understanding these concepts is crucial because they allow us to analyze and predict how objects move in one dimension.",
        "coreConcepts": [
          {
            "conceptTitle": "Scalars",
            "explanation": "Scalars are quantities that are described completely by a magnitude alone. Common examples include distance, speed, mass, and temperature. For instance, if a car travels 50 meters, the distance is a scalar because only the magnitude matters, not the direction.",
            "example": "A runner covers 100 meters in 12 seconds. The speed of the runner is a scalar quantity: speed = distance/time = 100/12 ≈ 8.33 m/s.",
            "diagramDescription": "A straight line showing the distance traveled without indicating any direction."
          },
          {
            "conceptTitle": "Vectors",
            "explanation": "Vectors are quantities that have both magnitude and direction. Examples include displacement, velocity, and acceleration. Displacement is a vector, represented as \\\\( \\\\vec{d} \\\\), which points from the initial to the final position. Vector addition follows the triangle or parallelogram law. For motion in one dimension, vectors can be added algebraically, considering their signs for direction.",
            "example": "If a car moves 30 meters east and then 20 meters west, the displacement is \\\\( \\\\vec{d} = 30 - 20 = 10 \\\\) meters east.",
            "diagramDescription": "A straight line with arrows pointing in positive and negative directions representing displacement vectors."
          },
          {
            "conceptTitle": "Average Speed and Velocity",
            "explanation": "Average speed is a scalar given by total distance divided by total time: \\\\( v_{avg} = \\\\frac{d_{total}}{t_{total}} \\\\). Average velocity is a vector given by total displacement over total time: \\\\( \\\\vec{v}_{avg} = \\\\frac{\\\\vec{d}_{total}}{t_{total}} \\\\). Understanding the distinction is essential in kinematics problems.",
            "example": "A car travels 50 m east in 5 s and then 30 m west in 3 s. Average speed = (50+30)/(5+3) = 10 m/s. Average velocity = (50-30)/(5+3) = 2.5 m/s east.",
            "diagramDescription": "Arrow diagram showing displacement vectors in opposite directions and their net result."
          }
        ],
        "summary": [
          "Scalars have only magnitude; vectors have both magnitude and direction.",
          "Displacement differs from distance as it considers direction.",
          "Average speed and average velocity are distinct concepts."
        ],
        "quickCheckQuestions": [
          {
            "question": "Is speed a scalar or vector?",
            "answer": "Scalar"
          },
          {
            "question": "A person walks 10 m east and then 4 m west. What is the displacement?",
            "answer": "6 m east"
          },
          {
            "question": "What is the difference between distance and displacement?",
            "answer": "Distance is total path length (scalar), displacement is net change in position (vector)."
          }
        ]
      }
    },
    {
      "sectionId": "1.2",
      "title": "Visual Representations of Motion",
      "lessonContent": {
        "introduction": "Graphs and diagrams provide visual ways to understand motion. In this lesson, you will learn how to interpret position-time, velocity-time, and acceleration-time graphs to analyze motion effectively.",
        "coreConcepts": [
          {
            "conceptTitle": "Position-Time Graphs",
            "explanation": "A position-time graph shows how an object's position changes over time. The slope of the graph gives the velocity: \\\\( v = \\\\frac{\\\\Delta x}{\\\\Delta t} \\\\). A straight line indicates constant velocity; a curved line indicates acceleration.",
            "example": "If a car moves at constant velocity and its position-time graph is a straight line, the slope of the line represents the velocity.",
            "diagramDescription": "Graph with time on x-axis, position on y-axis, straight line with slope indicating velocity."
          },
          {
            "conceptTitle": "Velocity-Time Graphs",
            "explanation": "A velocity-time graph shows how velocity changes with time. The slope of the graph gives acceleration: \\\\( a = \\\\frac{\\\\Delta v}{\\\\Delta t} \\\\). The area under the curve represents displacement.",
            "example": "A car accelerating from 0 to 20 m/s in 10 s has a velocity-time graph with slope = 2 m/s².",
            "diagramDescription": "Graph with time on x-axis, velocity on y-axis, line sloping upwards for positive acceleration."
          },
          {
            "conceptTitle": "Acceleration-Time Graphs",
            "explanation": "An acceleration-time graph shows how acceleration changes with time. The area under the curve gives the change in velocity: \\\\( \\\\Delta v = \\\\int a \\\\, dt \\\\). Constant acceleration is shown as a horizontal line.",
            "example": "Free fall under gravity at 9.8 m/s² is represented by a horizontal line at a = 9.8 m/s².",
            "diagramDescription": "Graph with time on x-axis, acceleration on y-axis, horizontal line indicating constant acceleration."
          }
        ],
        "summary": [
          "Slope of position-time graph gives velocity.",
          "Slope of velocity-time graph gives acceleration.",
          "Area under velocity-time graph gives displacement.",
          "Area under acceleration-time graph gives change in velocity."
        ],
        "quickCheckQuestions": [
          {
            "question": "What does the slope of a position-time graph represent?",
            "answer": "Velocity"
          },
          {
            "question": "What does the area under a velocity-time graph represent?",
            "answer": "Displacement"
          },
          {
            "question": "How is constant acceleration shown in an acceleration-time graph?",
            "answer": "As a horizontal line"
          }
        ]
      }
    }
  ]
}`;
};

/**
 * Generate lessons for a single unit using Gemini
 */
const generateLessonForUnit = async (unit: Unit): Promise<UnitLessons | null> => {
  const prompt = getLessonPrompt(unit);
  return callGeminiJson<UnitLessons>(prompt);
};

lessonsRouter.post("/generate", async (req, res) => {
  try {
    const book = req.body as Book;

    if (!Array.isArray(book) || book.length === 0) {
      return res.status(400).json({ 
        error: "Invalid input. Expected an array of units" 
      });
    }

    for (const unit of book) {
      if (!unit.unitTitle || !unit.sections || !Array.isArray(unit.sections)) {
        return res.status(400).json({ 
          error: `Invalid unit format. Each unit must have unitTitle and sections array.` 
        });
      }
      if (unit.sections.length === 0) {
        return res.status(400).json({ error: `Unit "${unit.unitTitle}" has no sections` });
      }
    }

    const unitLessons: UnitLessons[] = [];
    
    for (const unit of book) {
      console.log(`Generating lessons for unit: ${unit.unitTitle}...`);
      const lessons = await generateLessonForUnit(unit);
      
      if (!lessons) {
        return res.status(500).json({ 
          error: `Failed to generate lessons for unit: ${unit.unitTitle}` 
        });
      }
      
      unitLessons.push(lessons);
    }

    res.json(unitLessons);
  } catch (error) {
    console.error("Error generating lessons:", error);
    res.status(500).json({ error: "Failed to generate lessons" });
  }
});
