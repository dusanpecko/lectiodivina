'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Flag, User, Eye, Settings, BarChart3, Save, X, Upload, Image as ImageIcon, ChevronDown, ChevronRight, AlertTriangle, Search, Filter, Copy } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'navrhy' | 'vyvoj' | 'testovanie' | 'hotove';
  priority: 'low' | 'medium' | 'high';
  assignee: string | null;
  due_date: string | null;
  image_url: string | null; // Pridané pre obrázky
  created_at: string;
}

const columns = {
  navrhy: { title: 'NÁVRHY', color: 'bg-blue-50 border-blue-200', headerColor: 'bg-blue-100' },
  vyvoj: { title: 'VO VÝVOJI', color: 'bg-yellow-50 border-yellow-200', headerColor: 'bg-yellow-100' },
  testovanie: { title: 'V TESTOVANÍ', color: 'bg-orange-50 border-orange-200', headerColor: 'bg-orange-100' },
  hotove: { title: 'HOTOVÉ', color: 'bg-green-50 border-green-200', headerColor: 'bg-green-100' }
};

const priorityColors = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
};

const priorityLabels = {
  high: 'Vysoká',
  medium: 'Stredná',
  low: 'Nízka'
};

export default function AdminTasksPage() {
  console.log('AdminTasksPage rendered'); // Debug log
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set()); // Sledovanie rozbalených úloh
  
  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'navrhy' | 'vyvoj' | 'testovanie' | 'hotove'>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'overdue' | 'thisWeek' | 'my'>('all');
  
  // Users state
  const [users, setUsers] = useState<Array<{id: string, email: string, full_name: string, role: string}>>([]);
  const [currentUser, setCurrentUser] = useState<{id: string, email: string, full_name: string, role: string} | null>(null);
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    assignee: string;
    due_date: string;
    image_url: string;
  }>({
    title: '',
    description: '',
    priority: 'medium',
    assignee: '',
    due_date: '',
    image_url: ''
  });

  // Fetch tasks from Supabase
  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchCurrentUser();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched tasks:', data.length, 'tasks'); // Debug log
        setTasks(data);
      } else {
        console.error('Failed to fetch tasks:', response.status);
        // Keep existing tasks if fetch fails
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Only use mock data if no tasks exist
      if (tasks.length === 0) {
        setTasks([
          {
            id: '1',
            title: 'Nová funkcia denného čítania',
            description: 'Implementovať systém pre denné biblické čítania s možnosťou sledovania pokroku',
            status: 'navrhy',
            priority: 'high',
            assignee: 'dusan@pecko.me',
            due_date: '2025-07-15',
            image_url: null,
            created_at: '2025-06-20T00:00:00Z'
          },
          {
            id: '2',
            title: 'Mobilná aplikácia optimalizácia',
            description: 'Zlepšiť responzívnosť a výkon na mobilných zariadeniach',
            status: 'vyvoj',
            priority: 'medium',
            assignee: 'maria@example.com',
            due_date: '2025-07-01',
            image_url: null,
            created_at: '2025-06-18T00:00:00Z'
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Mock users for development
      setUsers([
        { id: '1', email: 'dusan@pecko.me', full_name: 'Dušan Pecko', role: 'admin' },
        { id: '2', email: 'maria@example.com', full_name: 'Mária Nováková', role: 'admin' },
        { id: '3', email: 'peter@example.com', full_name: 'Peter Svoboda', role: 'user' },
        { id: '4', email: 'anna@example.com', full_name: 'Anna Krásna', role: 'admin' }
      ]);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      } else {
        // Fallback - use user from session or mock
        console.log('API /api/auth/me not available, using fallback');
        setCurrentUser({ id: '1', email: 'dusan@pecko.me', full_name: 'Dušan Pecko', role: 'admin' });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      // Mock current user for development
      setCurrentUser({ id: '1', email: 'dusan@pecko.me', full_name: 'Dušan Pecko', role: 'admin' });
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    setDraggedTask(null);
    setDraggedOver(null);
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOver(status);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    if (!draggedTask) return;
    
    if (draggedTask.status !== newStatus) {
      await updateTaskStatus(draggedTask.id, newStatus);
    }
    
    setDraggedTask(null);
    setDraggedOver(null);
  };

  // Image upload handler
  const handleImageUpload = async (file: File) => {
    if (!file) return null;
    
    setUploading(true);
    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'task-images');
      
      // Upload to API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.url;
      } else {
        console.error('Upload failed');
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // File input change handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Prosím vyberte obrázok');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Obrázok je príliš veľký. Maximum 5MB.');
        return;
      }
      
      const imageUrl = await handleImageUpload(file);
      if (imageUrl) {
        setNewTask({ ...newTask, image_url: imageUrl });
      }
    }
  };

  // Remove image
  const removeImage = () => {
    setNewTask({ ...newTask, image_url: '' });
  };

  // Toggle task expansion
  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (expandedTasks.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  // API calls
  const createTask = async (taskData: typeof newTask) => {
    try {
      console.log('Sending task data:', taskData); // Debug log
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          status: 'navrhy',
          created_at: new Date().toISOString()
        })
      });

      const responseData = await response.json();
      console.log('Response:', response.status, responseData); // Debug log

      if (response.ok) {
        setTasks(prev => [...prev, responseData]);
        // Refresh tasks from server to ensure sync
        setTimeout(() => {
          fetchTasks();
        }, 500);
        return true;
      } else {
        console.error('API Error:', responseData);
        alert(`Chyba pri vytváraní úlohy: ${responseData.error || 'Neznáma chyba'}`);
        return false;
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Chyba pri komunikácii so serverom');
      return false;
    }
  };

  const updateTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
        return true;
      }
    } catch (error) {
      console.error('Error updating task:', error);
      // Mock update for development
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...taskData } : task
      ));
      return true;
    }
    return false;
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    return updateTask(taskId, { status });
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        return true;
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      // Mock delete for development
      setTasks(prev => prev.filter(task => task.id !== taskId));
      return true;
    }
    return false;
  };

  // Form handlers
  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    
    const success = await createTask(newTask);
    if (success) {
      setNewTask({ title: '', description: '', priority: 'medium', assignee: '', due_date: '', image_url: '' });
      setShowAddForm(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      assignee: task.assignee || '',
      due_date: task.due_date || '',
      image_url: task.image_url || ''
    });
    setShowAddForm(true);
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;
    
    const success = await updateTask(editingTask.id, newTask);
    if (success) {
      setEditingTask(null);
      setNewTask({ title: '', description: '', priority: 'medium', assignee: '', due_date: '', image_url: '' });
      setShowAddForm(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Ste si istí, že chcete vymazať túto úlohu?')) {
      await deleteTask(taskId);
    }
  };

  // Utility functions
  const getProgress = () => {
    const total = tasks.length;
    if (total === 0) return 0;
    
    const completed = tasks.filter(task => task.status === 'hotove').length;
    return Math.round((completed / total) * 100);
  };

  const getDetailedProgress = () => {
    const total = tasks.length;
    if (total === 0) return { navrhy: 0, vyvoj: 0, testovanie: 0, hotove: 0, total: 0 };
    
    const counts = {
      navrhy: tasks.filter(task => task.status === 'navrhy').length,
      vyvoj: tasks.filter(task => task.status === 'vyvoj').length,
      testovanie: tasks.filter(task => task.status === 'testovanie').length,
      hotove: tasks.filter(task => task.status === 'hotove').length,
      total
    };
    
    return {
      ...counts,
      navrhyPercent: Math.round((counts.navrhy / total) * 100),
      vyvojPercent: Math.round((counts.vyvoj / total) * 100),
      testovaniePercent: Math.round((counts.testovanie / total) * 100),
      hotovePercent: Math.round((counts.hotove / total) * 100)
    };
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  // Check if task is overdue
  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    const today = new Date();
    const taskDueDate = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    taskDueDate.setHours(0, 0, 0, 0);
    return taskDueDate < today;
  };

  // Get overdue tasks count
  const getOverdueTasks = () => {
    return tasks.filter(task => 
      task.status !== 'hotove' && isOverdue(task.due_date)
    );
  };

  // Get unique assignees for filter (only admins)
  const getUniqueAssignees = () => {
    const assigneeEmails = tasks
      .map(task => task.assignee)
      .filter(Boolean) as string[];
    const uniqueEmails = [...new Set(assigneeEmails)];
    
    // Return only admin users that have tasks assigned
    return users.filter(user => 
      uniqueEmails.includes(user.email) && user.role === 'admin'
    );
  };

  // Get all admin users for task assignment
  const getAdminUsers = () => {
    return users.filter(user => user.role === 'admin');
  };

  // Get user display name by email
  const getUserDisplayName = (email: string | null) => {
    if (!email) return null;
    const user = users.find(u => u.email === email);
    return user ? user.full_name : email;
  };

  // Filter tasks based on search and filters
  const getFilteredTasks = () => {
    return tasks.filter(task => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Priority filter
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

      // Assignee filter
      const matchesAssignee = filterAssignee === 'all' || task.assignee === filterAssignee;

      // Status filter
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;

      // Quick filters
      let matchesQuickFilter = true;
      if (quickFilter === 'overdue') {
        matchesQuickFilter = task.status !== 'hotove' && isOverdue(task.due_date);
      } else if (quickFilter === 'thisWeek') {
        const today = new Date();
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        matchesQuickFilter = task.due_date ? 
          new Date(task.due_date) >= today && new Date(task.due_date) <= weekFromNow : false;
      } else if (quickFilter === 'my') {
        // Filter by current user's email
        matchesQuickFilter = currentUser ? task.assignee === currentUser.email : false;
      }

      return matchesSearch && matchesPriority && matchesAssignee && matchesStatus && matchesQuickFilter;
    });
  };

  // Get filtered tasks by status
  const getFilteredTasksByStatus = (status: Task['status']) => {
    return getFilteredTasks().filter(task => task.status === status);
  };

  // Duplicate task
  const duplicateTask = async (originalTask: Task) => {
    const duplicatedTaskData = {
      title: `${originalTask.title} (kópia)`,
      description: originalTask.description || '',
      priority: originalTask.priority,
      assignee: originalTask.assignee || '',
      due_date: originalTask.due_date || '',
      image_url: originalTask.image_url || ''
    };
    
    const success = await createTask(duplicatedTaskData);
    if (success) {
      console.log('Task duplicated successfully');
    }
  };

  // Quick add task to specific column
  const quickAddTask = (status: Task['status']) => {
    setNewTask({ 
      title: '', 
      description: '', 
      priority: 'medium', 
      assignee: '', 
      due_date: '', 
      image_url: '' 
    });
    setEditingTask(null);
    setShowAddForm(true);
    // We'll modify the form to pre-select the status
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterPriority('all');
    setFilterAssignee('all');
    setFilterStatus('all');
    setQuickFilter('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam úlohy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin - Správa úloh</h1>
              <p className="text-gray-600 mt-1">Kanban board pre Lectio Divina projekt</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Pokrok: {getProgress()}%</span>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Pridať úlohu</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 SEARCH AND FILTERS - MOVED HERE */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🔍 Vyhľadávanie a Filtre</h2>
          
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Vyhľadať úlohy..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setQuickFilter('all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  quickFilter === 'all' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Všetky
              </button>
              <button
                onClick={() => setQuickFilter('overdue')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  quickFilter === 'overdue' 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Po termíne
              </button>
              <button
                onClick={() => setQuickFilter('thisWeek')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  quickFilter === 'thisWeek' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tento týždeň
              </button>
              <button
                onClick={() => setQuickFilter('my')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  quickFilter === 'my' 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Moje úlohy
              </button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Všetky priority</option>
              <option value="high">Vysoká priorita</option>
              <option value="medium">Stredná priorita</option>
              <option value="low">Nízka priorita</option>
            </select>
            
            {/* Assignee Filter */}
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Všetky osoby</option>
              {getUniqueAssignees().map(user => (
                <option key={user.id} value={user.email}>{user.full_name}</option>
              ))}
            </select>
            
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Všetky stavy</option>
              <option value="navrhy">Návrhy</option>
              <option value="vyvoj">Vo vývoji</option>
              <option value="testovanie">V testovaní</option>
              <option value="hotove">Hotové</option>
            </select>
            
            {/* Clear Filters */}
            {(searchTerm || filterPriority !== 'all' || filterAssignee !== 'all' || filterStatus !== 'all' || quickFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Vymazať filtre
              </button>
            )}
          </div>
          
          {/* Filter Results Count */}
          {getFilteredTasks().length !== tasks.length && (
            <div className="mt-3 text-sm text-gray-600">
              Zobrazených {getFilteredTasks().length} z {tasks.length} úloh
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingTask ? 'Upraviť úlohu' : 'Pridať novú úlohu'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingTask(null);
                  setNewTask({ title: '', description: '', priority: 'medium', assignee: '', due_date: '', image_url: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Názov úlohy *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Zadajte názov úlohy"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Popis
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                  placeholder="Zadajte popis úlohy"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priorita
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Nízka</option>
                    <option value="medium">Stredná</option>
                    <option value="high">Vysoká</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Termín
                  </label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zodpovedná osoba
                </label>
                <select
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Nevybrané</option>
                  {getAdminUsers().map(user => (
                    <option key={user.id} value={user.email}>
                      {user.full_name} {user.role === 'admin' && '👑'}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Obrázok <span className="text-gray-500">(voliteľné)</span>
                </label>
                
                {/* Current Image Preview */}
                {newTask.image_url && (
                  <div className="mb-3 relative">
                    <img 
                      src={newTask.image_url} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {/* Upload Button */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer ${
                      uploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-gray-600">Nahráva sa...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {newTask.image_url ? 'Zmeniť obrázok' : 'Pridať obrázok'} 
                          <span className="text-xs ml-1">(max 5MB)</span>
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={editingTask ? handleUpdateTask : handleAddTask}
                disabled={!newTask.title.trim()}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{editingTask ? 'Uložiť' : 'Pridať'}</span>
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingTask(null);
                  setNewTask({ title: '', description: '', priority: 'medium', assignee: '', due_date: '', image_url: '' });
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Zrušiť
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(columns).map(([status, column]) => (
            <div key={status} className={`rounded-lg border-2 ${column.color}`}>
              <div className={`${column.headerColor} p-4 rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">{column.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="bg-white text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
                      {getFilteredTasksByStatus(status as Task['status']).length}
                    </span>
                    <button
                      onClick={() => quickAddTask(status as Task['status'])}
                      className="bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 p-1 rounded-full transition-colors"
                      title="Rýchlo pridať úlohu"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div
                className={`p-4 min-h-96 transition-colors ${
                  draggedOver === status ? 'bg-blue-50' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status as Task['status'])}
              >
                {getFilteredTasksByStatus(status as Task['status']).map((task) => {
                  const isExpanded = expandedTasks.has(task.id);
                  const taskOverdue = isOverdue(task.due_date);
                  
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white rounded-lg shadow-sm border mb-3 transition-all cursor-move hover:shadow-md ${
                        draggedTask?.id === task.id ? 'shadow-lg rotate-1 opacity-50' : ''
                      } ${
                        taskOverdue && task.status !== 'hotove' 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      {/* Kompaktný režim - nové rozloženie */}
                      <div className="p-3">
                        {/* Prvý riadok - názov a priorita */}
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            task.priority === 'high' ? 'bg-red-500' : 
                            task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></span>
                          
                          <span className={`font-medium flex-1 ${
                            taskOverdue && task.status !== 'hotove' 
                              ? 'text-red-800' 
                              : 'text-gray-800'
                          }`}>
                            {task.title}
                          </span>
                        </div>
                        
                        {/* Druhý riadok - ikony indikátorov */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {taskOverdue && task.status !== 'hotove' && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                            {task.image_url && (
                              <ImageIcon className="w-4 h-4 text-gray-400" />
                            )}
                            {task.assignee && (
                              <User className="w-4 h-4 text-gray-400" />
                            )}
                            {task.due_date && (
                              <Calendar className={`w-4 h-4 ${
                                taskOverdue && task.status !== 'hotove' 
                                  ? 'text-red-500' 
                                  : 'text-gray-400'
                              }`} />
                            )}
                          </div>
                          
                          {/* Tretí riadok - tlačidlá akcií */}
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => duplicateTask(task)}
                              className="text-gray-400 hover:text-green-600 transition-colors p-1"
                              title="Duplikovať"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditTask(task)}
                              className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                              title="Upraviť"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1"
                              title="Vymazať"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleTaskExpansion(task.id)}
                              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                              title={isExpanded ? "Zbaliť" : "Rozbaliť"}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Rozbalený obsah */}
                      {isExpanded && (
                        <div className="px-3 pb-3 border-t border-gray-100">
                          <div className="pt-3 space-y-3">
                            {/* Obrázok */}
                            {task.image_url && (
                              <div>
                                <img 
                                  src={task.image_url} 
                                  alt={task.title}
                                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                />
                              </div>
                            )}
                            
                            {/* Popis */}
                            {task.description && (
                              <div>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                  {task.description}
                                </p>
                              </div>
                            )}
                            
                            {/* Detaily */}
                            <div className="flex flex-wrap gap-3 text-xs">
                              <span className={`px-2 py-1 rounded-full font-medium border ${
                                priorityColors[task.priority]
                              }`}>
                                <Flag className="w-3 h-3 inline mr-1" />
                                {priorityLabels[task.priority]}
                              </span>
                              
                              {task.assignee && (
                                <span className="flex items-center text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                                  <User className="w-3 h-3 mr-1" />
                                  {getUserDisplayName(task.assignee)}
                                </span>
                              )}
                              
                              {task.due_date && (
                                <span className={`flex items-center px-2 py-1 rounded-full ${
                                  taskOverdue && task.status !== 'hotove'
                                    ? 'text-red-700 bg-red-100 border border-red-200'
                                    : 'text-gray-500 bg-gray-50'
                                }`}>
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(task.due_date).toLocaleDateString('sk-SK')}
                                  {taskOverdue && task.status !== 'hotove' && (
                                    <span className="ml-1 text-xs font-medium">(po termíne)</span>
                                  )}
                                </span>
                              )}
                              
                              <span className="flex items-center text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                                Vytvorené: {new Date(task.created_at).toLocaleDateString('sk-SK')}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {getFilteredTasksByStatus(status as Task['status']).length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    {getTasksByStatus(status as Task['status']).length === 0 ? (
                      <p>Žiadne úlohy</p>
                    ) : (
                      <div>
                        <p>Žiadne úlohy nezodpovedajú filtrom</p>
                        <button
                          onClick={clearFilters}
                          className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                        >
                          Vymazať filtre
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}