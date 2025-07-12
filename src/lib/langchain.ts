
import { OpenAI } from '@langchain/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { DynamicTool } from 'langchain/tools';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { BufferMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import dbConnect from './mongodb';
import Customer from '../models/Customer';
import Lead from '../models/Lead';

// Memory storage for long-term context
const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "history",
});

// Enhanced customer analysis tool
const getCustomerInsightsTool = new DynamicTool({
  name: 'get_customer_insights',
  description: 'Analyze customer data to provide insights about purchasing patterns, top customers, and revenue trends',
  func: async (input: string) => {
    await dbConnect();
    
    // Get various customer insights
    const topCustomers = await Customer.find({})
      .sort({ totalSpent: -1 })
      .limit(5)
      .select('name totalSpent lastPurchase -_id');
    
    const totalRevenue = await Customer.aggregate([
      { $group: { _id: null, total: { $sum: '$totalSpent' } } }
    ]);
    
    const recentCustomers = await Customer.find({})
      .sort({ lastPurchase: -1 })
      .limit(3)
      .select('name lastPurchase totalSpent -_id');
    
    const avgOrderValue = await Customer.aggregate([
      { $group: { _id: null, avg: { $avg: '$totalSpent' } } }
    ]);
    
    return JSON.stringify({
      topCustomers: topCustomers.map(c => ({ name: c.name, totalSpent: c.totalSpent, lastPurchase: c.lastPurchase })),
      totalRevenue: totalRevenue[0]?.total || 0,
      recentCustomers: recentCustomers.map(c => ({ name: c.name, lastPurchase: c.lastPurchase, totalSpent: c.totalSpent })),
      avgOrderValue: avgOrderValue[0]?.avg || 0
    });
  },
});

// Lead analysis tool
const getLeadInsightsTool = new DynamicTool({
  name: 'get_lead_insights',
  description: 'Analyze lead data and provide insights about lead quality and conversion opportunities',
  func: async (input: string) => {
    await dbConnect();
    
    const totalLeads = await Lead.countDocuments();
    const recentLeads = await Lead.find({})
      .sort({ _id: -1 })
      .limit(5)
      .select('name email -_id');
    
    return JSON.stringify({
      totalLeads,
      recentLeads: recentLeads.map(l => ({ name: l.name, email: l.email })),
      conversionRate: totalLeads > 0 ? ((await Customer.countDocuments()) / totalLeads * 100).toFixed(2) : 0
    });
  },
});

