import { PrismaClient, ApiProvider, RuntimeType, DeploymentStatus, LocalModelProvider } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create sample developer profiles
  const sampleDeveloper = await prisma.user.upsert({
    where: { email: 'developer@example.com' },
    update: {},
    create: {
      email: 'developer@example.com',
      name: 'Sample Developer',
      auth0Id: 'auth0|sample-developer-id',
      plan: 'PRO',
      developerProfile: {
        create: {
          displayName: 'AI Innovations Inc.',
          description: 'Building the future of AI applications',
          website: 'https://aiinnovations.com',
          verified: true,
          verifiedAt: new Date(),
        },
      },
    },
    include: {
      developerProfile: true,
    },
  });

  // Create sample app runtimes
  const contentGeneratorRuntime = await prisma.appRuntime.create({
    data: {
      type: RuntimeType.JAVASCRIPT,
      version: '18.0.0',
      sourceCode: `
// Smart Content Generator
const generateContent = async (prompt, options = {}) => {
  const { aiProvider, model = 'gpt-4' } = options;
  
  try {
    const response = await aiProvider.chat({
      model,
      messages: [
        { role: 'system', content: 'You are a professional content writer. Create engaging, high-quality content.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });
    
    return {
      content: response.content,
      wordCount: response.content.split(' ').length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(\`Content generation failed: \${error.message}\`);
  }
};

module.exports = { generateContent };`,
      entryPoint: 'generateContent',
      dependencies: {
        "@ai-marketplace/sdk": "^1.0.0"
      },
      allowNetworking: true,
      allowFileSystem: false,
      timeoutSeconds: 60,
      deploymentStatus: DeploymentStatus.DEPLOYED,
      deployedAt: new Date()
    }
  });

  const dataAnalysisRuntime = await prisma.appRuntime.create({
    data: {
      type: RuntimeType.PYTHON,
      version: '3.11',
      sourceCode: `
import json
import pandas as pd
from ai_marketplace_sdk import AIProvider

def analyze_data(data, query, ai_provider):
    """
    Analyze data using AI-powered insights
    """
    try:
        # Convert data to DataFrame if needed
        if isinstance(data, str):
            df = pd.read_csv(data)
        else:
            df = pd.DataFrame(data)
        
        # Generate data summary
        summary = {
            'rows': len(df),
            'columns': list(df.columns),
            'dtypes': df.dtypes.to_dict(),
            'missing_values': df.isnull().sum().to_dict()
        }
        
        # Use AI to interpret the query
        analysis_prompt = f"""
        Data Summary: {json.dumps(summary, default=str)}
        User Query: {query}
        
        Provide insights and analysis based on the data structure and user query.
        """
        
        response = ai_provider.chat({
            'model': 'gpt-4',
            'messages': [
                {'role': 'system', 'content': 'You are a data analyst. Provide clear, actionable insights.'},
                {'role': 'user', 'content': analysis_prompt}
            ]
        })
        
        return {
            'insights': response['content'],
            'data_summary': summary,
            'timestamp': pd.Timestamp.now().isoformat()
        }
        
    except Exception as e:
        raise Exception(f"Data analysis failed: {str(e)}")
`,
      entryPoint: 'analyze_data',
      dependencies: {
        "pandas": "^2.0.0",
        "ai-marketplace-sdk": "^1.0.0"
      },
      allowNetworking: true,
      allowFileSystem: true,
      timeoutSeconds: 120,
      deploymentStatus: DeploymentStatus.DEPLOYED,
      deployedAt: new Date()
    }
  });

  const codeReviewRuntime = await prisma.appRuntime.create({
    data: {
      type: RuntimeType.JAVASCRIPT,
      version: '18.0.0',
      sourceCode: `
// AI Code Review Bot
const reviewCode = async (codeContent, language, aiProvider) => {
  try {
    const reviewPrompt = \`
Please review the following \${language} code and provide:
1. Bug identification
2. Security vulnerabilities
3. Performance optimizations
4. Code quality improvements
5. Best practices recommendations

Code:
\`\`\`\${language}
\${codeContent}
\`\`\`
\`;

    const response = await aiProvider.chat({
      model: 'claude-3-sonnet',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert code reviewer. Provide detailed, actionable feedback on code quality, security, and performance.' 
        },
        { role: 'user', content: reviewPrompt }
      ],
      temperature: 0.1
    });

    return {
      review: response.content,
      language,
      linesReviewed: codeContent.split('\\n').length,
      timestamp: new Date().toISOString(),
      severity: extractSeverityScore(response.content)
    };
  } catch (error) {
    throw new Error(\`Code review failed: \${error.message}\`);
  }
};

const extractSeverityScore = (review) => {
  // Simple heuristic to determine severity
  const criticalKeywords = ['security', 'vulnerability', 'critical', 'dangerous'];
  const criticalCount = criticalKeywords.reduce((count, keyword) => {
    return count + (review.toLowerCase().split(keyword).length - 1);
  }, 0);
  
  if (criticalCount > 2) return 'high';
  if (criticalCount > 0) return 'medium';
  return 'low';
};

module.exports = { reviewCode };`,
      entryPoint: 'reviewCode',
      dependencies: {
        "@ai-marketplace/sdk": "^1.0.0"
      },
      allowNetworking: true,
      allowFileSystem: false,
      timeoutSeconds: 90,
      deploymentStatus: DeploymentStatus.DEPLOYED,
      deployedAt: new Date()
    }
  });

  // Create sample marketplace apps
  if (sampleDeveloper.developerProfile) {
    const sampleApps = [
      {
        name: 'Smart Content Generator',
        slug: 'smart-content-generator',
        description: 'Generate high-quality content using advanced AI models. Perfect for blogs, marketing copy, and creative writing.',
        shortDescription: 'AI-powered content generation tool',
        category: 'CONTENT_CREATION' as const,
        tags: ['content', 'writing', 'ai', 'marketing'],
        pricing: 'FREEMIUM' as const,
        price: 29.99,
        isActive: true,
        isFeatured: true,
        status: 'PUBLISHED' as const,
        publishedAt: new Date(),
        downloadCount: 1250,
        activeUsers: 890,
        averageRating: 4.8,
        reviewCount: 127,
        requiredProviders: [ApiProvider.OPENAI, ApiProvider.ANTHROPIC],
        supportedLocalModels: [LocalModelProvider.OLLAMA],
        runtimeId: contentGeneratorRuntime.id,
        maxExecutionTime: 60,
        memoryLimit: 512,
        allowedDomains: ['api.openai.com', 'api.anthropic.com'],
      },
      {
        name: 'Data Analysis Assistant',
        slug: 'data-analysis-assistant',
        description: 'Powerful data analysis tool that helps you understand your data with natural language queries and AI-powered insights.',
        shortDescription: 'AI-driven data analysis and insights',
        category: 'DATA_ANALYSIS' as const,
        tags: ['data', 'analytics', 'insights', 'business'],
        pricing: 'PAID' as const,
        price: 49.99,
        isActive: true,
        isFeatured: false,
        status: 'PUBLISHED' as const,
        publishedAt: new Date(),
        downloadCount: 680,
        activeUsers: 520,
        averageRating: 4.6,
        reviewCount: 89,
        requiredProviders: [ApiProvider.OPENAI, ApiProvider.GOOGLE],
        supportedLocalModels: [LocalModelProvider.OLLAMA, LocalModelProvider.LLAMACPP],
        runtimeId: dataAnalysisRuntime.id,
        maxExecutionTime: 120,
        memoryLimit: 1024,
        allowedDomains: ['api.openai.com', 'generativelanguage.googleapis.com'],
      },
      {
        name: 'AI Code Review Bot',
        slug: 'ai-code-review-bot',
        description: 'Automated code review assistant that helps identify bugs, security issues, and optimization opportunities in your codebase.',
        shortDescription: 'Automated AI code review and optimization',
        category: 'DEVELOPER_TOOLS' as const,
        tags: ['code', 'review', 'security', 'optimization', 'development'],
        pricing: 'FREE' as const,
        isActive: true,
        isFeatured: true,
        status: 'PUBLISHED' as const,
        publishedAt: new Date(),
        downloadCount: 2100,
        activeUsers: 1650,
        averageRating: 4.9,
        reviewCount: 245,
        requiredProviders: [ApiProvider.ANTHROPIC],
        supportedLocalModels: [LocalModelProvider.OLLAMA],
        runtimeId: codeReviewRuntime.id,
        maxExecutionTime: 90,
        memoryLimit: 768,
        allowedDomains: ['api.anthropic.com'],
      },
    ];

    for (const appData of sampleApps) {
      await prisma.marketplaceApp.upsert({
        where: { slug: appData.slug },
        update: {},
        create: {
          ...appData,
          developerId: sampleDeveloper.developerProfile.id,
        },
      });
    }
  }

  // Create sample user with subscriptions
  const sampleUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Sample User',
      auth0Id: 'auth0|sample-user-id',
      plan: 'FREE',
    },
  });

  // Create sample API keys
  await prisma.apiKey.create({
    data: {
      userId: sampleUser.id,
      name: 'OpenAI Production',
      provider: ApiProvider.OPENAI,
      keyHash: 'hashed-key-value',
      keyPreview: '****1234',
      encryptedKey: 'encrypted-actual-key-value',
      totalRequests: 1500,
      totalCost: 45.67,
      lastUsed: new Date(),
    },
  });

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });