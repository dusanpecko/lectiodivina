'use client';

import { Calendar, ExternalLink, Eye, Mail, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface BetaFeedback {
  id: number;
  email: string | null;
  message: string;
  page_url: string | null;
  user_agent: string | null;
  language: string;
  created_at: string;
  resolved: boolean;
  admin_notes: string | null;
}

interface BetaFeedbackStats {
  total: number;
  resolved: number;
  unresolved: number;
}

interface BetaFeedbackListProps {
  onStatsChange?: (stats: BetaFeedbackStats) => void;
}

export default function BetaFeedbackList({ onStatsChange }: BetaFeedbackListProps) {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<BetaFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterResolved, setFilterResolved] = useState<string>('all');

  const fetchFeedbacks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/beta-feedback');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      setFeedbacks(result.data || []);
    } catch (error) {
      console.error('Error fetching beta feedbacks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleResolved = async (id: number, resolved: boolean) => {
    try {
      const response = await fetch('/api/admin/beta-feedback', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, resolved: !resolved }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Update local state
      setFeedbacks(prev => prev.map(feedback => 
        feedback.id === id ? { ...feedback, resolved: !resolved } : feedback
      ));
    } catch (error) {
      console.error('Error updating feedback:', error);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (filterResolved === 'resolved') return feedback.resolved;
    if (filterResolved === 'unresolved') return !feedback.resolved;
    return true;
  });

  const stats = useMemo(() => ({
    total: feedbacks.length,
    resolved: feedbacks.filter(f => f.resolved).length,
    unresolved: feedbacks.filter(f => !f.resolved).length,
  }), [feedbacks]);

  // Send stats to parent component
  useEffect(() => {
    if (onStatsChange) {
      onStatsChange(stats);
    }
  }, [stats, onStatsChange]);

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

  return (
    <div>
      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filterResolved}
            onChange={(e) => setFilterResolved(e.target.value)}
            className="px-4 py-2.5 rounded-lg border-2 border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          >
            <option value="all">Všetky</option>
            <option value="unresolved">Nové</option>
            <option value="resolved">Vyriešené</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedbacks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Žiadny beta feedback</h3>
            <p className="text-gray-600">Zatiaľ nie sú žiadne beta feedback správy.</p>
          </div>
        ) : (
          filteredFeedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-2 ${feedback.resolved ? 'bg-green-500' : 'bg-orange-500'}`} />
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Calendar size={16} />
                        {formatDate(feedback.created_at)}
                      </div>
                      {feedback.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={16} />
                          {feedback.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/admin/beta-feedback/${feedback.id}`)}
                      className="p-2 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600 transition-all hover:shadow-md hover:scale-105"
                      title="Zobraziť detail"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => toggleResolved(feedback.id, feedback.resolved)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        feedback.resolved 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                      }`}
                    >
                      {feedback.resolved ? 'Vyriešené' : 'Nové'}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Správa:</h4>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-3">
                    {feedback.message}
                  </p>
                </div>

                {feedback.page_url && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ExternalLink size={16} />
                      <span>Stránka: </span>
                      <a 
                        href={feedback.page_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 underline"
                      >
                        {feedback.page_url}
                      </a>
                    </div>
                  </div>
                )}

                {feedback.user_agent && (
                  <div className="text-xs text-gray-500 mt-2">
                    <span className="font-medium">Prehliadač:</span> {feedback.user_agent}
                  </div>
                )}

                {feedback.admin_notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Admin poznámky:</h5>
                    <p className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
                      {feedback.admin_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}