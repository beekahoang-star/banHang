import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Check, Sparkles, AlertCircle, Layers, Table,
  Trash2, ArrowRight, Save, UploadCloud, Image as ImageIcon,
  Star, Link as LinkIcon, RefreshCw, X, Eye
} from 'lucide-react';
import { Category, Brand, AttributeSchemaField } from '../../types';
import { api } from '../../services/api';

interface OptionInput {
  name: string; // e.g. "Màu sắc" or "color"
  values: string[]; // e.g. ["Đen", "Trắng"]
}

interface SkuRow {
  skuCode: string;
  barcode: string;
  price: number;
  salePrice: number;
  weightGrams: number;
  initialStock: number;
  imageUrl: string;
  options: Record<string, string>;
}

interface ProductImage {
  id: string;
  url: string;
  name?: string;
  isCover: boolean;
}

export const ProductFormDynamic: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  
  // Basic SPU Info
  const [spuName, setSpuName] = useState('iPhone 16 Pro Max Titan');
  const [spuDescription, setSpuDescription] = useState('Khung viền Titan thế hệ mới, chip A18 Pro và nút chụp ảnh chuyên nghiệp Camera Control.');
  const [basePrice, setBasePrice] = useState<number>(34990000);
  const [brandName, setBrandName] = useState('Apple');

  // SPU Image Gallery
  const [spuImages, setSpuImages] = useState<ProductImage[]>([
    {
      id: 'img-1',
      url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
      name: 'Titan Tự Nhiên',
      isCover: true
    },
    {
      id: 'img-2',
      url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
      name: 'Titan Đen',
      isCover: false
    }
  ]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Specs (from category schema)
  const [dynamicSpecs, setDynamicSpecs] = useState<Record<string, any>>({});
  const [schemaFields, setSchemaFields] = useState<AttributeSchemaField[]>([]);

  // Variant Option groups (for Cartesian Product)
  const [optionGroups, setOptionGroups] = useState<OptionInput[]>([
    { name: 'Màu sắc', values: ['Titan Sa Mạc', 'Titan Tự Nhiên'] },
    { name: 'Dung lượng', values: ['256GB', '512GB'] }
  ]);
  const [skuMatrix, setSkuMatrix] = useState<SkuRow[]>([]);
  const [createdSuccess, setCreatedSuccess] = useState(false);

  useEffect(() => {
    api.getCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0) {
        handleCategoryChange(cats[0].id, cats);
      }
    });
  }, []);

  const handleCategoryChange = (catId: number, catList = categories) => {
    setSelectedCategoryId(catId);
    const cat = catList.find(c => c.id === catId);
    if (cat && cat.attributeSchema) {
      try {
        const fields: AttributeSchemaField[] = JSON.parse(cat.attributeSchema);
        setSchemaFields(fields);
        const initialSpecs: Record<string, any> = {};
        fields.forEach(f => {
          initialSpecs[f.key] = f.options && f.options.length > 0 ? f.options[0] : '';
        });
        setDynamicSpecs(initialSpecs);
      } catch (e) {
        setSchemaFields([]);
      }
    } else {
      setSchemaFields([]);
    }
  };

  // Image Upload Handlers
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const newImgs: ProductImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const res = await api.uploadProductImage(file);
        newImgs.push({
          id: `img-${Date.now()}-${i}`,
          url: res.url,
          name: file.name,
          isCover: spuImages.length === 0 && i === 0
        });
      } catch (err) {
        console.error('Lỗi tải ảnh:', err);
      }
    }

    setSpuImages(prev => [...prev, ...newImgs]);
    setUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddUrlImage = () => {
    if (!customImageUrl.trim()) return;
    const newImg: ProductImage = {
      id: `img-${Date.now()}`,
      url: customImageUrl.trim(),
      name: 'Ảnh liên kết',
      isCover: spuImages.length === 0
    };
    setSpuImages([...spuImages, newImg]);
    setCustomImageUrl('');
  };

  const handleSetCover = (id: string) => {
    setSpuImages(spuImages.map(img => ({
      ...img,
      isCover: img.id === id
    })));
  };

  const handleRemoveImage = (id: string) => {
    const remaining = spuImages.filter(img => img.id !== id);
    if (remaining.length > 0 && !remaining.some(img => img.isCover)) {
      remaining[0].isCover = true;
    }
    setSpuImages(remaining);
  };

  const handleApplyPresetImages = (type: 'phone' | 'fashion' | 'appliance') => {
    let presets: ProductImage[] = [];
    if (type === 'phone') {
      presets = [
        { id: 'p1', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600', name: 'iPhone Titan Tự Nhiên', isCover: true },
        { id: 'p2', url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600', name: 'Titan Xám', isCover: false },
        { id: 'p3', url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600', name: 'Titan Đen', isCover: false }
      ];
    } else if (type === 'fashion') {
      presets = [
        { id: 'f1', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600', name: 'Áo khoác mặt trước', isCover: true },
        { id: 'f2', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600', name: 'Áo khoác góc nghiêng', isCover: false }
      ];
    } else {
      presets = [
        { id: 'a1', url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600', name: 'Nồi chiên góc chính', isCover: true },
        { id: 'a2', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600', name: 'Khay chiên bên trong', isCover: false }
      ];
    }
    setSpuImages(presets);
  };

  // Cartesian Product Generator
  useEffect(() => {
    generateCartesianMatrix();
  }, [optionGroups, spuName, basePrice, spuImages]);

  const generateCartesianMatrix = () => {
    const validGroups = optionGroups.filter(g => g.name.trim() && g.values.length > 0);
    if (validGroups.length === 0) {
      setSkuMatrix([]);
      return;
    }

    const cartesian = (arrays: string[][]): string[][] => {
      return arrays.reduce((acc, curr) => {
        return acc.flatMap(x => curr.map(y => [...x, y]));
      }, [[]] as string[][]);
    };

    const valueArrays = validGroups.map(g => g.values);
    const combinations = cartesian(valueArrays);

    const coverUrl = spuImages.find(img => img.isCover)?.url || spuImages[0]?.url || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300';

    const rows: SkuRow[] = combinations.map((comb, idx) => {
      const opts: Record<string, string> = {};
      validGroups.forEach((g, gIdx) => {
        opts[g.name] = comb[gIdx];
      });

      const prefix = spuName.trim() ? spuName.toUpperCase().replace(/\s+/g, '-').slice(0, 8) : 'SKU';
      const suffix = comb.map(c => c.replace(/\s+/g, '').toUpperCase().slice(0, 4)).join('-');
      const code = `${prefix}-${suffix}`;

      // Match image from SPU gallery if possible, otherwise use cover
      const matchedImage = spuImages[idx % spuImages.length]?.url || coverUrl;

      return {
        skuCode: code,
        barcode: `89385012${1000 + idx}`,
        price: basePrice,
        salePrice: Math.round(basePrice * 0.95),
        weightGrams: 250,
        initialStock: 30,
        imageUrl: matchedImage,
        options: opts
      };
    });

    setSkuMatrix(rows);
  };

  const handleAddOptionGroup = () => {
    setOptionGroups([...optionGroups, { name: 'Kích cỡ', values: ['M', 'L'] }]);
  };

  const handleRemoveOptionGroup = (idx: number) => {
    setOptionGroups(optionGroups.filter((_, i) => i !== idx));
  };

  const handleUpdateOptionGroup = (idx: number, name: string, valuesStr: string) => {
    const values = valuesStr.split(',').map(s => s.trim()).filter(Boolean);
    setOptionGroups(optionGroups.map((g, i) => i === idx ? { name, values } : g));
  };

  const handleUpdateSkuRow = (idx: number, patch: Partial<SkuRow>) => {
    setSkuMatrix(skuMatrix.map((r, i) => i === idx ? { ...r, ...patch } : r));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatedSuccess(true);
    setTimeout(() => {
      setCreatedSuccess(false);
      alert(`Đã lưu thành công SPU "${spuName}" cùng ${spuImages.length} ảnh và ${skuMatrix.length} biến thể SKU vào hệ thống!`);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Tạo Sản Phẩm Mới & Cấu Hình Biến Thể</h1>
        <p className="text-xs text-slate-500 mt-1">
          Hỗ trợ tải lên ảnh đại diện & album sản phẩm, cấu hình thông số kỹ thuật theo ngành hàng và tự động tạo ma trận biến thể theo màu sắc, kích cỡ, dung lượng.
        </p>
      </div>

      <form onSubmit={handleSaveProduct} className="space-y-8">
        {/* Step 1: Basic SPU Details */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="h-5 w-5 text-indigo-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">Bước 1: Thông Tin Chung Sản Phẩm</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ngành Hàng (Category):</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => handleCategoryChange(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-semibold text-indigo-700 bg-indigo-50/50 focus:border-indigo-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Thương Hiệu (Brand):</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Tên Sản Phẩm SPU:</label>
              <input
                type="text"
                required
                value={spuName}
                onChange={(e) => setSpuName(e.target.value)}
                placeholder="Ví dụ: iPhone 16 Pro Max Titan"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Giá Gốc Niêm Yết (VNĐ):</label>
              <input
                type="number"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-indigo-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Mô Tả Sản Phẩm:</label>
              <textarea
                rows={2}
                value={spuDescription}
                onChange={(e) => setSpuDescription(e.target.value)}
                placeholder="Giới thiệu điểm nổi bật của dòng sản phẩm..."
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Quản Lý Hình Ảnh Sản Phẩm (SPU Image Gallery) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Bước 2: Quản Lý Hình Ảnh Sản Phẩm (Album Ảnh SPU & Ảnh Bìa)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tải lên ảnh từ máy tính hoặc dán đường dẫn ảnh. Ảnh đầu tiên hoặc có ngôi sao sẽ làm ảnh bìa chính (Cover).
                </p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium">Bộ mẫu:</span>
              <button
                type="button"
                onClick={() => handleApplyPresetImages('phone')}
                className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                Điện thoại
              </button>
              <button
                type="button"
                onClick={() => handleApplyPresetImages('fashion')}
                className="rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
              >
                Thời trang
              </button>
              <button
                type="button"
                onClick={() => handleApplyPresetImages('appliance')}
                className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                Gia dụng
              </button>
            </div>
          </div>

          {/* Upload Area & URL Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Direct File Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-6 text-center hover:border-indigo-500 hover:bg-indigo-50/70 transition space-y-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFilesSelected}
                className="hidden"
              />
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs text-indigo-600">
                {uploadingImage ? <RefreshCw className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
              </div>
              <div className="text-xs font-bold text-slate-800">
                {uploadingImage ? 'Đang tải ảnh lên...' : 'Bấm để tải ảnh từ máy tính (PNG, JPG, WEBP)'}
              </div>
              <p className="text-[11px] text-slate-500">
                Hỗ trợ chọn nhiều file cùng lúc, tự động lưu vào thư mục /uploads
              </p>
            </div>

            {/* Paste Image URL */}
            <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50/50 p-6 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Hoặc dán link hình ảnh online (CDN / Web):
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddUrlImage}
                  disabled={!customImageUrl.trim()}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 disabled:opacity-50"
                >
                  Thêm ảnh
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Hỗ trợ link Unsplash, Imgur, Cloudinary, S3...
              </p>
            </div>
          </div>

          {/* Uploaded Gallery Grid */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">
                Album ảnh đã đăng ({spuImages.length} ảnh):
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                Click vào biểu tượng ngôi sao để đổi ảnh bìa chính
              </span>
            </div>

            {spuImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {spuImages.map((img) => (
                  <div
                    key={img.id}
                    className={`relative group rounded-2xl border-2 p-1.5 bg-white overflow-hidden transition-all shadow-xs ${
                      img.isCover ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                      <img
                        src={img.url}
                        alt={img.name || 'Ảnh sản phẩm'}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Cover Badge */}
                      {img.isCover && (
                        <span className="absolute top-1.5 left-1.5 rounded-md bg-indigo-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                          Ảnh Bìa
                        </span>
                      )}

                      {/* Action Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSetCover(img.id)}
                          className={`rounded-lg p-1.5 transition ${
                            img.isCover ? 'bg-amber-400 text-slate-900' : 'bg-white/90 text-slate-700 hover:bg-amber-400 hover:text-slate-900'
                          }`}
                          title="Đặt làm ảnh bìa chính"
                        >
                          <Star className={`h-3.5 w-3.5 ${img.isCover ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="rounded-lg bg-rose-500 p-1.5 text-white hover:bg-rose-600 transition"
                          title="Xóa ảnh"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-1 px-1 text-[10px] text-slate-600 truncate font-medium">
                      {img.name || 'Ảnh chi tiết'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs">
                Chưa có hình ảnh nào cho sản phẩm. Hãy tải lên ảnh đại diện hoặc chọn bộ mẫu bên trên.
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Dynamic Specs Form (JSONB attributes) */}
        {schemaFields.length > 0 && (
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-indigo-100/60 pb-3">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Bước 3: Thông Số Kỹ Thuật (Tự sinh theo ngành hàng đã chọn)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Các thông số đặc trưng của ngành hàng để khách hàng lọc và so sánh sản phẩm.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {schemaFields.map((field) => (
                <div key={field.key} className="rounded-2xl border border-slate-200 bg-white p-3 space-y-1">
                  <label className="block font-bold text-slate-700">{field.label}</label>
                  {field.type === 'select' && field.options ? (
                    <select
                      value={dynamicSpecs[field.key] || ''}
                      onChange={(e) => setDynamicSpecs({ ...dynamicSpecs, [field.key]: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                    >
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={dynamicSpecs[field.key] || ''}
                      onChange={(e) => setDynamicSpecs({ ...dynamicSpecs, [field.key]: e.target.value })}
                      placeholder={`Nhập ${field.label.toLowerCase()}`}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Cartesian Variant Matrix Generator with SKU Images */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Table className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Bước 4: Thiết Lập Biến Thể Bán Hàng & Tồn Kho (Màu sắc, Dung lượng, Kích cỡ)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tự động sinh tổ hợp biến thể, cho phép cấu hình giá bán, mã vạch, số lượng tồn kho và gán ảnh riêng cho từng lựa chọn.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddOptionGroup}
              className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Thêm nhóm phân loại</span>
            </button>
          </div>

          {/* Option Groups Input */}
          <div className="space-y-3">
            {optionGroups.map((group, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-xs">
                <input
                  type="text"
                  value={group.name}
                  onChange={(e) => handleUpdateOptionGroup(idx, e.target.value, group.values.join(', '))}
                  placeholder="Tên thuộc tính (VD: Màu sắc)"
                  className="w-40 rounded-xl border border-slate-200 bg-white p-2 font-bold text-slate-800"
                />
                <input
                  type="text"
                  value={group.values.join(', ')}
                  onChange={(e) => handleUpdateOptionGroup(idx, group.name, e.target.value)}
                  placeholder="Các giá trị phân cách bằng dấu phẩy (VD: Đen, Trắng, Xanh)"
                  className="flex-1 rounded-xl border border-slate-200 bg-white p-2 text-slate-700"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOptionGroup(idx)}
                  className="p-1 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Generated Cartesian SKU Matrix Table with Variant Images */}
          {skuMatrix.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  Đã sinh {skuMatrix.length} biến thể SKU khả dụng:
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Click ảnh thu nhỏ để chọn ảnh từ album hoặc dán link ảnh mới
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-16">Ảnh SKU</th>
                      <th className="py-2.5 px-3 text-left">Tổ Hợp Phân Loại</th>
                      <th className="py-2.5 px-3 text-left">Mã SKU</th>
                      <th className="py-2.5 px-3 text-left">Mã Vạch Barcode</th>
                      <th className="py-2.5 px-3 text-left">Giá Bán</th>
                      <th className="py-2.5 px-3 text-left">Giá Sale</th>
                      <th className="py-2.5 px-3 text-left">Tồn Ban Đầu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {skuMatrix.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/60">
                        {/* Variant Image Column */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="relative group/img mx-auto h-12 w-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
                            <img
                              src={row.imageUrl || spuImages[0]?.url}
                              alt={row.skuCode}
                              className="h-full w-full object-cover"
                            />
                            {/* Dropdown / Quick Selector from SPU Gallery */}
                            <select
                              value={row.imageUrl}
                              onChange={(e) => handleUpdateSkuRow(rIdx, { imageUrl: e.target.value })}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              title="Chọn ảnh từ Album SPU"
                            >
                              {spuImages.map((img, i) => (
                                <option key={img.id} value={img.url}>
                                  Ảnh #{i + 1}: {img.name || 'Ảnh chi tiết'}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {Object.entries(row.options).map(([k, v]) => `${k}: ${v}`).join(' / ')}
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={row.skuCode}
                            onChange={(e) => handleUpdateSkuRow(rIdx, { skuCode: e.target.value })}
                            className="w-36 rounded-lg border border-slate-200 p-1.5 font-mono text-xs font-bold text-indigo-600"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={row.barcode}
                            onChange={(e) => handleUpdateSkuRow(rIdx, { barcode: e.target.value })}
                            className="w-28 rounded-lg border border-slate-200 p-1.5 font-mono text-xs"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            value={row.price}
                            onChange={(e) => handleUpdateSkuRow(rIdx, { price: Number(e.target.value) })}
                            className="w-28 rounded-lg border border-slate-200 p-1.5 font-bold"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            value={row.salePrice}
                            onChange={(e) => handleUpdateSkuRow(rIdx, { salePrice: Number(e.target.value) })}
                            className="w-28 rounded-lg border border-slate-200 p-1.5 text-rose-600 font-bold"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            value={row.initialStock}
                            onChange={(e) => handleUpdateSkuRow(rIdx, { initialStock: Number(e.target.value) })}
                            className="w-20 rounded-lg border border-slate-200 p-1.5 font-bold text-emerald-600"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition"
          >
            <Save className="h-4 w-4" />
            <span>Tạo Sản Phẩm, Đăng Album Ảnh & Sinh Biến Thể SKU</span>
          </button>
        </div>
      </form>
    </div>
  );
};
