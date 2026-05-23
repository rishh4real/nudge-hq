import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  BellRing,
  Building2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  X,
  FileCheck2,
  Fingerprint,
  LayoutDashboard,
  LineChart,
  LockKeyhole,
  Mail,
  MessageSquareText,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserCheck,
  UsersRound,
  Workflow,
  LogOut,
  Plus,
  AlertCircle,
  Send,
  RefreshCw,
  Download,
  User,
  ListTodo,
  Shield,
  Zap,
  ExternalLink
} from 'lucide-react'

// --- CONSTANTS ---
const painPoints = [
  {
    icon: MessageSquareText,
    title: 'Updates are scattered',
    copy: 'Managers spend hours pulling status from chats, calls, and spreadsheets.',
  },
  {
    icon: Clock3,
    title: 'Delays show up late',
    copy: 'Small blockers become delivery risks because nobody sees them in time.',
  },
  {
    icon: FileCheck2,
    title: 'Reports take too long',
    copy: 'HR and ops teams rebuild the same progress summaries every week.',
  },
]

const employeeFeatures = [
  ['Quick daily check-ins', Smartphone],
  ['Task progress nudges', BellRing],
  ['Blocker notes in seconds', MessageSquareText],
  ['Personal completion view', CheckCircle2],
]

const adminFeatures = [
  ['Live team dashboard', LayoutDashboard],
  ['Department progress trends', LineChart],
  ['Attendance and task visibility', UserCheck],
  ['Export-ready HR summaries', ClipboardCheck],
]

const steps = [
  {
    step: '01',
    title: 'Set teams and workflows',
    copy: 'Create departments, assign owners, and define the progress signals you want to track.',
  },
  {
    step: '02',
    title: 'Employees update fast',
    copy: 'People receive lightweight nudges and submit progress without long meetings or forms.',
  },
  {
    step: '03',
    title: 'Leaders see what changed',
    copy: 'Admins get real-time visibility into completion, blockers, and workforce momentum.',
  },
]

const pricing = [
  {
    name: 'Free',
    price: 'Rs.0',
    description: 'For small teams piloting progress visibility.',
    features: ['Free trial for 40 employees', 'Basic check-ins', 'Team progress board'],
  },
  {
    name: 'Starter',
    price: 'Rs.2000',
    description: 'For growing teams replacing manual follow-ups.',
    features: ['Up to 10 employees', 'Automated nudges', 'Weekly reports'],
  },
  {
    name: 'Growth',
    price: 'Rs.6000',
    description: 'For companies that need cross-team clarity.',
    features: ['Up to 40 employees', 'Admin analytics', 'Exports and roles'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For larger organizations with custom workflows.',
    features: ['Unlimited teams', 'Custom integrations', 'Priority support'],
  },
]

const badges = [
  {
    title: 'Encrypted data',
    copy: 'Progress and workforce records stay protected in transit and at rest.',
    icon: LockKeyhole,
  },
  {
    title: 'Role-based access',
    copy: 'Admins, HR, managers, and employees see only the views they need.',
    icon: Fingerprint,
  },
  {
    title: 'Audit-ready logs',
    copy: 'Important updates and admin actions are structured for review.',
    icon: ShieldCheck,
  },
  {
    title: 'Secure exports',
    copy: 'Reports can be shared without exposing unnecessary team data.',
    icon: FileCheck2,
  },
]

const aiSummaryItems = [
  ['12 tasks completed', 'Completed', '#1D9E75'],
  ['2 blockers detected', 'Needs review', '#EF4444'],
  ['3 delayed check-ins', 'Follow up', '#F59E0B'],
]

const trustSignals = [
  ['Beta access open', Sparkles],
  ['Early teams onboarding', UsersRound],
  ['HR-friendly workflows', ClipboardCheck],
  ['AI-powered summaries', Activity],
]

const sampleTeams = ['Northstar Ops', 'Tech Team', 'OpsFlow', 'PeopleDesk', 'FieldPilot']

const formatDisplayDate = (value) => {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value));
}

const cardMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.5, ease: 'easeOut' },
}

let activeServerPort = null;

const isBackendConnectionError = (message = '') => (
  /fetch failed|aborted|timed out|connection refused|supabase/i.test(message)
)

