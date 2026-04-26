import mongoose, { Schema, Document } from 'mongoose';

export interface IEventMember {
  name: string;
  department: string;
}

export interface IEvent extends Document {
  title: string;
  description: string;
  start_date: Date;
  end_date?: Date;
  venue?: string;
  college_id: mongoose.Types.ObjectId;
  creator_id: mongoose.Types.ObjectId;
  organizer_name?: string;
  members?: IEventMember[];
  status: string;
  banner_url?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  cancellation_reason?: string;
  createdAt: Date;
}

const EventSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date },
  venue: { type: String },
  college_id: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  creator_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organizer_name: { type: String },
  members: [{
    name: { type: String },
    department: { type: String }
  }],
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'advisor_pending', 'hod_pending', 'ed_pending', 'principal_pending'], 
    default: 'pending' 
  },
  banner_url: { type: String },
  contact_name: { type: String },
  contact_email: { type: String },
  contact_phone: { type: String },
  cancellation_reason: { type: String },
  createdAt: { type: Date, default: Date.now },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default mongoose.model<IEvent>('Event', EventSchema);
