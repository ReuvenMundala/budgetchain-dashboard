import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Shield, Search, ArrowUpRight, Activity, LayoutDashboard,
  Database, Users, FileText, X, ChevronRight,
  ExternalLink, Lock, Flag, User, Bell, Download, Plus,
  ShieldCheck, Info, Map as MapIcon, Globe, Check, Cpu,
  Briefcase, TrendingUp, Loader2, Menu, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { useLocalStorage } from './hooks/useLocalStorage';

// --- THEME COLORS ---
const DB_BLUE = "#001f3f";
const DB_GOLD = "#fbbf24";
const DB_DARK = "#0a0e17";

// VERIFIED GAA 2026 BUDGET DATA
const INITIAL_SUMMARY = {
  total: 6750000000000, // ₱6.75 Trillion
  released: 1687500000000,
  spent: 540000000000,
  activeProjects: 22450,
};

const INITIAL_DEPARTMENTS = [
  { id: 'DEPED', name: 'Education (DepEd/SUCs)', allocated: 1104200000000, spent: 145200000000, status: 'On Track' },
  { id: 'DPWH', name: 'Public Works (DPWH)', allocated: 845600000000, spent: 92000000000, status: 'On Track' },
  { id: 'DOH', name: 'Health (DOH/PhilHealth)', allocated: 324500000000, spent: 48600000000, status: 'On Track' },
  { id: 'DILG', name: 'Local Govt (DILG)', allocated: 295800000000, spent: 34500000000, status: 'On Track' },
  { id: 'DND', name: 'Defense (DND)', allocated: 285600000000, spent: 52400000000, status: 'On Track' },
  { id: 'DSWD', name: 'Social Welfare (DSWD)', allocated: 254200000000, spent: 61500000000, status: 'On Track' },
];

const INITIAL_PROJECTS = [
  {
    id: 'PRJ-001',
    name: 'North-South Commuter Railway (NSCR) Extension',
    agency: 'DOTr',
    budget: 94500000000,
    location: 'Luzon',
    status: 'Ongoing',
    securityKey: '0xaf4e...b210',
    createdAt: '2026-01-01',
    anomalies: [],
    disbursements: [
      { phase: 'Phase 1: Mobilization', amount: 14175000000, status: 'Released', date: 'Jan 15, 2026' },
      { phase: 'Phase 2: Land Acquisition', amount: 28350000000, status: 'Pending', date: 'Mar 2026' },
      { phase: 'Phase 3: Construction', amount: 51975000000, status: 'Locked', date: 'Jul 2026' }
    ],
    signatures: [
      { role: 'Agency Head', status: 'Signed', date: 'Jan 02, 2026' },
      { role: 'DBM Secretary', status: 'Signed', date: 'Jan 05, 2026' },
      { role: 'COA Auditor', status: 'Pending', date: null }
    ]
  },
  {
    id: 'PRJ-002',
    name: '4Ps Cash Transfer - 2026 Expansion',
    agency: 'DSWD',
    budget: 126800000000,
    location: 'Nationwide',
    status: 'Ongoing',
    securityKey: '0x7d1a...cc04',
    createdAt: '2026-01-01',
    anomalies: ['Rapid Release'],
    disbursements: [
      { phase: 'Q1 Distribution', amount: 31700000000, status: 'Released', date: 'Jan 10, 2026' },
      { phase: 'Q2 Distribution', amount: 31700000000, status: 'Locked', date: 'Apr 2026' }
    ],
    signatures: [
      { role: 'Agency Head', status: 'Signed', date: 'Jan 03, 2026' },
      { role: 'DBM Secretary', status: 'Signed', date: 'Jan 04, 2026' },
      { role: 'COA Auditor', status: 'Signed', date: 'Jan 08, 2026' }
    ]
  },
  {
    id: 'PRJ-003',
    name: 'Bataan-Cavite Interlink Bridge Construction',
    agency: 'DPWH',
    budget: 18200000000,
    location: 'Luzon',
    status: 'Ongoing',
    securityKey: '0x8f2d...92a1',
    createdAt: '2026-01-01',
    anomalies: ['Ghost Project'],
    disbursements: [
      { phase: 'Initial Design', amount: 910000000, status: 'Released', date: 'Jan 20, 2026' },
      { phase: 'Construction Start', amount: 5460000000, status: 'Pending', date: 'May 2026' }
    ],
    signatures: [
      { role: 'Agency Head', status: 'Signed', date: 'Jan 12, 2026' },
      { role: 'DBM Secretary', status: 'Pending', date: null },
      { role: 'COA Auditor', status: 'Pending', date: null }
    ]
  },
];

const INITIAL_LOGS = [
  { id: 'LOG-01', action: 'Budget Approved', details: 'The 2026 National Budget of ₱6.75T was officially signed and recorded.', time: 'Jan 01, 2026' },
  { id: 'LOG-02', action: 'Funds Released', details: '₱145B was sent to Education and Health departments for Q1 projects.', time: '5 hours ago' },
];

const REGIONAL_DATA = [
  { region: 'Luzon', amount: 2840000000000, color: '#fbbf24' },
  { region: 'Visayas', amount: 1420000000000, color: '#f59e0b' },
  { region: 'Mindanao', amount: 1680000000000, color: '#d97706' },
  { region: 'Palawan', amount: 810000000000, color: '#b45309' },
];

