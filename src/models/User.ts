import mongoose, { Schema, Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export interface IUser extends Document {
  full_name: string;
  email: string;
  password: string;
  college_id?: mongoose.Types.ObjectId;
  department?: string;
  branch?: string;
  phone?: string;
  roles: string[];
  must_change_password: boolean;
  is_approved: boolean;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  college_id: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  department: { type: String },
  branch: { type: String },
  phone: { type: String },
  roles: [{ type: String, enum: ['admin', 'principal', 'ed', 'hod', 'advisor', 'student'], default: ['student'] }],
  must_change_password: { type: Boolean, default: false },
  is_approved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, (this as any).password);
};

export default mongoose.model<IUser>('User', UserSchema);
