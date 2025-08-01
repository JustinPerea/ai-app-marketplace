import { NextRequest, NextResponse } from 'next/server';

interface OpenAIModel {
  id: string;
  object: 'model';
  created: number;
  owned_by: string;
  permission: any[];
  root: string;
  parent: string | null;
}

interface OpenAIModelsResponse {
  object: 'list';
  data: OpenAIModel[];
}

// Model definitions with provider routing
const AVAILABLE_MODELS: OpenAIModel[] = [
  // OpenAI Models
  {
    id: 'gpt-4o',
    object: 'model',
    created: 1677649963,
    owned_by: 'openai',
    permission: [],
    root: 'gpt-4o',
    parent: null,
  },
  {
    id: 'gpt-4o-mini',
    object: 'model',
    created: 1677649963,
    owned_by: 'openai',
    permission: [],
    root: 'gpt-4o-mini',
    parent: null,
  },
  {
    id: 'gpt-4-turbo',
    object: 'model',
    created: 1677610602,
    owned_by: 'openai',
    permission: [],
    root: 'gpt-4-turbo',
    parent: null,
  },
  {
    id: 'gpt-4',
    object: 'model',
    created: 1687882411,
    owned_by: 'openai',
    permission: [],
    root: 'gpt-4',
    parent: null,
  },
  {
    id: 'gpt-3.5-turbo',
    object: 'model',
    created: 1677649963,
    owned_by: 'openai',
    permission: [],
    root: 'gpt-3.5-turbo',
    parent: null,
  },
  {
    id: 'gpt-3.5-turbo-16k',
    object: 'model',
    created: 1677649963,
    owned_by: 'openai',
    permission: [],
    root: 'gpt-3.5-turbo-16k',
    parent: null,
  },

  // Anthropic Claude Models (exposed as OpenAI-compatible)
  {
    id: 'claude-3-5-sonnet-20241022',
    object: 'model',
    created: 1677649963,
    owned_by: 'anthropic',
    permission: [],
    root: 'claude-3-5-sonnet-20241022',
    parent: null,
  },
  {
    id: 'claude-3-5-haiku-20241022',
    object: 'model',
    created: 1677649963,
    owned_by: 'anthropic',
    permission: [],
    root: 'claude-3-5-haiku-20241022',
    parent: null,
  },
  {
    id: 'claude-3-opus-20240229',
    object: 'model',
    created: 1677649963,
    owned_by: 'anthropic',
    permission: [],
    root: 'claude-3-opus-20240229',
    parent: null,
  },
  {
    id: 'claude-3-sonnet-20240229',
    object: 'model',
    created: 1677649963,
    owned_by: 'anthropic',
    permission: [],
    root: 'claude-3-sonnet-20240229',
    parent: null,
  },
  {
    id: 'claude-3-haiku-20240307',
    object: 'model',
    created: 1677649963,
    owned_by: 'anthropic',
    permission: [],
    root: 'claude-3-haiku-20240307',
    parent: null,
  },

  // Google AI Models
  {
    id: 'gemini-1.5-pro',
    object: 'model',
    created: 1677649963,
    owned_by: 'google',
    permission: [],
    root: 'gemini-1.5-pro',
    parent: null,
  },
  {
    id: 'gemini-1.5-flash',
    object: 'model',
    created: 1677649963,
    owned_by: 'google',
    permission: [],
    root: 'gemini-1.5-flash',
    parent: null,
  },
  {
    id: 'gemini-pro',
    object: 'model',
    created: 1677649963,
    owned_by: 'google',
    permission: [],
    root: 'gemini-pro',
    parent: null,
  },

  // Cohere Models
  {
    id: 'command-r-plus',
    object: 'model',
    created: 1677649963,
    owned_by: 'cohere',
    permission: [],
    root: 'command-r-plus',
    parent: null,
  },
  {
    id: 'command-r',
    object: 'model',
    created: 1677649963,
    owned_by: 'cohere',
    permission: [],
    root: 'command-r',
    parent: null,
  },
  {
    id: 'command',
    object: 'model',
    created: 1677649963,
    owned_by: 'cohere',
    permission: [],
    root: 'command',
    parent: null,
  },

  // Hugging Face Models (popular open-source models)
  {
    id: 'huggingface/meta-llama/Llama-2-70b-chat-hf',
    object: 'model',
    created: 1677649963,
    owned_by: 'meta',
    permission: [],
    root: 'huggingface/meta-llama/Llama-2-70b-chat-hf',
    parent: null,
  },
  {
    id: 'huggingface/microsoft/DialoGPT-large',
    object: 'model',
    created: 1677649963,
    owned_by: 'microsoft',
    permission: [],
    root: 'huggingface/microsoft/DialoGPT-large',
    parent: null,
  },
  {
    id: 'huggingface/mistralai/Mistral-7B-Instruct-v0.1',
    object: 'model',
    created: 1677649963,
    owned_by: 'mistralai',
    permission: [],
    root: 'huggingface/mistralai/Mistral-7B-Instruct-v0.1',
    parent: null,
  },

  // Local/Ollama Models (commonly available)
  {
    id: 'llama3.2:3b',
    object: 'model',
    created: 1677649963,
    owned_by: 'meta',
    permission: [],
    root: 'llama3.2:3b',
    parent: null,
  },
  {
    id: 'llama3.2:1b',
    object: 'model',
    created: 1677649963,
    owned_by: 'meta',
    permission: [],
    root: 'llama3.2:1b',
    parent: null,
  },
  {
    id: 'mistral:7b',
    object: 'model',
    created: 1677649963,
    owned_by: 'mistralai',
    permission: [],
    root: 'mistral:7b',
    parent: null,
  },
  {
    id: 'codellama:7b',
    object: 'model',
    created: 1677649963,
    owned_by: 'meta',
    permission: [],
    root: 'codellama:7b',
    parent: null,
  },
];

