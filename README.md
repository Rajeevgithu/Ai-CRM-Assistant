# AI-Powered Smart CRM Assistant

A comprehensive, intelligent sales and business management system that thinks, plans, and acts for your sales team. Built with Next.js, MongoDB, and advanced AI capabilities.

## 🚀 Features

### 🤖 Intelligent AI Assistant
- **Advanced Reasoning**: Powered by LangChain and GPT-4 for sophisticated business analysis
- **Multi-Tool Agent**: Analyzes customer data, forecasts sales, creates action plans, and provides strategic insights
- **Agent Planning & Orchestration**: Automatically decides which tools to use and in what order (CrewAI-style)
- **Memory & Long-Term Context**: Remembers past interactions, customers, and maintains conversation history
- **Natural Language Interface**: Ask questions in plain English and get comprehensive business intelligence
- **Contextual Responses**: AI understands your business context and provides actionable recommendations

### 📊 Sales Pipeline Management
- **Visual Pipeline**: Kanban-style board showing leads at every stage
- **Lead Scoring**: Automatic prioritization based on value, probability, and engagement
- **Status Tracking**: From initial contact to closed deals
- **Follow-up Automation**: Never miss important follow-ups with smart reminders

### 📈 Advanced Analytics & Business Intelligence
- **Real-time Dashboards**: Live metrics and KPIs with enhanced visual insights
- **Revenue Forecasting**: AI-powered sales predictions and trend analysis
- **Customer Segmentation**: Automatic categorization and targeted strategies
- **Performance Tracking**: Monitor conversion rates, win rates, and growth trends
- **Custom Reports**: Export data and generate insights
- **Document Upload (RAG)**: Upload PDFs or CSVs and ask questions about them

### 👥 Customer Management
- **360° Customer View**: Complete customer profiles and interaction history
- **Purchase Tracking**: Monitor buying patterns and preferences
- **Churn Prevention**: Identify at-risk customers and retention opportunities
- **Customer Insights**: AI-driven recommendations for customer engagement

### 🎯 Lead Management
- **Lead Capture**: Multiple sources (website, referrals, cold calls, etc.)
- **Qualification**: Automated scoring and qualification processes
- **Nurturing**: Track engagement and follow-up activities
- **Conversion Optimization**: Data-driven insights to improve conversion rates

