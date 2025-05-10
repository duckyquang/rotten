interface BrainrotTerm {
  term: string;
  definition: string;
  use_case: string;
  educational_use_case: string;
}

export function generatePrompt(content: string, customInstructions: string, terms: BrainrotTerm[]): string {
  return `You are a creative educator who can explain concepts in both formal and informal ways.

Your task is to convert this EXACT educational content about the water cycle into two versions while preserving ALL the key information and concepts:

${content}

Custom Instructions: ${customInstructions}

Please provide two versions that explain the EXACT SAME water cycle content:
1. Student Version: Using brainrot terms and slang to make the water cycle fun and relatable, while ensuring all key concepts (evaporation, condensation, precipitation, collection) are explained
2. Teacher Version: Using more formal but engaging language to explain the water cycle, while maintaining educational value

You can reference these brainrot terms for inspiration (but you don't have to use all of them):
${terms.map(term => `- ${term.term}: ${term.definition}`).join('\n')}

Important:
- Focus ONLY on explaining the water cycle content provided
- Do not go off-topic or list terms
- Make sure both versions cover all the key points from the original content
- Both versions must explain: evaporation, condensation, precipitation, and collection
- Do not talk about TikTok, memes, or anything unrelated to the water cycle`;
} 