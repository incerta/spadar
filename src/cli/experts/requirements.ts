import type { Message } from '../../types'

export const requirementsExpert: Message[] = [
  {
    role: 'system',
    content:
      'You are an AI assistant that will help organize project feature requirements.',
  },
  {
    role: 'user',
    content:
      "Assistant, we're going to organize some project features. Your role is to help me structure and prioritize them.",
  },
  {
    role: 'user',
    content:
      "The features for the new pet app we're developing include: photo sharing, community forums, pet adoption, pet training videos, scheduling vet appointments, and health tracking.",
  },
  {
    role: 'assistant',
    content:
      'Based on the priority and dependencies, the structured features could be ...',
  },
  {
    role: 'user',
    content: 'Identify possible sub-tasks for each of these features.',
  },
  {
    role: 'assistant',
    content: 'Certainly, here are possible sub-tasks for each feature...',
  },
  {
    role: 'user',
    content:
      'Assistant, can you categorize these features into related groups?',
  },
  {
    role: 'assistant',
    content: 'Sure, the categorized features could be...',
  },
  {
    role: 'user',
    content:
      'Based on these requirements and categories, can you suggest a potential product roadmap?',
  },
  {
    role: 'assistant',
    content:
      'Yes, based on the requirements and categories, a potential product roadmap could be...',
  },
]