// --- API UTILITY (Auto-probe ports 5000 and 5001) ---
const fetchApi = async (endpoint, options = {}, token = null) => {
  const ports = activeServerPort ? [activeServerPort] : [5000, 5001];
  let lastError = null;

  for (const port of ports) {
    try {
      const url = `http://localhost:${port}/api${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(id);

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'API request failed.');
      }
      return { data, port };
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError?.name === 'AbortError') {
    throw new Error('Backend request timed out. Supabase may be unreachable or not configured yet.');
  }

  if (lastError?.message === 'Failed to authenticate user.' || lastError?.message?.includes('fetch failed')) {
    throw new Error('Backend is running, but Supabase is not reachable or the Supabase credentials are incomplete.');
  }

  throw lastError || new Error('Connection refused on ports 5000/5001');
}

// --- MAIN APPLICATION ---
function App() {
  const [isTrialOpen, setIsTrialOpen] = useState(false)
  const [currentView, setCurrentView] = useState('landing') // 'landing' | 'demo_console' | 'dashboard'
  const [authRole, setAuthRole] = useState(null) // 'admin' | 'employee'
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  
  // Active Connection Metadata
  const [serverPort, setServerPort] = useState(null)
  const [isSandbox, setIsSandbox] = useState(false)
  const [statusMessage, setStatusMessage] = useState(null)

  // Demo Sign-in States
  const [emailInput, setEmailInput] = useState('hr@nudgehq.com')
  const [passwordInput, setPasswordInput] = useState('nudgehq123')
  const [loginError, setLoginError] = useState(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [showCompanySignup, setShowCompanySignup] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [companyAdminName, setCompanyAdminName] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [companyPassword, setCompanyPassword] = useState('')
  const [companySignupLoading, setCompanySignupLoading] = useState(false)
  const [companySignupError, setCompanySignupError] = useState(null)

  // --- DASHBOARD DATA STATES ---
  // Employee Workspace
  const [empStats, setEmpStats] = useState(null)
  const [empTasks, setEmpTasks] = useState([])
  const [empHistory, setEmpHistory] = useState([])
  const [progressText, setProgressText] = useState('')
  const [proofLink, setProofLink] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false)

  // Blocker text mapping for status update modal
  const [activeBlockTask, setActiveBlockTask] = useState(null)
  const [blockerTextVal, setBlockerTextVal] = useState('')

  // Admin Workspace
  const [analytics, setAnalytics] = useState(null)
  const [allUpdates, setAllUpdates] = useState([])
  const [departments, setDepartments] = useState([])
  const [newDeptName, setNewDeptName] = useState('')
  const [newDeptDesc, setNewDeptDesc] = useState('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [newTaskAssignee, setNewTaskAssignee] = useState('')
  const [adminUsers, setAdminUsers] = useState([]) // List of employees for task assignment
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteDepartmentId, setInviteDepartmentId] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteResult, setInviteResult] = useState(null)

  // AI Summary Results
  const [aiReportType, setAiReportType] = useState(null) // 'summary' | 'delays' | 'inactivity'
  const [aiReportContent, setAiReportContent] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  // --- EFFECTS ---
  // Check active server port on mount
  useEffect(() => {
    const probeServer = async () => {
      const ports = [5000, 5001];
      for (const port of ports) {
        try {
          const res = await fetch(`http://localhost:${port}/health`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'healthy') {
              activeServerPort = port;
              setServerPort(port);
              setIsSandbox(false);
              console.log(`Connected to NudgeHQ backend on port ${port}`);
              return;
            }
          }
        } catch {
          // ignore error and check next port
        }
      }
      console.warn('Backend server not detected. Running Demo Console in Sandbox Mode.');
      setIsSandbox(true);
      setServerPort(null);
      // Set mock data
      setMockData();
    };
    probeServer();
  }, []);

  // Sync dashboard data when logged in
  useEffect(() => {
    if (token) {
      refreshDashboardData();
    }
  }, [token, authRole]);

  // --- MOCK DATA SETUP (Sandbox Mode) ---
  const setMockData = () => {
    setDepartments([
      { id: '1', name: 'Sales Operations', description: 'Commercial check-in monitoring.' },
      { id: '2', name: 'Engineering', description: 'Product development and integration.' }
    ]);
    setAdminUsers([
      { id: 'emp-1', name: 'Kunal', email: 'employee@nudgehq.com', department_id: '1' }
    ]);
    setEmpTasks([
      { id: 't-1', title: 'Verify customer email lists for marketing campaign', description: 'Review bounce projections.', status: 'completed' },
      { id: 't-2', title: 'Finalize weekly sales forecast summary', description: 'Structure weekly updates.', status: 'in_progress' },
      { id: 't-3', title: 'Resolve database replication delays in staging', description: 'Investigate sync latency peaks.', status: 'blocked' }
    ]);
    setEmpHistory([
      { id: 'h-1', progress_text: 'Scrubbed duplicate email records and checked lists.', created_at: new Date().toISOString(), tasks: { title: 'Verify customer email lists' } }
    ]);
    setEmpStats({
      totalTasks: 3,
      todo: 0,
      inProgress: 1,
      completed: 1,
      blocked: 1
    });
    setAnalytics({
      summary: {
        totalEmployees: 1,
        totalTasks: 3,
        completionRate: 33,
        tasksOnTrack: 66,
        checkinRate: 100,
        blockersCount: 1
      },
      statusDistribution: { todo: 0, in_progress: 1, completed: 1, blocked: 1 },
      departmentStats: [{ name: 'Sales Operations', total: 3, completed: 1, percentage: 33 }],
      activeBlockers: [{ id: 'b-1', task: { title: 'Resolve database replication delays' }, reporter: { name: 'Kunal' }, blocker_text: 'Waiting for AWS DevOps staging keys.', created_at: new Date().toISOString() }]
    });
    setAllUpdates([
      { id: 'u-1', progress_text: 'Finished cleaning bounce parameters for lead campaign.', user: { name: 'Kunal', departments: { name: 'Sales Operations' } }, tasks: { title: 'Verify customer email lists' }, created_at: new Date().toISOString() }
    ]);
  };

  // --- REFRESH DATA API CALLS ---
  const refreshDashboardData = async () => {
    if (isSandbox) return;
    try {
      if (authRole === 'employee') {
        // Fetch employee tasks
        const { data: taskRes } = await fetchApi('/tasks', { method: 'GET' }, token);
        setEmpTasks(taskRes.tasks || []);

        // Fetch employee history
        const { data: updateRes } = await fetchApi('/employees/updates', { method: 'GET' }, token);
        setEmpHistory(updateRes.updates || []);

        // Fetch employee stats
        const { data: statRes } = await fetchApi('/employees/dashboard', { method: 'GET' }, token);
        setEmpStats(statRes.stats || null);
      } else if (authRole === 'admin') {
        // Fetch Admin Analytics
        const { data: analyticRes } = await fetchApi('/analytics/dashboard', { method: 'GET' }, token);
        setAnalytics(analyticRes || null);

        // Fetch updates registry
        const { data: updateRes } = await fetchApi('/admin/updates', { method: 'GET' }, token);
        setAllUpdates(updateRes.updates || []);

        // Fetch departments
        const { data: deptRes } = await fetchApi('/admin/departments', { method: 'GET' }, token);
        setDepartments(deptRes.departments || []);

        // Fetch tasks to extract assignees/users list (Helper)
        const { data: taskRes } = await fetchApi('/tasks', { method: 'GET' }, token);
        const uniqueUsers = [];
        taskRes.tasks.forEach(t => {
          if (t.assignee && !uniqueUsers.some(u => u.id === t.assignee.id)) {
            uniqueUsers.push(t.assignee);
          }
        });
        setAdminUsers(uniqueUsers);
      }
    } catch (err) {
      showToast('Error syncing live dashboard values: ' + err.message, 'error');
    }
  };

  // --- TOAST/STATUS CONTROLLERS ---
  const showToast = (message, type = 'info') => {
    setStatusMessage({ text: message, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const enterSandboxDashboard = () => {
    const simulatedUser = emailInput === 'hr@nudgehq.com'
      ? { name: 'HR Operations', role: 'admin', email: 'hr@nudgehq.com' }
      : { name: 'Kunal', role: 'employee', email: 'employee@nudgehq.com' };

    setIsSandbox(true);
    setServerPort(null);
    setMockData();
    setUser(simulatedUser);
    setToken('sandbox-token-jwt');
    setAuthRole(simulatedUser.role);
    setCurrentView('dashboard');
    setLoginError(null);
    showToast(`Using Sandbox Mode as ${simulatedUser.name}. Connect Supabase later for live data.`, 'info');
  };

  // --- USER AUTHENTICATION ACTIONS ---
  const handleDemoSignIn = (role) => {
    if (role === 'admin') {
      setEmailInput('hr@nudgehq.com');
      setPasswordInput('nudgehq123');
    } else {
      setEmailInput('employee@nudgehq.com');
      setPasswordInput('nudgehq123');
    }
    setLoginError(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    if (isSandbox) {
      // Sandbox Authentication Bypass
      const simulatedUser = emailInput === 'hr@nudgehq.com'
        ? { name: 'HR Operations', role: 'admin', email: 'hr@nudgehq.com' }
        : { name: 'Kunal', role: 'employee', email: 'employee@nudgehq.com' };

      setUser(simulatedUser);
      setToken('sandbox-token-jwt');
      setAuthRole(simulatedUser.role);
      setCurrentView('dashboard');
      showToast(`Welcome! Logged into Sandbox Mode as ${simulatedUser.name}`, 'info');
      setLoginLoading(false);
      return;
    }

    try {
      const { data } = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });

      setUser(data.user);
      setToken(data.token);
      setAuthRole(data.user.role);
      setCurrentView('dashboard');
      showToast(`Welcome back, ${data.user.name}!`, 'success');
    } catch (err) {
      const message = err.message || 'Incorrect email or password.';
      setLoginError(isBackendConnectionError(message)
        ? `${message} You can continue in Sandbox Mode for now.`
        : message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleCompanySignup = async (e) => {
    e.preventDefault();
    setCompanySignupError(null);
    setCompanySignupLoading(true);

    try {
      const { data } = await fetchApi('/auth/company-signup', {
        method: 'POST',
        body: JSON.stringify({
          company_name: companyName,
          admin_name: companyAdminName,
          email: companyEmail,
          password: companyPassword,
        })
      });

      setUser(data.user);
      setToken(data.token);
      setAuthRole(data.user.role);
      setCurrentView('dashboard');
      showToast(`Workspace created for ${companyName}. Welcome, ${data.user.name}.`, 'success');
    } catch (err) {
      setCompanySignupError(err.message || 'Failed to create company workspace.');
    } finally {
      setCompanySignupLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setAuthRole(null);
    setCurrentView('landing');
    setAiReportContent(null);
    setAiReportType(null);
    showToast('Logged out of demo session.', 'info');
  };

  // --- EMPLOYEE DASHBOARD OPERATIONS ---
  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (!progressText.trim()) return;
    setIsSubmittingUpdate(true);

    if (isSandbox) {
      const newMockUpdate = {
        id: Math.random().toString(),
        progress_text: progressText,
        created_at: new Date().toISOString(),
        tasks: selectedTaskId ? { title: empTasks.find(t => t.id === selectedTaskId)?.title || 'Assigned task' } : null
      };
      setEmpHistory([newMockUpdate, ...empHistory]);
      setProgressText('');
      setProofLink('');
      setSelectedTaskId('');
      setIsSubmittingUpdate(false);
      showToast('Mock check-in submitted successfully.', 'success');
      return;
    }

    try {
      await fetchApi('/employees/updates', {
        method: 'POST',
        body: JSON.stringify({
          task_id: selectedTaskId || null,
          progress_text: progressText,
          proof_link: proofLink || null
        })
      }, token);

      setProgressText('');
      setProofLink('');
      setSelectedTaskId('');
      showToast('Progress update logged successfully to the server!', 'success');
      refreshDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const handleUpdateStatusClick = (task, targetStatus) => {
    if (targetStatus === 'blocked') {
      setActiveBlockTask(task);
      setBlockerTextVal('');
    } else {
      updateTaskStatusApi(task.id, targetStatus, null);
    }
  };

  const updateTaskStatusApi = async (taskId, status, blockerText) => {
    if (isSandbox) {
      const updated = empTasks.map(t => {
        if (t.id === taskId) {
          return { ...t, status };
        }
        return t;
      });
      setEmpTasks(updated);
      setActiveBlockTask(null);
      showToast(`Task status set to '${status}'`, 'success');
      return;
    }

    try {
      await fetchApi(`/tasks/${taskId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, blocker_text: blockerText })
      }, token);

      showToast(`Task status updated to '${status}' successfully!`, 'success');
      refreshDashboardData();
      setActiveBlockTask(null);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // --- ADMIN/HR DASHBOARD OPERATIONS ---
  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    if (isSandbox) {
      const newDept = { id: Math.random().toString(), name: newDeptName, description: newDeptDesc, created_at: new Date().toISOString() };
      setDepartments([...departments, newDept]);
      setNewDeptName('');
      setNewDeptDesc('');
      showToast(`Mock department '${newDeptName}' created.`, 'success');
      return;
    }

    try {
      await fetchApi('/admin/departments', {
        method: 'POST',
        body: JSON.stringify({ name: newDeptName, description: newDeptDesc })
      }, token);
      setNewDeptName('');
      setNewDeptDesc('');
      showToast(`Department created successfully!`, 'success');
      refreshDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    if (isSandbox) {
      showToast('Task creation mock completed.', 'success');
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskAssignee('');
      return;
    }

    try {
      await fetchApi('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDesc,
          assignee_id: newTaskAssignee || null
        })
      }, token);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskAssignee('');
      showToast('Task successfully created and assigned!', 'success');
      refreshDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleInviteEmployee = async (e) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    setInviteLoading(true);
    setInviteResult(null);

    if (isSandbox) {
      const invited = {
        id: `emp-${Date.now()}`,
        name: inviteName,
        email: inviteEmail,
        department_id: inviteDepartmentId || null
      };
      setAdminUsers([...adminUsers, invited]);
      setInviteResult({ email: inviteEmail, temporary_password: 'nudgehq123', sandbox: true });
      setInviteName('');
      setInviteEmail('');
      setInviteDepartmentId('');
      setInviteLoading(false);
      showToast('Sandbox employee invite created.', 'success');
      return;
    }

    try {
      const { data } = await fetchApi('/admin/employees/invite', {
        method: 'POST',
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail,
          department_id: inviteDepartmentId || null
        })
      }, token);

      setAdminUsers([...adminUsers, data.employee]);
      setInviteResult({ email: data.employee.email, temporary_password: data.temporary_password, sandbox: false });
      setInviteName('');
      setInviteEmail('');
      setInviteDepartmentId('');
      showToast('Employee invite created successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to invite employee.', 'error');
    } finally {
      setInviteLoading(false);
    }
  };

  // AI Generation triggers
  const triggerAiReport = async (type) => {
    setAiReportType(type);
    setAiLoading(true);
    setAiReportContent(null);

    if (isSandbox) {
      setTimeout(() => {
        setAiLoading(false);
        if (type === 'summary') {
          setAiReportContent({
            summary: "Today's engineering sprint achieved critical backend milestones. The employee registry reported 100% check-in ratios.",
            achievements: ["Successfully deployed initial schema setups", "Completed authentication logic testing"],
            blockers: ["AWS credentials sync pending on server replicas"],
            needs_attention: ["AWS sync blockers need DBA credential updates"]
          });
        } else if (type === 'delays') {
          setAiReportContent({
            assessments: [
              { task_title: "Resolve database replication delays", risk_level: "high", remedy: "Liaise with AWS devops specialist to audit replication key permissions." }
            ]
          });
        } else {
          setAiReportContent({
            inactive_employees: [
              { name: "John Miller", email: "john@nudgehq.com", checkin_nudge: "Hi John, hope you're having a good week! Let us know if you need assistance with current sprint targets." }
            ]
          });
        }
      }, 1000);
      return;
    }

    try {
      const endpoint = type === 'summary' ? '/ai/summary/daily' : type === 'delays' ? '/ai/delays' : '/ai/inactivity';
      const { data } = await fetchApi(endpoint, { method: 'GET' }, token);
      setAiReportContent(data.data || data);
    } catch (err) {
      showToast('AI request failed: ' + err.message, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // Open trial modal helper
  const openTrial = () => setIsTrialOpen(true)
  const closeTrial = () => setIsTrialOpen(false)

  return (
    <main className="min-h-screen overflow-x-clip bg-white text-[#2C2C2A] font-sans">
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 16, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className={`fixed left-1/2 z-[100] flex items-center gap-3 rounded-lg px-5 py-3.5 shadow-lg border text-sm font-semibold max-w-md w-max ${
              statusMessage.type === 'success'
                ? 'bg-[#E8F7F1] border-[#1D9E75]/30 text-[#1D9E75]'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-indigo-50 border-indigo-200 text-indigo-700'
            }`}
          >
            {statusMessage.type === 'error' ? (
              <AlertCircle className="h-5 w-5 shrink-0" />
            ) : (
              <Sparkles className="h-5 w-5 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SITE HEADER --- */}
      <header className="sticky inset-x-0 top-0 z-50 border-b border-[#EEEDFE] bg-white/95 shadow-sm shadow-[#EEEDFE]/70">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <a
            href="#top"
            onClick={() => {
              if (currentView !== 'landing') {
                setCurrentView('landing');
              }
            }}
            className="flex items-center gap-3"
            aria-label="NudgeHQ home"
          >
            <img src="/brand/nudgehq-icon.svg" alt="" className="h-10 w-10 rounded-lg" />
            <span className="text-lg font-bold text-[#3C3489]">NudgeHQ</span>
          </a>

          {currentView === 'landing' ? (
            <>
              <div className="hidden items-center gap-8 text-sm font-medium text-[#5F5E5A] md:flex">
                <a className="transition hover:text-[#3C3489]" href="#features">Features</a>
                <a className="transition hover:text-[#3C3489]" href="#pricing">Pricing</a>
                <a className="transition hover:text-[#3C3489]" href="#security">Security</a>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setLoginError(null);
                    setCurrentView('demo_console');
                  }}
                  className="inline-flex items-center gap-2 rounded-md border border-[#DAD7FB] bg-white px-4 py-2.5 text-sm font-semibold text-[#3C3489] transition hover:bg-[#EEEDFE]"
                >
                  <Zap className="h-4 w-4 text-[#F59E0B]" />
                  Demo Console
                </button>
                <button
                  type="button"
                  onClick={openTrial}
                  className="inline-flex items-center gap-2 rounded-md bg-[#7F77DD] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#7F77DD]/20 transition hover:bg-[#3C3489]"
                >
                  Get Early Access
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <span className="hidden text-xs font-semibold px-2.5 py-1 rounded bg-[#F4F3FF] border border-[#EEEDFE] sm:inline-flex items-center gap-1.5 text-[#5F5E5A]">
                <Activity className="h-3.5 w-3.5 text-[#1D9E75]" />
                {isSandbox ? 'Sandbox Environment' : `Server Port: ${serverPort}`}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
              >
                <LogOut className="h-4 w-4" />
                Exit Demo
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* --- VIEW ROUTER --- */}

      {/* VIEW 1: LANDING PAGE */}
      {currentView === 'landing' && (
        <>
          <section id="top" className="relative isolate">
            <div className="dot-grid absolute inset-0 -z-10 opacity-50" />
            <div className="absolute left-1/2 top-14 -z-10 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[#F4F3FF]" />
            <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:pb-28 lg:pt-20">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#EEEDFE] bg-white px-4 py-2 text-sm font-semibold text-[#3C3489] shadow-sm">
                  <Sparkles className="h-4 w-4 text-[#1D9E75]" aria-hidden="true" />
                  Real-time workforce progress tracking
                </div>
                <h1 className="mt-7 max-w-4xl text-5xl font-extrabold leading-[1.02] text-[#2C2C2A] sm:text-6xl lg:text-7xl">
                  Track team progress without chasing updates.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5F5E5A] sm:text-xl">
                  <span className="brand-shimmer font-bold">NudgeHQ</span> gives employees a fast way to share progress, blockers, and status while admins get one live view of workforce momentum.
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setCurrentView('demo_console')}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#7F77DD] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-[#7F77DD]/25 transition hover:-translate-y-0.5 hover:bg-[#3C3489]"
                  >
                    Launch Demo Console
                    <Zap className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <a
                    href="#features"
                    className="inline-flex items-center justify-center rounded-md border border-[#DAD7FB] bg-white px-6 py-4 text-base font-semibold text-[#3C3489] transition hover:border-[#7F77DD] hover:bg-[#EEEDFE]"
                  >
                    Explore features
                  </a>
                </div>
              </div>

              <div className="relative">
                <div className="soft-grid rounded-lg border border-[#DAD7FB] bg-white p-4 shadow-xl shadow-[#3C3489]/10">
                  <div className="rounded-md border border-[#EEEDFE] bg-white">
                    <div className="flex items-center justify-between border-b border-[#EEEDFE] px-5 py-4">
                      <div>
                        <p className="text-sm font-semibold text-[#3C3489]">Workforce dashboard</p>
                        <p className="text-xs text-[#5F5E5A]">Live across 2 teams</p>
                      </div>
                      <span className="rounded-full bg-[#E8F7F1] px-3 py-1 text-xs font-semibold text-[#1D9E75]">Live</span>
                    </div>
                    <div className="grid gap-4 p-5 sm:grid-cols-3">
                      {[
                        ['66%', 'Tasks on track'],
                        ['1', 'Open blockers'],
                        ['100%', 'Check-ins sent'],
                      ].map(([value, label]) => (
                        <div key={label} className="rounded-md border border-[#EEEDFE] bg-white p-4">
                          <p className="text-2xl font-bold text-[#3C3489]">{value}</p>
                          <p className="mt-1 text-xs font-medium text-[#5F5E5A]">{label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-5 px-5 pb-5 lg:grid-cols-[1.2fr_0.8fr]">
                      <div className="rounded-md border border-[#EEEDFE] bg-[#FCFCFF] p-5">
                        <div className="mb-5 flex items-center justify-between">
                          <p className="font-semibold text-[#2C2C2A]">Department progress</p>
                          <LineChart className="h-5 w-5 text-[#7F77DD]" aria-hidden="true" />
                        </div>
                        {[
                          ['Sales ops', '66%'],
                          ['Engineering', '0%'],
                        ].map(([team, percent]) => (
                          <div key={team} className="mb-4 last:mb-0">
                            <div className="mb-2 flex justify-between text-sm">
                              <span className="font-medium text-[#2C2C2A]">{team}</span>
                              <span className="text-[#5F5E5A]">{percent}</span>
                            </div>
                            <div className="h-2 rounded-full bg-[#EEEDFE]">
                              <div className="h-2 rounded-full bg-[#7F77DD]" style={{ width: percent }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-md border border-[#EEEDFE] bg-[#FCFCFF] p-5">
                        <p className="font-semibold text-[#2C2C2A]">Today&apos;s nudges</p>
                        <div className="mt-5 space-y-3">
                          {['1 blocker follow-up', '1 progress check-in'].map((item) => (
                            <div key={item} className="flex items-center gap-3 text-sm text-[#5F5E5A]">
                              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EEEDFE] text-[#3C3489]">
                                <BellRing className="h-4 w-4" aria-hidden="true" />
                              </span>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-[#EEEDFE] bg-white px-5 py-14 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                <motion.div {...cardMotion}>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1D9E75]">Trust signals</p>
                  <h2 className="mt-3 text-2xl font-bold text-[#2C2C2A] sm:text-3xl">Built for modern Indian teams.</h2>
                  <p className="mt-4 leading-7 text-[#5F5E5A]">
                    Designed for fast-moving HR, operations, and field teams that need clear progress without extra reporting work.
                  </p>
                </motion.div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {trustSignals.map(([signal, Icon], index) => (
                    <motion.div
                      key={signal}
                      {...cardMotion}
                      transition={{ duration: 0.45, delay: index * 0.05, ease: 'easeOut' }}
                      className="rounded-lg border border-[#EEEDFE] bg-[#FCFCFF] p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#DAD7FB] hover:shadow-md"
                    >
                      <Icon className="h-5 w-5 text-[#7F77DD]" aria-hidden="true" />
                      <p className="mt-4 font-semibold text-[#2C2C2A]">{signal}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3 border-t border-[#EEEDFE] pt-8">
                {sampleTeams.map((team) => (
                  <span key={team} className="rounded-md border border-[#EEEDFE] bg-white px-4 py-2 text-sm font-semibold text-[#5F5E5A]">
                    {team}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Section features & product descriptions */}
          <section className="border-y border-[#EEEDFE] bg-[#FCFCFF] px-5 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <SectionHeader
                eyebrow="The problem"
                title="Progress gets messy when every update needs a chase."
                copy="NudgeHQ gives companies a calmer operating rhythm by making workforce progress visible before it becomes a meeting."
              />
              <div className="mt-12 grid gap-5 md:grid-cols-3">
                {painPoints.map(({ icon: Icon, title, copy }) => (
                  <motion.article key={title} {...cardMotion} className="rounded-lg border border-[#EEEDFE] bg-white p-6 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#EEEDFE] text-[#3C3489]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-[#2C2C2A]">{title}</h3>
                    <p className="mt-3 leading-7 text-[#5F5E5A]">{copy}</p>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          <section id="features" className="px-5 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <SectionHeader
                eyebrow="Features"
                title="Built for employees and the teams that support them."
                copy="The employee side stays lightweight. The admin side turns every update into a clear operational signal."
              />
              <div className="mt-14 grid gap-6 lg:grid-cols-2">
                <motion.div {...cardMotion} className="rounded-lg border border-[#EEEDFE] bg-white p-7 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#EEEDFE] text-[#3C3489]">
                      <UsersRound className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1D9E75]">Employee side</p>
                      <h3 className="text-2xl font-bold text-[#2C2C2A]">Fast progress sharing</h3>
                    </div>
                  </div>
                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    {employeeFeatures.map(([feature, Icon]) => (
                      <div key={feature} className="flex items-center gap-3 rounded-md border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                        <Icon className="h-5 w-5 shrink-0 text-[#7F77DD]" aria-hidden="true" />
                        <span className="font-medium text-[#2C2C2A]">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div {...cardMotion} className="rounded-lg border border-[#EEEDFE] bg-white p-7 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#E8F7F1] text-[#1D9E75]">
                      <Building2 className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1D9E75]">Admin and HR side</p>
                      <h3 className="text-2xl font-bold text-[#2C2C2A]">Live workforce visibility</h3>
                    </div>
                  </div>
                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    {adminFeatures.map(([feature, Icon]) => (
                      <div key={feature} className="flex items-center gap-3 rounded-md border border-[#EEEDFE] bg-[#FCFCFF] p-4">
                        <Icon className="h-5 w-5 shrink-0 text-[#1D9E75]" aria-hidden="true" />
                        <span className="font-medium text-[#2C2C2A]">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* AI Features Highlight */}
          <section className="relative overflow-hidden bg-[#FCFCFF] px-5 py-24 sm:px-6 lg:px-8 border-y border-[#EEEDFE]">
            <div className="dot-grid absolute inset-0 opacity-40" />
            <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <motion.div {...cardMotion}>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1D9E75]">Killer feature</p>
                <h2 className="mt-4 text-3xl font-bold text-[#2C2C2A] sm:text-4xl">AI Team Summaries that turn updates into decisions.</h2>
                <p className="mt-5 text-lg leading-8 text-[#5F5E5A]">
                  NudgeHQ can roll daily check-ins, blockers, and delayed updates into a manager-ready summary, so leaders see what changed without reading every message.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentView('demo_console')}
                  className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#3C3489] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7F77DD]"
                >
                  Launch Demo Console
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </motion.div>
              <motion.div {...cardMotion} className="rounded-lg border border-[#DAD7FB] bg-white p-4 shadow-xl shadow-[#3C3489]/10">
                <div className="rounded-md border border-[#EEEDFE] bg-[#FCFCFF] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#3C3489]">AI Team Summary</p>
                      <p className="mt-1 text-xs text-[#5F5E5A]">Generated from today&apos;s updates</p>
                    </div>
                    <span className="rounded-full bg-[#E8F7F1] px-3 py-1 text-xs font-semibold text-[#1D9E75]">Live draft</span>
                  </div>
                  <div className="mt-6 space-y-3">
                    {aiSummaryItems.map(([item, label, color]) => (
                      <div key={item} className="flex items-center justify-between gap-4 rounded-md border border-[#EEEDFE] bg-white p-4">
                        <div className="flex items-center gap-3">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                          <p className="font-semibold text-[#2C2C2A]">{item}</p>
                        </div>
                        <span className="rounded-full bg-[#EEEDFE] px-3 py-1 text-xs font-semibold text-[#3C3489]">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <section className="bg-[#EEEDFE] px-5 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <SectionHeader
                eyebrow="How it works"
                title="Three steps from chasing updates to seeing progress."
              />
              <div className="mt-14 grid gap-6 md:grid-cols-3">
                {steps.map(({ step, title, copy }, index) => (
                  <motion.article
                    key={step}
                    {...cardMotion}
                    transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' }}
                    className="rounded-lg border border-white/70 bg-white p-7 transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#7F77DD]">{step}</span>
                      <Workflow className="h-5 w-5 text-[#1D9E75]" aria-hidden="true" />
                    </div>
                    <h3 className="mt-8 text-xl font-bold text-[#2C2C2A]">{title}</h3>
                    <p className="mt-3 leading-7 text-[#5F5E5A]">{copy}</p>
                  </motion.article>
                ))}
              </div>
              <div className="mx-auto mt-10 grid max-w-3xl gap-3 rounded-lg border border-white/70 bg-white/70 p-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
                {['Employee update', 'AI summary', 'Manager dashboard'].map((item, index) => (
                  <span key={item} className="contents">
                    <motion.span
                      initial={{ opacity: 0.65 }}
                      animate={{ opacity: [0.65, 1, 0.65] }}
                      transition={{ duration: 2.4, delay: index * 0.35, repeat: Infinity, ease: 'easeInOut' }}
                      className="rounded-md bg-white px-4 py-3 text-center text-sm font-semibold text-[#3C3489]"
                    >
                      {item}
                    </motion.span>
                    {index < 2 ? <ArrowRight className="mx-auto hidden h-5 w-5 text-[#1D9E75] sm:block" aria-hidden="true" /> : null}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section id="pricing" className="px-5 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <SectionHeader
                eyebrow="Pricing"
                title="Start simple. Scale when visibility becomes company-wide."
                copy="Choose a plan that matches your current team size and progress tracking needs."
              />
              <div className="mt-14 grid gap-5 lg:grid-cols-4">
                {pricing.map(({ name, price, description, features, highlighted }, index) => (
                  <motion.article
                    key={name}
                    {...cardMotion}
                    transition={{ duration: 0.45, delay: index * 0.05, ease: 'easeOut' }}
                    className={`rounded-lg border p-6 ${
                      highlighted
                        ? 'border-[#7F77DD] bg-[#3C3489] text-white shadow-xl shadow-[#3C3489]/20'
                        : 'border-[#EEEDFE] bg-white text-[#2C2C2A] shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">{name}</h3>
                      {highlighted ? (
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">Popular</span>
                      ) : null}
                    </div>
                    <p className={`mt-4 text-3xl font-extrabold ${highlighted ? 'text-white' : 'text-[#3C3489]'}`}>
                      {price}
                    </p>
                    <p className={`mt-3 min-h-14 leading-6 ${highlighted ? 'text-white/75' : 'text-[#5F5E5A]'}`}>
                      {description}
                    </p>
                    <ul className="mt-7 space-y-3">
                      {features.map((feature) => (
                        <li key={feature} className={`flex gap-3 text-sm ${highlighted ? 'text-white/85' : 'text-[#5F5E5A]'}`}>
                          <Check className={`h-5 w-5 shrink-0 ${highlighted ? 'text-[#8DE4C3]' : 'text-[#1D9E75]'}`} aria-hidden="true" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={openTrial}
                      className={`mt-8 inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-semibold transition ${
                        highlighted
                          ? 'bg-white text-[#3C3489] hover:bg-[#EEEDFE]'
                          : 'bg-[#EEEDFE] text-[#3C3489] hover:bg-[#7F77DD] hover:text-white'
                      }`}
                    >
                      Get Early Access
                    </button>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          <section id="security" className="border-y border-[#EEEDFE] bg-[#FCFCFF] px-5 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1D9E75]">Data security</p>
                <h2 className="mt-4 text-3xl font-bold text-[#2C2C2A] sm:text-4xl">Workforce data handled with enterprise-grade care.</h2>
                <p className="mt-5 text-lg leading-8 text-[#5F5E5A]">
                  NudgeHQ keeps progress, attendance, and team insights protected with access controls and security-first workflows.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {badges.map(({ title, copy, icon: Icon }, index) => (
                  <motion.div
                    key={title}
                    {...cardMotion}
                    transition={{ duration: 0.45, delay: index * 0.05, ease: 'easeOut' }}
                    className="flex items-center gap-4 rounded-lg border border-[#EEEDFE] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#E8F7F1] text-[#1D9E75]">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-bold text-[#2C2C2A]">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#5F5E5A]">{copy}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Footer sections */}
          <footer className="px-5 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-10 border-t border-[#EEEDFE] pt-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
              <div>
                <a href="#top" className="flex items-center gap-3">
                  <img src="/brand/nudgehq-icon.svg" alt="" className="h-9 w-9 rounded-lg" />
                  <span className="font-bold text-[#3C3489]">NudgeHQ</span>
                </a>
                <p className="mt-4 max-w-sm leading-7 text-[#5F5E5A]">
                  Real-time workforce progress tracking for teams that want clarity without constant follow-ups.
                </p>
                <a className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#3C3489] hover:text-[#7F77DD]" href="mailto:hello.nudgehq@gmail.com">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  hello.nudgehq@gmail.com
                </a>
              </div>
              <div>
                <p className="font-semibold text-[#2C2C2A]">Product</p>
                <div className="mt-4 grid gap-3 text-sm font-medium text-[#5F5E5A]">
                  <a className="hover:text-[#3C3489]" href="#features">Features</a>
                  <a className="hover:text-[#3C3489]" href="#pricing">Pricing</a>
                  <a className="hover:text-[#3C3489]" href="#security">Security</a>
                  <button type="button" onClick={openTrial} className="w-fit text-left font-medium hover:text-[#3C3489]">
                    Get Early Access
                  </button>
                </div>
              </div>
              <div>
                <p className="font-semibold text-[#2C2C2A]">Company</p>
                <div className="mt-4 grid gap-3 text-sm font-medium text-[#5F5E5A]">
                  <a className="hover:text-[#3C3489]" href="mailto:hello.nudgehq@gmail.com">Contact</a>
                  <a className="inline-flex items-center gap-1 hover:text-[#3C3489]" href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
                    LinkedIn
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                  <a className="hover:text-[#3C3489]" href="#top">Privacy Policy</a>
                  <a className="hover:text-[#3C3489]" href="#top">Terms</a>
                </div>
              </div>
            </div>
            <div className="mx-auto mt-10 max-w-7xl border-t border-[#EEEDFE] pt-6">
              <p className="text-sm text-[#5F5E5A]">(c) 2026 NudgeHQ. All rights reserved.</p>
            </div>
          </footer>
        </>
      )}

      {/* VIEW 2: DEMO LOGIN CONSOLE */}
      {currentView === 'demo_console' && (
        <section className="mx-auto max-w-lg px-5 py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border border-[#DAD7FB] bg-white p-8 shadow-xl shadow-[#3C3489]/10"
          >
            <div className="text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#F4F3FF] text-[#3C3489]">
                <Zap className="h-6 w-6 text-[#F59E0B]" />
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-[#2C2C2A]">Developer Demo Console</h2>
              <p className="mt-2 text-sm text-[#5F5E5A]">
                Switch between demo roles and test the backend endpoints in real-time.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoSignIn('employee')}
                className="rounded-md border border-[#EEEDFE] bg-[#F4F3FF] p-3 text-center transition hover:bg-[#EEEDFE]"
              >
                <User className="mx-auto h-5 w-5 text-[#7F77DD]" />
                <span className="mt-2 block text-xs font-bold text-[#3C3489]">Employee Account</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('admin')}
                className="rounded-md border border-[#EEEDFE] bg-[#E8F7F1] p-3 text-center transition hover:bg-[#EEEDFE]"
              >
                <Shield className="mx-auto h-5 w-5 text-[#1D9E75]" />
                <span className="mt-2 block text-xs font-bold text-[#1D9E75]">Admin / HR Account</span>
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5F5E5A]">Email Address</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="mt-1.5 block w-full rounded-md border border-[#DAD7FB] px-3.5 py-2.5 text-sm outline-none focus:border-[#7F77DD]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5F5E5A]">Password</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="mt-1.5 block w-full rounded-md border border-[#DAD7FB] px-3.5 py-2.5 text-sm outline-none focus:border-[#7F77DD]"
                  required
                />
              </div>

              {loginError && (
                <div className="rounded-md bg-rose-50 p-3 text-xs font-medium text-rose-600 border border-rose-100">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                  {isBackendConnectionError(loginError) ? (
                    <button
                      type="button"
                      onClick={enterSandboxDashboard}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-[#3C3489] ring-1 ring-[#DAD7FB] transition hover:bg-[#EEEDFE]"
                    >
                      Continue in Sandbox Mode
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#7F77DD] py-3 text-sm font-semibold text-white shadow-md hover:bg-[#3C3489] transition disabled:opacity-50"
              >
                {loginLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                Sign in to Console
              </button>
            </form>

            <div className="mt-6 rounded-lg border border-[#EEEDFE] bg-[#FCFCFF] p-4">
              <button
                type="button"
                onClick={() => setShowCompanySignup(!showCompanySignup)}
                className="flex w-full items-center justify-between text-left"
              >
                <span>
                  <span className="block text-sm font-bold text-[#2C2C2A]">Create a company workspace</span>
                  <span className="mt-1 block text-xs text-[#5F5E5A]">Real Supabase signup for a new admin and organization.</span>
                </span>
                <ArrowRight className={`h-4 w-4 text-[#7F77DD] transition ${showCompanySignup ? 'rotate-90' : ''}`} />
              </button>

              {showCompanySignup ? (
                <form onSubmit={handleCompanySignup} className="mt-4 grid gap-3 border-t border-[#EEEDFE] pt-4">
                  <input
                    type="text"
                    placeholder="Company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="block w-full rounded-md border border-[#DAD7FB] px-3.5 py-2.5 text-sm outline-none focus:border-[#7F77DD]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Admin name"
                    value={companyAdminName}
                    onChange={(e) => setCompanyAdminName(e.target.value)}
                    className="block w-full rounded-md border border-[#DAD7FB] px-3.5 py-2.5 text-sm outline-none focus:border-[#7F77DD]"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Admin email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="block w-full rounded-md border border-[#DAD7FB] px-3.5 py-2.5 text-sm outline-none focus:border-[#7F77DD]"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={companyPassword}
                    onChange={(e) => setCompanyPassword(e.target.value)}
                    className="block w-full rounded-md border border-[#DAD7FB] px-3.5 py-2.5 text-sm outline-none focus:border-[#7F77DD]"
                    required
                  />
                  {companySignupError ? (
                    <p className="rounded-md border border-rose-100 bg-rose-50 p-3 text-xs font-medium text-rose-600">{companySignupError}</p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={companySignupLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#3C3489] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#7F77DD] disabled:opacity-50"
                  >
                    {companySignupLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
                    Create Workspace
                  </button>
                </form>
              ) : null}
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setCurrentView('landing')}
                className="text-xs font-medium text-[#5F5E5A] hover:text-[#3C3489] underline"
              >
                Back to landing page
              </button>
            </div>
          </motion.div>
        </section>
      )}

      {/* VIEW 3: LIVE DASHBOARD AREA */}
      {currentView === 'dashboard' && (
        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
          
          {/* Welcome User Header */}
          <div className="flex flex-col gap-4 border-b border-[#EEEDFE] pb-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${authRole === 'admin' ? 'bg-[#1D9E75]' : 'bg-[#7F77DD]'}`} />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5F5E5A]">
                  {authRole === 'admin' ? 'HR & Administration Workspace' : 'Employee Check-in Desk'}
                </span>
              </div>
              <h2 className="mt-1 text-3xl font-extrabold text-[#2C2C2A]">Hello, {user?.name || 'Demo User'}</h2>
              <p className="text-sm text-[#5F5E5A]">Logged in as: <strong className="text-[#3C3489]">{user?.email}</strong></p>
            </div>

            <button
              onClick={refreshDashboardData}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#DAD7FB] bg-white px-4.5 py-2.5 text-xs font-semibold text-[#3C3489] hover:bg-[#EEEDFE] transition shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh Dashboard
            </button>
          </div>

          {/* --- SUBVIEW: EMPLOYEE WORKSPACE --- */}
          {authRole === 'employee' && (
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              
              {/* Employee Left Column */}
              <div className="space-y-8">
                
                {/* Submit Daily Update */}
                <div className="rounded-lg border border-[#EEEDFE] bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-[#2C2C2A] flex items-center gap-2">
                    <Send className="h-5 w-5 text-[#7F77DD]" />
                    Share Daily Progress Update
                  </h3>
                  <form onSubmit={handleProgressSubmit} className="mt-5 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#5F5E5A]">Link this update to a Task (Optional)</label>
                      <select
                        value={selectedTaskId}
                        onChange={(e) => setSelectedTaskId(e.target.value)}
                        className="mt-1.5 block w-full rounded-md border border-[#DAD7FB] bg-white px-3 py-2 text-sm outline-none focus:border-[#7F77DD]"
                      >
                        <option value="">General update / No task link</option>
                        {empTasks.map(t => (
                          <option key={t.id} value={t.id}>{t.title} ({t.status})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5F5E5A]">What did you accomplish today? *</label>
                      <textarea
                        value={progressText}
                        onChange={(e) => setProgressText(e.target.value)}
                        placeholder="Detail accomplishments, milestones, or current focus..."
                        className="mt-1.5 block min-h-24 w-full rounded-md border border-[#DAD7FB] px-3.5 py-2.5 text-sm outline-none focus:border-[#7F77DD]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5F5E5A]">Proof/Deliverable Link (Optional)</label>
                      <input
                        type="url"
                        value={proofLink}
                        onChange={(e) => setProofLink(e.target.value)}
                        placeholder="https://github.com/... or https://docs.google.com/..."
                        className="mt-1.5 block w-full rounded-md border border-[#DAD7FB] px-3.5 py-2.5 text-sm outline-none focus:border-[#7F77DD]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingUpdate}
                      className="inline-flex items-center gap-2 rounded-md bg-[#7F77DD] px-5 py-3 text-sm font-semibold text-white shadow hover:bg-[#3C3489] transition disabled:opacity-50"
                    >
                      {isSubmittingUpdate ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Log Progress Update
                    </button>
                  </form>
                </div>

                {/* Task Status Transition Modal for Blockers */}
                {activeBlockTask && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1035]/45 px-5 py-8">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
                      <div className="flex items-start justify-between">
                        <h4 className="text-lg font-bold text-rose-600">Declare Task Blocker</h4>
                        <button onClick={() => setActiveBlockTask(null)} className="text-[#5F5E5A] hover:text-[#2C2C2A]">
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-[#5F5E5A]">
                        Task: <strong>{activeBlockTask.title}</strong>
                      </p>
                      
                      <div className="mt-4">
                        <label className="block text-xs font-semibold text-[#5F5E5A]">What is blocking your progress?</label>
                        <textarea
                          value={blockerTextVal}
                          onChange={(e) => setBlockerTextVal(e.target.value)}
                          placeholder="Provide details about credentials needed, dependencies on other teams, or server issues..."
                          className="mt-1.5 block min-h-20 w-full rounded-md border border-[#DAD7FB] px-3 py-2 text-sm outline-none focus:border-rose-500"
                          required
                        />
                      </div>

                      <div className="mt-5 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveBlockTask(null)}
                          className="rounded-md border border-[#DAD7FB] px-4 py-2 text-xs font-semibold text-[#5F5E5A] hover:bg-[#EEEDFE]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTaskStatusApi(activeBlockTask.id, 'blocked', blockerTextVal)}
                          disabled={!blockerTextVal.trim()}
                          className="rounded-md bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                        >
                          Submit Blocker
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Check-in History */}
                <div className="rounded-lg border border-[#EEEDFE] bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-[#2C2C2A] flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-[#3C3489]" />
                    Your Progress Update History
                  </h3>
                  <div className="mt-5 divide-y divide-[#EEEDFE] max-h-96 overflow-y-auto pr-2">
                    {empHistory.length === 0 ? (
                      <p className="text-sm text-[#5F5E5A] py-4">No progress logs found in database history.</p>
                    ) : (
                      empHistory.map(h => (
                        <div key={h.id} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex justify-between text-xs text-[#5F5E5A]">
                            <span>{h.tasks ? `Task: ${h.tasks.title}` : 'General Update'}</span>
                            <span>{formatDisplayDate(h.created_at)}</span>
                          </div>
                          <p className="mt-2 text-sm text-[#2C2C2A] font-medium leading-relaxed">{h.progress_text}</p>
                          {h.proof_link && (
                            <a
                              href={h.proof_link}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-[#7F77DD] hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Deliverable Proof
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Employee Right Column: Task Status Desk */}
              <div className="space-y-8">
                
                {/* Stats Dashboard mini */}
                {empStats && (
                  <div className="rounded-lg border border-[#EEEDFE] bg-[#FCFCFF] p-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5F5E5A]">Assigned Task Ratios</h4>
                    <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                      <div className="bg-white border border-[#EEEDFE] rounded p-2.5">
                        <span className="text-xl font-bold text-[#2C2C2A]">{empStats.todo + empStats.inProgress + empStats.completed + empStats.blocked}</span>
                        <p className="text-[10px] font-semibold text-[#5F5E5A] uppercase tracking-wider mt-1">Total</p>
                      </div>
                      <div className="bg-[#E8F7F1] border border-[#1D9E75]/20 rounded p-2.5">
                        <span className="text-xl font-bold text-[#1D9E75]">{empStats.completed}</span>
                        <p className="text-[10px] font-semibold text-[#1D9E75] uppercase tracking-wider mt-1">Done</p>
                      </div>
                      <div className="bg-[#F4F3FF] border border-[#7F77DD]/20 rounded p-2.5">
                        <span className="text-xl font-bold text-[#7F77DD]">{empStats.inProgress}</span>
                        <p className="text-[10px] font-semibold text-[#7F77DD] uppercase tracking-wider mt-1">Active</p>
                      </div>
                      <div className="bg-rose-50 border border-rose-200 rounded p-2.5">
                        <span className="text-xl font-bold text-rose-600">{empStats.blocked}</span>
                        <p className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider mt-1">Block</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assigned Tasks Card */}
                <div className="rounded-lg border border-[#EEEDFE] bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-[#2C2C2A] flex items-center gap-2">
                    <ListTodo className="h-5 w-5 text-[#1D9E75]" />
                    Assigned Task Registry
                  </h3>
                  <div className="mt-5 space-y-4">
                    {empTasks.length === 0 ? (
                      <p className="text-sm text-[#5F5E5A]">No tasks assigned to you currently.</p>
                    ) : (
                      empTasks.map(task => (
                        <div key={task.id} className="rounded-md border border-[#EEEDFE] p-4 bg-[#FCFCFF]">
                          <div className="flex items-start justify-between gap-4">
                            <h4 className="text-sm font-bold text-[#2C2C2A]">{task.title}</h4>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              task.status === 'completed' ? 'bg-[#E8F7F1] text-[#1D9E75]' :
                              task.status === 'blocked' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                              task.status === 'in_progress' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                          {task.description && <p className="mt-2 text-xs text-[#5F5E5A]">{task.description}</p>}
                          
                          <div className="mt-4 flex flex-wrap gap-2 border-t border-[#EEEDFE]/60 pt-3">
                            <span className="text-[10px] font-bold text-[#5F5E5A] w-full mb-1">Set status:</span>
                            {['todo', 'in_progress', 'completed', 'blocked'].map(st => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleUpdateStatusClick(task, st)}
                                disabled={task.status === st}
                                className={`text-[10px] font-bold px-2 py-1 rounded border transition ${
                                  task.status === st 
                                    ? 'bg-[#3C3489] text-white border-[#3C3489]' 
                                    : 'bg-white border-[#DAD7FB] text-[#3C3489] hover:bg-[#EEEDFE]'
                                }`}
                              >
                                {st.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* --- SUBVIEW: ADMIN WORKSPACE --- */}
          {authRole === 'admin' && (
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              
              {/* Admin Left Column */}
              <div className="space-y-8">
                
                {/* Metrics Stats Grid */}
                {analytics && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                      ['Total Staff', analytics.summary.totalEmployees, UsersRound],
                      ['Completion Rate', `${analytics.summary.completionRate}%`, CheckCircle2],
                      ['Active Blockers', analytics.summary.blockersCount, AlertCircle],
                      ['Today Updates Ratio', `${analytics.summary.checkinRate}%`, Sparkles]
                    ].map(([label, val, Icon]) => (
                      <div key={label} className="rounded-lg border border-[#EEEDFE] bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between text-[#5F5E5A]">
                          <span className="text-xs font-semibold">{label}</span>
                          <Icon className="h-4 w-4 text-[#3C3489]" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-[#2C2C2A]">{val}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* NudgeAI Control Panel */}
                <div className="rounded-lg border border-[#EEEDFE] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-[#F59E0B]" />
                    <h3 className="text-lg font-bold text-[#2C2C2A]">NudgeAI Operations Desk</h3>
                  </div>
                  <p className="mt-1 text-xs text-[#5F5E5A]">Turns active workforce data into summaries, delay signals, and suggested nudges.</p>
                  
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <button
                      onClick={() => triggerAiReport('summary')}
                      className="rounded-md border border-[#DAD7FB] bg-[#F4F3FF] p-3 text-center transition hover:border-[#7F77DD]"
                    >
                      <Sparkles className="mx-auto h-5 w-5 text-[#7F77DD]" />
                      <span className="mt-2 block text-xs font-bold text-[#3C3489]">NudgeAI Daily Summary</span>
                    </button>
                    <button
                      onClick={() => triggerAiReport('delays')}
                      className="rounded-md border border-[#DAD7FB] bg-rose-50 p-3 text-center transition hover:border-rose-400"
                    >
                      <Clock3 className="mx-auto h-5 w-5 text-rose-500" />
                      <span className="mt-2 block text-xs font-bold text-rose-700">Audit Delayed Tasks</span>
                    </button>
                    <button
                      onClick={() => triggerAiReport('inactivity')}
                      className="rounded-md border border-[#DAD7FB] bg-amber-50 p-3 text-center transition hover:border-amber-400"
                    >
                      <UserCheck className="mx-auto h-5 w-5 text-amber-500" />
                      <span className="mt-2 block text-xs font-bold text-amber-700">Check Inactivity</span>
                    </button>
                  </div>

                  {/* AI Results Output Container */}
                  <AnimatePresence>
                    {(aiLoading || aiReportContent) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 rounded-lg border border-[#EEEDFE] bg-[#FCFCFF] p-5 overflow-hidden"
                      >
                        {aiLoading ? (
                          <div className="flex flex-col items-center justify-center py-6 text-[#5F5E5A] gap-3">
                            <RefreshCw className="h-6 w-6 animate-spin text-[#3C3489]" />
                            <span className="text-xs font-semibold">Querying NudgeAI intelligence engine...</span>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between border-b border-[#EEEDFE] pb-3 mb-4">
                              <span className="text-xs font-bold uppercase tracking-wider text-[#3C3489]">
                                {aiReportType === 'summary' ? 'Daily Briefing Report' : aiReportType === 'delays' ? 'Overdue Risk Assessments' : 'Inactivity Report'}
                              </span>
                              <button onClick={() => setAiReportContent(null)} className="text-[#5F5E5A] hover:text-[#2C2C2A]">
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Report Rendering templates */}
                            {aiReportType === 'summary' && (
                              <div className="space-y-4 text-sm">
                                <p className="leading-relaxed text-[#2C2C2A] font-medium">{aiReportContent.summary}</p>
                                
                                {aiReportContent.achievements && aiReportContent.achievements.length > 0 && (
                                  <div>
                                    <span className="text-xs font-bold text-[#1D9E75] block uppercase tracking-wider">Major Achievements:</span>
                                    <ul className="list-disc list-inside mt-1.5 text-xs space-y-1 text-[#5F5E5A]">
                                      {aiReportContent.achievements.map((a, i) => <li key={i}>{a}</li>)}
                                    </ul>
                                  </div>
                                )}

                                {aiReportContent.blockers && aiReportContent.blockers.length > 0 && (
                                  <div>
                                    <span className="text-xs font-bold text-rose-600 block uppercase tracking-wider">Identified Blockers:</span>
                                    <ul className="list-disc list-inside mt-1.5 text-xs space-y-1 text-rose-700">
                                      {aiReportContent.blockers.map((b, i) => <li key={i}>{b}</li>)}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}

                            {aiReportType === 'delays' && (
                              <div className="space-y-3">
                                {aiReportContent.assessments?.map((a, i) => (
                                  <div key={i} className="rounded border border-[#EEEDFE] bg-white p-4">
                                    <div className="flex items-center justify-between">
                                      <h5 className="text-xs font-bold text-[#2C2C2A]">{a.task_title}</h5>
                                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                        a.risk_level === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                      }`}>{a.risk_level} Risk</span>
                                    </div>
                                    <p className="mt-2 text-xs text-[#5F5E5A] leading-relaxed"><strong>Suggested remedy:</strong> {a.remedy}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {aiReportType === 'inactivity' && (
                              <div className="space-y-3">
                                {aiReportContent.inactive_employees?.length === 0 ? (
                                  <p className="text-xs text-[#5F5E5A]">All employee updates are up to date within 3 days.</p>
                                ) : (
                                  aiReportContent.inactive_employees?.map((e, i) => (
                                    <div key={i} className="rounded border border-[#EEEDFE] bg-white p-4">
                                      <div className="flex justify-between text-xs font-bold text-[#2C2C2A]">
                                        <span>{e.name} ({e.department})</span>
                                        <span className="text-[#5F5E5A]">{e.email}</span>
                                      </div>
                                      <div className="mt-3 bg-amber-50/50 border border-amber-200/50 rounded p-3 text-xs text-amber-900 italic">
                                        &ldquo;{e.checkin_nudge}&rdquo;
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Audit All Employee Updates feed */}
                <div className="rounded-lg border border-[#EEEDFE] bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-[#2C2C2A]">Auditing Employee Update Feed</h3>
                  <div className="mt-5 divide-y divide-[#EEEDFE] max-h-96 overflow-y-auto pr-2">
                    {allUpdates.length === 0 ? (
                      <p className="text-sm text-[#5F5E5A] py-4">No recent employee check-ins found in query.</p>
                    ) : (
                      allUpdates.map(u => (
                        <div key={u.id} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex justify-between text-xs text-[#5F5E5A]">
                            <span className="font-bold text-[#3C3489]">{u.user?.name} ({u.user?.departments?.name || 'Unassigned'})</span>
                            <span>{formatDisplayDate(u.created_at)}</span>
                          </div>
                          <p className="mt-2 text-sm text-[#2C2C2A] leading-relaxed">{u.progress_text}</p>
                          <div className="mt-2 flex items-center justify-between text-[11px] text-[#5F5E5A]">
                            <span>Task link: <strong>{u.tasks?.title || 'General Update'}</strong></span>
                            {u.proof_link && (
                              <a href={u.proof_link} target="_blank" rel="noreferrer" className="text-[#7F77DD] hover:underline flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" /> Proof Link
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Admin Right Column */}
              <div className="space-y-8">
                
                {/* Export Reports Ready Card */}
                <div className="rounded-lg border border-[#EEEDFE] bg-[#FCFCFF] p-6">
                  <h4 className="text-sm font-bold text-[#2C2C2A]">Export Operational Datasets</h4>
                  <p className="text-xs text-[#5F5E5A] mt-1">Download flat JSON metrics mapping active task assignees and blockers.</p>
                  
                  <a
                    href={isSandbox ? '#' : `http://localhost:${serverPort}/api/admin/reports/export`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => {
                      if (isSandbox) {
                        e.preventDefault();
                        showToast("Sandbox data export simulated. Check console.", "info");
                        console.log(analytics);
                      }
                    }}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#3C3489] py-3 text-xs font-semibold text-white shadow hover:bg-[#7F77DD] transition"
                  >
                    <Download className="h-4 w-4" />
                    Compile & Export Report
                  </a>
                </div>

                {/* Invite Employees */}
                <div className="rounded-lg border border-[#EEEDFE] bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-[#2C2C2A]">Invite Employee</h3>
                  <p className="mt-1 text-xs text-[#5F5E5A]">Create an employee login and assign them to a department.</p>

                  <form onSubmit={handleInviteEmployee} className="mt-4 space-y-3">
                    <input
                      type="text"
                      placeholder="Employee name *"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="block w-full rounded-md border border-[#DAD7FB] px-3 py-2 text-xs outline-none focus:border-[#7F77DD]"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Employee email *"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="block w-full rounded-md border border-[#DAD7FB] px-3 py-2 text-xs outline-none focus:border-[#7F77DD]"
                      required
                    />
                    <select
                      value={inviteDepartmentId}
                      onChange={(e) => setInviteDepartmentId(e.target.value)}
                      className="block w-full rounded-md border border-[#DAD7FB] bg-white px-2 py-2 text-xs outline-none focus:border-[#7F77DD]"
                    >
                      <option value="">No department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={inviteLoading}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-[#7F77DD] py-2.5 text-xs font-semibold text-white hover:bg-[#3C3489] transition disabled:opacity-50"
                    >
                      {inviteLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
                      Invite Employee
                    </button>
                  </form>

                  {inviteResult ? (
                    <div className="mt-4 rounded-md border border-[#E8F7F1] bg-[#E8F7F1] p-3 text-xs text-[#1D9E75]">
                      <p className="font-bold">Invite ready for {inviteResult.email}</p>
                      <p className="mt-1">Temporary password: <span className="font-mono font-bold">{inviteResult.temporary_password}</span></p>
                    </div>
                  ) : null}
                </div>

                {/* Create & Assign Tasks */}
                <div className="rounded-lg border border-[#EEEDFE] bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-[#2C2C2A]">Create & Assign Tasks</h3>
                  <form onSubmit={handleCreateTask} className="mt-4 space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Task Title *"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="block w-full rounded-md border border-[#DAD7FB] px-3 py-2 text-xs outline-none focus:border-[#7F77DD]"
                        required
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="Task Description"
                        value={newTaskDesc}
                        onChange={(e) => setNewTaskDesc(e.target.value)}
                        className="block min-h-16 w-full rounded-md border border-[#DAD7FB] px-3 py-2 text-xs outline-none focus:border-[#7F77DD]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#5F5E5A] uppercase tracking-wider mb-1">Assignee</label>
                      <select
                        value={newTaskAssignee}
                        onChange={(e) => setNewTaskAssignee(e.target.value)}
                        className="block w-full rounded-md border border-[#DAD7FB] bg-white px-2 py-2 text-xs outline-none"
                      >
                        <option value="">Unassigned</option>
                        {adminUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-[#7F77DD] py-2.5 text-xs font-semibold text-white hover:bg-[#3C3489] transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create Task
                    </button>
                  </form>
                </div>

                {/* Manage Departments */}
                <div className="rounded-lg border border-[#EEEDFE] bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-[#2C2C2A]">Manage Departments</h3>
                  
                  <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
                    {departments.map(dept => (
                      <div key={dept.id} className="flex items-center justify-between p-2.5 rounded border border-[#EEEDFE] bg-[#FCFCFF] text-xs">
                        <div>
                          <strong className="text-[#2C2C2A]">{dept.name}</strong>
                          {dept.description && <p className="text-[10px] text-[#5F5E5A] mt-0.5">{dept.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleCreateDepartment} className="mt-4 border-t border-[#EEEDFE]/60 pt-4 space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Department Name *"
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        className="block w-full rounded-md border border-[#DAD7FB] px-3 py-2 text-xs outline-none focus:border-[#7F77DD]"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Description (Optional)"
                        value={newDeptDesc}
                        onChange={(e) => setNewDeptDesc(e.target.value)}
                        className="block w-full rounded-md border border-[#DAD7FB] px-3 py-2 text-xs outline-none focus:border-[#7F77DD]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-[#7F77DD] py-2.5 text-xs font-semibold text-white hover:bg-[#3C3489] transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Department
                    </button>
                  </form>
                </div>

              </div>

            </div>
          )}

        </section>
      )}

      {/* --- EARLY ACCESS EMAIL FALLBACK MODAL --- */}
      {isTrialOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1A1035]/45 px-5 py-8">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl shadow-[#1A1035]/25">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1D9E75]">Early access</p>
                <h2 className="mt-2 text-2xl font-bold text-[#2C2C2A]">Join the NudgeHQ beta list.</h2>
              </div>
              <button
                type="button"
                onClick={closeTrial}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#EEEDFE] text-[#5F5E5A] transition hover:bg-[#EEEDFE] hover:text-[#3C3489]"
                aria-label="Close trial request"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-4 leading-7 text-[#5F5E5A]">
              We&apos;re onboarding early teams manually while the product flow is being built. Send a quick request and we&apos;ll follow up with beta access details.
            </p>
            
            <div className="mt-6 border-t border-[#EEEDFE] pt-4">
              <p className="text-xs text-[#5F5E5A] font-semibold mb-2">💡 Want to test the platform live?</p>
              <button
                type="button"
                onClick={() => {
                  closeTrial();
                  setCurrentView('demo_console');
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#3C3489] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7F77DD]"
              >
                <Zap className="h-4 w-4 text-[#F59E0B]" />
                Launch Demo Console
              </button>
            </div>

            <div className="mt-3 grid gap-3">
              <a
                href="mailto:hello.nudgehq@gmail.com?subject=NudgeHQ%20early%20access%20request"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[#DAD7FB] bg-white px-5 py-3 text-sm font-semibold text-[#3C3489] transition hover:bg-[#EEEDFE]"
              >
                Request access by email
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

function SectionHeader({ eyebrow, title, copy }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1D9E75]">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-bold text-[#2C2C2A] sm:text-4xl">{title}</h2>
      {copy ? <p className="mt-4 text-lg leading-8 text-[#5F5E5A]">{copy}</p> : null}
    </div>
  )
}

export default App
