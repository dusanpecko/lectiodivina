"use client";

import { createClient } from "@/app/lib/supabase/client";
import { ArrowDown, ArrowUp, Calendar, CheckCircle2, ChevronDown, ChevronRight, Circle, Copy, Edit2, GripVertical, Plus, Search, StickyNote, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChecklistItem {
  id: string;
  category: string;
  task: string;
  is_completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  week_number: number | null;
  order_index: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface CategoryData {
  name: string;
  items: ChecklistItem[];
  weekRange: string;
  completed: number;
  total: number;
}

export default function LaunchChecklistPage() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Scroll preservation
  const scrollPositionRef = useRef<number>(0);
  const shouldPreserveScrollRef = useRef<boolean>(false);
  const isInitialLoadRef = useRef<boolean>(true);
  const categoryRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  // CRUD states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    task: "",
    week_number: 1,
    order_index: 0
  });
  
  // Drag & Drop states
  const [draggedItem, setDraggedItem] = useState<ChecklistItem | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchChecklist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (checklist.length > 0) {
      organizeByCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklist]);

  // Open first category on initial load only
  useEffect(() => {
    if (isInitialLoadRef.current && categories.length > 0 && !expandedCategory) {
      setExpandedCategory(categories[0].name);
      isInitialLoadRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  // Restore scroll position after data refresh
  useEffect(() => {
    if (shouldPreserveScrollRef.current) {
      window.scrollTo(0, scrollPositionRef.current);
      shouldPreserveScrollRef.current = false;
    }
  }, [categories]);

  // Helper to preserve scroll and expanded category
  function preserveStateAndRefresh() {
    scrollPositionRef.current = window.scrollY;
    shouldPreserveScrollRef.current = true;
    return fetchChecklist();
  }

  async function fetchChecklist() {
    try {
      const { data, error } = await supabase
        .from("launch_checklist")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;

      setChecklist(data || []);
    } catch (error) {
      console.error("Error fetching checklist:", error);
    } finally {
      setLoading(false);
    }
  }

  function organizeByCategories() {
    const categoryMap = new Map<string, ChecklistItem[]>();

    checklist.forEach((item) => {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, []);
      }
      categoryMap.get(item.category)!.push(item);
    });

    const categoriesData: CategoryData[] = Array.from(categoryMap.entries()).map(
      ([name, items]) => {
        const completed = items.filter((i) => i.is_completed).length;
        const weekNumbers = items
          .map((i) => i.week_number)
          .filter((w): w is number => w !== null);
        const minWeek = Math.min(...weekNumbers);
        const maxWeek = Math.max(...weekNumbers);
        const weekRange =
          minWeek === maxWeek ? `Týždeň ${minWeek}` : `Týždeň ${minWeek}-${maxWeek}`;

        return {
          name,
          items,
          weekRange,
          completed,
          total: items.length,
        };
      }
    );

    setCategories(categoriesData);
  }

  async function toggleTask(itemId: string, currentState: boolean) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const updates = {
        is_completed: !currentState,
        completed_at: !currentState ? new Date().toISOString() : null,
        completed_by: !currentState ? (userData.user?.id || null) : null,
      };

      const { error } = await supabase
        .from("launch_checklist")
        .update(updates)
        .eq("id", itemId);

      if (error) throw error;

      // Update local state
      setChecklist((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, ...updates }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  async function saveNote(itemId: string) {
    try {
      const { error } = await supabase
        .from("launch_checklist")
        .update({ notes: noteText || null })
        .eq("id", itemId);

      if (error) throw error;

      setChecklist((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, notes: noteText || null } : item
        )
      );
      
      setEditingNote(null);
      setNoteText("");
    } catch (error) {
      console.error("Error saving note:", error);
    }
  }

  function toggleCategory(categoryName: string) {
    // Accordion behavior - only one category open at a time
    const newExpandedCategory = expandedCategory === categoryName ? null : categoryName;
    setExpandedCategory(newExpandedCategory);
    
    // Scroll to category after opening (with small delay for animation)
    if (newExpandedCategory === categoryName) {
      setTimeout(() => {
        const categoryElement = categoryRefs.current.get(categoryName);
        if (categoryElement) {
          const navbarHeight = 80; // Approximate navbar height
          const offset = 20; // Extra spacing
          const elementPosition = categoryElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100); // Wait for category to expand
    }
  }

  // CRUD Functions
  function openAddModal(categoryName?: string) {
    setFormData({
      category: categoryName || "",
      task: "",
      week_number: 1,
      order_index: checklist.length + 1
    });
    setShowAddModal(true);
  }

  function openEditModal(item: ChecklistItem) {
    setEditingItem(item);
    setFormData({
      category: item.category,
      task: item.task,
      week_number: item.week_number || 1,
      order_index: item.order_index
    });
    setShowEditModal(true);
  }

  async function handleAddTask() {
    try {
      const { data, error } = await supabase
        .from("launch_checklist")
        .insert([{
          category: formData.category,
          task: formData.task,
          week_number: formData.week_number,
          order_index: formData.order_index,
          is_completed: false
        }])
        .select()
        .single();

      if (error) throw error;

      setChecklist([...checklist, data]);
      setShowAddModal(false);
      setFormData({ category: "", task: "", week_number: 1, order_index: 0 });
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Chyba pri pridávaní úlohy");
    }
  }

  async function handleEditTask() {
    if (!editingItem) return;

    try {
      const { data, error } = await supabase
        .from("launch_checklist")
        .update({
          category: formData.category,
          task: formData.task,
          week_number: formData.week_number,
          order_index: formData.order_index
        })
        .eq("id", editingItem.id)
        .select()
        .single();

      if (error) throw error;

      setChecklist(checklist.map(item => 
        item.id === editingItem.id ? data : item
      ));
      setShowEditModal(false);
      setEditingItem(null);
      setFormData({ category: "", task: "", week_number: 1, order_index: 0 });
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Chyba pri úprave úlohy");
    }
  }

  function openDeleteModal(itemId: string) {
    setDeletingItemId(itemId);
    setShowDeleteModal(true);
  }

  async function confirmDeleteTask() {
    if (!deletingItemId) return;

    try {
      const { error } = await supabase
        .from("launch_checklist")
        .delete()
        .eq("id", deletingItemId);

      if (error) throw error;

      setChecklist(checklist.filter(item => item.id !== deletingItemId));
      setShowDeleteModal(false);
      setDeletingItemId(null);
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Chyba pri mazaní úlohy");
    }
  }

  async function handleCopyTask(item: ChecklistItem) {
    try {
      const { data, error } = await supabase
        .from("launch_checklist")
        .insert([{
          category: item.category,
          task: item.task + " (kópia)",
          week_number: item.week_number,
          order_index: checklist.length + 1,
          is_completed: false,
          notes: item.notes
        }])
        .select()
        .single();

      if (error) throw error;

      setChecklist([...checklist, data]);
      alert("Úloha bola skopírovaná");
    } catch (error) {
      console.error("Error copying task:", error);
      alert("Chyba pri kopírovaní úlohy");
    }
  }

  // Drag & Drop Functions
  function handleDragStartItem(e: React.DragEvent, item: ChecklistItem) {
    e.stopPropagation();
    setDraggedItem(item);
  }

  function handleDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    e.stopPropagation();
    setDragOverItem(targetId);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.stopPropagation();
    setDragOverItem(null);
  }

  async function handleDropOnItem(e: React.DragEvent, targetItem: ChecklistItem) {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.id === targetItem.id) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    // Only allow reordering within the same category
    // If different category, don't stop propagation - let it bubble to handleDropOnCategory
    if (draggedItem.category !== targetItem.category) {
      // Don't reset state here - let handleDropOnCategory handle it
      return;
    }

    // Stop propagation only for same-category reordering
    e.stopPropagation();

    try {
      // Swap order_index
      const draggedIndex = draggedItem.order_index;
      const targetIndex = targetItem.order_index;

      // Update both items in database
      const updates = [
        supabase
          .from("launch_checklist")
          .update({ order_index: targetIndex })
          .eq("id", draggedItem.id),
        supabase
          .from("launch_checklist")
          .update({ order_index: draggedIndex })
          .eq("id", targetItem.id)
      ];

      await Promise.all(updates);

      // Refresh the checklist to get updated order
      await preserveStateAndRefresh();

    } catch (error) {
      console.error("Error reordering tasks:", error);
      alert("Chyba pri presúvaní úlohy");
    } finally {
      setDraggedItem(null);
      setDragOverItem(null);
    }
  }

  async function handleDropOnCategory(e: React.DragEvent, targetCategory: string) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem) {
      setDragOverItem(null);
      return;
    }
    
    // Move item to different category
    if (draggedItem.category === targetCategory) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    try {
      const { error } = await supabase
        .from("launch_checklist")
        .update({ category: targetCategory })
        .eq("id", draggedItem.id);

      if (error) throw error;

      // Refresh checklist
      await preserveStateAndRefresh();

      alert(`Úloha presunutá do kategórie "${targetCategory}"`);
    } catch (error) {
      console.error("Error moving task to category:", error);
      alert("Chyba pri presúvaní úlohy do kategórie");
    } finally {
      setDraggedItem(null);
      setDragOverItem(null);
    }
  }

  // Category Reordering Functions
  async function moveCategoryUp(categoryName: string) {
    const currentIndex = categories.findIndex(c => c.name === categoryName);
    if (currentIndex <= 0) return;
    
    const targetCategoryName = categories[currentIndex - 1].name;
    // Keep the same category expanded after swap
    setExpandedCategory(categoryName);
    await swapCategories(categoryName, targetCategoryName);
  }

  async function moveCategoryDown(categoryName: string) {
    const currentIndex = categories.findIndex(c => c.name === categoryName);
    if (currentIndex >= categories.length - 1) return;
    
    const targetCategoryName = categories[currentIndex + 1].name;
    // Keep the same category expanded after swap
    setExpandedCategory(categoryName);
    await swapCategories(categoryName, targetCategoryName);
  }

  async function swapCategories(category1: string, category2: string) {
    // Get all items from both categories
    const cat1Items = checklist.filter(item => item.category === category1);
    const cat2Items = checklist.filter(item => item.category === category2);
    
    try {
      // Swap categories
      const updates = [
        ...cat1Items.map(item => 
          supabase
            .from("launch_checklist")
            .update({ category: category2 })
            .eq("id", item.id)
        ),
        ...cat2Items.map(item => 
          supabase
            .from("launch_checklist")
            .update({ category: category1 })
            .eq("id", item.id)
        )
      ];

      await Promise.all(updates);
      await preserveStateAndRefresh();
    } catch (error) {
      console.error("Error swapping categories:", error);
      alert("Chyba pri presúvaní kategórie");
    }
  }

  const totalTasks = checklist.length;
  const completedTasks = checklist.filter((item) => item.is_completed).length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Filter checklist by search query
  const filteredChecklist = searchQuery
    ? checklist.filter(item => 
        item.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : checklist;

  // Recalculate categories with filtered data
  const displayCategories = searchQuery
    ? (() => {
        const categoryMap = new Map<string, ChecklistItem[]>();
        filteredChecklist.forEach(item => {
          if (!categoryMap.has(item.category)) {
            categoryMap.set(item.category, []);
          }
          categoryMap.get(item.category)!.push(item);
        });
        
        return Array.from(categoryMap.entries())
          .filter(([, items]) => items.length > 0)
          .map(([name, items]) => {
            const categoryData = categories.find(c => c.name === name);
            return {
              name,
              weekRange: categoryData?.weekRange || '',
              items: items.sort((a, b) => a.order_index - b.order_index),
              completed: items.filter(i => i.is_completed).length,
              total: items.length
            };
          });
      })()
    : categories;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40467b]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hlavička */}
        <header className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#40467b] via-[#686ea3] to-[#40467b] px-8 py-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                    🚀 Launch Checklist
                  </h1>
                  <p className="text-indigo-100 mt-1">Sleduj pokrok projektu a odškrtávaj splnené úlohy</p>
                </div>
              </div>
              
              {/* Štatistiky */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{totalTasks}</div>
                  <div className="text-sm text-indigo-100 mt-1">Celkom úloh</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{completedTasks}</div>
                  <div className="text-sm text-indigo-100 mt-1">Hotovo</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{categories.length}</div>
                  <div className="text-sm text-indigo-100 mt-1">Kategórií</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{progressPercentage.toFixed(0)}%</div>
                  <div className="text-sm text-indigo-100 mt-1">Pokrok</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-white h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Ovládacie panely */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Search Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Search size={20} className="text-[#40467b]" />
              </div>
              <h3 className="font-semibold text-gray-800">Vyhľadávanie</h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Vyhľadať úlohu alebo poznámku..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Actions Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Plus size={20} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Akcie</h3>
            </div>
            <button
              onClick={() => openAddModal()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg hover:opacity-90 transition"
              style={{ backgroundColor: '#40467b' }}
            >
              <Plus className="w-5 h-5" />
              Pridať novú úlohu
            </button>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <strong>Vyhľadávanie:</strong> Nájdených {displayCategories.reduce((sum, cat) => sum + cat.items.length, 0)} výsledkov pre &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {/* Categories */}
        {displayCategories.map((category, index) => {
          const isExpanded = expandedCategory === category.name;
          const categoryProgress = (category.completed / category.total) * 100;

          return (
            <div
              key={category.name}
              ref={(el) => {
                if (el) {
                  categoryRefs.current.set(category.name, el);
                } else {
                  categoryRefs.current.delete(category.name);
                }
              }}
              className={`bg-white rounded-xl shadow-md mb-4 overflow-hidden transition-all ${
                dragOverItem === category.name ? "ring-2 ring-indigo-500 ring-offset-2" : ""
              }`}
              onDragOver={(e) => handleDragOver(e, category.name)}
              onDragLeave={(e) => handleDragLeave(e)}
              onDrop={(e) => handleDropOnCategory(e, category.name)}
            >
              {/* Category Header */}
              <div className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div 
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                  onClick={() => toggleCategory(category.name)}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-gray-900">
                      {category.name}
                    </h2>
                    <p className="text-sm text-gray-500">{category.weekRange}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Category Reorder Arrows - only show when not searching */}
                  {!searchQuery && (
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveCategoryUp(category.name);
                        }}
                        disabled={index === 0}
                        className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                          index === 0 ? "opacity-30 cursor-not-allowed" : ""
                        }`}
                        title="Presunúť hore"
                      >
                        <ArrowUp className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveCategoryDown(category.name);
                        }}
                        disabled={index === displayCategories.length - 1}
                        className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                          index === displayCategories.length - 1 ? "opacity-30 cursor-not-allowed" : ""
                        }`}
                        title="Presunúť dole"
                      >
                        <ArrowDown className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddModal(category.name);
                    }}
                    className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Pridať
                  </button>
                  <span className="text-sm font-medium text-gray-600">
                    {category.completed} / {category.total}
                  </span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${categoryProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Category Items */}
              {isExpanded && (
                <div className="px-6 pb-4 space-y-2">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStartItem(e, item)}
                      onDragOver={(e) => handleDragOver(e, item.id)}
                      onDragLeave={(e) => handleDragLeave(e)}
                      onDrop={(e) => handleDropOnItem(e, item)}
                      className={`group border rounded-lg p-4 hover:border-indigo-300 transition-all cursor-move ${
                        item.is_completed
                          ? "bg-green-50 border-green-200"
                          : "bg-white border-gray-200"
                      } ${
                        dragOverItem === item.id ? "ring-2 ring-indigo-400" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Drag Handle */}
                        <div className="flex-shrink-0 mt-0.5">
                          <GripVertical className="w-5 h-5 text-gray-300 group-hover:text-gray-500 cursor-grab active:cursor-grabbing" />
                        </div>
                        
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleTask(item.id, item.is_completed)}
                          className="flex-shrink-0 mt-0.5"
                        >
                          {item.is_completed ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                          )}
                        </button>

                        {/* Task Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-base flex-1 ${
                                item.is_completed
                                  ? "line-through text-gray-500"
                                  : "text-gray-900"
                              }`}
                            >
                              {item.task}
                            </p>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Upraviť"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCopyTask(item)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Kopírovať"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(item.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Vymazať"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Metadata */}
                          {item.is_completed && item.completed_at && (
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(item.completed_at).toLocaleDateString("sk-SK")}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {editingNote === item.id ? (
                            <div className="mt-3">
                              <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Pridaj poznámku..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                rows={2}
                              />
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => saveNote(item.id)}
                                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                                >
                                  Uložiť
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingNote(null);
                                    setNoteText("");
                                  }}
                                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                                >
                                  Zrušiť
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {item.notes && (
                                <div className="mt-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-gray-700">
                                  <div className="flex items-start gap-2">
                                    <StickyNote className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <p>{item.notes}</p>
                                  </div>
                                </div>
                              )}
                              <button
                                onClick={() => {
                                  setEditingNote(item.id);
                                  setNoteText(item.notes || "");
                                }}
                                className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                              >
                                <StickyNote className="w-3 h-3" />
                                {item.notes ? "Upraviť poznámku" : "Pridať poznámku"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40467b] to-[#686ea3] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white drop-shadow">Pridať úlohu</h2>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kategória
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition-all"
                  placeholder="napr. BRANDING"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Úloha
                </label>
                <textarea
                  value={formData.task}
                  onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition-all resize-none"
                  rows={4}
                  placeholder="Popis úlohy..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Týždeň
                  </label>
                  <input
                    type="number"
                    value={formData.week_number}
                    onChange={(e) => setFormData({ ...formData, week_number: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition-all"
                    min="1"
                    max="20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Poradie
                  </label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition-all"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all font-medium"
              >
                Zrušiť
              </button>
              <button
                onClick={handleAddTask}
                className="flex-1 px-4 py-3 text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-lg"
                style={{ backgroundColor: '#40467b' }}
              >
                Pridať úlohu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40467b] to-[#686ea3] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Edit2 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white drop-shadow">Upraviť úlohu</h2>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kategória
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Úloha
                </label>
                <textarea
                  value={formData.task}
                  onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition-all resize-none"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Týždeň
                  </label>
                  <input
                    type="number"
                    value={formData.week_number}
                    onChange={(e) => setFormData({ ...formData, week_number: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition-all"
                    min="1"
                    max="20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Poradie
                  </label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition-all"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all font-medium"
              >
                Zrušiť
              </button>
              <button
                onClick={handleEditTask}
                className="flex-1 px-4 py-3 text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-lg"
                style={{ backgroundColor: '#40467b' }}
              >
                Uložiť zmeny
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white drop-shadow">Vymazať úlohu</h2>
                  <p className="text-red-100 text-sm mt-0.5">Táto akcia sa nedá vrátiť späť</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 text-lg">
                Naozaj chceš vymazať túto úlohu?
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Všetky údaje o tejto úlohe budú trvalo odstránené.
              </p>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingItemId(null);
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all font-medium"
              >
                Zrušiť
              </button>
              <button
                onClick={confirmDeleteTask}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium shadow-lg"
              >
                Vymazať
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