// Sales forecasting tool
const getSalesForecastTool = new DynamicTool({
  name: 'get_sales_forecast',
  description: 'Generate sales forecasts based on historical data and current trends',
  func: async (input: string) => {
    await dbConnect();
    
    // Get monthly sales data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlySales = await Customer.aggregate([
      { $match: { lastPurchase: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$lastPurchase' },
            month: { $month: '$lastPurchase' }
          },
          total: { $sum: '$totalSpent' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Simple trend analysis
    const recentMonths = monthlySales.slice(-3);
    const avgGrowth = recentMonths.length > 1 ? 
      (recentMonths[recentMonths.length - 1].total - recentMonths[0].total) / recentMonths.length : 0;
    
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // Forecast next 3 months
    const forecast = [];
    let lastMonthTotal = recentMonths[recentMonths.length - 1]?.total || 0;
    
    for (let i = 1; i <= 3; i++) {
      const forecastMonth = currentMonth + i > 12 ? currentMonth + i - 12 : currentMonth + i;
      const forecastYear = currentMonth + i > 12 ? currentYear + 1 : currentYear;
      lastMonthTotal += avgGrowth;
      
      forecast.push({
        month: forecastMonth,
        year: forecastYear,
        projectedRevenue: Math.max(0, lastMonthTotal)
      });
    }
    
    return JSON.stringify({
      historicalData: monthlySales,
      forecast,
      trend: avgGrowth > 0 ? 'increasing' : avgGrowth < 0 ? 'decreasing' : 'stable'
    });
  },
});

// Customer segmentation tool
const getCustomerSegmentsTool = new DynamicTool({
  name: 'get_customer_segments',
  description: 'Segment customers based on spending patterns and create targeted strategies',
  func: async (input: string) => {
    await dbConnect();
    
    const customers = await Customer.find({}).select('name totalSpent quantity lastPurchase -_id');
    
    // Segment customers by spending
    const segments = {
      highValue: customers.filter(c => c.totalSpent >= 1000),
      mediumValue: customers.filter(c => c.totalSpent >= 500 && c.totalSpent < 1000),
      lowValue: customers.filter(c => c.totalSpent < 500)
    };
    
    // Calculate segment metrics
    const segmentMetrics = {
      highValue: {
        count: segments.highValue.length,
        totalRevenue: segments.highValue.reduce((sum, c) => sum + c.totalSpent, 0),
        avgSpend: segments.highValue.length > 0 ? 
          segments.highValue.reduce((sum, c) => sum + c.totalSpent, 0) / segments.highValue.length : 0
      },
      mediumValue: {
        count: segments.mediumValue.length,
        totalRevenue: segments.mediumValue.reduce((sum, c) => sum + c.totalSpent, 0),
        avgSpend: segments.mediumValue.length > 0 ? 
          segments.mediumValue.reduce((sum, c) => sum + c.totalSpent, 0) / segments.mediumValue.length : 0
      },
      lowValue: {
        count: segments.lowValue.length,
        totalRevenue: segments.lowValue.reduce((sum, c) => sum + c.totalSpent, 0),
        avgSpend: segments.lowValue.length > 0 ? 
          segments.lowValue.reduce((sum, c) => sum + c.totalSpent, 0) / segments.lowValue.length : 0
      }
    };
    
    return JSON.stringify({
      segments: segmentMetrics,
      recommendations: {
        highValue: 'Focus on retention and upselling opportunities',
        mediumValue: 'Develop loyalty programs to increase spending',
        lowValue: 'Implement re-engagement campaigns and special offers'
      }
    });
  },
});

// Action planning tool
const createActionPlanTool = new DynamicTool({
  name: 'create_action_plan',
  description: 'Create actionable sales strategies and next steps based on current data',
  func: async (input: string) => {
    await dbConnect();
    
    const customers = await Customer.find({}).select('name totalSpent lastPurchase -_id');
    const leads = await Lead.find({}).select('name email -_id');
    
    // Identify at-risk customers (no purchase in 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const atRiskCustomers = customers.filter(c => c.lastPurchase < thirtyDaysAgo);
    
    // Identify high-potential leads
    const highPotentialLeads = leads.slice(0, 5); // Top 5 recent leads
    
    const actionPlan = {
      immediate: [
        `Contact ${atRiskCustomers.length} at-risk customers for re-engagement`,
        `Follow up with ${highPotentialLeads.length} high-potential leads`,
        'Review and update customer segmentation strategy'
      ],
      shortTerm: [
        'Implement automated email campaigns for customer retention',
        'Develop targeted promotions for medium-value customers',
        'Create lead nurturing sequences for new prospects'
      ],
      longTerm: [
        'Establish customer loyalty program',
        'Develop referral incentive system',
        'Create customer feedback and improvement process'
      ],
      metrics: {
        atRiskCustomers: atRiskCustomers.length,
        highPotentialLeads: highPotentialLeads.length,
        totalCustomers: customers.length,
        totalLeads: leads.length
      }
    };
    
    return JSON.stringify(actionPlan);
  },
});

// Email automation tool
const sendEmailTool = new DynamicTool({
  name: 'send_email',
  description: 'Send automated emails to customers or leads based on triggers',
  func: async (input: string) => {
    try {
      const { recipient, subject, content, type } = JSON.parse(input);
      
      // In a real implementation, this would integrate with email services
      // For now, we'll simulate email sending
      console.log(`📧 Email sent to ${recipient}: ${subject}`);
      
      return JSON.stringify({
        success: true,
        message: `Email sent to ${recipient}`,
        type: type || 'general',
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      return {
        success: false,
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  },
});

// Document analysis tool (RAG-ready)
const analyzeDocumentTool = new DynamicTool({
  name: 'analyze_document',
  description: 'Analyze uploaded documents (PDFs, CSVs) and extract insights',
  func: async (input: string) => {
    try {
      const { documentType, content, query } = JSON.parse(input);
      
      // In a real implementation, this would use document processing libraries
      // For now, we'll simulate document analysis
      const analysis = {
        documentType,
        keyInsights: [
          'Document contains customer data',
          'Revenue patterns identified',
          'Growth opportunities detected'
        ],
        recommendations: [
          'Focus on high-value customers',
          'Implement retention strategies',
          'Develop new product offerings'
        ],
        extractedData: {
          totalRecords: 150,
          revenueTotal: 45000,
          topCustomers: 5
        }
      };
      
      return JSON.stringify(analysis);
    } catch (error: unknown) {
      return JSON.stringify({
        success: false,
        error: 'Failed to analyze document',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  },
});

// Agent planning and orchestration
class SmartAgent {
  private model: ChatOpenAI;
  private tools: DynamicTool[];
  private memory: BufferMemory;

  constructor() {
    this.model = new ChatOpenAI({ 
      temperature: 0.1, 
      model: 'gpt-3.5-turbo',
      maxTokens: 2000
    });
    
    this.tools = [
      getCustomerInsightsTool,
      getLeadInsightsTool,
      getSalesForecastTool,
      getCustomerSegmentsTool,
      createActionPlanTool,
      sendEmailTool,
      analyzeDocumentTool
    ];
    
    this.memory = memory;
  }

  // Plan which tools to use based on the query
  private async planTools(query: string): Promise<string[]> {
    const planningPrompt = PromptTemplate.fromTemplate(`
You are an intelligent sales assistant that needs to decide which tools to use to answer a user's question.

Available tools:
- get_customer_insights: Analyze customer data and purchasing patterns
- get_lead_insights: Analyze lead data and conversion opportunities  
- get_sales_forecast: Generate sales forecasts and trends
- get_customer_segments: Segment customers and create strategies
- create_action_plan: Create actionable sales strategies
- send_email: Send automated emails to customers/leads
- analyze_document: Analyze uploaded documents and extract insights

User Question: {query}

Based on the user's question, determine which tools (if any) should be used to provide the best answer.
Return only the tool names as a JSON array, or an empty array if no tools are needed.

Example: ["get_customer_insights", "create_action_plan"]
`);

    const chain = planningPrompt.pipe(this.model);
    const result = await chain.invoke({ query });
    
    try {
      return JSON.parse(result.content as string);
    } catch {
      return [];
    }
  }

  // Execute tools in sequence
  private async executeTools(toolNames: string[], query: string): Promise<any> {
    const results: any = {};
    
    for (const toolName of toolNames) {
      const tool = this.tools.find(t => t.name === toolName);
      if (tool) {
        try {
          const result = await tool.func(query);
          results[toolName] = result;
        } catch (error: unknown) {
          console.error(`Error executing tool ${toolName}:`, error);
          results[toolName] = { error: 'Tool execution failed', details: error instanceof Error ? error.message : 'Unknown error' };
        }
      }
    }
    
    return results;
  }

  // Main agent execution with planning and memory
  async run(input: string): Promise<string> {
    try {
      // Get conversation history
      const history = await this.memory.loadMemoryVariables({});
      
      // Plan which tools to use
      const toolNames = await this.planTools(input);
      
      // Execute tools if needed
      let toolResults = {};
      if (toolNames.length > 0) {
        toolResults = await this.executeTools(toolNames, input);
      }
      
      // Create comprehensive response
      const responsePrompt = PromptTemplate.fromTemplate(`
You are an intelligent sales assistant with access to business data and tools.

User Question: {input}

Conversation History: {history}

Tool Results: {toolResults}

Based on the user's question, conversation history, and available data, provide a comprehensive response that includes:

1. **Direct Answer**: Address the user's specific question
2. **Data Insights**: Share relevant data and patterns
3. **Strategic Recommendations**: Provide actionable next steps
4. **Context Awareness**: Reference previous conversations if relevant
5. **Follow-up Suggestions**: Suggest related questions or actions

Be specific, actionable, and business-focused. Use the data to support your recommendations.

Response:
`);

      const responseChain = responsePrompt.pipe(this.model);
      const response = await responseChain.invoke({ 
        input, 
        history: JSON.stringify(history.history || []),
        toolResults: JSON.stringify(toolResults)
      });
      
      // Save to memory
      await this.memory.saveContext(
        { input: new HumanMessage(input) },
        { output: new AIMessage(response.content as string) }
      );
      
      return response.content as string;
      
          } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Agent execution error:', errorMessage);
        return "I apologize, but I encountered an error while processing your request. Please try again or contact support if the issue persists.";
      }
  }

  // Scheduled tasks for autonomy
  async runScheduledTasks(): Promise<void> {
    const tasks = [
      {
        name: 'Daily Summary',
        description: 'Generate daily business summary',
        frequency: 'daily'
      },
      {
        name: 'Weekly Report',
        description: 'Create weekly performance report',
        frequency: 'weekly'
      },
      {
        name: 'Follow-up Reminders',
        description: 'Send follow-up emails to leads',
        frequency: 'daily'
      }
    ];

    for (const task of tasks) {
      try {
        console.log(`Running scheduled task: ${task.name}`);
        // In a real implementation, this would check if the task should run
        // and execute the appropriate actions
              } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error running scheduled task ${task.name}:`, errorMessage);
        }
    }
  }
}

// Create singleton agent instance
const smartAgent = new SmartAgent();

// Enhanced agent with planning and memory
export async function runAgent(input: string) {
  return await smartAgent.run(input);
}

// Export tools for individual use
export const tools = {
  getCustomerInsights: getCustomerInsightsTool,
  getLeadInsights: getLeadInsightsTool,
  getSalesForecast: getSalesForecastTool,
  getCustomerSegments: getCustomerSegmentsTool,
  createActionPlan: createActionPlanTool,
  sendEmail: sendEmailTool,
  analyzeDocument: analyzeDocumentTool
};

// Export agent for scheduled tasks
export { smartAgent };
