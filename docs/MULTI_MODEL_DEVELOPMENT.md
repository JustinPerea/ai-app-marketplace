# Multi-Model App Development Guide

This guide explains how to build AI applications that work consistently across different AI models (local Ollama, OpenAI, Anthropic, Google AI) while providing the same user experience.

## Core Architecture Principles

### 1. **Unified Prompt Templates**
Create standardized prompts that work across all models:

```typescript
const createUniversalPrompt = (task: string, content: string, style?: string) => {
  return `You are an expert ${task} assistant.

TASK: ${task}
${style ? `STYLE: ${style}` : ''}

REQUIREMENTS:
- Be precise and accurate
- Use clear, professional language
- Maintain consistent formatting
- Focus on actionable insights

CONTENT:
${content}

RESPONSE:
`;
};
```

### 2. **Model Abstraction Layer**
Create a unified interface for all AI providers:

```typescript
interface AIModelProvider {
  id: string;
  name: string;
  type: 'local' | 'cloud';
  requiresApiKey: boolean;
  process: (prompt: string, options?: ModelOptions) => Promise<string>;
}

interface ModelOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}
```

### 3. **Consistent Output Formatting**
Ensure all models return similar structured outputs:

```typescript
interface AppResult {
  content: string;
  metadata: {
    model: string;
    processingTime: number;
    tokenCount?: number;
    cost?: number;
  };
  quality: {
    confidence: number;
    completeness: number;
  };
}
```

## Implementation Pattern: PDF Notes Generator

Here's how the PDF Notes Generator achieves model consistency:

### Step 1: Standardized Prompt Creation

```typescript
function createNotesPrompt(text: string, style: string): string {
  let styleInstructions = '';
  
  switch (style) {
    case 'summary':
      styleInstructions = `Create an executive summary with:
- Key findings and main arguments
- Supporting evidence and data points  
- Clear conclusions and implications
- Use bullet points and clear structure`;
      break;
    case 'structured':
      styleInstructions = `Create structured notes with:
- Clear hierarchical organization (sections, subsections)
- Logical flow from introduction to conclusion
- Detailed sub-points under each main topic
- Use numbered lists and indentation`;
      break;
    case 'actionable':
      styleInstructions = `Extract actionable insights with:
- Immediate action items that can be implemented
- Strategic recommendations for future consideration
- Success metrics to track progress
- Clear next steps and follow-up tasks`;
      break;
  }

  return `You are an expert note-taker helping to extract key insights from documents.

${styleInstructions}

REQUIREMENTS FOR ALL MODELS:
- Extract 5-7 main points maximum
- Include relevant details and examples from source
- Use clear, professional language  
- Maintain original context and meaning
- Format using markdown for readability

CONTENT TO ANALYZE:
${text}

GENERATED NOTES:
`;
}
```

### Step 2: Model-Specific API Calls

```typescript
async function callAIModel(prompt: string, model: string, apiKey?: string): Promise<string> {
  const baseOptions = {
    temperature: 0.3,  // Consistent across all models
    maxTokens: 1500,   // Consistent token limit
    topP: 0.9         // Consistent creativity setting
  };

  switch (model) {
    case 'ollama':
      return await callOllama(prompt, baseOptions);
    case 'openai':
      return await callOpenAI(prompt, apiKey, baseOptions);
    case 'anthropic':
      return await callAnthropic(prompt, apiKey, baseOptions);
    case 'google':
      return await callGoogleAI(prompt, apiKey, baseOptions);
  }
}
```

### Step 3: Quality Normalization

```typescript
function normalizeOutput(rawOutput: string, model: string): AppResult {
  // Clean up model-specific formatting quirks
  let cleanedOutput = rawOutput
    .replace(/^Here's.*?:\n/i, '')  // Remove OpenAI prefixes
    .replace(/^I'll.*?:\n/i, '')    // Remove Anthropic prefixes
    .trim();

  // Ensure consistent markdown formatting
  cleanedOutput = ensureMarkdownFormatting(cleanedOutput);

  return {
    content: cleanedOutput,
    metadata: {
      model,
      processingTime: Date.now(),
      tokenCount: estimateTokens(cleanedOutput)
    },
    quality: {
      confidence: calculateConfidence(cleanedOutput),
      completeness: calculateCompleteness(cleanedOutput)
    }
  };
}
```

## Platform Integration Requirements

### 1. **Model Selection UI Component**
Provide consistent model selection across all apps:

