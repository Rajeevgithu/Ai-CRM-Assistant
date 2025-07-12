'use client';

import { useState, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  X, 
  Eye, 
  Download,
  Brain,
  Search,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface UploadedDocument {
  id: string;
  name: string;
  type: 'pdf' | 'csv' | 'other';
  size: number;
  uploadedAt: Date;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  insights?: any;
}

export default function DocumentUpload() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const documentId = Date.now() + i;
      
      // Create document object
      const newDocument: UploadedDocument = {
        id: documentId.toString(),
        name: file.name,
        type: getFileType(file.name),
        size: file.size,
        uploadedAt: new Date(),
        status: 'uploading'
      };

      setDocuments(prev => [...prev, newDocument]);

      try {
        // Simulate file upload and processing
        await simulateFileProcessing(file, documentId.toString());
        
        // Update document status
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId.toString() 
            ? { ...doc, status: 'ready' }
            : doc
        ));
      } catch (error) {
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId.toString() 
            ? { ...doc, status: 'error' }
            : doc
        ));
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const simulateFileProcessing = async (file: File, documentId: string) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, this would:
    // 1. Upload file to cloud storage
    // 2. Process document (extract text, parse data)
    // 3. Store in vector database for RAG
    // 4. Generate initial insights
    
    console.log(`Processing document: ${file.name}`);
  };

  const getFileType = (filename: string): 'pdf' | 'csv' | 'other' => {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return 'pdf';
    if (extension === 'csv') return 'csv';
    return 'other';
  };

  const removeDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const analyzeDocument = async (documentId: string) => {
    const document = documents.find(doc => doc.id === documentId);
    if (!document) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Analyze the document "${document.name}" and provide insights about customer data, revenue patterns, and business opportunities.`,
          documentAnalysis: {
            documentId,
            documentName: document.name,
            documentType: document.type
          }
        }),
      });

      const data = await response.json();
      
      if (data.reply) {
        setAnalysis({
          document: document.name,
          insights: data.reply,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error analyzing document:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const askQuestion = async () => {
    if (!query.trim() || documents.length === 0) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          documentQuery: {
            documents: documents.map(doc => ({ id: doc.id, name: doc.name, type: doc.type }))
          }
        }),
      });

      const data = await response.json();
      
      if (data.reply) {
        setAnalysis({
          question: query,
          answer: data.reply,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error querying documents:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'csv':
        return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
          <Brain className="w-4 h-4" />
          RAG Enabled
        </div>
      </div>

      {/* Upload Area */}
      <Card className="p-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Documents</h3>
          <p className="text-gray-600 mb-4">
            Upload PDFs, CSVs, or other documents to analyze with AI
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.csv,.txt,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            variant="default"
          >
            {isUploading ? 'Uploading...' : 'Choose Files'}
          </Button>
        </div>
      </Card>

      {/* Document List */}
      {documents.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h3>
          <div className="space-y-3">
            {documents.map((document) => (
              <div key={document.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getFileIcon(document.type)}
                  <div>
                    <p className="font-medium text-gray-900">{document.name}</p>
                    <p className="text-sm text-gray-600">
                      {formatFileSize(document.size)} • {document.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(document.status)}
                  <Button
                    onClick={() => analyzeDocument(document.id)}
                    disabled={document.status !== 'ready' || isAnalyzing}
                    variant="outline"
                    size="sm"
                  >
                    <Brain className="w-4 h-4 mr-1" />
                    Analyze
                  </Button>
                  <Button
                    onClick={() => removeDocument(document.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Query Interface */}
      {documents.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ask Questions About Your Documents</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question about your uploaded documents..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
              />
            </div>
            <Button
              onClick={askQuestion}
              disabled={!query.trim() || isAnalyzing}
              variant="default"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Ask
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Analysis Results */}
      {analysis && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
            <span className="text-sm text-gray-500">
              {analysis.timestamp.toLocaleTimeString()}
            </span>
          </div>
          
          {analysis.question && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Question:</p>
              <p className="text-blue-800">{analysis.question}</p>
            </div>
          )}
          
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700">
              {analysis.insights || analysis.answer}
            </div>
          </div>
        </Card>
      )}

      {/* Quick Questions */}
      {documents.length > 0 && !analysis && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "What are the key insights from these documents?",
              "What revenue patterns can you identify?",
              "Who are the top customers mentioned?",
              "What business opportunities do you see?",
              "What are the main challenges highlighted?",
              "What recommendations would you make?"
            ].map((question, index) => (
              <button
                key={index}
                onClick={() => setQuery(question)}
                className="text-left p-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
              >
                {question}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
} 