import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Plus, Send, Trash2, Edit2, Check, X, FolderTree, Sparkles } from 'lucide-react';
import { ContactList } from '../../types';

export const ListsScreen: React.FC = () => {
  const { lists, contacts, createList, updateList, deleteList, setActiveScreen } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<ContactList | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#10b981');

  const presetColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

  const handleOpenCreate = () => {
    setEditingList(null);
    setName('');
    setDescription('');
    setColor('#10b981');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (list: ContactList) => {
    setEditingList(list);
    setName(list.name);
    setDescription(list.description);
    setColor(list.color);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingList) {
      await updateList(editingList.id, {
        name: name.trim(),
        description: description.trim(),
        color,
      });
    } else {
      await createList(name.trim(), description.trim(), color);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-1.5">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Screen 4 of 9: Audience Segmentation</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Contact Lists &amp; Target Segments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Group your contacts by VIP status, geography, campaign stage, or customer tags for laser-focused messaging.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New List</span>
        </button>
      </div>

      {/* Grid of Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {lists.map((list) => {
          const memberCount = contacts.filter((c) => c.listIds.includes(list.id)).length;

          return (
            <div
              key={list.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: list.color }}
              />

              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: list.color }}
                    />
                    <h3 className="font-bold text-slate-900 text-base">{list.name}</h3>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleOpenEdit(list)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete list "${list.name}"?`)) {
                          deleteList(list.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {list.description || 'No description provided.'}
                </p>

                <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between mb-4 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-600 font-medium">Recipients</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{memberCount} contacts</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setActiveScreen('new_broadcast');
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-xl text-xs transition shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast to List</span>
                </button>
                <button
                  onClick={() => setActiveScreen('contacts')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
                >
                  Manage
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingList ? 'Edit List' : 'Create Audience List'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">List Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festival VIP Offers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Notes on who should be included in this segment..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Color Badge</label>
                <div className="flex items-center gap-2">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition border-2 ${
                        color === c ? 'border-slate-800 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm"
                >
                  {editingList ? 'Save Changes' : 'Create List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
