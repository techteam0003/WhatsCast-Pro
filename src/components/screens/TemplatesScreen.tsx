import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Send,
  Sparkles,
  Smartphone,
  ExternalLink,
  MessageSquare,
  CheckCheck,
  X,
} from 'lucide-react';
import { MessageTemplate, TemplateButton } from '../../types';

export const TemplatesScreen: React.FC = () => {
  const { templates, createTemplate, updateTemplate, deleteTemplate, setActiveScreen } = useApp();

  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate>(templates[0] || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Marketing' | 'Utility' | 'Transactional'>('Marketing');
  const [headerType, setHeaderType] = useState<'none' | 'text' | 'image'>('none');
  const [headerText, setHeaderText] = useState('');
  const [headerUrl, setHeaderUrl] = useState('');
  const [body, setBody] = useState('');
  const [footer, setFooter] = useState('');
  const [buttonType, setButtonType] = useState<'url' | 'quick_reply'>('url');
  const [buttonLabel, setButtonLabel] = useState('');
  const [buttonValue, setButtonValue] = useState('');

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setName('');
    setCategory('Marketing');
    setHeaderType('none');
    setHeaderText('');
    setHeaderUrl('');
    setBody('Hello {{name}}! 👋\n\nWe have an exclusive update for you from {{company}}.\n\nTap below to explore.');
    setFooter('Reply STOP to unsubscribe');
    setButtonLabel('Visit Website');
    setButtonValue('https://example.com');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: MessageTemplate) => {
    setEditingTemplate(t);
    setName(t.name);
    setCategory(t.category);
    setHeaderType(t.headerType || 'none');
    setHeaderText(t.headerText || '');
    setHeaderUrl(t.headerUrl || '');
    setBody(t.body);
    setFooter(t.footer || '');
    if (t.buttons && t.buttons[0]) {
      setButtonLabel(t.buttons[0].label);
      setButtonValue(t.buttons[0].value);
      setButtonType(t.buttons[0].type === 'quick_reply' ? 'quick_reply' : 'url');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) return;

    // Detect variables
    const matches = body.match(/{{([^{}]+)}}/g) || [];
    const variables = Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, '').trim())));

    const buttons: TemplateButton[] = buttonLabel.trim()
      ? [
          {
            type: buttonType,
            label: buttonLabel.trim(),
            value: buttonValue.trim() || '#',
          },
        ]
      : [];

    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, {
        name: name.trim(),
        category,
        channel: 'whatsapp',
        headerType,
        headerText: headerType === 'text' ? headerText.trim() : undefined,
        headerUrl: headerType === 'image' ? headerUrl.trim() : undefined,
        body: body.trim(),
        footer: footer.trim() || undefined,
        buttons,
        variables,
      });
    } else {
      await createTemplate({
        name: name.trim(),
        category,
        channel: 'whatsapp',
        headerType,
        headerText: headerType === 'text' ? headerText.trim() : undefined,
        headerUrl: headerType === 'image' ? headerUrl.trim() : undefined,
        body: body.trim(),
        footer: footer.trim() || undefined,
        buttons,
        variables,
      });
    }

    setIsModalOpen(false);
  };

  const insertVariable = (variableName: string) => {
    setBody((prev) => `${prev} {{${variableName}}}`);
  };

  // Preview replacement sample
  const previewBody = (template: MessageTemplate) => {
    return template.body
      .replace(/{{name}}/gi, 'Gurpreet Singh')
      .replace(/{{company}}/gi, 'WhatsCast Studio')
      .replace(/{{phone}}/gi, '+91 98140 12345');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>Screen 5 of 9: Template Studio</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            WhatsApp &amp; SMS Message Templates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Design high-converting broadcast messages with dynamic placeholders, media headers, and action buttons.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Template</span>
        </button>
      </div>

      {/* Main Grid: Template List + Live WhatsApp Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Template List */}
        <div className="lg:col-span-7 space-y-3">
          {templates.map((tpl) => {
            const isSelected = selectedTemplate?.id === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl)}
                className={`p-4 rounded-xl border transition cursor-pointer bg-white ${
                  isSelected
                    ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-sm">{tpl.name}</h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        tpl.category === 'Marketing'
                          ? 'bg-purple-100 text-purple-700'
                          : tpl.category === 'Transactional'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {tpl.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Meta: {tpl.metaStatus || 'APPROVED'}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(tpl);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete template "${tpl.name}"?`)) {
                          deleteTemplate(tpl.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 whitespace-pre-wrap font-sans">
                  {tpl.body}
                </p>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>Variables:</span>
                    {tpl.variables.length > 0 ? (
                      tpl.variables.map((v) => (
                        <span
                          key={v}
                          className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono text-[10px]"
                        >
                          {`{{${v}}}`}
                        </span>
                      ))
                    ) : (
                      <span>None</span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveScreen('new_broadcast');
                    }}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1"
                  >
                    Use in Broadcast <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Phone Preview Mockup */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-slate-900 rounded-[32px] p-3 shadow-2xl border-4 border-slate-800 max-w-sm mx-auto">
            {/* Phone Notch */}
            <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
            </div>

            {/* WhatsApp App Mockup Screen */}
            <div className="bg-[#efeae2] rounded-[24px] overflow-hidden flex flex-col h-[520px] shadow-inner relative">
              {/* WhatsApp Chat Header */}
              <div className="bg-[#075e54] text-white p-3 flex items-center gap-2.5 shadow-md">
                <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs">
                  W
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs truncate">WhatsCast Broadcast</div>
                  <div className="text-[10px] text-emerald-200">Verified Business Account</div>
                </div>
                <CheckCheck className="w-4 h-4 text-emerald-200" />
              </div>

              {/* Chat Canvas */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 flex flex-col justify-end">
                {selectedTemplate ? (
                  <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm max-w-[90%] border border-slate-200 text-xs text-slate-800 space-y-2">
                    {/* Header */}
                    {selectedTemplate.headerType === 'text' && selectedTemplate.headerText && (
                      <div className="font-bold text-slate-900 text-xs pb-1 border-b border-slate-100">
                        {selectedTemplate.headerText}
                      </div>
                    )}
                    {selectedTemplate.headerType === 'image' && (
                      <div className="rounded overflow-hidden bg-slate-100 aspect-video flex items-center justify-center text-[10px] text-slate-400">
                        Image Header Preview
                      </div>
                    )}

                    {/* Body */}
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {previewBody(selectedTemplate)}
                    </div>

                    {/* Footer */}
                    {selectedTemplate.footer && (
                      <div className="text-[10px] text-slate-400 pt-1">
                        {selectedTemplate.footer}
                      </div>
                    )}

                    {/* Time & Ticks */}
                    <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 pt-1">
                      <span>10:25 AM</span>
                      <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                    </div>

                    {/* Buttons */}
                    {selectedTemplate.buttons && selectedTemplate.buttons.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        {selectedTemplate.buttons.map((btn, i) => (
                          <div
                            key={i}
                            className="bg-slate-50 hover:bg-slate-100 text-emerald-600 font-bold text-center py-1.5 px-2 rounded border border-slate-200 text-[11px] flex items-center justify-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{btn.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-xs text-slate-400 my-auto">
                    Select a template to view live preview
                  </div>
                )}
              </div>

              {/* Bottom WhatsApp bar */}
              <div className="bg-white p-2 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-400">
                <span className="flex-1 bg-slate-100 px-3 py-1.5 rounded-full text-[11px]">
                  Type a reply...
                </span>
                <Send className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Step 11 Meta WhatsApp Manager Export Button */}
          {selectedTemplate && (
            <div className="mt-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  const metaPayload = {
                    name: selectedTemplate.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                    category: selectedTemplate.category.toUpperCase(),
                    language: 'en_US',
                    components: [
                      ...(selectedTemplate.headerType === 'text' && selectedTemplate.headerText
                        ? [{ type: 'HEADER', format: 'TEXT', text: selectedTemplate.headerText }]
                        : []),
                      {
                        type: 'BODY',
                        text: selectedTemplate.body.replace(/{{name}}/gi, '{{1}}').replace(/{{company}}/gi, '{{2}}'),
                      },
                      ...(selectedTemplate.footer ? [{ type: 'FOOTER', text: selectedTemplate.footer }] : []),
                      ...(selectedTemplate.buttons.length > 0
                        ? [
                            {
                              type: 'BUTTONS',
                              buttons: selectedTemplate.buttons.map((b) =>
                                b.type === 'url'
                                  ? { type: 'URL', text: b.label, url: b.value }
                                  : { type: 'QUICK_REPLY', text: b.label }
                              ),
                            },
                          ]
                        : []),
                    ],
                  };
                  navigator.clipboard.writeText(JSON.stringify(metaPayload, null, 2));
                  alert('Meta Template JSON copied! Paste directly into WhatsApp Manager (Step 11).');
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded-xl text-xs transition shadow-xs"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span>Step 11: Copy WhatsApp Manager JSON</span>
              </button>
              <p className="text-[10px] text-slate-400">
                Ready for submission to Meta for instant template approval.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingTemplate ? 'Edit Template' : 'Create Message Template'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Template Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diwali Flash Sale"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Marketing">Marketing</option>
                    <option value="Transactional">Transactional</option>
                    <option value="Utility">Utility</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Header (Optional)</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {(['none', 'text', 'image'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setHeaderType(type)}
                      className={`py-1.5 px-2 rounded-lg font-medium capitalize border text-center ${
                        headerType === type
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                {headerType === 'text' && (
                  <input
                    type="text"
                    placeholder="Header bold text..."
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                )}
                {headerType === 'image' && (
                  <input
                    type="url"
                    placeholder="https://example.com/banner.jpg"
                    value={headerUrl}
                    onChange={(e) => setHeaderUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Message Body *</label>
                  <div className="flex gap-1 text-[11px]">
                    <span className="text-slate-400">Insert:</span>
                    <button
                      type="button"
                      onClick={() => insertVariable('name')}
                      className="text-emerald-600 font-semibold hover:underline"
                    >
                      + Name
                    </button>
                    <button
                      type="button"
                      onClick={() => insertVariable('company')}
                      className="text-emerald-600 font-semibold hover:underline"
                    >
                      + Company
                    </button>
                    <button
                      type="button"
                      onClick={() => insertVariable('phone')}
                      className="text-emerald-600 font-semibold hover:underline"
                    >
                      + Phone
                    </button>
                  </div>
                </div>
                <textarea
                  required
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Footer Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Reply STOP to opt out"
                  value={footer}
                  onChange={(e) => setFooter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="block font-bold text-slate-800">Call to Action Button</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Button Label (e.g. Claim 40% OFF)"
                    value={buttonLabel}
                    onChange={(e) => setButtonLabel(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="URL (e.g. https://yoursite.com)"
                    value={buttonValue}
                    onChange={(e) => setButtonValue(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
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
                  {editingTemplate ? 'Save Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
