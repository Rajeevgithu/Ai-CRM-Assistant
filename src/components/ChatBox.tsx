'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from './ui/button';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isMock?: boolean;
  suggestion?: string;
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI sales assistant. I can help you analyze customer data, forecast sales, create action plans, and provide strategic insights. What would you like to know about your business?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Memoize suggested questions inside the component
  const suggestedQuestions = useMemo(() => [
    "What are our top performing customers?",
    "How is our sales pipeline looking?",
    "What's our revenue forecast for next quarter?",
    "Which customers are at risk of churning?",
    "What actions should we take to improve sales?",
    "Analyze our lead conversion rates"
  ], []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input.trim() }),
      });

      const data = await response.json();

      if (data.reply) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.reply,
          sender: 'assistant',
          timestamp: new Date(),
          isMock: data.isMock,
          suggestion: data.suggestion
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('No reply received');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I encountered an error while processing your request. Please try again.",
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const formatMessage = useCallback((content: string) => {
    // Convert markdown-like formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .split('<br>')
      .map((line, index) => (
        <div key={index} dangerouslySetInnerHTML={{ __html: line }} />
      ));
  }, []);

  return (
    <div className="flex flex-col h-[400px] sm:h-[500px] lg:h-[600px] bg-white rounded-xl shadow-lg border">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
        <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
          <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">AI Sales Assistant</h3>
          <p className="text-xs sm:text-sm text-gray-600 truncate">Powered by advanced analytics & AI</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full flex-shrink-0">
          <Sparkles className="w-3 h-3" />
          <span className="hidden sm:inline">{messages.some(m => m.isMock) ? 'Demo Mode' : 'Smart'}</span>
          <span className="sm:hidden">{messages.some(m => m.isMock) ? 'Demo' : 'Smart'}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 sm:gap-3 ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.sender === 'assistant' && (
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg self-start flex-shrink-0">
                <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              </div>
            )}
            
            <div
              className={`max-w-[85%] sm:max-w-[80%] p-2.5 sm:p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.isMock
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-xs sm:text-sm leading-relaxed">
                {formatMessage(message.content)}
              </div>
              {message.isMock && (
                <div className="mt-2 p-1.5 sm:p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                  <strong>Demo Mode:</strong> This is a sample response. {message.suggestion}
                </div>
              )}
              <div
                className={`text-xs mt-2 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
                {message.isMock && ' • Demo Mode'}
              </div>
            </div>

            {message.sender === 'user' && (
              <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg self-start flex-shrink-0">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 sm:gap-3 justify-start">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg self-start flex-shrink-0">
              <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
            </div>
            <div className="bg-gray-100 text-gray-900 p-2.5 sm:p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                <span className="text-xs sm:text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="p-3 sm:p-4 border-t bg-gray-50">
          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Suggested questions:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedQuestions.slice(0, 4).map((question, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(question);
                  setTimeout(() => sendMessage(), 100);
                }}
                className="text-left p-2 sm:p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200 text-xs sm:text-sm text-gray-700 hover:text-blue-700"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t bg-white rounded-b-xl">
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your business..."
              className="w-full p-2.5 sm:p-3 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