```typescript
const ModelSelector = ({ selectedModel, onModelChange, showCosts = true }) => {
  const models = [
    { id: 'ollama-llama32', name: 'Llama 3.2 3B', type: 'local', cost: 'Free' },
    { id: 'openai-gpt4', name: 'GPT-4o', type: 'cloud', cost: '$0.03/page' },
    { id: 'anthropic-claude', name: 'Claude 3.5 Sonnet', type: 'cloud', cost: '$0.02/page' },
    { id: 'google-gemini', name: 'Gemini 2.5 Pro', type: 'cloud', cost: '$0.01/page' }
  ];

  return (
    <div className="space-y-3">
      {models.map(model => (
        <ModelOption 
          key={model.id} 
          model={model} 
          selected={selectedModel === model.id}
          onClick={() => onModelChange(model.id)}
          showCost={showCosts}
        />
      ))}
    </div>
  );
};
```

### 2. **API Key Management**
Handle user API keys securely:

```typescript
const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState({
    openai: localStorage.getItem('openai_key'),
    anthropic: localStorage.getItem('anthropic_key'),
    google: localStorage.getItem('google_key')
  });

  const updateApiKey = (provider: string, key: string) => {
    localStorage.setItem(`${provider}_key`, key);
    setApiKeys(prev => ({ ...prev, [provider]: key }));
  };

  return { apiKeys, updateApiKey };
};
```

### 3. **Error Handling & Fallbacks**
Provide consistent error handling:

```typescript
async function safeAICall(prompt: string, model: string, apiKey?: string): Promise<AppResult> {
  try {
    const result = await callAIModel(prompt, model, apiKey);
    return normalizeOutput(result, model);
  } catch (error) {
    console.error(`${model} API error:`, error);
    
    // Provide fallback based on app type
    return {
      content: generateFallbackContent(prompt),
      metadata: { model: `${model}-fallback`, processingTime: 0 },
      quality: { confidence: 0.5, completeness: 0.7 }
    };
  }
}
```

## Best Practices for App Developers

### 1. **Prompt Engineering**
- **Use specific instructions**: "Create exactly 5 bullet points" vs "Create some bullet points"
- **Include examples**: Show the expected output format
- **Set constraints**: Specify token limits, structure requirements
- **Test across models**: Verify consistency on all supported models

### 2. **User Experience**
- **Show processing indicators**: Different models have different speeds
- **Display cost estimates**: Help users make informed choices
- **Provide previews**: Let users see output quality before committing
- **Allow model switching**: Users should be able to try different models

### 3. **Performance Optimization**
- **Cache common prompts**: Reduce API calls for similar requests
- **Batch processing**: Group multiple items when possible
- **Stream responses**: Show partial results for long operations
- **Local fallbacks**: Always have a local processing option

### 4. **Privacy & Security**
- **API key encryption**: Never store keys in plain text
- **Local processing**: Default to local models when possible
- **Data minimization**: Only send necessary data to cloud APIs
- **User consent**: Clear notices about cloud processing

## Testing Multi-Model Consistency

### 1. **Automated Testing**
```typescript
describe('Multi-Model Consistency', () => {
  const testPrompt = "Summarize: The quick brown fox jumps over the lazy dog.";
  const models = ['ollama', 'openai', 'anthropic', 'google'];

  test('All models return valid responses', async () => {
    for (const model of models) {
      const result = await callAIModel(testPrompt, model);
      expect(result.content).toBeTruthy();
      expect(result.content.length).toBeGreaterThan(10);
    }
  });

  test('Output format consistency', async () => {
    const results = await Promise.all(
      models.map(model => callAIModel(testPrompt, model))
    );
    
    // Check that all results have similar structure
    results.forEach(result => {
      expect(result.content).toMatch(/summary|quick|fox|dog/i);
      expect(result.metadata.model).toBeTruthy();
    });
  });
});
```

### 2. **Quality Metrics**
Track consistency across models:

```typescript
interface QualityMetrics {
  outputLength: number;
  keywordCoverage: number;
  structureScore: number;
  coherenceScore: number;
}

function calculateQualityMetrics(output: string, expectedKeywords: string[]): QualityMetrics {
  return {
    outputLength: output.length,
    keywordCoverage: calculateKeywordCoverage(output, expectedKeywords),
    structureScore: calculateStructureScore(output),
    coherenceScore: calculateCoherenceScore(output)
  };
}
```

## Mobile & API Considerations

### 1. **Mobile Users**
Mobile users cannot run local models, so:
- **Default to cloud models** on mobile devices
- **Show clear cost indicators** for cloud usage
- **Provide offline fallbacks** when possible
- **Cache frequent results** to reduce API calls

### 2. **API-Only Users**
For users accessing via API:
- **Require API keys** for cloud models
- **Provide model capability matrix** in documentation
- **Support batch processing** for efficiency
- **Include usage analytics** for cost tracking

## Conclusion

Building multi-model AI applications requires:

1. **Standardized prompt engineering** across all models
2. **Consistent output formatting** and quality normalization  
3. **Robust error handling** with fallback strategies
4. **Clear cost and privacy indicators** for user decision-making
5. **Comprehensive testing** to ensure consistency

The PDF Notes Generator demonstrates these principles in action, providing users with consistent results regardless of their chosen AI model while respecting their privacy and cost preferences.