### 🔄 Workflow Automation
- **Scheduled Autonomy**: Agent runs daily/weekly to send emails, generate summaries, and create reports
- **Task Management**: Automated task creation and assignment
- **Email Integration**: Seamless communication tracking with automated follow-ups
- **Calendar Sync**: Automatic scheduling and reminders
- **Team Collaboration**: Shared workspaces and real-time updates

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **AI/ML**: LangChain, OpenAI GPT-4, Custom AI Tools
- **Database**: MongoDB Atlas
- **UI Components**: Radix UI, Lucide Icons
- **Styling**: Tailwind CSS with custom design system

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-crm-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   **Step 1: Create Environment File**
   Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```
   
   **Step 2: Configure OpenAI API**
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Add credits to your account (required for API usage)
   - Replace `your_openai_api_key_here` in `.env.local` with your actual API key
   
   **Step 3: Configure MongoDB**
   
   **Option A: Local MongoDB**
   - Install MongoDB locally or use Docker
   - Use the default connection string: `mongodb://localhost:27017/ai-crm-assistant`
   
   **Option B: MongoDB Atlas (Recommended)**
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get your connection string and replace the MongoDB URI in `.env.local`
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/ai-crm-assistant`
   
   **Final .env.local should look like:**
   ```env
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-crm-assistant
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-crm-assistant
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
```bash
npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 Key Pages & Features

### 🏠 Dashboard (`/`)
- **AI Chat Assistant**: Ask questions about your business data
- **Quick Stats**: Revenue, customers, leads, and conversion metrics
- **Widget Panel**: Customer insights and recent activity
- **Navigation**: Quick access to all major features

### 📊 Sales Pipeline (`/pipeline`)
- **Kanban Board**: Visual lead management across all stages
- **Lead Cards**: Detailed information with priority indicators
- **Filters & Search**: Find leads by status, source, or custom criteria
- **Quick Actions**: Add, edit, and manage leads efficiently

### 📈 Analytics (`/analytics`)
- **Business Intelligence**: Comprehensive metrics and trends
- **Revenue Analysis**: Growth tracking and forecasting
- **Customer Segments**: Segmentation and targeting insights
- **Product Performance**: Top-performing products and services

### 📄 Document Analysis (`/documents`)
- **RAG-Powered**: Upload PDFs, CSVs, and other documents
- **AI Analysis**: Ask questions about uploaded documents
- **Insight Extraction**: Automatic data extraction and insights
- **Quick Questions**: Pre-built questions for common analyses

### 🤖 Automation (`/automation`)
- **Scheduled Tasks**: Daily summaries, weekly reports, follow-up emails
- **Task History**: Track execution history and results
- **Manual Execution**: Run tasks on-demand
- **Autonomous Agents**: Self-running business intelligence

### 👤 Customer Management (`/add-customer`)
- **Customer Registration**: Add new customers with detailed profiles
- **Purchase Tracking**: Record transactions and preferences
- **Activity History**: Complete customer interaction timeline

## 🤖 AI Capabilities

### Smart Analysis Tools
- **Customer Insights**: Analyze purchasing patterns and customer behavior
- **Lead Intelligence**: Evaluate lead quality and conversion potential
- **Sales Forecasting**: Predict future revenue and trends
- **Action Planning**: Generate strategic recommendations
- **Risk Assessment**: Identify at-risk customers and opportunities

### Natural Language Queries
Ask the AI assistant questions like:
- "What are our top performing customers?"
- "How is our sales pipeline looking?"
- "What's our revenue forecast for next quarter?"
- "Which customers are at risk of churning?"
- "What actions should we take to improve sales?"
- "Analyze our lead conversion rates"

## 📊 Data Models

### Customer Model
```typescript
interface Customer {
  name: string;
  itemPurchased: string;
  quantity: number;
  totalSpent: number;
  lastPurchase: Date;
  isActive: boolean;
}
```

### Lead Model
```typescript
interface Lead {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  value: number;
  source: 'website' | 'referral' | 'cold-call' | 'social-media' | 'email-campaign' | 'other';
  assignedTo?: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  probability: number;
  expectedCloseDate?: Date;
  tags?: string[];
}
```

## 🔧 Troubleshooting

### Common Issues

**1. OpenAI API Quota Exceeded (429 Error)**
- **Problem**: "You exceeded your current quota, please check your plan and billing details"
- **Solution**: 
  - Add credits to your OpenAI account at [OpenAI Platform](https://platform.openai.com/account/billing)
  - Check your usage in the OpenAI dashboard
  - Consider upgrading your plan if you're using the API frequently

**2. Missing Environment Variables**
- **Problem**: "Missing: MONGODB_URI" or "Missing: OPENAI_API_KEY"
- **Solution**:
  - Ensure `.env.local` file exists in the project root
  - Copy from `env.example` if the file doesn't exist
  - Verify all required variables are set correctly

**3. MongoDB Connection Issues**
- **Problem**: Database connection fails
- **Solution**:
  - Check if MongoDB is running (local) or accessible (Atlas)
  - Verify connection string format
  - Ensure network access is configured (for Atlas)
  - Check firewall settings

**4. AI Assistant Not Responding**
- **Problem**: Chat interface shows errors or no response
- **Solution**:
  - Run the diagnostic tool in the app to identify specific issues
  - Check OpenAI API key validity
  - Ensure sufficient API credits
  - Verify MongoDB connection for data retrieval

### Running Diagnostics
Use the built-in diagnostic tool in the app to:
- Check environment variable configuration
- Test database connectivity
- Verify OpenAI API access
- Test AI assistant functionality

## 🔧 API Endpoints

### Customers
- `GET /api/customers/top` - Get top customers by revenue
- `POST /api/customers/add` - Add new customer

### Leads
- `GET /api/leads` - Get leads with filtering and analytics
- `POST /api/leads` - Create new lead or AI chat
- `PUT /api/leads` - Update lead
- `DELETE /api/leads` - Delete lead

### AI Assistant
- `POST /api/leads` (with message) - Get AI-powered business insights

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with Tailwind CSS
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Live data refresh and notifications
- **Interactive Elements**: Hover effects, animations, and smooth transitions
- **Accessibility**: WCAG compliant with proper ARIA labels

## 🔒 Security & Performance

- **Data Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Graceful error handling with user-friendly messages
- **Performance Optimization**: Efficient database queries and caching
- **Scalability**: Built to handle growing data and user bases

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Similar to Vercel deployment
- **AWS**: Deploy to EC2 or use AWS Amplify
- **Docker**: Containerized deployment option

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the code comments and this README
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join community discussions for help and ideas

## 🔮 Roadmap

- [ ] Email integration (Gmail, Outlook)
- [ ] Calendar sync (Google Calendar, Outlook)
- [ ] Advanced reporting with charts
- [ ] Mobile app (React Native)
- [ ] Multi-tenant architecture
- [ ] Advanced AI features (sentiment analysis, predictive analytics)
- [ ] Integration marketplace (Zapier, webhooks)
- [ ] Team collaboration features
- [ ] Advanced automation workflows

---

**Built with ❤️ for modern sales teams who want to work smarter, not harder.**
