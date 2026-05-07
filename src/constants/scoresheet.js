
export const SCORESHEET_CRITERIA = Object.freeze([
  {
    key: 'technicalScore',
    label: 'Technical Skills',
    description:
      "Candidate's proficiency in the technical competencies listed in the job description. Includes domain knowledge, tools, and problem-solving ability.",
  },
  {
    key: 'behaviouralScore',
    label: 'Behavioural',
    description:
      'Demonstration of teamwork, adaptability, conflict resolution, and past behaviour in professional scenarios (STAR-method responses).',
  },
  {
    key: 'communicationScore',
    label: 'Communication',
    description:
      'Clarity, structure, and confidence in articulating thoughts. Active listening and ability to explain complex ideas.',
  },
  {
    key: 'cultureFitScore',
    label: 'Culture Fit',
    description:
      'Alignment with company values, working style, and team dynamics as assessed by the interviewer.',
  },
  {
    key: 'problemSolvingScore',
    label: 'Problem Solving',
    description:
      'Approach to ambiguous or novel challenges. Logical thinking, creativity, and ability to work through unknowns.',
  },
])

export const SCORE_RANGE = Object.freeze({ min: 1, max: 5 })

export const DECISION = Object.freeze({
  PASS: 'PASS',
  REJECT: 'REJECT',
})

export const DECISION_LABELS = Object.freeze({
  [DECISION.PASS]: 'Pass',
  [DECISION.REJECT]: 'Reject',
})
