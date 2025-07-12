'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import LeadForm from './LeadForm';
import { 
  Plus, 
  Filter, 
  Search, 
  MoreVertical, 
  Phone, 
  Mail, 
  Calendar,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  FileText,
  X,
  IndianRupee
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Lead {
  _id: string;
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
  lastContact?: string;
  nextFollowUp?: string;
  priority: 'low' | 'medium' | 'high';
  expectedCloseDate?: string;
  probability: number;
  createdAt: string;
}

const STATUS_CONFIG = {
  'new': { label: 'New', color: 'bg-gray-100 text-gray-800', icon: Clock },
  'contacted': { label: 'Contacted', color: 'bg-blue-100 text-blue-800', icon: Phone },
  'qualified': { label: 'Qualified', color: 'bg-yellow-100 text-yellow-800', icon: Target },
  'proposal': { label: 'Proposal', color: 'bg-purple-100 text-purple-800', icon: FileText },
  'negotiation': { label: 'Negotiation', color: 'bg-orange-100 text-orange-800', icon: TrendingUp },
  'closed-won': { label: 'Won', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  'closed-lost': { label: 'Lost', color: 'bg-red-100 text-red-800', icon: X }
};

const PRIORITY_CONFIG = {
  'low': { label: 'Low', color: 'bg-gray-100 text-gray-600' },
  'medium': { label: 'Medium', color: 'bg-yellow-100 text-yellow-600' },
  'high': { label: 'High', color: 'bg-red-100 text-red-600' }
};

export default function LeadList() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddLead, setShowAddLead] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await fetch('/api/leads');
      if (!response.ok) throw new Error('Failed to fetch leads');
      return response.json();
    },
    staleTime: 1000 * 60 * 1, // 1 minute (reduced for faster updates)
    refetchOnMount: false, // Don't refetch on mount if data exists
  });

  const leads: Lead[] = data?.leads || [];

  const filteredLeads = leads.filter((lead: Lead) => {
    const matchesFilter = filter === 'all' || lead.status === filter;
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusStats = () => {
    const stats = {
      total: leads.length,
      new: leads.filter((l: Lead) => l.status === 'new').length,
      contacted: leads.filter((l: Lead) => l.status === 'contacted').length,
      qualified: leads.filter((l: Lead) => l.status === 'qualified').length,
      proposal: leads.filter((l: Lead) => l.status === 'proposal').length,
      negotiation: leads.filter((l: Lead) => l.status === 'negotiation').length,
      won: leads.filter((l: Lead) => l.status === 'closed-won').length,
      lost: leads.filter((l: Lead) => l.status === 'closed-lost').length
    };
    return stats;
  };

  const stats = getStatusStats();
  const totalValue = leads.reduce((sum: number, lead: Lead) => sum + lead.value, 0);
  const weightedValue = leads.reduce((sum: number, lead: Lead) => sum + (lead.value * lead.probability / 100), 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-500">Failed to load leads. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <Button 
          onClick={() => setShowAddLead(true)}
          variant="default"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{totalValue.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <IndianRupee className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Weighted Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{weightedValue.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.total > 0 ? Math.round((stats.won / (stats.won + stats.lost)) * 100) : 0}%
              </p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed-won">Won</option>
            <option value="closed-lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Pipeline View */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const statusLeads = filteredLeads.filter(lead => lead.status === status);
          const IconComponent = config.icon;
          
          return (
            <div key={status} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                  {config.label}
                </div>
                <span className="text-sm text-gray-500">({statusLeads.length})</span>
              </div>
              
              <div className="space-y-2">
                {statusLeads.map(lead => (
                  <Card key={lead._id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{lead.name}</h4>
                          {lead.company && (
                            <p className="text-xs text-gray-600">{lead.company}</p>
                          )}
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_CONFIG[lead.priority].color}`}>
                          {PRIORITY_CONFIG[lead.priority].label}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>₹{lead.value.toLocaleString('en-IN')}</span>
                        <span>{lead.probability}%</span>
                      </div>
                      
                      {lead.nextFollowUp && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(lead.nextFollowUp).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first lead'
            }
          </p>
          {!searchTerm && filter === 'all' && (
            <Button onClick={() => setShowAddLead(true)} variant="default">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Lead
            </Button>
          )}
        </div>
      )}

      {/* Lead Form Modal */}
      <LeadForm 
        isOpen={showAddLead}
        onClose={() => setShowAddLead(false)}
        onSuccess={() => {
          setShowAddLead(false);
          queryClient.invalidateQueries({ queryKey: ['leads'] });
        }}
      />
    </div>
  );
}
