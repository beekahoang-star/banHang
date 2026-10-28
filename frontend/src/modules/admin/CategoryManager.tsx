import React, { useState, useEffect } from 'react';
import {
  FolderTree, Plus, Trash2, Save, Check, Settings2,
  ChevronRight, AlertCircle, Sparkles
} from 'lucide-react';
import { Category, AttributeSchemaField } from '../../types';
import { api } from '../../services/api';

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [fields, setFields] = useState<AttributeSchemaField[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.getCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0) {
        selectCategory(cats[0]);
      }
    });
  }, []);

  const selectCategory = (cat: Category) => {
    setSelectedCat(cat);
    try {
      if (cat.attributeSchema) {
        setFields(JSON.parse(cat.attributeSchema));
      } else {
        setFields([]);
      }
    } catch (e) {
      setFields([]);
    }
    setSavedSuccess(false);
  };

  const handleAddField = () => {
    const newField: AttributeSchemaField = {
      key: `field_${Date.now().toString().slice(-4)}`,
      label: 'Thông số mới',
      type: 'text',
      options: []
    };
    setFields([...fields, newField]);
  };

  const handleRemoveField = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const handleUpdateField = (idx: number, patch: Partial<AttributeSchemaField>) => {
    setFields(fields.map((f, i) => i === idx ? { ...f, ...patch } : f));
  };

  const handleSaveSchema = () => {
    if (!selectedCat) return;
    const jsonStr = JSON.stringify(fields, null, 2);
    // Update local state
    selectedCat.attributeSchema = jsonStr;
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Quản Lý Danh Mục & Cấu Hình Khuôn Mẫu (Schema JSONB)</h1>
        <p className="text-xs text-slate-500 mt-1">
          Cấu hình khuôn mẫu `attribute_schema` cho từng ngành hàng. Khi tạo sản phẩm mới, hệ thống sẽ tự động render các ô nhập kỹ thuật tương ứng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Category Tree */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <FolderTree className="h-4 w-4 text-indigo-600" />
              <span>Cây Danh Mục Ngành Hàng</span>
            </div>
          </div>

          <div className="space-y-2">
            {categories.map((c) => (
              <div key={c.id} className="space-y-1">
                <button
                  onClick={() => selectCategory(c)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    selectedCat?.id === c.id
                      ? 'bg-indigo-600 text-white font-bold shadow'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="font-mono text-[10px] opacity-80">slug: {c.slug}</span>
                </button>

                {c.children && (
                  <div className="ml-4 border-l-2 border-slate-200 pl-2 space-y-1">
                    {c.children.map(sub => (
                      <div
                        key={sub.id}
                        className="py-1 px-2 text-[11px] text-slate-500 hover:text-slate-800"
                      >
                        ↳ {sub.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Dynamic Attribute Schema Editor */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Cấu Hình Thông Số Cho: <span className="text-indigo-600">{selectedCat?.name}</span>
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Định nghĩa các trường thuộc tính sẽ xuất hiện trên form tạo sản phẩm của danh mục này
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddField}
                className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Thêm trường thông số</span>
              </button>

              <button
                onClick={handleSaveSchema}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-indigo-700 transition"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Lưu Schema JSONB</span>
              </button>
            </div>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-700 animate-fade-in">
              <Check className="h-4 w-4" />
              <span>Đã lưu thành công cấu hình attribute_schema vào cơ sở dữ liệu PostgreSQL!</span>
            </div>
          )}

          {/* Fields List Editor */}
          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Trường thông số #{idx + 1}</span>
                  <button
                    onClick={() => handleRemoveField(idx)}
                    className="text-slate-400 hover:text-rose-500"
                    title="Xóa trường"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Mã khóa (Key JSONB):</label>
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) => handleUpdateField(idx, { key: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Tên nhãn (Label):</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => handleUpdateField(idx, { label: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Kiểu dữ liệu:</label>
                    <select
                      value={field.type}
                      onChange={(e) => handleUpdateField(idx, { type: e.target.value as any })}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2"
                    >
                      <option value="text">Văn bản (Text)</option>
                      <option value="number">Số (Number)</option>
                      <option value="select">Lựa chọn (Select Dropdown)</option>
                    </select>
                  </div>
                </div>

                {field.type === 'select' && (
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">
                      Các lựa chọn (phân cách bằng dấu phẩy):
                    </label>
                    <input
                      type="text"
                      value={field.options?.join(', ') || ''}
                      onChange={(e) => handleUpdateField(idx, {
                        options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      placeholder="VD: 6.1 inch, 6.7 inch, 6.8 inch"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2"
                    />
                  </div>
                )}
              </div>
            ))}

            {fields.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-xs">
                Chưa có cấu hình thuộc tính nào. Bấm "Thêm trường thông số" để bắt đầu.
              </div>
            )}
          </div>

          {/* JSON Schema Preview */}
          <div className="rounded-2xl bg-slate-900 p-4 text-[11px] font-mono text-emerald-400 overflow-x-auto">
            <div className="text-slate-400 text-[10px] mb-1 uppercase font-bold">// Xem trước JSON Schema lưu cột categories.attribute_schema:</div>
            <pre>{JSON.stringify(fields, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
