'use client';

import { ArrowLeft, Calendar, Check, ExternalLink, Kanban, Mail, MessageSquare, Plus, Save, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface BetaFeedback {
  id: number;
  email: string | null;
  message: string;
  page_url: string | null;
  user_agent: string | null;
  language: string;
  created_at: string;
  resolved: boolean;
  status: 'new' | 'resolved' | 'sent_to_task';
  admin_notes: string | null;
}

export default function BetaFeedbackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<BetaFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'new' | 'resolved' | 'sent_to_task'>('new');
  const [adminNotes, setAdminNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [feedbackId, setFeedbackId] = useState<string>('');
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    status: 'navrhy' as 'navrhy' | 'vyvoj' | 'testovanie' | 'hotove',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignee: '',
    due_date: ''
  });
  const [users, setUsers] = useState<Array<{id: string, email: string, full_name: string}>>([]);
  const [creatingTask, setCreatingTask] = useState(false);

  // Task creation constants from tasks page
  const columns = {
    navrhy: { title: 'NÁVRHY', color: 'bg-blue-50 border-blue-200' },
    vyvoj: { title: 'VO VÝVOJI', color: 'bg-yellow-50 border-yellow-200' },
    testovanie: { title: 'V TESTOVANÍ', color: 'bg-orange-50 border-orange-200' },
    hotove: { title: 'HOTOVÉ', color: 'bg-green-50 border-green-200' }
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

  useEffect(() => {
    params.then((resolvedParams) => {
      setFeedbackId(resolvedParams.id);
    });
  }, [params]);

  const fetchFeedback = useCallback(async () => {
    if (!feedbackId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/beta-feedback/${feedbackId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      setFeedback(result.data);
      // Use status field if available, otherwise fall back to resolved field
      if (result.data.status) {
        setStatus(result.data.status);
      } else {
        setStatus(result.data.resolved ? 'resolved' : 'new');
      }
      setAdminNotes(result.data.admin_notes || '');
    } catch (error) {
      console.error('Error fetching feedback:', error);
      router.push('/admin/error-reports');
    } finally {
      setLoading(false);
    }
  }, [feedbackId, router]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Initialize task data when feedback is loaded
  useEffect(() => {
    if (feedback) {
      setTaskData(prev => ({
        ...prev,
        title: `Beta Feedback #${feedback.id}: ${feedback.message.substring(0, 50)}${feedback.message.length > 50 ? '...' : ''}`,
        description: `Beta Feedback od používateľa:\n\n${feedback.message}\n\n${feedback.email ? `Email: ${feedback.email}` : 'Anonymný feedback'}\nStránka: ${feedback.page_url || 'N/A'}`
      }));
    }
  }, [feedback]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!taskData.title.trim()) {
      alert('Názov tasku je povinný');
      return;
    }

    try {
      setCreatingTask(true);
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...taskData,
          due_date: taskData.due_date || null
        }),
      });

      if (response.ok) {
        // Update feedback status to 'sent_to_task'
        setStatus('sent_to_task');
        await handleSave();
        
        alert('Task bol úspešne vytvorený!');
        setShowCreateTaskModal(false);
        
        // Reset task form
        setTaskData({
          title: '',
          description: '',
          status: 'navrhy',
          priority: 'medium',
          assignee: '',
          due_date: ''
        });
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Chyba pri vytváraní tasku');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/beta-feedback/${feedbackId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          resolved: status === 'resolved', // Keep backward compatibility
          admin_notes: adminNotes.trim() || null
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Refresh data
      fetchFeedback();
    } catch (error) {
      console.error('Error saving feedback:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{ 
              borderColor: 'rgba(64, 70, 123, 0.2)',
              borderTopColor: '#40467b'
            }}
          />
          <p className="text-gray-600">Načítavam beta feedback...</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Beta Feedback sa nenašiel</h2>
          <p className="text-gray-600 mb-4">Tento feedback možno už neexistuje alebo bol zmazaný.</p>
          <button
            onClick={() => router.push('/admin/error-reports')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Späť na zoznam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/admin/error-reports')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-80 font-medium"
            style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)', color: '#40467b' }}
          >
            <ArrowLeft size={20} />
            Späť na zoznam
          </button>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg animate-fade-in" style={{ backgroundColor: '#d1fae5' }}>
                <Check size={16} style={{ color: '#065f46' }} />
                <span className="text-sm font-medium" style={{ color: '#065f46' }}>
                  Zmeny uložené
                </span>
              </div>
            )}
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:opacity-80 disabled:opacity-50 shadow-md"
              style={{ backgroundColor: '#40467b' }}
            >
              <Save size={20} />
              {saving ? 'Ukladám...' : 'Uložiť zmeny'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">ID feedbacku</div>
            <div className="text-lg font-bold" style={{ color: '#40467b' }}>#{feedback.id}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Dátum vytvorenia</div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar size={16} />
              {formatDate(feedback.created_at)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Používateľ</div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User size={16} />
              {feedback.email || 'Anonymný'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Feedback Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Info */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#40467b' }}>
              Informácie o používateľovi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Email</div>
                <div className="text-base font-medium text-gray-900">
                  {feedback.email ? (
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      {feedback.email}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Anonymný feedback</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Jazyk</div>
                <div className="text-base font-bold" style={{ color: '#40467b' }}>
                  {feedback.language.toUpperCase()}
                </div>
              </div>
            </div>
            
            {(feedback.page_url || feedback.user_agent) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {feedback.page_url && (
                  <div className="mb-3">
                    <div className="text-sm text-gray-600 mb-1">Stránka</div>
                    <a 
                      href={feedback.page_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 underline text-sm"
                    >
                      <ExternalLink size={14} />
                      {feedback.page_url}
                    </a>
                  </div>
                )}
                {feedback.user_agent && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Prehliadač</div>
                    <div className="text-xs text-gray-700 font-mono bg-gray-50 p-2 rounded">
                      {feedback.user_agent}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Feedback Message */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#40467b' }}>
              Správa od používateľa
            </h2>
            
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={18} style={{ color: '#3b82f6' }} />
                <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#3b82f6' }}>
                  Feedback
                </h3>
              </div>
              <div 
                className="p-4 rounded-lg border-l-4"
                style={{ 
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderLeftColor: '#3b82f6'
                }}
              >
                <p className="text-gray-900 whitespace-pre-wrap text-base leading-relaxed">
                  {feedback.message}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Notes Display */}
          {feedback.admin_notes && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#40467b' }}>
                Admin poznámky
              </h2>
              <div 
                className="p-4 rounded-lg border-l-4"
                style={{ 
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderLeftColor: '#10b981'
                }}
              >
                <p className="text-gray-900 whitespace-pre-wrap text-base leading-relaxed">
                  {feedback.admin_notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#40467b' }}>
              Status
            </h3>
            
            <div className="space-y-3">
              <div 
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ 
                  backgroundColor: status === 'resolved' ? 'rgba(16, 185, 129, 0.1)' : 
                                   status === 'sent_to_task' ? 'rgba(59, 130, 246, 0.1)' : 
                                   'rgba(245, 158, 11, 0.1)' 
                }}
              >
                {status === 'resolved' ? (
                  <Check size={20} style={{ color: '#10b981' }} />
                ) : status === 'sent_to_task' ? (
                  <Kanban size={20} style={{ color: '#3b82f6' }} />
                ) : (
                  <X size={20} style={{ color: '#f59e0b' }} />
                )}
                <span 
                  className="font-semibold"
                  style={{ 
                    color: status === 'resolved' ? '#10b981' : 
                           status === 'sent_to_task' ? '#3b82f6' : 
                           '#f59e0b' 
                  }}
                >
                  {status === 'resolved' ? 'Vyriešené' : 
                   status === 'sent_to_task' ? 'Odoslané do Tasku' : 
                   'Nové'}
                </span>
              </div>

              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'new'}
                    onChange={() => setStatus('new')}
                    className="mr-3 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Označiť ako nové</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'sent_to_task'}
                    onChange={() => setStatus('sent_to_task')}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Odoslané do Tasku</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'resolved'}
                    onChange={() => setStatus('resolved')}
                    className="mr-3 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Označiť ako vyriešené</span>
                </label>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#40467b' }}>
              Admin poznámky
            </h3>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
              placeholder="Pridajte interné poznámky k tomuto feedbacku..."
            />
          </div>

          {/* Create Task Action */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#40467b' }}>
              Akcie
            </h3>
            <button
              onClick={() => setShowCreateTaskModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={20} />
              Vytvoriť Task z tohto feedbacku
            </button>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#40467b' }}>
                  Vytvoriť Task z Beta Feedbacku
                </h2>
                <button
                  onClick={() => setShowCreateTaskModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Názov tasku *
                  </label>
                  <input
                    type="text"
                    value={taskData.title}
                    onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Zadajte názov tasku..."
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Popis
                  </label>
                  <textarea
                    value={taskData.description}
                    onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Popis tasku..."
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stĺpec (Status)
                  </label>
                  <select
                    value={taskData.status}
                    onChange={(e) => setTaskData(prev => ({ ...prev, status: e.target.value as 'navrhy' | 'vyvoj' | 'testovanie' | 'hotove' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(columns).map(([key, column]) => (
                      <option key={key} value={key}>
                        {column.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorita
                  </label>
                  <div className="space-y-2">
                    {Object.entries(priorityLabels).map(([key, label]) => (
                      <label key={key} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="priority"
                          value={key}
                          checked={taskData.priority === key}
                          onChange={(e) => setTaskData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                          className="mr-3"
                        />
                        <span 
                          className={`px-2 py-1 rounded text-xs font-medium border ${priorityColors[key as keyof typeof priorityColors]}`}
                        >
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priradiť používateľovi
                  </label>
                  <select
                    value={taskData.assignee}
                    onChange={(e) => setTaskData(prev => ({ ...prev, assignee: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Nepriradené</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.email}>
                        {user.full_name || user.email}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Termín dokončenia
                  </label>
                  <input
                    type="date"
                    value={taskData.due_date}
                    onChange={(e) => setTaskData(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCreateTaskModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Zrušiť
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={creatingTask || !taskData.title.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingTask ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Vytváram...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Vytvoriť Task
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}