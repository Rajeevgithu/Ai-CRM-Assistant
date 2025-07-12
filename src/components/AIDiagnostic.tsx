'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function AIDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics(null);

    try {
      // Test 1: Check if environment variables are set
      const envTest = await fetch('/api/diagnostic/env');
      const envResult = await envTest.json();

      // Test 2: Check MongoDB connection
      const dbTest = await fetch('/api/diagnostic/database');
      const dbResult = await dbTest.json();

      // Test 3: Check OpenAI API
      const openaiTest = await fetch('/api/diagnostic/openai');
      const openaiResult = await openaiTest.json();

      // Test 4: Test AI assistant
      const aiTest = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello, can you hear me?' })
      });
      const aiResult = await aiTest.json();

      setDiagnostics({
        environment: envResult,
        database: dbResult,
        openai: openaiResult,
        aiAssistant: aiResult
      });
    } catch (error) {
      setDiagnostics({
        error: 'Failed to run diagnostics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <AlertCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusText = (status: boolean) => {
    return status ? 'Working' : 'Not Working';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border p-6">
      <div className="flex items-center gap-3 mb-6">
        <AlertCircle className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">AI Assistant Diagnostics</h3>
      </div>

      <Button
        onClick={runDiagnostics}
        disabled={isRunning}
        variant="default"
        className="w-full mb-6"
      >
        {isRunning ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Running Diagnostics...
          </>
        ) : (
          'Run Diagnostics'
        )}
      </Button>

      {diagnostics && (
        <div className="space-y-4">
          {diagnostics.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="font-medium text-red-800">Diagnostic Error</span>
              </div>
              <p className="text-red-700">{diagnostics.error}</p>
              {diagnostics.details && (
                <p className="text-red-600 text-sm mt-1">{diagnostics.details}</p>
              )}
            </div>
          ) : (
            <>
              {/* Environment Variables */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Environment Variables</h4>
                  {getStatusIcon(diagnostics.environment?.ok)}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Status: {getStatusText(diagnostics.environment?.ok)}
                </p>
                {diagnostics.environment?.missing && (
                  <div className="text-sm text-red-600">
                    Missing: {diagnostics.environment.missing.join(', ')}
                  </div>
                )}
              </div>

              {/* Database Connection */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Database Connection</h4>
                  {getStatusIcon(diagnostics.database?.ok)}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Status: {getStatusText(diagnostics.database?.ok)}
                </p>
                {diagnostics.database?.error && (
                  <div className="text-sm text-red-600">{diagnostics.database.error}</div>
                )}
              </div>

              {/* OpenAI API */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">OpenAI API</h4>
                  {getStatusIcon(diagnostics.openai?.ok)}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Status: {getStatusText(diagnostics.openai?.ok)}
                </p>
                {diagnostics.openai?.error && (
                  <div className="text-sm text-red-600">{diagnostics.openai.error}</div>
                )}
                {diagnostics.openai?.suggestion && (
                  <div className="text-sm text-blue-600 mt-1">{diagnostics.openai.suggestion}</div>
                )}
              </div>

              {/* AI Assistant */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">AI Assistant</h4>
                  {getStatusIcon(diagnostics.aiAssistant?.reply)}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Status: {getStatusText(!!diagnostics.aiAssistant?.reply)}
                  {diagnostics.aiAssistant?.isMock && (
                    <span className="ml-2 text-yellow-600">(Demo Mode)</span>
                  )}
                </p>
                {diagnostics.aiAssistant?.reply && (
                  <div className="text-sm text-green-600">
                    Response: "{diagnostics.aiAssistant.reply.substring(0, 100)}..."
                  </div>
                )}
                {diagnostics.aiAssistant?.error && (
                  <div className="text-sm text-red-600">{diagnostics.aiAssistant.error}</div>
                )}
                {diagnostics.aiAssistant?.isMock && (
                  <div className="text-sm text-yellow-600 mt-1">
                    Demo mode active - using mock responses due to OpenAI API issues
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Common Solutions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Create a <code className="bg-blue-100 px-1 rounded">.env.local</code> file with your OpenAI API key</li>
          <li>• Ensure MongoDB is running and accessible</li>
          <li>• Check your internet connection for API access</li>
          <li>• Verify your OpenAI API key is valid and has credits</li>
        </ul>
      </div>
    </div>
  );
} 