// Function to check if Ollama is available and get actual models
async function getOllamaModels(): Promise<OpenAIModel[]> {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return []; // Ollama not available
    }

    const data = await response.json();
    return data.models?.map((model: any) => ({
      id: model.name,
      object: 'model' as const,
      created: Math.floor(new Date(model.modified_at).getTime() / 1000),
      owned_by: 'ollama',
      permission: [],
      root: model.name,
      parent: null,
    })) || [];
  } catch (error) {
    return []; // Ollama not available
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get Ollama models if available
    const ollamaModels = await getOllamaModels();
    
    // Combine static models with dynamic Ollama models
    const allModels = [...AVAILABLE_MODELS];
    
    // Replace static Ollama models with actual ones if available
    if (ollamaModels.length > 0) {
      // Remove static Ollama models
      const nonOllamaModels = allModels.filter(model => 
        !['llama3.2:3b', 'llama3.2:1b', 'mistral:7b', 'codellama:7b'].includes(model.id)
      );
      allModels.splice(0, allModels.length, ...nonOllamaModels, ...ollamaModels);
    }

    const response: OpenAIModelsResponse = {
      object: 'list',
      data: allModels,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Models API error:', error);
    
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          type: 'api_error',
          param: null,
          code: null,
        }
      },
      { status: 500 }
    );
  }
}

// Handle single model retrieval
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modelId = searchParams.get('model');

    if (!modelId) {
      return NextResponse.json(
        {
          error: {
            message: 'Model ID is required',
            type: 'invalid_request_error',
            param: 'model',
            code: null,
          }
        },
        { status: 400 }
      );
    }

    // Check if model exists in our available models
    const model = AVAILABLE_MODELS.find(m => m.id === modelId);
    
    if (!model) {
      // Check if it's an Ollama model
      const ollamaModels = await getOllamaModels();
      const ollamaModel = ollamaModels.find(m => m.id === modelId);
      
      if (ollamaModel) {
        return NextResponse.json(ollamaModel);
      }
      
      return NextResponse.json(
        {
          error: {
            message: `Model '${modelId}' not found`,
            type: 'invalid_request_error',
            param: 'model',
            code: 'model_not_found',
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json(model);
  } catch (error) {
    console.error('Model retrieval error:', error);
    
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          type: 'api_error',
          param: null,
          code: null,
        }
      },
      { status: 500 }
    );
  }
}