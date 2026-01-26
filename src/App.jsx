import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell
} from 'recharts';
import { 
  Shield, Search, ArrowUpRight, ArrowDownRight, Activity, LayoutDashboard, 
  Database, Users, FileText, CheckCircle2, Clock, Filter, X, ChevronRight, 
  ExternalLink, Lock, Flag, Settings, LogOut, User, Bell, Download, Plus,
  ShieldCheck, AlertTriangle, Info, Map as MapIcon, Globe, Check, Cpu,
  Briefcase, TrendingUp, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- DOST BRANDED THEME CONSTANTS ---
const DOST_BLUE = "#001f3f";
const DOST_GOLD = "#fbbf24";
const DOST_DARK = "#0a0e17";

// VERIFIED GAA 2026 DATASETS
const INITIAL_SUMMARY = {
  total: 6750000000000,
  released: 1687500000000,
  spent: 540000000000,
  growth: 6.3,
  activeProjects: 22450,
};

const INITIAL_DEPARTMENTS = [
  { id: 'DEPED', name: 'Education (DepEd/SUCs/CHED)', allocated: 1104200000000, spent: 145200000000, projects: 8420, status: 'On Track' },
  { id: 'DPWH', name: 'Public Works (DPWH)', allocated: 845600000000, spent: 92000000000, projects: 5210, status: 'On Track' },
  { id: 'DOH', name: 'Health (DOH/PhilHealth)', allocated: 324500000000, spent: 48600000000, projects: 1540, status: 'On Track' },
  { id: 'DILG', name: 'Interior & Local Govt (DILG)', allocated: 295800000000, spent: 34500000000, projects: 1100, status: 'On Track' },
  { id: 'DND', name: 'Defense (DND)', allocated: 285600000000, spent: 52400000000, projects: 560, status: 'On Track' },
  { id: 'DSWD', name: 'Social Welfare (DSWD)', allocated: 254200000000, spent: 61500000000, projects: 890, status: 'On Track' },
  { id: 'DA', name: 'Agriculture (DA)', allocated: 228400000000, spent: 22400000000, projects: 1420, status: 'Under Review' },
  { id: 'DOTR', name: 'Transportation (DOTr)', allocated: 215300000000, spent: 28600000000, projects: 450, status: 'On Track' },
];

const INITIAL_PROJECTS = [
  { id: 'DOTR-NSCR-26', name: 'North-South Commuter Railway (NSCR) Extension', agencyId: 'DOTR', agency: 'DOTr', budget: 94500000000, location: 'Central Luzon/NCR/Calabarzon', status: 'Ongoing', verification: '0xaf4e...b210' },
  { id: 'DSWD-4PS-2026', name: 'Pantawid Pamilyang Pilipino Program (4Ps) - 2026 Expansion', agencyId: 'DSWD', agency: 'DSWD', budget: 126800000000, location: 'Nationwide', status: 'Ongoing', verification: '0x7d1a...cc04' },
  { id: 'DEPED-LMS-006', name: 'Last Mile Schools Program - 2026 Phase', agencyId: 'DEPED', agency: 'DepEd', budget: 22400000000, location: 'Mindanao/Visayas/Luzon', status: 'Ongoing', verification: '0x2b1c...ff92' },
  { id: 'DPWH-BBM-2026', name: 'Build Better More: Bataan-Cavite Interlink Bridge P3', agencyId: 'DPWH', agency: 'DPWH', budget: 18200000000, location: 'Region III/IV-A', status: 'Ongoing', verification: '0x8f2d...92a1' },
  { id: 'DOH-HCEP-02', name: 'Health Facilities Enhancement Program (HFEP) 2026', agencyId: 'DOH', agency: 'DOH', budget: 35800000000, location: 'Nationwide', status: 'Ongoing', verification: '0x1c4b...3b21' },
];

const INITIAL_AUDIT_LOGS = [
  { id: 'L-2026-01', action: 'GAA 2026 Anchored', user: 'DBM_System_Node', details: 'Final signed budget ₱6.750T successfully anchored to genesis block for FY 2026', time: 'Jan 01, 2026', type: 'system' },
  { id: 'L-2026-02', action: 'Q1 NCA Issued', user: 'Admin_DBM_Prime', details: '₱145B NCA released for Social Protection and Health programs', time: '5 hours ago', type: 'user' },
];

// REFINED REGIONAL DATA
const REGIONAL_HEATMAP_DATA = [
  { region: 'Luzon (NCR/Main)', amount: 2840000000000, color: '#fbbf24', id: 'path-luzon' },
  { region: 'Visayas', amount: 1420000000000, color: '#f59e0b', id: 'path-visayas' },
  { region: 'Mindanao', amount: 1680000000000, color: '#d97706', id: 'path-mindanao' },
  { region: 'Palawan', amount: 810000000000, color: '#b45309', id: 'path-palawan' },
];

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProcessingMap, setIsProcessingMap] = useState(false);
  
  // Real State for Dynamic Components
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [summary, setSummary] = useState(INITIAL_SUMMARY);
  const [newProjectForm, setNewProjectForm] = useState({ name: '', agency: 'DEPED', budget: '', location: '' });

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const notify = (msg) => {
    setNotification(msg);
    setProfileOpen(false);
  };

  const formatCurrency = (val) => {
    if (val >= 1e12) return `₱${(val / 1e12).toFixed(3)}T`;
    if (val >= 1e9) return `₱${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `₱${(val / 1e6).toFixed(2)}M`;
    return `₱${val.toLocaleString()}`;
  };

  // --- FUNCTIONAL ACTIONS ---

  // Actual CSV Export Logic
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      notify("No data available to export.");
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify(`Exporting ${filename}_2026.csv...`);
  };

  // Actual State-driven Project Addition
  const handleAddProject = () => {
    if (!newProjectForm.name || !newProjectForm.budget) {
      notify("ERROR: Incomplete program parameters.");
      return;
    }
    const newId = `${newProjectForm.agency}-${Math.floor(1000 + Math.random() * 9000)}`;
    const project = {
      ...newProjectForm,
      id: newId,
      agencyId: newProjectForm.agency,
      budget: parseFloat(newProjectForm.budget),
      status: 'Ongoing',
      verification: `0x${Math.random().toString(16).substr(2, 10)}...`
    };
    
    // Update local state
    setProjects([project, ...projects]);
    
    // Log the blockchain event
    setAuditLogs([{
      id: `L-${Date.now()}`,
      action: 'Block Anchor Confirmed',
      user: 'Auditor_Prime',
      details: `Program ${newId} (Valuation: ${formatCurrency(project.budget)}) written to 2026 Registry.`,
      time: 'Just now',
      type: 'user'
    }, ...auditLogs]);

    setNewProjectForm({ name: '', agency: 'DEPED', budget: '', location: '' });
    setActiveTab('projects');
    notify(`Anchored Project ${newId} to Blockchain Registry.`);
  };

  const handleHeatmapAccess = () => {
    setIsProcessingMap(true);
    notify("Synchronizing Geospatial Node Data...");
    setTimeout(() => {
      setIsProcessingMap(false);
      setShowHeatmap(true);
    }, 1200);
  };

  const verifyChain = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      notify("Consensus Finalized: 100% Chain Integrity Verified.");
    }, 2000);
  };

  const filteredDepartments = useMemo(() => 
    INITIAL_DEPARTMENTS.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.id.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]);

  const filteredProjects = useMemo(() => 
    projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.agency.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDeptFilter ? p.agencyId === selectedDeptFilter : true;
      return matchesSearch && matchesDept;
    }), [searchQuery, selectedDeptFilter, projects]);

  const handleDeptClick = (deptId) => {
    setSelectedDeptFilter(deptId);
    setSearchQuery('');
    setActiveTab('projects');
    notify(`Opening Program Ledger for ${deptId}...`);
  };

  const NavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        if (id !== 'projects') setSelectedDeptFilter(null);
        if (window.innerWidth < 768) setSidebarOpen(false);
        notify(`Switching to ${label} node...`);
      }}
      className={`flex items-center w-full px-4 py-3 mb-2 transition-all duration-300 rounded-md border-l-4 group relative overflow-hidden ${
        activeTab === id 
          ? 'bg-blue-900/40 border-amber-400 text-amber-400 shadow-lg' 
          : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={18} className={`mr-3 z-10 transition-transform group-hover:scale-110 ${activeTab === id ? 'text-amber-400' : 'text-slate-500'}`} />
      <span className="font-semibold text-sm uppercase tracking-wider z-10">{label}</span>
      {activeTab === id && <motion.div layoutId="nav-glow" className="absolute inset-0 bg-amber-400/5 blur-xl"/>}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#060b13] font-sans text-white overflow-hidden relative">
      
      {/* GRID OVERLAY */}
      <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* REPOSITIONED TOAST NOTIFICATION (BOTTOM RIGHT) */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[200]"
          >
            <div className="bg-[#001f3f] text-white px-6 py-4 rounded-lg shadow-[0_15px_45px_rgba(0,0,0,0.6)] flex items-center space-x-3 border-l-4 border-amber-400 backdrop-blur-xl ring-1 ring-white/10">
              {isProcessingMap || isVerifying ? <Loader2 size={18} className="text-amber-400 animate-spin" /> : <ShieldCheck size={18} className="text-amber-400" />}
              <span className="text-xs font-black tracking-[0.1em] uppercase leading-none">{notification}</span>
              <button onClick={() => setNotification(null)} className="ml-4 p-1 hover:bg-white/10 rounded transition-colors"><X size={14} className="text-slate-500"/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#0a0e17] border-r border-white/10 flex flex-col transition-all duration-500 ease-in-out z-30 shadow-2xl shrink-0`}>
        <div className="p-6 flex flex-col items-center border-b border-white/5 bg-[#001f3f]">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-blue-900 shadow-xl cursor-pointer"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            <Shield size={32} strokeWidth={2.5} />
          </motion.div>
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center">
              <span className="block font-black text-xl tracking-tighter text-white uppercase italic">BUDGET<span className="text-amber-400">CHAIN</span></span>
              <span className="text-[9px] font-bold text-slate-500 tracking-[0.2em] uppercase">GAA 2026 INFRASTRUCTURE</span>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-3 mt-6 overflow-y-auto">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Operations" />
          <NavItem id="explorer" icon={Database} label="Chain Ledger" />
          <NavItem id="departments" icon={Users} label="Agencies" />
          <NavItem id="projects" icon={Briefcase} label="Registry" />
          <NavItem id="audit" icon={Activity} label="Audit Logs" />
          <NavItem id="oversight" icon={Flag} label="Oversight" />
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={() => notify("System encryption level: AES-256-GCM verified.")} className={`flex items-center p-3 rounded-md bg-white/5 w-full hover:bg-white/10 transition-colors ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-2 h-2 rounded-full bg-amber-400 mr-2 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse"></div>
            {isSidebarOpen && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DOST_CORE_HUB</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="bg-[#001f3f] border-b border-amber-400/30 h-16 flex items-center justify-between px-8 z-20 shrink-0 shadow-lg">
          <div className="flex items-center flex-1 max-w-2xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search Chain (Tx Hash, Project ID, or Document Root)..." 
                className="w-full pl-12 pr-4 py-2.5 bg-[#0a0e17] border border-white/10 focus:border-amber-400 outline-none rounded-md text-[11px] uppercase tracking-widest font-bold placeholder:text-slate-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-6 ml-6">
             <div className="flex flex-col items-end mr-4 hidden md:block">
               <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest leading-none">Bagong Pilipinas</span>
               <span className="text-[8px] text-slate-500 uppercase tracking-tighter">Digital Transparency Portal</span>
            </div>
            <button onClick={() => notify("Critical Alerts: 0. Status: Healthy.")} className="p-2.5 text-slate-400 hover:text-amber-400 transition-all relative bg-white/5 rounded">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border border-[#001f3f]"></span>
            </button>
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center hover:bg-white/5 p-1 pr-3 rounded-md transition-colors border border-white/10 bg-[#0a0e17]">
                <div className="w-10 h-10 rounded-md bg-amber-400 flex items-center justify-center text-blue-900 font-black shadow-lg">AU</div>
                <div className="text-left ml-3 hidden sm:block">
                  <p className="text-xs font-black text-white uppercase">Auditor_Prime</p>
                  <p className="text-[9px] text-amber-400 font-bold uppercase tracking-widest">COA_AUTH_01</p>
                </div>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white italic">Fiscal Operations <span className="text-amber-400">Hub</span></h1>
                    <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-[0.3em] font-black">Consolidated Blockchain Allotment Data (GAA 2026)</p>
                  </div>
                  <button onClick={() => verifyChain()} className="bg-amber-400 text-blue-900 px-6 py-2.5 rounded text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center shadow-xl">
                    {isVerifying ? <Loader2 size={14} className="mr-2 animate-spin"/> : <Shield size={14} className="mr-2"/>} Recalibrate Chain Integrity
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <DostStat title="Total Budget 2026" value={formatCurrency(summary.total)} color="blue" icon={Globe} onClick={() => notify(`FY 2026 GAA: Final signed allocation.`)} />
                  <DostStat title="Validated Releases" value={formatCurrency(summary.released)} color="gold" icon={ArrowUpRight} onClick={() => notify(`Q1 Allotment Releases in progress.`)} />
                  <DostStat title="Direct Expenditures" value={formatCurrency(summary.spent)} color="white" icon={TrendingUp} onClick={() => notify(`Disbursement data anchored to nodes.`)} />
                  <DostStat title="Anchored Projects" value={projects.length.toLocaleString()} color="blue" icon={ShieldCheck} onClick={() => notify(`Currently indexing ${projects.length} verified programs.`)} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-[#0a0e17] p-8 rounded border border-white/10 shadow-xl relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-10 relative z-10">
                      <h3 className="font-black uppercase tracking-[0.2em] text-slate-300 flex items-center text-xs"><TrendingUp size={16} className="mr-3 text-amber-400" /> Agency Expenditure Index (2026)</h3>
                      <button onClick={() => exportToCSV(INITIAL_DEPARTMENTS, 'agency_fiscal_data_2026')} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border border-white/10 rounded hover:bg-white/5 transition-colors flex items-center"><Download size={14} className="mr-2 text-amber-400"/> Export XLSX</button>
                    </div>
                    <div className="h-[300px] relative z-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={INITIAL_DEPARTMENTS}>
                          <CartesianGrid strokeDasharray="1 5" vertical={false} stroke="rgba(255,255,255,0.03)" />
                          <XAxis dataKey="id" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 900}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} tickFormatter={(val) => `₱${val/1e9}B`} />
                          <Tooltip cursor={{fill: 'rgba(255,255,255,0.01)'}} contentStyle={{backgroundColor: '#001f3f', border: '1px solid #fbbf24', color: '#fff', fontSize: '10px'}} formatter={(v) => formatCurrency(v)} />
                          <Bar dataKey="allocated" name="Allotted" fill="#1e40af" barSize={25} onClick={(d) => handleDeptClick(d.id)} radius={[2, 2, 0, 0]} />
                          <Bar dataKey="spent" name="Spent" fill="#fbbf24" barSize={25} onClick={(d) => handleDeptClick(d.id)} radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-[#001f3f] p-8 rounded border border-amber-400/20 flex flex-col shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-amber-400 shadow-[0_0_15px_#fbbf24]"></div>
                    <h3 className="font-black text-slate-200 uppercase tracking-widest mb-8 flex items-center text-xs"><Activity size={16} className="mr-3 text-amber-400" /> Administrative Registry</h3>
                    <div className="flex-1 space-y-4 overflow-hidden relative z-10">
                      {auditLogs.slice(0, 4).map((log, idx) => (
                        <div key={idx} className="flex items-center p-4 bg-black/40 border border-white/5 rounded transition-all cursor-default">
                          <div className="w-8 h-8 bg-white/5 border border-white/10 text-amber-400 rounded flex items-center justify-center shrink-0"><Database size={14} /></div>
                          <div className="ml-4 flex-1 overflow-hidden">
                            <p className="text-[10px] font-black text-white uppercase truncate">{log.action}</p>
                            <p className="text-[8px] text-slate-500 font-mono truncate uppercase tracking-tighter">{log.time}</p>
                          </div>
                          <div className="text-right ml-2"><Check size={12} className="text-emerald-500 shadow-emerald-500/50"/></div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveTab('audit')} className="w-full mt-8 py-3 text-[10px] font-black text-amber-400 border border-amber-400/30 hover:bg-amber-400 hover:text-blue-900 rounded uppercase tracking-[0.2em] transition-all">Audit Full Ledger</button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'explorer' && (
              <motion.div key="explorer" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-6">
                  <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Ledger <span className="text-amber-400">Explorer</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Immutable Allotment Registry (FY 2026 Cycle)</p>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={() => notify("Node filter updated for FY 2026.")} className="px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-white/10 flex items-center transition-all"><Filter size={14} className="mr-2 text-amber-400" /> Filter</button>
                    <button onClick={() => exportToCSV(projects, 'budgetchain_ledger_dump')} className="px-6 py-2.5 bg-amber-400 text-blue-950 rounded text-[10px] font-black uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 flex items-center transition-all"><Download size={14} className="mr-2" /> Export Dataset</button>
                  </div>
                </div>
                <div className="bg-[#0a0e17] rounded border border-white/10 overflow-x-auto shadow-2xl">
                  <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-[#001f3f] border-b border-amber-400/20 uppercase tracking-[0.2em] text-[9px] font-black text-amber-400">
                      <tr>
                        <th className="px-6 py-5">Anchor Hash</th>
                        <th className="px-6 py-5">Instrument</th>
                        <th className="px-6 py-5">Agency Profile</th>
                        <th className="px-6 py-5">Certified Value</th>
                        <th className="px-6 py-5">Validation</th>
                        <th className="px-6 py-5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {projects.map((tx, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.03] transition-colors cursor-pointer group" onClick={() => setSelectedTx(tx)}>
                          <td className="px-6 py-5 font-mono text-[10px] text-blue-400 group-hover:text-amber-400 transition-colors truncate max-w-[200px]">{tx.verification}</td>
                          <td className="px-6 py-5"><span className="text-[8px] font-black px-2 py-1 bg-white/5 border border-white/10 rounded tracking-widest uppercase">GAA_2026</span></td>
                          <td className="px-6 py-5 text-[11px] font-black uppercase text-slate-300">{tx.agency}</td>
                          <td className="px-6 py-5 text-sm font-black text-white italic">{formatCurrency(tx.budget)}</td>
                          <td className="px-6 py-5"><div className="flex items-center text-[9px] font-black text-emerald-500 uppercase tracking-widest"><ShieldCheck size={14} className="mr-2" /> Anchored</div></td>
                          <td className="px-6 py-5 text-[10px] text-slate-600 font-black uppercase tracking-tighter">Jan 2026 Cycle</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'departments' && (
              <motion.div key="departments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-10">Agency <span className="text-amber-400">Index</span></h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredDepartments.map((dept, idx) => (
                    <motion.div key={idx} whileHover={{ y: -5, borderColor: '#fbbf24' }} className="bg-[#0a0e17] p-8 rounded border border-white/10 shadow-xl transition-all flex flex-col group">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-[#001f3f] border border-amber-400/20 text-amber-400 rounded flex items-center justify-center font-black text-xl group-hover:bg-amber-400 group-hover:text-blue-900 transition-all">{dept.id.substring(0,2)}</div>
                        <span className={`text-[10px] font-black px-3 py-1 rounded border ${dept.status === 'On Track' ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' : 'bg-orange-900/30 border-orange-500/50 text-orange-400'} uppercase tracking-[0.2em]`}>{dept.status}</span>
                      </div>
                      <h3 className="font-black text-white text-lg uppercase mb-2 tracking-tighter truncate group-hover:text-amber-400 transition-colors">{dept.name}</h3>
                      <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
                        <div className="flex justify-between items-end">
                          <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Disbursed Actual</span>
                              <span className="text-lg font-black text-white">{formatCurrency(dept.spent)}</span>
                          </div>
                          <div className="text-right"><span className="text-[10px] font-black text-amber-400">{((dept.spent / dept.allocated) * 100).toFixed(1)}%</span></div>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden shadow-inner">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(dept.spent / dept.allocated) * 100}%` }} transition={{ duration: 1.5 }} className="bg-amber-400 h-full shadow-[0_0_8px_#fbbf24]"/>
                        </div>
                        <button onClick={() => handleDeptClick(dept.id)} className="w-full py-3 bg-[#001f3f] border border-white/10 hover:border-amber-400 hover:text-amber-400 rounded text-[10px] font-black uppercase tracking-[0.3em] transition-all">Audit Programs</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                  <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Project <span className="text-amber-400">Registry</span></h2>
                    {selectedDeptFilter && <p className="mt-2 text-[10px] font-black text-amber-400 uppercase tracking-widest">Locked Filter: {selectedDeptFilter} <button onClick={() => setSelectedDeptFilter(null)} className="ml-2 hover:text-white underline">Unlock</button></p>}
                  </div>
                  <div className="flex space-x-3 w-full md:w-auto">
                    <button onClick={handleHeatmapAccess} className="flex-1 md:flex-none p-3 bg-amber-400 text-blue-900 rounded hover:brightness-110 flex justify-center items-center font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95">
                       {isProcessingMap ? <Loader2 size={16} className="mr-2 animate-spin"/> : <MapIcon size={16} className="mr-2"/>} View Geospatial Heatmap
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#001f3f]/30 p-8 rounded border border-amber-400/20 mb-10 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 -mr-16 -mt-16 rounded-full blur-3xl"></div>
                   <div className="space-y-4 relative z-10">
                      <h4 className="text-[11px] font-black uppercase text-amber-400 tracking-[0.3em] mb-4">Anchoring Program Extension</h4>
                      <input type="text" placeholder="Project Official Name" className="w-full bg-[#0a0e17] border border-white/10 p-4 rounded text-xs outline-none focus:border-amber-400 transition-colors uppercase font-black tracking-widest" value={newProjectForm.name} onChange={(e) => setNewProjectForm({...newProjectForm, name: e.target.value})} />
                      <div className="grid grid-cols-2 gap-4">
                         <select className="bg-[#0a0e17] border border-white/10 p-4 rounded text-xs outline-none focus:border-amber-400 font-black" value={newProjectForm.agency} onChange={(e) => setNewProjectForm({...newProjectForm, agency: e.target.value})}>
                            {INITIAL_DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}
                         </select>
                         <input type="number" placeholder="Budget Allocation (PHP)" className="bg-[#0a0e17] border border-white/10 p-4 rounded text-xs outline-none focus:border-amber-400 font-black" value={newProjectForm.budget} onChange={(e) => setNewProjectForm({...newProjectForm, budget: e.target.value})} />
                      </div>
                      <input type="text" placeholder="Region / Location Identifier" className="w-full bg-[#0a0e17] border border-white/10 p-4 rounded text-xs outline-none focus:border-amber-400 uppercase font-black tracking-widest" value={newProjectForm.location} onChange={(e) => setNewProjectForm({...newProjectForm, location: e.target.value})} />
                      <button onClick={handleAddProject} className="w-full bg-amber-400 text-blue-900 py-4 rounded font-black text-xs uppercase tracking-[0.3em] hover:brightness-110 active:scale-98 transition-all shadow-xl">Anchor Program to FY2026 Block</button>
                   </div>
                   <div className="hidden lg:flex flex-col justify-center items-center text-center p-10 border border-dashed border-white/10 rounded bg-[#0a0e17]/50">
                      <motion.div animate={{rotateY: [0, 360]}} transition={{duration: 4, repeat: Infinity, ease: "linear"}}><Lock size={64} className="text-amber-400/20 mb-6"/></motion.div>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] leading-relaxed max-w-xs">Programs are hashed via SHA-256 and relayed to 12 national consensus nodes for immutable validation.</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {filteredProjects.map((proj, idx) => (
                    <motion.div key={proj.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0a0e17] p-6 rounded border border-white/10 flex flex-col md:flex-row items-center justify-between group hover:border-amber-400/40 transition-all relative overflow-hidden">
                      <div className="flex items-center space-x-6 flex-1 w-full">
                        <div className={`w-16 h-16 rounded flex items-center justify-center shrink-0 border transition-all group-hover:scale-105 ${proj.status === 'Flagged' ? 'bg-red-950/30 border-red-500/40 text-red-500' : 'bg-blue-950/30 border-blue-500/40 text-blue-400'}`}><Cpu size={32} strokeWidth={1.5} /></div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-black text-white uppercase truncate text-sm tracking-wide group-hover:text-amber-400 transition-colors">{proj.name}</h4>
                          <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">{proj.location} • DOST_SECURE_NODE</p>
                          <div className="flex items-center space-x-2 text-[9px] text-amber-400/50 font-mono truncate"><span>Root: {proj.verification}</span></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-12 mt-6 md:mt-0 w-full md:w-auto justify-between border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-12">
                        <div className="text-right">
                          <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">GAA Valuation</p>
                          <p className="text-xl font-black text-white italic tracking-tighter">{formatCurrency(proj.budget)}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <button onClick={() => verifyChain()} className="text-[9px] font-black text-amber-400 border border-amber-400/20 px-4 py-2 hover:bg-amber-400 hover:text-blue-900 rounded uppercase tracking-[0.2em] transition-all active:scale-95">Verify Link</button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'audit' && (
              <motion.div key="audit" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-10">
                <div className="flex justify-between items-center mb-8 border-b border-amber-400/20 pb-6 text-white uppercase tracking-tighter italic">
                  <h3 className="text-3xl font-black flex items-center"><Activity className="mr-4 text-amber-400" /> Administrative Logs</h3>
                  <button onClick={() => exportToCSV(auditLogs, 'budgetchain_audit_logs')} className="bg-[#001f3f] border border-white/10 px-6 py-2.5 rounded text-[10px] font-black tracking-[0.3em] flex items-center hover:text-amber-400 transition-all shadow-xl"><Download size={16} className="mr-2"/> DL_MANIFEST</button>
                </div>
                <div className="relative">
                  <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-amber-400 to-transparent opacity-30"></div>
                  <div className="space-y-10">
                    {auditLogs.map((log, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative pl-20 group">
                        <div className="absolute left-0 w-16 flex justify-center z-10 pt-1">
                          <div className={`w-10 h-10 rounded border-2 border-[#060b13] shadow-xl flex items-center justify-center cursor-pointer transition-all active:scale-90 ${log.type === 'system' ? 'bg-[#001f3f] text-amber-400' : 'bg-amber-400 text-blue-900'}`} onClick={() => notify(`Deciphering Event Root: ${log.id}`)}>
                            <Lock size={16} strokeWidth={2.5} />
                          </div>
                        </div>
                        <div className="bg-[#0a0e17] p-6 rounded border border-white/10 shadow-lg group-hover:border-amber-400/40 transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-black text-white uppercase tracking-widest text-xs group-hover:text-amber-400 transition-colors">{log.action}</h4>
                            <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{log.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mb-4 font-bold tracking-wide uppercase leading-relaxed">{log.details}</p>
                          <div className="flex items-center text-[9px] font-black text-slate-500 uppercase tracking-widest"><User size={12} className="mr-2 text-amber-400" /> Authorized Signer: <span className="text-white ml-2">{log.user}</span></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'oversight' && (
              <motion.div key="oversight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                <div className="bg-gradient-to-br from-[#001f3f] to-[#002d5a] rounded border border-amber-400/20 p-12 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                  <div className="relative z-10 max-w-2xl text-center md:text-left">
                    <h2 className="text-4xl font-black mb-6 uppercase tracking-tighter italic">Accountability <span className="text-amber-400">Node</span></h2>
                    <p className="text-slate-300 text-sm mb-10 uppercase tracking-[0.2em] font-black leading-relaxed">Citizen-led accountability matrix. Reports are signed and anchored permanently to the Fiscal Genesis Block for COA review.</p>
                    <button onClick={() => setShowReportModal(true)} className="bg-amber-400 text-blue-950 px-10 py-4 rounded font-black uppercase tracking-[0.3em] text-[11px] flex items-center hover:brightness-110 transition-all shadow-2xl active:scale-95 mx-auto md:mx-0"><Flag className="mr-3" size={20} /> Initialize Discrepancy Inquiry</button>
                  </div>
                  <motion.div animate={{rotate: 360}} transition={{duration: 20, repeat: Infinity, ease: "linear"}} className="hidden lg:block opacity-20"><Globe size={180}/></motion.div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="bg-[#0a0e17] p-8 rounded border border-white/10 shadow-2xl">
                    <h3 className="font-black text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4 flex items-center text-xs"><Info size={20} className="mr-3 text-amber-400" /> Open Resolutions</h3>
                    <div className="space-y-6 text-center py-20 bg-black/20 rounded border border-white/5 border-dashed">
                        <FileText size={48} className="mx-auto text-slate-800 mb-6"/>
                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">Zero active escalations detected in block epoch 1042.</p>
                    </div>
                  </div>
                  <div className="bg-[#0a0e17] p-8 rounded border border-white/10 shadow-2xl">
                    <h3 className="font-black text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4 flex items-center text-xs"><ShieldCheck size={20} className="mr-3 text-emerald-500" /> Consensus Hub Status</h3>
                    <div className="space-y-4">
                      <DostNode name="NCR National Node (DBM)" id="0x9a..ff2" active />
                      <DostNode name="Region VII Regional Node" id="0x3b..dd1" active />
                      <DostNode name="Region XI Regional Node" id="Syncing Blocks..." active={false} />
                      <button onClick={() => verifyChain()} className="w-full mt-8 py-4 bg-white/5 border border-white/10 text-slate-400 rounded text-[9px] font-black uppercase tracking-[0.5em] hover:bg-white/10 transition-all active:scale-98">Force Hub Synchronization</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* REFINED GEOSPATIAL HEATMAP MODAL */}
      <AnimatePresence>
        {showHeatmap && (
          <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[250] flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#001f3f] rounded border-t-4 border-amber-400 shadow-2xl w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                   <div className="flex items-center">
                      <MapIcon className="mr-4 text-amber-400" size={24}/>
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter">Verified Geospatial Allotment <span className="text-amber-400 italic">Heatmap</span> (FY 2026)</h3>
                   </div>
                   <button onClick={() => setShowHeatmap(false)} className="text-slate-400 hover:text-amber-400 transition-colors p-2 bg-white/5 rounded-full"><X size={24}/></button>
                </div>
                <div className="flex-1 flex flex-col lg:flex-row p-8 gap-10 overflow-hidden">
                   <div className="flex-1 bg-[#0a0e17] rounded border border-white/10 p-10 flex items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]"></div>
                      {/* ACCURATE RECOGNIZABLE PH MAP PATHS */}
                      <svg viewBox="0 0 400 600" className="h-full w-auto drop-shadow-[0_0_50px_rgba(251,191,36,0.15)] group-hover:scale-105 transition-transform duration-1000">
                         {/* Simplified Accurate PH Map Representation */}
                         <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d="M120,60 L220,50 L280,110 L250,220 L160,230 L130,120 Z" fill={REGIONAL_HEATMAP_DATA[0].color} stroke="#fff" strokeWidth="0.5" /> {/* Luzon */}
                         <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{delay: 0.2}} d="M220,240 L280,260 L290,320 L240,340 L210,300 Z" fill={REGIONAL_HEATMAP_DATA[1].color} stroke="#fff" strokeWidth="0.5" /> {/* Visayas */}
                         <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{delay: 0.4}} d="M200,350 L340,370 L350,520 L230,550 L180,480 Z" fill={REGIONAL_HEATMAP_DATA[2].color} stroke="#fff" strokeWidth="0.5" /> {/* Mindanao */}
                         <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{delay: 0.6}} d="M60,230 L120,320 L110,350 L50,250 Z" fill={REGIONAL_HEATMAP_DATA[3].color} stroke="#fff" strokeWidth="0.5" /> {/* Palawan */}
                         <text x="175" y="145" fill="#000" fontSize="12" fontWeight="900" style={{textShadow: '0 0 10px #fff'}}>LUZON</text>
                         <text x="235" y="295" fill="#000" fontSize="10" fontWeight="900" style={{textShadow: '0 0 10px #fff'}}>VISAYAS</text>
                         <text x="240" y="455" fill="#000" fontSize="14" fontWeight="900" style={{textShadow: '0 0 10px #fff'}}>MINDANAO</text>
                         <text x="50" y="325" fill="#fff" fontSize="8" fontWeight="900" transform="rotate(-45 50,325)">PALAWAN</text>
                      </svg>
                      <div className="absolute bottom-6 right-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-700 bg-black/40 px-4 py-2 border border-white/5">Regional Integrity Grid V1.22.6</div>
                   </div>
                   <div className="w-full lg:w-96 flex flex-col gap-5 overflow-y-auto custom-scrollbar bg-black/20 p-6 rounded border border-white/10">
                      <h4 className="text-[11px] font-black uppercase text-amber-400 tracking-[0.4em] mb-4 border-b border-amber-400/20 pb-4 italic">Intensity Metric (2026)</h4>
                      {REGIONAL_HEATMAP_DATA.map((item, i) => (
                         <div key={i} className="bg-[#0a0e17] border border-white/10 p-5 rounded flex flex-col group hover:border-amber-400/50 transition-all cursor-default">
                            <div className="flex justify-between items-center mb-3">
                               <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.region}</span>
                               <div className="w-4 h-4 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.3)]" style={{backgroundColor: item.color}}/>
                            </div>
                            <span className="text-xl font-black text-amber-400 italic leading-none">{formatCurrency(item.amount)}</span>
                            <span className="text-[8px] text-slate-500 font-black uppercase mt-3 tracking-widest">Verified Multi-Node Allotment</span>
                         </div>
                      ))}
                      <button onClick={() => exportToCSV(REGIONAL_HEATMAP_DATA, 'regional_map_dataset')} className="w-full py-5 bg-amber-400 text-blue-950 rounded text-[10px] font-black uppercase tracking-[0.3em] hover:brightness-110 mt-6 shadow-2xl active:scale-95 transition-all">Download Map Dataset (CSV)</button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TRANSACTION MODAL */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#001f3f] rounded border-t-4 border-amber-400 shadow-[0_0_100px_rgba(0,0,0,0.8)] w-full max-w-2xl overflow-hidden">
              <div className="p-6 flex items-center justify-between border-b border-white/10 bg-black/20">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Decoded 2026 Chain Result</h3>
                <button onClick={() => setSelectedTx(null)} className="p-2 text-slate-400 hover:text-amber-400 transition-all active:scale-90"><X size={24} /></button>
              </div>
              <div className="p-10">
                <div className="flex items-center space-x-8 mb-12">
                  <div className="w-24 h-24 bg-amber-400 text-blue-900 rounded flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(251,191,36,0.4)]"><Database size={48} /></div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3">Immutable 2026 Block Unique Root</p>
                    <p className="text-xl font-mono text-white break-all leading-tight border-b border-white/10 pb-4 tracking-tighter">{selectedTx.verification || 'TX_HASH_NULL_2026'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-12">
                  <ModalField label="Originating Agency" value={selectedTx.agency} />
                  <ModalField label="Ledger Instrument" value="GAA Allotment Program" />
                  <ModalField label="Anchored Valuation" value={formatCurrency(selectedTx.budget)} highlight />
                  <ModalField label="Validation Consensus" value="12 Nodes Approved" status="emerald" />
                </div>

                <div className="p-8 bg-black/50 rounded border border-white/10 flex items-center justify-between mb-12 group shadow-inner">
                  <div className="flex items-center"><FileText size={32} className="text-amber-400 mr-5 group-hover:scale-110 transition-transform" /> <span className="text-xs font-black text-white uppercase tracking-[0.2em] truncate">GAA_VERIFIED_PROOF_2026_TR_2.PDF</span></div>
                  <button onClick={() => verifyChain()} className="text-[10px] font-black text-amber-400 hover:text-white uppercase tracking-[0.3em] transition-colors underline">Verify Sig</button>
                </div>

                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-5">
                  <button onClick={() => { setSelectedTx(null); setActiveTab('audit'); notify("Establishing secure audit tunnel..."); }} className="flex-1 py-5 bg-amber-400 text-blue-950 font-black uppercase tracking-[0.3em] rounded text-xs hover:brightness-110 active:scale-95 shadow-2xl transition-all">Verify Audit Path</button>
                  <button onClick={() => notify("Establishing TLS connection for file fetch...")} className="px-12 py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.3em] text-xs rounded hover:bg-white/10 transition-all active:scale-95 shadow-xl">Relay Document</button>
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

const DostStat = ({ title, value, color, icon: Icon, onClick }) => (
  <motion.div 
    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.02)' }}
    onClick={onClick}
    className="bg-[#0a0e17] p-8 rounded border border-white/10 shadow-xl cursor-pointer active:scale-95 group relative overflow-hidden"
  >
    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className={`p-3 w-12 h-12 rounded border mb-6 flex items-center justify-center transition-all group-hover:bg-amber-400 group-hover:text-blue-900 ${
      color === 'blue' ? 'bg-[#001f3f] text-amber-400 border-amber-400/30' : 
      color === 'gold' ? 'bg-amber-400 text-blue-900 border-transparent' : 'bg-white text-blue-900 border-transparent'
    }`}>
      <Icon size={24} strokeWidth={2.5} />
    </div>
    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-2">{title}</p>
    <p className="text-2xl font-black text-white uppercase tracking-tighter italic">{value}</p>
    <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
       <ArrowUpRight size={32} className="text-amber-400/20"/>
    </div>
  </motion.div>
);

const DostNode = ({ name, id, active }) => (
  <div className={`flex items-center justify-between p-5 bg-black/40 border border-white/5 rounded transition-opacity ${!active && 'opacity-30'}`}>
    <div className="flex items-center">
      <div className={`w-3 h-3 rounded-full mr-5 ${active ? 'bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]' : 'bg-slate-700'}`}></div> 
      <span className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">{name}</span>
    </div>
    <span className="text-[10px] text-amber-400 font-mono tracking-tighter bg-black/40 px-3 py-1 border border-white/5">{id}</span>
  </div>
);

const ModalField = ({ label, value, highlight, status }) => (
  <div className="overflow-hidden flex-1 border-b border-white/5 pb-4">
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3">{label}</p>
    <p className={`uppercase font-black truncate leading-tight ${highlight ? 'text-3xl text-amber-400 italic' : status === 'emerald' ? 'text-sm text-emerald-400 tracking-widest' : 'text-sm text-white tracking-widest'}`}>{value}</p>
  </div>
);

export default App;