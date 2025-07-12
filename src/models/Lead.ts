import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ILead extends Document {
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
  lastContact?: Date;
  nextFollowUp?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  priority: 'low' | 'medium' | 'high';
  expectedCloseDate?: Date;
  probability: number; // 0-100 percentage
}

const LeadSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  company: { type: String },
  position: { type: String },
  status: { 
    type: String, 
    enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'],
    default: 'new'
  },
  value: { type: Number, default: 0 },
  source: { 
    type: String, 
    enum: ['website', 'referral', 'cold-call', 'social-media', 'email-campaign', 'other'],
    default: 'other'
  },
  assignedTo: { type: String },
  notes: { type: String },
  lastContact: { type: Date },
  nextFollowUp: { type: Date },
  tags: [{ type: String }],
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  expectedCloseDate: { type: Date },
  probability: { 
    type: Number, 
    min: 0, 
    max: 100, 
    default: 10 
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
LeadSchema.index({ status: 1, assignedTo: 1 });
LeadSchema.index({ nextFollowUp: 1 });
LeadSchema.index({ priority: 1, value: -1 });
LeadSchema.index({ createdAt: -1 });

export default models.Lead || model<ILead>('Lead', LeadSchema);