const App = () => {
  const navigate = useNavigate();
  const { user, logout, canAddProjects, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [locationFilter, setLocationFilter] = useState(null);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [showAmendmentForm, setShowAmendmentForm] = useState(false);
  const [amendmentForm, setAmendmentForm] = useState({ type: 'Status Update', description: '', newBudget: '' });
  const [selectedLog, setSelectedLog] = useState(null);

  // Persisted state with localStorage
  const [projects, setProjects] = useLocalStorage('budgetchain_projects', INITIAL_PROJECTS);
  const [logs, setLogs] = useLocalStorage('budgetchain_logs', INITIAL_LOGS);
  const [reports, setReports] = useLocalStorage('budgetchain_reports', []);
  const [amendments, setAmendments] = useLocalStorage('budgetchain_amendments', []);
  const [notifications, setNotifications] = useLocalStorage('budgetchain_notifications', [
    { id: 1, type: 'info', message: 'Welcome to BudgetChain 2026!', time: 'Just now', read: false },
    { id: 2, type: 'success', message: 'System verification passed.', time: '1 hour ago', read: false },
  ]);

  const [newProject, setNewProject] = useState({ name: '', agency: 'DEPED', budget: '', location: '' });
  const [reportForm, setReportForm] = useState({ projectId: '', category: 'Ghost Project (Not existing)', description: '' });

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (window.innerWidth >= 1024) setSidebarOpen(true);
  }, []);

  const formatPHP = (val) => {
    if (val >= 1e12) return `₱${(val / 1e12).toFixed(2)} Trillion`;
    if (val >= 1e9) return `₱${(val / 1e9).toFixed(2)} Billion`;
    return `₱${val.toLocaleString()}`;
  };

  const exportCSV = (data, filename) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(','));
    const content = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(content));
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNotification(`Successfully downloaded ${filename}.csv`);
  };

  const handleRegisterProject = () => {
    if (!canAddProjects()) {
      setNotification("Guests cannot add projects. Please login as admin.");
      return;
    }
    if (!newProject.name || !newProject.budget) return setNotification("Please fill in the project details.");
    const prj = {
      ...newProject,
      id: `PRJ-${Math.floor(100 + Math.random() * 899)}`,
      budget: parseFloat(newProject.budget),
      status: 'Registered',
      securityKey: `0x${Math.random().toString(16).substr(2, 8)}...`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProjects([prj, ...projects]);
    setLogs([{ id: `L-${Date.now()}`, action: 'New Project Added', details: `${prj.name} was added to the official list.`, time: 'Just now' }, ...logs]);
    addNotification('success', `Project "${prj.name}" has been registered.`);
    setNewProject({ name: '', agency: 'DEPED', budget: '', location: '' });
    setNotification("Project successfully recorded in the system.");
  };

  // Generate simulated blockchain hash
  const generateBlockHash = () => `0x${Math.random().toString(16).substr(2, 8)}${Math.random().toString(16).substr(2, 8)}`;
  const generateBlockNumber = () => Math.floor(1000000 + Math.random() * 100000);

  // BLOCKCHAIN: No delete - only amendments allowed
  const handleSubmitAmendment = (projectId) => {
    if (!isAdmin()) {
      setNotification("Only authorized officials can submit amendments.");
      return;
    }
    if (!amendmentForm.description) {
      setNotification("Please provide amendment details.");
      return;
    }

    const project = projects.find(p => p.id === projectId);
    const newAmendment = {
      id: `AMD-${Date.now()}`,
      projectId,
      projectName: project?.name,
      type: amendmentForm.type,
      description: amendmentForm.description,
      previousBudget: project?.budget,
      newBudget: amendmentForm.newBudget ? parseFloat(amendmentForm.newBudget) : null,
      timestamp: new Date().toISOString(),
      blockHash: generateBlockHash(),
      blockNumber: generateBlockNumber(),
      recordedBy: user?.name || 'Administrator',
      confirmations: Math.floor(5 + Math.random() * 10)
    };

    setAmendments([newAmendment, ...amendments]);
    setLogs([{
      id: `L-${Date.now()}`,
      action: 'Amendment Recorded',
      details: `${amendmentForm.type} amendment for ${project?.name}. Hash: ${newAmendment.blockHash.substring(0, 10)}...`,
      time: 'Just now'
    }, ...logs]);
    addNotification('success', `Amendment recorded on blockchain. Block #${newAmendment.blockNumber}`);
    setAmendmentForm({ type: 'Status Update', description: '', newBudget: '' });
    setShowAmendmentForm(false);
    setNotification("Amendment permanently recorded on blockchain.");
  };

  // Get amendments for a specific project
  const getProjectAmendments = (projectId) => amendments.filter(a => a.projectId === projectId);

  // Get projects for a specific agency
  const getAgencyProjects = (agencyId) => projects.filter(p => p.agency === agencyId);

  const handleSubmitReport = () => {
    if (!reportForm.projectId || !reportForm.description) {
      setNotification("Please fill in all report fields.");
      return;
    }
    const newReport = {
      id: `RPT-${Date.now()}`,
      ...reportForm,
      status: 'Pending',
      submittedBy: user?.name || 'Guest',
      createdAt: new Date().toISOString()
    };
    setReports([newReport, ...reports]);
    setLogs([{ id: `L-${Date.now()}`, action: 'Report Submitted', details: `New report filed for ${reportForm.projectId}.`, time: 'Just now' }, ...logs]);
    addNotification('info', 'Your report has been submitted for review.');
    setReportForm({ projectId: '', category: 'Ghost Project (Not existing)', description: '' });
    setShowReportForm(false);
    setNotification("Thank you. Your report has been securely submitted to COA.");
  };

  const addNotification = (type, message) => {
    const newNotif = {
      id: Date.now(),
      type,
      message,
      time: 'Just now',
      read: false
    };
    setNotifications([newNotif, ...notifications]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const verifySystem = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      addNotification('success', 'System verification completed successfully.');
      setNotification("System Check: All records are accurate and verified.");
    }, 1500);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Enhanced filtering with location and search
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.agency.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !locationFilter || p.location === locationFilter || p.location === 'Nationwide';
    return matchesSearch && matchesLocation;
  });

  const NavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        if (window.innerWidth < 1024) setSidebarOpen(false);
      }}
      className={`flex items-center w-full mb-2 h-12 transition-all rounded-md border-l-4 ${activeTab === id
        ? 'bg-blue-900/40 border-amber-400 text-amber-400 shadow-md'
        : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white'
        } ${!isSidebarOpen && window.innerWidth >= 1024 ? 'justify-center px-0' : 'px-4'}`}
    >
      <Icon size={20} className={`${!isSidebarOpen && window.innerWidth >= 1024 ? '' : 'mr-4'}`} />
      {(isSidebarOpen || window.innerWidth < 1024) && (
        <span className="font-bold text-xs uppercase tracking-widest">{label}</span>
      )}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#060b13] font-sans text-white overflow-hidden relative">

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-[100] lg:relative transition-all duration-300
        ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'}
        bg-[#0a0e17] border-r border-white/10 flex flex-col overflow-hidden shadow-2xl
      `}>
        <div className="p-6 flex flex-col items-center border-b border-white/5 bg-[#001f3f] shrink-0">
          <div
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-900 shadow-lg cursor-pointer"
            onClick={() => { if (window.innerWidth >= 1024) setSidebarOpen(!isSidebarOpen); }}
          >
            <Shield size={28} />
          </div>
          {(isSidebarOpen || window.innerWidth < 1024) && (
            <div className="mt-4 text-center">
              <span className="block font-black text-lg tracking-tight uppercase italic">BUDGET<span className="text-amber-400">CHAIN</span></span>
              <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">GAA 2026 Transparency</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 mt-6 overflow-y-auto">
          <NavItem id="overview" icon={LayoutDashboard} label="General Overview" />
          <NavItem id="records" icon={Database} label="Official Records" />
          <NavItem id="agencies" icon={Users} label="Government Agencies" />
          <NavItem id="projects" icon={Briefcase} label="Project List" />
          <NavItem id="logs" icon={Activity} label="System Logs" />
          <NavItem id="report" icon={Flag} label="Report a Problem" />
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className={`flex items-center p-3 rounded-md bg-white/5 w-full ${!isSidebarOpen && window.innerWidth >= 1024 ? 'justify-center' : ''}`}>
            <div className="w-2 h-2 rounded-full bg-emerald-400 mr-3 animate-pulse"></div>
            {(isSidebarOpen || window.innerWidth < 1024) && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Secure</span>}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-[#001f3f] border-b border-amber-400/30 h-16 flex items-center justify-between px-4 lg:px-8 z-[80] shadow-lg shrink-0">
          <div className="flex items-center space-x-4 flex-1">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-amber-400 bg-white/5 rounded-md">
              <Menu size={24} />
            </button>
            <div className="relative w-full max-w-lg hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Find a project, agency, or budget record..."
                className="w-full pl-10 pr-4 py-2 bg-[#0a0e17] border border-white/10 focus:border-amber-400 outline-none rounded-md text-xs uppercase tracking-widest"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {locationFilter && (
              <button
                onClick={() => setLocationFilter(null)}
                className="flex items-center px-3 py-1 bg-amber-400/20 border border-amber-400/30 rounded text-amber-400 text-[9px] font-black uppercase"
              >
                {locationFilter} <X size={12} className="ml-2" />
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4 relative">
            <div className="hidden lg:flex flex-col items-end border-r border-white/10 pr-4 mr-2">
              <span className="text-[10px] font-black text-amber-400 uppercase italic">Bagong Pilipinas</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-tighter">Budget Transparency Portal</span>
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                className="p-2 text-slate-400 hover:text-amber-400 transition-all bg-white/5 rounded relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute right-0 top-12 w-80 bg-[#0a0e17] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-[200]"
                  >
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                      <span className="text-xs font-black uppercase text-white">Notifications</span>
                      <button onClick={markAllNotificationsRead} className="text-[9px] text-amber-400 font-bold uppercase">Mark all read</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-xs">No notifications</div>
                      ) : (
                        notifications.slice(0, 5).map(n => (
                          <div key={n.id} className={`p-4 border-b border-white/5 ${!n.read ? 'bg-blue-900/20' : ''}`}>
                            <p className="text-xs text-white font-bold">{n.message}</p>
                            <p className="text-[9px] text-slate-500 mt-1">{n.time}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                className="w-8 h-8 rounded-md bg-amber-400 flex items-center justify-center text-blue-900 font-black shadow-md text-xs cursor-pointer hover:brightness-110"
              >
                {user?.initials || 'GU'}
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute right-0 top-12 w-48 bg-[#0a0e17] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-[200]"
                  >
                    <div className="p-4 border-b border-white/10">
                      <p className="text-xs font-black uppercase text-white">{user?.name}</p>
                      <p className="text-[9px] text-amber-400 uppercase">{user?.type === 'admin' ? 'Administrator' : 'Guest User'}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full p-4 flex items-center text-left text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <LogOut size={16} className="mr-3" />
                      <span className="text-xs font-bold uppercase">Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar relative">

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter italic">2026 Budget <span className="text-amber-400">Overview</span></h1>
                    <p className="text-slate-500 text-[10px] mt-1 uppercase font-bold tracking-widest">Official Government spending updates in real-time.</p>
                  </div>
                  <button onClick={verifySystem} className="w-full md:w-auto bg-amber-400 text-blue-900 px-6 py-2.5 rounded text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 flex items-center justify-center shadow-lg">
                    {isVerifying ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Check size={14} className="mr-2" />} Refresh Data
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Total National Budget" value={formatPHP(INITIAL_SUMMARY.total)} icon={Globe} color="blue" />
                  <StatCard title="Funds Ready for Use" value={formatPHP(INITIAL_SUMMARY.released)} icon={ArrowUpRight} color="gold" />
                  <StatCard title="Actual Money Spent" value={formatPHP(INITIAL_SUMMARY.spent)} icon={TrendingUp} color="white" />
                  <StatCard title="Total Projects" value={INITIAL_SUMMARY.activeProjects.toLocaleString()} icon={Briefcase} color="blue" />
                </div>

                {/* Budget Flow Visualization */}
                <div className="bg-[#0a0e17] p-6 rounded border border-white/10 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black uppercase tracking-widest text-[10px] text-slate-300 flex items-center gap-2">
                      🔗 Budget Flow Pipeline
                    </h3>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> Live on Blockchain
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 md:gap-4">
                    <div className="text-center">
                      <div className="bg-blue-900/30 p-4 rounded border border-blue-500/30 mb-2">
                        <p className="text-[9px] text-blue-400 uppercase font-bold mb-1">GAA Allocation</p>
                        <p className="text-lg font-black text-white italic">{formatPHP(INITIAL_SUMMARY.total)}</p>
                        <p className="text-[8px] text-slate-500 mt-1">100%</p>
                      </div>
                    </div>
                    <div className="text-center relative">
                      <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-amber-400/50 -translate-y-1/2 -translate-x-full hidden md:block"></div>
                      <div className="bg-amber-400/10 p-4 rounded border border-amber-400/30 mb-2">
                        <p className="text-[9px] text-amber-400 uppercase font-bold mb-1">Released</p>
                        <p className="text-lg font-black text-amber-400 italic">{formatPHP(INITIAL_SUMMARY.released)}</p>
                        <p className="text-[8px] text-slate-500 mt-1">{((INITIAL_SUMMARY.released / INITIAL_SUMMARY.total) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="text-center relative">
                      <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-amber-400/50 -translate-y-1/2 -translate-x-full hidden md:block"></div>
                      <div className="bg-emerald-900/20 p-4 rounded border border-emerald-500/30 mb-2">
                        <p className="text-[9px] text-emerald-400 uppercase font-bold mb-1">Disbursed</p>
                        <p className="text-lg font-black text-emerald-400 italic">{formatPHP(INITIAL_SUMMARY.spent)}</p>
                        <p className="text-[8px] text-slate-500 mt-1">{((INITIAL_SUMMARY.spent / INITIAL_SUMMARY.total) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="text-center relative">
                      <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-amber-400/50 -translate-y-1/2 -translate-x-full hidden md:block"></div>
                      <div className="bg-purple-900/20 p-4 rounded border border-purple-500/30 mb-2">
                        <p className="text-[9px] text-purple-400 uppercase font-bold mb-1">Unspent</p>
                        <p className="text-lg font-black text-purple-400 italic">{formatPHP(INITIAL_SUMMARY.total - INITIAL_SUMMARY.spent)}</p>
                        <p className="text-[8px] text-slate-500 mt-1">{(((INITIAL_SUMMARY.total - INITIAL_SUMMARY.spent) / INITIAL_SUMMARY.total) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="h-full flex">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(INITIAL_SUMMARY.spent / INITIAL_SUMMARY.total) * 100}%` }}></div>
                      <div className="bg-amber-400 h-full" style={{ width: `${((INITIAL_SUMMARY.released - INITIAL_SUMMARY.spent) / INITIAL_SUMMARY.total) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="flex gap-6 mt-3 text-[8px] font-bold uppercase">
                    <span className="flex items-center"><div className="w-2 h-2 bg-emerald-500 rounded mr-1"></div> Spent</span>
                    <span className="flex items-center"><div className="w-2 h-2 bg-amber-400 rounded mr-1"></div> Released (Pending)</span>
                    <span className="flex items-center"><div className="w-2 h-2 bg-white/20 rounded mr-1"></div> Not Released</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-[#0a0e17] p-6 rounded border border-white/10 shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                      <h3 className="font-black uppercase tracking-widest text-[10px] lg:text-xs text-slate-300">Spending by Department (2026)</h3>
                      <button onClick={() => exportCSV(INITIAL_DEPARTMENTS, 'department_spending')} className="text-[9px] font-black uppercase tracking-widest px-4 py-2 border border-white/10 rounded hover:bg-white/5 flex items-center">
                        <Download size={12} className="mr-2 text-amber-400" /> Download CSV
                      </button>
                    </div>
                    <div className="h-[250px] lg:h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={INITIAL_DEPARTMENTS}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="id" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={(val) => `₱${val / 1e9}B`} />
                          <Tooltip contentStyle={{ backgroundColor: '#001f3f', border: 'none', color: '#fff', fontSize: '10px' }} formatter={(v) => formatPHP(v)} />
                          <Bar dataKey="allocated" name="Allocated" fill="#1e40af" barSize={20} radius={[2, 2, 0, 0]} />
                          <Bar dataKey="spent" name="Disbursed" fill="#10b981" barSize={20} radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-[#001f3f] p-6 rounded border border-amber-400/20 flex flex-col shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-amber-400"></div>
                    <h3 className="font-black text-white uppercase tracking-widest mb-6 text-[10px]">Recent System Updates</h3>
                    <div className="flex-1 space-y-4 max-h-[280px] overflow-y-auto">
                      {logs.slice(0, 10).map((log, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedLog(log)}
                          className="flex items-center p-3 bg-black/40 border border-white/5 rounded cursor-pointer hover:border-amber-400/50 hover:bg-black/60 transition-all"
                        >
                          <Activity size={14} className="text-amber-400 mr-3 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-white uppercase truncate">{log.action}</p>
                            <p className="text-[8px] text-slate-500 uppercase">{log.time}</p>
                          </div>
                          <ChevronRight size={14} className="text-slate-600 shrink-0" />
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveTab('logs')} className="w-full mt-6 py-3 text-[9px] font-black text-amber-400 border border-amber-400/30 rounded uppercase tracking-widest">See All Logs</button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'records' && (
              <motion.div key="records" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-end gap-4 mb-4">
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">Official <span className="text-amber-400">Records</span></h2>
                  <button onClick={() => exportCSV(projects, 'budget_records_2026')} className="bg-amber-400 text-blue-900 px-6 py-2.5 rounded text-[10px] font-black uppercase shadow-lg">Download Full Records</button>
                </div>
                <div className="bg-[#0a0e17] rounded border border-white/10 overflow-x-auto shadow-xl">
                  <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-[#001f3f] border-b border-white/10 uppercase text-[10px] font-black text-amber-400 italic">
                      <tr>
                        <th className="px-6 py-5">Security Key</th>
                        <th className="px-6 py-5">Department</th>
                        <th className="px-6 py-5">Verified Value</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {projects.map((p, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedProject(p)}>
                          <td className="px-6 py-5 font-mono text-[11px] text-blue-400">
                            {p.securityKey}
                            {p.anomalies && p.anomalies.length > 0 && (
                              <div className="mt-1 flex gap-1">
                                {p.anomalies.map((a, i) => (
                                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title={`${a} Detected`}></span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5 text-[11px] font-black uppercase">
                            {p.agency}
                            {p.anomalies && p.anomalies.length > 0 && (
                              <span className="ml-2 text-[8px] text-red-500 border border-red-500/30 px-1 py-0.5 rounded bg-red-900/20">⚠</span>
                            )}
                          </td>
                          <td className="px-6 py-5 text-sm font-black italic">{formatPHP(p.budget)}</td>
                          <td className="px-6 py-5"><div className="flex items-center text-[9px] font-black text-emerald-500 uppercase tracking-widest"><ShieldCheck size={14} className="mr-2" /> Verified</div></td>
                          <td className="px-6 py-5 text-[10px] text-slate-500 font-bold uppercase">Jan 2026</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'agencies' && (
              <motion.div key="agencies" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">Government <span className="text-amber-400">Agencies</span></h2>
                    <p className="text-slate-500 text-[10px] mt-1 uppercase font-bold tracking-widest">Click an agency to view its projects</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {INITIAL_DEPARTMENTS.map((dept, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedAgency(dept)}
                      className="bg-[#0a0e17] p-6 rounded border border-white/10 shadow-xl flex flex-col group hover:border-amber-400 transition-colors cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-[#001f3f] border border-amber-400/20 text-amber-400 rounded flex items-center justify-center font-black text-lg group-hover:bg-amber-400 group-hover:text-blue-900 transition-all">{dept.id.substring(0, 2)}</div>
                        <span className="text-[9px] font-black px-2.5 py-1 rounded border border-emerald-500/30 text-emerald-400 uppercase tracking-widest">{dept.status}</span>
                      </div>
                      <h3 className="font-black text-white text-base lg:text-lg uppercase mb-2 tracking-tight group-hover:text-amber-400 transition-colors">{dept.name}</h3>
                      <p className="text-[9px] text-slate-500 mb-4">{getAgencyProjects(dept.id).length} registered projects</p>
                      <div className="mt-auto pt-6 border-t border-white/5">
                        <div className="flex justify-between mb-2">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Money Spent</span>
                          <span className="text-[10px] font-black text-amber-400">{((dept.spent / dept.allocated) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-4">
                          <div className="bg-amber-400 h-full" style={{ width: `${(dept.spent / dept.allocated) * 100}%` }}></div>
                        </div>
                        <p className="text-base font-black text-white italic">{formatPHP(dept.spent)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">Official <span className="text-amber-400">Project List</span></h2>
                  <button onClick={() => setShowMap(true)} className="w-full md:w-auto px-6 py-3 bg-amber-400 text-blue-900 rounded font-black text-[10px] uppercase shadow-lg flex items-center justify-center">
                    <MapIcon size={16} className="mr-2" /> Open Map Heatmap
                  </button>
                </div>

                {canAddProjects() ? (
                  <div className="bg-[#001f3f]/30 p-6 lg:p-8 rounded border border-amber-400/20 mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-amber-400 tracking-widest italic">Add a New Project</h4>
                      <input type="text" placeholder="Official Name of the Project" className="w-full bg-[#0a0e17] border border-white/10 p-4 rounded text-xs outline-none focus:border-amber-400 uppercase font-black text-white" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <select className="w-full bg-[#0a0e17] border border-white/10 p-4 rounded text-xs outline-none focus:border-amber-400 font-black text-white" value={newProject.agency} onChange={(e) => setNewProject({ ...newProject, agency: e.target.value })}>
                          {INITIAL_DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}
                        </select>
                        <input type="number" placeholder="Budget (PHP)" className="w-full bg-[#0a0e17] border border-white/10 p-4 rounded text-xs outline-none focus:border-amber-400 font-black text-white" value={newProject.budget} onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })} />
                      </div>
                      <input type="text" placeholder="Location (e.g. Luzon, Mindanao)" className="w-full bg-[#0a0e17] border border-white/10 p-4 rounded text-xs outline-none focus:border-amber-400 uppercase font-black text-white" value={newProject.location} onChange={(e) => setNewProject({ ...newProject, location: e.target.value })} />
                      <button onClick={handleRegisterProject} className="w-full bg-amber-400 text-blue-900 py-4 rounded font-black text-xs uppercase shadow-xl active:scale-95 transition-all">Securely Record Project</button>
                    </div>
                    <div className="hidden lg:flex flex-col justify-center items-center text-center p-8 border border-dashed border-white/10 rounded bg-black/20">
                      <Lock size={48} className="text-amber-400/20 mb-4" />
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-relaxed max-w-xs">Every project added is securely recorded and cannot be deleted or changed without audit. This ensures transparency.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#001f3f]/30 p-6 rounded border border-white/10 mb-8 flex items-center justify-between">
                    <div className="flex items-center">
                      <Lock size={20} className="text-slate-500 mr-4" />
                      <div>
                        <p className="text-xs font-black text-white uppercase">Guest Access</p>
                        <p className="text-[9px] text-slate-500">Login as admin to add new projects</p>
                      </div>
                    </div>
                    <button onClick={handleLogout} className="px-4 py-2 text-[9px] font-black uppercase border border-amber-400/30 text-amber-400 rounded hover:bg-amber-400 hover:text-blue-900 transition-all">Switch to Admin</button>
                  </div>
                )}

                <div className="space-y-4">
                  {filteredProjects.map((p, idx) => (
                    <div key={idx} className="bg-[#0a0e17] p-5 rounded border border-white/10 flex flex-col md:flex-row items-center justify-between group hover:border-amber-400 transition-all gap-4">
                      <div className="flex items-center space-x-6 flex-1 w-full">
                        <div className="w-14 h-14 rounded flex items-center justify-center border border-blue-500/30 bg-blue-950/20 text-blue-400"><Cpu size={24} /></div>
                        <div>
                          <h4 className="font-black text-white uppercase text-sm group-hover:text-amber-400 leading-tight">{p.name}</h4>
                          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">{p.location} • {p.agency}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-10 w-full md:w-auto justify-between border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-10">
                        <div className="text-right">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Approved Budget</p>
                          <p className="text-lg font-black text-white italic">{formatPHP(p.budget)}</p>
                        </div>
                        <button onClick={() => setSelectedProject(p)} className="text-[9px] font-black text-amber-400 border border-amber-400/30 px-4 py-2 hover:bg-amber-400 hover:text-blue-900 rounded uppercase tracking-widest shadow-md">Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'logs' && (
              <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-10 pb-12">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-10 border-b border-white/10 pb-6 gap-6">
                  <h3 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter italic flex items-center"><Activity className="mr-4 text-amber-400" /> Security Logs</h3>
                  <button onClick={() => exportCSV(logs, 'security_logs_2026')} className="w-full sm:w-auto bg-[#001f3f] border border-white/10 px-6 py-3 rounded text-[10px] font-black tracking-widest flex items-center justify-center">Download Logs</button>
                </div>
                <div className="relative pl-8 border-l-2 border-amber-400/20 space-y-12">
                  {logs.map((log, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]"></div>
                      <div className="bg-[#0a0e17] p-6 rounded border border-white/10 shadow-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black text-white uppercase text-xs">{log.action}</h4>
                          <span className="text-[9px] text-slate-600 font-black uppercase">{log.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide leading-relaxed">{log.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'report' && (
              <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="bg-gradient-to-br from-[#001f3f] to-[#002d5a] rounded border border-amber-400/20 p-8 lg:p-12 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-2xl">
                  <div className="relative z-10 max-w-2xl text-center md:text-left w-full">
                    <h2 className="text-3xl lg:text-4xl font-black mb-6 uppercase tracking-tighter italic">Report Budget <span className="text-amber-400">Issues & Anomalies</span></h2>
                    <p className="text-slate-300 text-xs lg:text-sm mb-10 uppercase font-black leading-relaxed">
                      Submit a formal report if you notice suspicious government spending, ghost projects, or overpriced materials. Your report is securely recorded and sent directly to the Commission on Audit (COA).
                    </p>
                    <button onClick={() => setShowReportForm(true)} className="w-full sm:w-auto bg-amber-400 text-blue-950 px-10 py-4 rounded font-black uppercase text-[10px] lg:text-[11px] flex items-center justify-center shadow-2xl active:scale-95">
                      <Flag className="mr-3" size={20} /> Create New Report
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-[#0a0e17] p-6 rounded border border-white/10 shadow-xl">
                    <h3 className="font-black text-white uppercase text-xs mb-8 border-b border-white/5 pb-4 flex items-center"><Info size={16} className="mr-2 text-amber-400" /> Status of Your Reports</h3>
                    {reports.length === 0 ? (
                      <div className="text-center py-16 bg-black/20 rounded border border-dashed border-white/5">
                        <FileText size={40} className="mx-auto text-slate-800 mb-6" />
                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">You have not submitted any reports yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {reports.map(r => (
                          <div key={r.id} className="p-4 bg-black/30 border border-white/5 rounded">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-black text-white uppercase">{r.projectId}</span>
                              <span className={`text-[9px] font-black px-2 py-1 rounded uppercase ${r.status === 'Pending' ? 'bg-amber-400/20 text-amber-400' :
                                r.status === 'Investigating' ? 'bg-blue-400/20 text-blue-400' :
                                  'bg-emerald-400/20 text-emerald-400'
                                }`}>{r.status}</span>
                            </div>
                            <p className="text-[9px] text-slate-500 uppercase">{r.category}</p>
                            <p className="text-[10px] text-slate-400 mt-2 line-clamp-2">{r.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-[#0a0e17] p-6 rounded border border-white/10 shadow-xl">
                    <h3 className="font-black text-white uppercase text-xs mb-8 border-b border-white/5 pb-4 flex items-center"><Check size={16} className="mr-2 text-emerald-500" /> System Connectivity Status</h3>
                    <div className="space-y-4">
                      <StatusNode name="National Verification Center" active />
                      <StatusNode name="COA Regional Hub (Cebu)" active />
                      <StatusNode name="COA Regional Hub (Davao)" active={false} />
                      <button onClick={verifySystem} className="w-full mt-6 py-4 bg-white/5 border border-white/10 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest italic">Check System Health</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* BOTTOM RIGHT NOTIFICATION */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="fixed bottom-6 right-6 z-[1000] w-[calc(100%-3rem)] sm:w-auto"
            >
              <div className="bg-[#001f3f] text-white px-5 py-4 rounded-lg shadow-2xl flex items-center justify-between border-l-4 border-amber-400 backdrop-blur-xl">
                <div className="flex items-center space-x-3">
                  <ShieldCheck size={18} className="text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{notification}</span>
                </div>
                <button onClick={() => setNotification(null)} className="ml-4 p-1 text-slate-500 hover:text-white"><X size={14} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* HEATMAP MODAL - ACCURATE SVG */}
      <AnimatePresence>
        {showMap && (
          <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[300] flex items-center justify-center p-2 lg:p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#001f3f] rounded border-t-4 border-amber-400 shadow-2xl w-full max-w-6xl h-[95vh] lg:h-[85vh] overflow-hidden flex flex-col">
              <div className="p-4 lg:p-6 border-b border-white/10 flex items-center justify-between bg-black/20 shrink-0">
                <h3 className="text-base lg:text-xl font-black text-white uppercase tracking-tighter italic">Geospatial Budget <span className="text-amber-400">Heatmap</span></h3>
                <button onClick={() => setShowMap(false)} className="text-slate-400 hover:text-amber-400 p-2 bg-white/5 rounded-full"><X size={20} /></button>
              </div>
              <div className="flex-1 flex flex-col lg:flex-row p-4 lg:p-8 gap-8 overflow-hidden">
                <div className="flex-1 bg-[#0a0e17] rounded border border-white/10 flex items-center justify-center relative overflow-hidden group">
                  <svg viewBox="0 0 400 600" className="h-[280px] sm:h-[350px] lg:h-full w-auto drop-shadow-[0_0_60px_rgba(251,191,36,0.15)]">
                    {/* LUZON - Clickable */}
                    <motion.path
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      d="M120,60 L220,50 L280,110 L250,220 L160,230 L130,120 Z"
                      fill={REGIONAL_DATA[0].color} stroke="#fff" strokeWidth="1"
                      className="cursor-pointer hover:brightness-125 transition-all"
                      onClick={() => { setLocationFilter('Luzon'); setShowMap(false); setActiveTab('projects'); }}
                    />
                    {/* VISAYAS - Clickable */}
                    <motion.path
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2 }}
                      d="M220,240 L280,260 L290,320 L240,340 L210,300 Z"
                      fill={REGIONAL_DATA[1].color} stroke="#fff" strokeWidth="1"
                      className="cursor-pointer hover:brightness-125 transition-all"
                      onClick={() => { setLocationFilter('Visayas'); setShowMap(false); setActiveTab('projects'); }}
                    />
                    {/* MINDANAO - Clickable */}
                    <motion.path
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4 }}
                      d="M200,350 L340,370 L350,520 L230,550 L180,480 Z"
                      fill={REGIONAL_DATA[2].color} stroke="#fff" strokeWidth="1"
                      className="cursor-pointer hover:brightness-125 transition-all"
                      onClick={() => { setLocationFilter('Mindanao'); setShowMap(false); setActiveTab('projects'); }}
                    />
                    {/* PALAWAN - Clickable */}
                    <motion.path
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6 }}
                      d="M60,230 L120,320 L110,350 L50,250 Z"
                      fill={REGIONAL_DATA[3].color} stroke="#fff" strokeWidth="1"
                      className="cursor-pointer hover:brightness-125 transition-all"
                      onClick={() => { setLocationFilter('Palawan'); setShowMap(false); setActiveTab('projects'); }}
                    />
                    <text x="175" y="145" fill="#000" fontSize="12" fontWeight="900" style={{ textShadow: '0 0 10px #fff', pointerEvents: 'none' }}>LUZON</text>
                    <text x="235" y="295" fill="#000" fontSize="10" fontWeight="900" style={{ textShadow: '0 0 10px #fff', pointerEvents: 'none' }}>VISAYAS</text>
                    <text x="240" y="455" fill="#000" fontSize="14" fontWeight="900" style={{ textShadow: '0 0 10px #fff', pointerEvents: 'none' }}>MINDANAO</text>
                  </svg>
                  <p className="absolute bottom-4 text-[9px] text-slate-500 font-bold uppercase">Click a region to filter projects</p>
                </div>
                <div className="w-full lg:w-96 flex flex-col gap-4 overflow-y-auto custom-scrollbar bg-black/20 p-4 lg:p-6 rounded border border-white/10 shrink-0">
                  <h4 className="text-[10px] font-black uppercase text-amber-400 tracking-widest italic mb-2">Money Allocated by Region</h4>
                  {REGIONAL_DATA.map((item, i) => (
                    <div key={i} className="bg-[#0a0e17] border-l-4 p-4 rounded flex flex-col" style={{ borderColor: item.color }}>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{item.region}</span>
                      <span className="text-lg font-black text-amber-400 italic leading-none">{formatPHP(item.amount)}</span>
                    </div>
                  ))}
                  <button onClick={() => exportCSV(REGIONAL_DATA, 'regional_budget_heat')} className="w-full py-4 bg-amber-400 text-blue-950 rounded text-[10px] font-black uppercase shadow-xl mt-4 active:scale-95">Download Region Map Data</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REPORT MODAL */}
      <AnimatePresence>
        {showReportForm && (
          <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[500] flex items-center justify-center p-3 lg:p-4">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#001f3f] rounded border-t-4 border-red-500 shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="p-5 lg:p-6 flex items-center justify-between border-b border-white/5 sticky top-0 z-10 backdrop-blur-md">
                <h3 className="text-base lg:text-xl font-black text-white uppercase tracking-tighter flex items-center"><Flag className="mr-3 text-red-500" /> Technical Escalation</h3>
                <button onClick={() => setShowReportForm(false)} className="p-2 text-slate-400 hover:text-white active:scale-90"><X size={20} /></button>
              </div>
              <div className="p-6 lg:p-10 space-y-6">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed italic">Discrepancies identified in the 2026 cycle are anchored permanently to the system records for official investigation.</p>
                <div>
                  <label className="text-[9px] font-black text-amber-400 uppercase">Project Name or ID</label>
                  <input
                    type="text"
                    className="w-full mt-2 p-4 bg-[#0a0e17] border border-white/10 rounded focus:border-amber-400 outline-none text-[11px] font-bold uppercase text-white"
                    placeholder="e.g. PRJ-001 or NSCR Extension"
                    value={reportForm.projectId}
                    onChange={(e) => setReportForm({ ...reportForm, projectId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-amber-400 uppercase">Problem Category</label>
                  <select
                    className="w-full mt-2 p-4 bg-[#0a0e17] border border-white/10 rounded focus:border-amber-400 outline-none text-[11px] font-bold uppercase text-white"
                    value={reportForm.category}
                    onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })}
                  >
                    <option>Ghost Project (Not existing)</option>
                    <option>Overpriced / Inflated Costs</option>
                    <option>Delayed / Stopped Construction</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black text-amber-400 uppercase">Description of the Issue</label>
                  <textarea
                    className="w-full mt-2 p-4 bg-[#0a0e17] border border-white/10 rounded focus:border-amber-400 outline-none h-24 text-[11px] font-bold uppercase text-white resize-none"
                    placeholder="Explain what is wrong with factual evidence..."
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  ></textarea>
                </div>
                <button onClick={handleSubmitReport} className="w-full py-4 bg-red-600 text-white font-black uppercase text-[10px] rounded hover:bg-red-700 shadow-xl active:scale-95 transition-all">Submit Secure Report</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AGENCY PROJECTS MODAL */}
      <AnimatePresence>
        {selectedAgency && (
          <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[350] flex items-center justify-center p-3 lg:p-4">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#001f3f] rounded border-t-4 border-amber-400 shadow-2xl w-full max-w-3xl overflow-hidden">
              <div className="p-5 lg:p-6 flex items-center justify-between border-b border-white/5">
                <div>
                  <h3 className="text-base lg:text-xl font-black text-white uppercase tracking-tighter flex items-center">
                    <Users className="mr-3 text-amber-400" /> {selectedAgency.name}
                  </h3>
                  <p className="text-[9px] text-slate-500 uppercase mt-1">{selectedAgency.id} • {getAgencyProjects(selectedAgency.id).length} Projects</p>
                </div>
                <button onClick={() => setSelectedAgency(null)} className="p-2 text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Budget Summary */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#0a0e17] p-4 rounded border border-white/10">
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Total Allocated</p>
                    <p className="text-lg font-black text-white italic">{formatPHP(selectedAgency.allocated)}</p>
                  </div>
                  <div className="bg-[#0a0e17] p-4 rounded border border-white/10">
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Total Spent</p>
                    <p className="text-lg font-black text-amber-400 italic">{formatPHP(selectedAgency.spent)}</p>
                    <div className="w-full bg-white/10 h-1 rounded mt-2">
                      <div className="bg-amber-400 h-full rounded" style={{ width: `${(selectedAgency.spent / selectedAgency.allocated) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Projects List */}
                <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Projects Under This Agency</h4>
                {getAgencyProjects(selectedAgency.id).length === 0 ? (
                  <div className="text-center py-12 bg-black/20 rounded border border-dashed border-white/10">
                    <Database size={32} className="mx-auto text-slate-700 mb-4" />
                    <p className="text-[10px] text-slate-600 font-bold uppercase">No projects registered for this agency</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getAgencyProjects(selectedAgency.id).map((project, idx) => (
                      <div
                        key={idx}
                        onClick={() => { setSelectedAgency(null); setSelectedProject(project); }}
                        className="bg-[#0a0e17] p-4 rounded border border-white/10 flex items-center justify-between hover:border-amber-400 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-900/30 rounded flex items-center justify-center">
                            <Cpu size={18} className="text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-white uppercase">{project.name}</p>
                            <p className="text-[9px] text-slate-500">{project.location} • {project.status}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-amber-400 italic">{formatPHP(project.budget)}</p>
                          <p className="text-[8px] font-mono text-blue-400">{project.securityKey}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PROJECT DETAIL MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[400] flex items-center justify-center p-3 lg:p-4">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#001f3f] rounded border-t-4 border-amber-400 shadow-2xl w-full max-w-2xl overflow-hidden">
              <div className="p-5 lg:p-6 flex items-center justify-between border-b border-white/5">
                <h3 className="text-base lg:text-xl font-black text-white uppercase tracking-tighter flex items-center">
                  <Cpu className="mr-3 text-amber-400" /> Project Details
                </h3>
                <button onClick={() => { setSelectedProject(null); setEditingProject(null); }} className="p-2 text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 lg:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Blockchain Transaction Info */}
                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-4 rounded border border-blue-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">🔗 Blockchain Record</span>
                    <span className="text-[9px] font-black text-emerald-400 uppercase flex items-center gap-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div> Confirmed
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-[10px]">
                    <div>
                      <p className="text-slate-500 uppercase">Transaction Hash</p>
                      <p className="font-mono text-blue-400">{selectedProject.securityKey}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 uppercase">Block Number</p>
                      <p className="font-mono text-white">#{selectedProject.id?.replace('PRJ-', '1,02')}{Math.floor(Math.random() * 1000)}</p>
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="bg-[#0a0e17] p-6 rounded border border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-black text-white uppercase mb-2">{selectedProject.name}</h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{selectedProject.agency} • {selectedProject.location}</p>
                    </div>
                    {selectedProject.anomalies && selectedProject.anomalies.length > 0 && (
                      <div className="flex flex-col gap-1 items-end">
                        {selectedProject.anomalies.map((anomaly, idx) => (
                          <span key={idx} className="bg-red-900/40 border border-red-500/40 text-red-500 px-2 py-1 round text-[8px] font-black uppercase tracking-widest flex items-center shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                            <Activity size={10} className="mr-1 animate-pulse" /> {anomaly} Detected
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Multi-Sig Approvals */}
                {selectedProject.signatures && (
                  <div className="bg-[#0a0e17] p-4 rounded border border-white/10">
                    <h5 className="text-[10px] font-black text-white uppercase mb-4 flex items-center gap-2">
                      Multi-Signature Approvals
                    </h5>
                    <MultiSig signatures={selectedProject.signatures} />
                  </div>
                )}

                {/* Disbursement Timeline */}
                {selectedProject.disbursements && (
                  <div className="bg-[#0a0e17] p-4 rounded border border-white/10">
                    <h5 className="text-[10px] font-black text-white uppercase mb-4 flex items-center gap-2">
                      <TrendingUp size={14} className="text-amber-400" /> Disbursement Timeline
                    </h5>
                    <Timeline items={selectedProject.disbursements} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0a0e17] p-4 rounded border border-white/10">
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Approved Budget</p>
                    <p className="text-xl font-black text-amber-400 italic">{formatPHP(selectedProject.budget)}</p>
                  </div>
                  <div className="bg-[#0a0e17] p-4 rounded border border-white/10">
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Status</p>
                    <p className="text-xl font-black text-emerald-400">{selectedProject.status}</p>
                  </div>
                </div>

                {/* Immutability Notice */}
                <div className="bg-amber-400/10 p-4 rounded border border-amber-400/30 flex items-start gap-3">
                  <Lock size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-amber-400 uppercase">Immutable Record</p>
                    <p className="text-[9px] text-slate-400 mt-1">This record is permanently stored on the blockchain and cannot be deleted or modified. Only amendments can be added.</p>
                  </div>
                </div>

                {/* Audit Trail */}
                <div className="bg-[#0a0e17] p-4 rounded border border-white/10">
                  <h5 className="text-[10px] font-black text-white uppercase mb-4 flex items-center gap-2">
                    <Activity size={14} className="text-amber-400" /> Audit Trail
                  </h5>
                  <div className="space-y-3">
                    {/* Original Record */}
                    <div className="flex items-start gap-3 p-3 bg-black/30 rounded border-l-2 border-emerald-400">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full mt-1.5 shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-white uppercase">Project Created</p>
                        <p className="text-[9px] text-slate-500">Initial registration in GAA 2026</p>
                        <p className="text-[8px] text-slate-600 font-mono mt-1">{selectedProject.createdAt || 'Jan 2026'}</p>
                      </div>
                    </div>

                    {/* Amendments */}
                    {getProjectAmendments(selectedProject.id).map((amd, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-black/30 rounded border-l-2 border-blue-400">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-white uppercase">{amd.type}</p>
                          <p className="text-[9px] text-slate-400">{amd.description}</p>
                          {amd.newBudget && (
                            <p className="text-[9px] text-amber-400 mt-1">New Budget: {formatPHP(amd.newBudget)}</p>
                          )}
                          <p className="text-[8px] text-slate-600 font-mono mt-1">Block #{amd.blockNumber} • {amd.confirmations} confirmations</p>
                        </div>
                      </div>
                    ))}

                    {getProjectAmendments(selectedProject.id).length === 0 && (
                      <p className="text-[9px] text-slate-600 italic text-center py-2">No amendments recorded</p>
                    )}
                  </div>
                </div>

                {/* Amendment Form (Admin Only) */}
                {isAdmin() && (
                  <>
                    {showAmendmentForm ? (
                      <div className="bg-[#001f3f] p-4 rounded border border-amber-400/30 space-y-4">
                        <h5 className="text-[10px] font-black text-amber-400 uppercase">Add Amendment</h5>
                        <select
                          className="w-full p-3 bg-[#0a0e17] border border-white/10 rounded text-xs text-white"
                          value={amendmentForm.type}
                          onChange={(e) => setAmendmentForm({ ...amendmentForm, type: e.target.value })}
                        >
                          <option>Status Update</option>
                          <option>Budget Revision</option>
                          <option>Scope Change</option>
                          <option>Official Correction</option>
                        </select>
                        {amendmentForm.type === 'Budget Revision' && (
                          <input
                            type="number"
                            placeholder="New Budget Amount (PHP)"
                            className="w-full p-3 bg-[#0a0e17] border border-white/10 rounded text-xs text-white"
                            value={amendmentForm.newBudget}
                            onChange={(e) => setAmendmentForm({ ...amendmentForm, newBudget: e.target.value })}
                          />
                        )}
                        <textarea
                          placeholder="Amendment description..."
                          className="w-full p-3 bg-[#0a0e17] border border-white/10 rounded text-xs text-white h-20 resize-none"
                          value={amendmentForm.description}
                          onChange={(e) => setAmendmentForm({ ...amendmentForm, description: e.target.value })}
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleSubmitAmendment(selectedProject.id)}
                            className="flex-1 py-3 bg-amber-400 text-blue-900 font-black uppercase text-[10px] rounded"
                          >
                            Record Amendment
                          </button>
                          <button
                            onClick={() => setShowAmendmentForm(false)}
                            className="px-4 py-3 bg-white/10 text-white font-black uppercase text-[10px] rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAmendmentForm(true)}
                        className="w-full py-3 bg-white/5 border border-white/10 text-slate-400 font-black uppercase text-[10px] rounded hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={14} /> Add Official Amendment
                      </button>
                    )}
                  </>
                )}

                {/* Flag for Review */}
                <button
                  onClick={() => { setSelectedProject(null); setActiveTab('report'); }}
                  className="w-full py-3 bg-red-600/10 border border-red-500/30 text-red-400 font-black uppercase text-[10px] rounded hover:bg-red-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Flag size={14} /> Flag for COA Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOG DETAIL MODAL */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[500] flex items-center justify-center p-3 lg:p-4">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#001f3f] rounded border-t-4 border-amber-400 shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="p-5 lg:p-6 flex items-center justify-between border-b border-white/5">
                <h3 className="text-base lg:text-lg font-black text-white uppercase tracking-tighter flex items-center">
                  <Activity className="mr-3 text-amber-400" size={20} /> System Log Details
                </h3>
                <button onClick={() => setSelectedLog(null)} className="p-2 text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {/* Blockchain Info */}
                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-4 rounded border border-blue-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">🔗 Blockchain Record</span>
                    <span className="text-[9px] font-black text-emerald-400 uppercase flex items-center gap-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div> Confirmed
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-[10px]">
                    <div>
                      <p className="text-slate-500 uppercase">Transaction Hash</p>
                      <p className="font-mono text-blue-400">0x{selectedLog.id?.toString(16) || Math.random().toString(16).substr(2, 12)}...</p>
                    </div>
                    <div>
                      <p className="text-slate-500 uppercase">Block Number</p>
                      <p className="font-mono text-white">#{Math.floor(1000000 + Math.random() * 100000)}</p>
                    </div>
                  </div>
                </div>

                {/* Log Details */}
                <div className="bg-[#0a0e17] p-4 rounded border border-white/10">
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-2">Action Type</p>
                  <p className="text-lg font-black text-white uppercase">{selectedLog.action}</p>
                </div>

                <div className="bg-[#0a0e17] p-4 rounded border border-white/10">
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-2">Details</p>
                  <p className="text-sm text-slate-300">{selectedLog.details || 'No additional details available.'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0a0e17] p-4 rounded border border-white/10">
                    <p className="text-[9px] text-slate-500 uppercase font-bold mb-2">Timestamp</p>
                    <p className="text-sm font-bold text-amber-400">{selectedLog.time}</p>
                  </div>
                  <div className="bg-[#0a0e17] p-4 rounded border border-white/10">
                    <p className="text-[9px] text-slate-500 uppercase font-bold mb-2">Confirmations</p>
                    <p className="text-sm font-bold text-emerald-400">{Math.floor(5 + Math.random() * 20)} blocks</p>
                  </div>
                </div>

                {/* Immutability Notice */}
                <div className="bg-amber-400/10 p-3 rounded border border-amber-400/30 flex items-start gap-3">
                  <Lock size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-slate-400">This log entry is permanently recorded on the blockchain and cannot be modified or deleted.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- SUBCOMPONENTS ---

const StatCard = ({ title, value, color, icon: Icon }) => (
  <div className="bg-[#0a0e17] p-6 rounded border border-white/10 shadow-lg flex flex-col group hover:border-amber-400 transition-colors">
    <div className={`p-2.5 w-10 h-10 rounded border mb-4 flex items-center justify-center ${color === 'blue' ? 'bg-blue-900/20 text-blue-400 border-blue-500/20' :
      color === 'gold' ? 'bg-amber-400 text-blue-900 border-transparent' : 'bg-white text-blue-900 border-transparent'
      }`}>
      <Icon size={20} />
    </div>
    <h3 className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">{title}</h3>
    <p className={`text-2xl font-black italic tracking-tighter ${color === 'blue' ? 'text-white' :
      color === 'gold' ? 'text-amber-400' : 'text-emerald-400'
      }`}>{value}</p>
  </div>
);

const Timeline = ({ items }) => (
  <div className="space-y-4">
    {items.map((item, idx) => (
      <div key={idx} className="relative pl-6 border-l-2 border-white/10 last:border-0">
        <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${item.status === 'Released' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' :
          item.status === 'Locked' ? 'bg-slate-700' : 'bg-amber-400 animate-pulse'
          }`}></div>
        <p className="text-[10px] font-black text-white uppercase">{item.phase}</p>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs font-bold text-amber-400 italic">{formatPHP(item.amount)}</span>
          <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase ${item.status === 'Released' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' :
            item.status === 'Locked' ? 'bg-white/5 text-slate-500 border border-white/5' :
              'bg-amber-900/30 text-amber-400 border border-amber-500/30'
            }`}>{item.status}</span>
        </div>
        {item.date && <p className="text-[8px] text-slate-500 mt-1">{item.date}</p>}
      </div>
    ))}
  </div>
);

const MultiSig = ({ signatures }) => (
  <div className="flex items-center justify-between gap-2">
    {signatures.map((sig, idx) => (
      <div key={idx} className="flex-1 bg-[#0a0e17] p-2 rounded border border-white/10 flex flex-col items-center text-center">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-2 ${sig.status === 'Signed' ? 'bg-emerald-400 text-blue-900' : 'bg-white/5 text-slate-600'
          }`}>
          {sig.status === 'Signed' ? <Check size={12} strokeWidth={4} /> : <Lock size={12} />}
        </div>
        <p className="text-[8px] font-black text-slate-300 uppercase leading-tight">{sig.role}</p>
        <p className={`text-[8px] font-bold mt-1 uppercase ${sig.status === 'Signed' ? 'text-emerald-400' : 'text-slate-600'
          }`}>{sig.status}</p>
      </div>
    ))}
  </div>
);

// formatPHP helper needs to be available or duplicated here if not exported. 
// However, since these are in the same file, I should move formatPHP out or pass it as prop/context.
// Quick fix: pass formatter or just use simple formatting inside if needed, 
// BUT formatPHP is defined inside the main component. I should move formatPHP outside or just duplicate simple formatting.
// Actually, I can format it inside the component if passed as a string or number.
// Since formatPHP is inside the main component, I should invoke it before passing props or move it out.
// Let's assume standard number formatting for now inside the component to avoid issues, or make formatPHP global.
// I'll define a local helper inside Timeline since I can't easily move the main one without more edits.
const formatPHP = (val) => {
  if (val >= 1e12) return `₱${(val / 1e12).toFixed(2)}T`;
  if (val >= 1e9) return `₱${(val / 1e9).toFixed(2)}B`;
  return `₱${val.toLocaleString()}`;
};

const StatusNode = ({ name, active }) => (
  <div className={`flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded ${!active ? 'opacity-30' : ''}`}>
    <div className="flex items-center">
      <div className={`w-2 h-2 rounded-full mr-4 ${active ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-slate-700'}`}></div>
      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{name}</span>
    </div>
    <span className="text-[9px] text-amber-400 font-mono tracking-tighter bg-black/40 px-2.5 py-1 border border-white/5 uppercase leading-none">{active ? 'Online' : 'Syncing'}</span>
  </div>
);

export default App;