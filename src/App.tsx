/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate 
} from 'react-router-dom';
import { 
  ClipboardList, 
  LayoutDashboard, 
  PlusCircle, 
  Search, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from './firebase';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Logo = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center", className)}>
    {/* Placeholder for the Sterling Auxiliaries Logo */}
    <div className="relative w-16 h-16 flex items-center justify-center">
      <div className="absolute inset-0 border-4 border-[#E31E24] rotate-45 rounded-sm"></div>
      <div className="absolute inset-2 border-4 border-[#3F3D91] rotate-45 rounded-sm flex items-center justify-center">
        <div className="w-4 h-4 bg-[#3F3D91] rounded-full"></div>
      </div>
    </div>
  </div>
);

const Header = ({ title, showBack = false }: { title: string, showBack?: boolean }) => {
  const navigate = useNavigate();
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        {showBack && (
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <Logo className="w-8 h-8 scale-50" />
        <h1 className="font-bold text-lg text-[#3F3D91] tracking-tight">{title}</h1>
      </div>
      <div className="text-[10px] font-bold text-[#E31E24] uppercase tracking-widest hidden sm:block">
        Sterling Auxiliaries
      </div>
    </header>
  );
};

// --- Screens ---

const HomeScreen = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center space-y-8"
      >
        <div className="space-y-4">
          <Logo className="mx-auto" />
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[#3F3D91] tracking-tighter">
              SAPL <span className="text-[#E31E24]">Grievance</span> Register
            </h1>
            <p className="text-gray-500 font-medium text-sm">Sterling Auxiliaries Pvt Ltd</p>
          </div>
        </div>

        <div className="grid gap-4">
          <Link to="/form">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#3F3D91] text-white p-6 rounded-2xl shadow-lg shadow-blue-900/10 flex items-center gap-4 group transition-all"
            >
              <div className="bg-white/10 p-3 rounded-xl group-hover:bg-white/20 transition-colors">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg">Employee Form</div>
                <div className="text-xs text-white/60">Submit a new grievance</div>
              </div>
            </motion.button>
          </Link>

          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white border-2 border-[#3F3D91]/10 text-[#3F3D91] p-6 rounded-2xl shadow-sm flex items-center gap-4 group transition-all"
            >
              <div className="bg-[#3F3D91]/5 p-3 rounded-xl group-hover:bg-[#3F3D91]/10 transition-colors">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg">Employer Dashboard</div>
                <div className="text-xs text-gray-400">Manage and view records</div>
              </div>
            </motion.button>
          </Link>
        </div>

        <p className="text-[10px] text-gray-400 uppercase tracking-widest pt-8">
          © 2024 Sterling Auxiliaries Pvt Ltd
        </p>
      </motion.div>
    </div>
  );
};

const GrievanceFormScreen = () => {
  const [formData, setFormData] = useState({
    employeeCode: '',
    employeeName: '',
    department: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    issue: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const departments = ['Production', 'R&D', 'Quality Control', 'HR', 'Finance', 'Logistics', 'Sales', 'Maintenance'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.employeeCode || !formData.employeeName || !formData.date || !formData.issue) {
      setError('All fields are mandatory');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'grievances'), {
        employee_code: formData.employeeCode,
        employee_name: formData.employeeName,
        department: formData.department,
        date: formData.date,
        issue: formData.issue,
        timestamp: Timestamp.now()
      });
      setSuccess(true);
      setFormData({
        employeeCode: '',
        employeeName: '',
        department: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        issue: ''
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setError('Failed to submit grievance. Please check your Firebase configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header title="Submit Grievance" showBack />
      <main className="max-w-2xl mx-auto p-4 sm:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
        >
          <div className="bg-[#3F3D91] p-6 text-white">
            <h2 className="text-xl font-bold">Grievance Form</h2>
            <p className="text-white/60 text-sm">Please fill in the details accurately.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Employee Code</label>
                <input 
                  type="text"
                  value={formData.employeeCode}
                  onChange={(e) => setFormData({...formData, employeeCode: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#3F3D91] focus:border-transparent outline-none transition-all"
                  placeholder="e.g. SAPL-001"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Employee Name</label>
                <input 
                  type="text"
                  value={formData.employeeName}
                  onChange={(e) => setFormData({...formData, employeeName: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#3F3D91] focus:border-transparent outline-none transition-all"
                  placeholder="Full Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Department</label>
                <select 
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#3F3D91] focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date</label>
                <input 
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#3F3D91] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Issue / Grievance Description</label>
              <textarea 
                rows={4}
                value={formData.issue}
                onChange={(e) => setFormData({...formData, issue: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#3F3D91] focus:border-transparent outline-none transition-all resize-none"
                placeholder="Describe your grievance in detail..."
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-sm font-medium"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-xl text-sm font-medium"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Grievance submitted successfully
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#3F3D91] text-white py-4 rounded-xl font-bold hover:bg-[#2F2D71] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Grievance'}
              </button>
              <button 
                type="button"
                onClick={() => setFormData({
                  employeeCode: '',
                  employeeName: '',
                  department: '',
                  date: format(new Date(), 'yyyy-MM-dd'),
                  issue: ''
                })}
                className="px-8 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Clear Form
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

const AdminDashboardScreen = () => {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'grievances'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGrievances(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await deleteDoc(doc(db, 'grievances', id));
      } catch (err) {
        alert('Failed to delete record');
      }
    }
  };

  const filteredGrievances = grievances.filter(g => 
    g.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header title="Employer Dashboard" showBack />
      
      <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by Employee Code or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#3F3D91] focus:border-transparent outline-none transition-all bg-white"
            />
          </div>
          <div className="text-sm font-medium text-gray-500">
            Total Records: <span className="text-[#3F3D91] font-bold">{filteredGrievances.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-[#3F3D91] animate-spin" />
              <p className="text-gray-400 font-medium">Loading grievances...</p>
            </div>
          ) : filteredGrievances.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <ClipboardList className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium">No grievances found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Issue Preview</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredGrievances.map((g) => (
                    <React.Fragment key={g.id}>
                      <tr className={cn(
                        "hover:bg-gray-50/50 transition-colors group",
                        expandedId === g.id && "bg-blue-50/30"
                      )}>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{g.employee_name}</div>
                          <div className="text-xs text-[#3F3D91] font-medium">{g.employee_code}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold uppercase">
                            {g.department || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {format(new Date(g.date), 'dd MMM yyyy')}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 truncate max-w-xs">
                            {g.issue}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setExpandedId(expandedId === g.id ? null : g.id)}
                              className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-[#3F3D91]"
                            >
                              {expandedId === g.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                            <button 
                              onClick={() => handleDelete(g.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      <AnimatePresence>
                        {expandedId === g.id && (
                          <tr>
                            <td colSpan={5} className="px-6 py-0">
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="py-6 px-4 bg-blue-50/30 rounded-2xl mb-4 border border-blue-100/50">
                                  <h4 className="text-xs font-bold text-[#3F3D91] uppercase tracking-widest mb-2">Full Grievance Description</h4>
                                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {g.issue}
                                  </p>
                                  <div className="mt-4 pt-4 border-t border-blue-100 flex items-center gap-4 text-[10px] text-gray-400 uppercase font-bold">
                                    <span>Submitted: {format(g.timestamp.toDate(), 'pp, dd MMM yyyy')}</span>
                                    <span>ID: {g.id}</span>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <Router>
      <div className="font-sans text-gray-900 selection:bg-[#3F3D91] selection:text-white">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/form" element={<GrievanceFormScreen />} />
          <Route path="/dashboard" element={<AdminDashboardScreen />} />
        </Routes>
      </div>
    </Router>
  );
}
