import React, { useState, useEffect } from 'react';
import {
  Filter, SlidersHorizontal, Star, ShoppingCart, Check,
  ChevronRight, RefreshCw, X
} from 'lucide-react';
import { Category, ProductListItem, AttributeSchemaField } from '../../types';
import { api } from '../../services/api';

interface ProductListingPageProps {
  initialCategorySlug?: string;
  initialKeyword?: string;
  onNavigate: (view: string, payload?: any) => void;
}

export const ProductListingPage: React.FC<ProductListingPageProps> = ({
  initialCategorySlug,
  initialKeyword,
  onNavigate
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategorySlug || '');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('ALL');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('basePrice');
  const [sortDir, setSortDir] = useState<string>('asc');
  const [dynamicFilters, setDynamicFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedBrand, priceRange, minRating, sortBy, sortDir, initialKeyword]);

  const fetchProducts = async () => {
    setLoading(true);
    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    if (priceRange === 'UNDER_5M') {
      maxPrice = 5000000;
    } else if (priceRange === '5M_20M') {
      minPrice = 5000000;
      maxPrice = 20000000;
    } else if (priceRange === 'OVER_20M') {
      minPrice = 20000000;
    }

    const filter = {
      categorySlug: selectedCategory || undefined,
      keyword: initialKeyword || undefined,
      minPrice,
      maxPrice,
      minRating: minRating > 0 ? minRating : undefined,
      sortBy,
      sortDir
    };

    const res = await api.searchProducts(filter);
    setProducts(res.items);
    setLoading(false);
  };

  // Find active category's dynamic schema fields
  const currentCategoryObj = categories.find(c => c.slug === selectedCategory);
  let schemaFields: AttributeSchemaField[] = [];
  if (currentCategoryObj && currentCategoryObj.attributeSchema) {
    try {
      schemaFields = JSON.parse(currentCategoryObj.attributeSchema);
    } catch (e) {}
  }

  const handleDynamicFilterChange = (key: string, value: string) => {
    setDynamicFilters(prev => {
      const next = { ...prev };
      if (next[key] === value) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange('ALL');
    setMinRating(0);
    setDynamicFilters({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb & Title */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <button onClick={() => onNavigate('home')} className="hover:text-indigo-600">Trang chủ</button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-800 font-medium">Danh mục sản phẩm</span>
          {currentCategoryObj && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-indigo-600 font-bold">{currentCategoryObj.name}</span>
            </>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-extrabold text-slate-900">
            {currentCategoryObj ? currentCategoryObj.name : 'Tất Cả Sản Phẩm'}
            <span className="ml-2 text-sm font-normal text-slate-400">({products.length} sản phẩm)</span>
          </h1>

          {/* Sort Controller */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Sắp xếp theo:</span>
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split('-');
                setSortBy(sb);
                setSortDir(sd);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none"
            >
              <option value="basePrice-asc">Giá: Thấp đến Cao</option>
              <option value="basePrice-desc">Giá: Cao đến Thấp</option>
              <option value="ratingAvg-desc">Đánh giá cao nhất</option>
              <option value="id-desc">Mới nhất</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar: Dynamic Filters */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
                <span>Bộ Lọc Động (JSONB)</span>
              </div>
              <button
                onClick={clearAllFilters}
                className="text-xs text-indigo-600 hover:underline"
              >
                Đặt lại
              </button>
            </div>

            {/* 1. Category Tree Filter */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2.5">Ngành Hàng</h4>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition ${
                    selectedCategory === '' ? 'bg-indigo-50 font-bold text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Tất cả ngành hàng
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition ${
                      selectedCategory === c.slug ? 'bg-indigo-50 font-bold text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Price Range Filter */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2.5">Khoảng Giá</h4>
              <div className="space-y-1.5 text-xs text-slate-600">
                {[
                  { id: 'ALL', label: 'Tất cả mức giá' },
                  { id: 'UNDER_5M', label: 'Dưới 5 triệu' },
                  { id: '5M_20M', label: '5 triệu - 20 triệu' },
                  { id: 'OVER_20M', label: 'Trên 20 triệu' },
                ].map((p) => (
                  <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:text-indigo-600">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={priceRange === p.id}
                      onChange={() => setPriceRange(p.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Rating Filter */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2.5">Đánh Giá Sao</h4>
              <div className="space-y-1.5 text-xs text-slate-600">
                {[4, 3].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(minRating === r ? 0 : r)}
                    className={`flex w-full items-center gap-1.5 px-2 py-1 rounded-lg ${
                      minRating === r ? 'bg-indigo-50 font-bold text-indigo-700' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < r ? 'fill-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <span>từ {r} sao trở lên</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Dynamic Attributes from JSONB Schema */}
            {schemaFields.length > 0 && (
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Thuộc tính động {currentCategoryObj?.name}</span>
                </div>

                {schemaFields.map((field) => (
                  <div key={field.key}>
                    <h5 className="font-semibold text-xs text-slate-700 mb-1.5">{field.label}</h5>
                    {field.options && field.options.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {field.options.map((opt) => {
                          const active = dynamicFilters[field.key] === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => handleDynamicFilterChange(field.key, opt)}
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                                active
                                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder={`Nhập ${field.label.toLowerCase()}...`}
                        value={dynamicFilters[field.key] || ''}
                        onChange={(e) => handleDynamicFilterChange(field.key, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Content: Product Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="mx-auto h-8 w-8 text-indigo-600 animate-spin" />
              <p className="mt-2 text-xs text-slate-400">Đang truy vấn cơ sở dữ liệu PostgreSQL JSONB...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <p className="text-sm font-semibold text-slate-700">Không tìm thấy sản phẩm nào khớp với bộ lọc.</p>
              <button
                onClick={clearAllFilters}
                className="mt-3 text-xs font-bold text-indigo-600 hover:underline"
              >
                Xóa toàn bộ bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover:border-indigo-400 hover:shadow-xl transition-all"
                >
                  {/* Product Image */}
                  <div
                    onClick={() => onNavigate('product', { slug: p.slug })}
                    className="relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-slate-50"
                  >
                    <img
                      src={p.mainImageUrl || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500'}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute top-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700 backdrop-blur-xs">
                      {p.brandName}
                    </span>

                    {p.totalStock > 0 ? (
                      <span className="absolute bottom-2 right-2 rounded-md bg-emerald-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                        Còn {p.totalStock} tồn
                      </span>
                    ) : (
                      <span className="absolute bottom-2 right-2 rounded-md bg-slate-800/90 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                        Hết hàng
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="mt-3 flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mb-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        <span>{p.ratingAvg}</span>
                        <span className="text-slate-400 font-normal">({p.reviewCount})</span>
                      </div>

                      <h3
                        onClick={() => onNavigate('product', { slug: p.slug })}
                        className="cursor-pointer font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition line-clamp-2"
                      >
                        {p.name}
                      </h3>
                    </div>

                    <div className="mt-3 border-t border-slate-100 pt-3 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Giá từ</span>
                        <span className="text-base font-extrabold text-indigo-600">
                          {p.minPrice.toLocaleString('vi-VN')} đ
                        </span>
                      </div>

                      <button
                        onClick={() => onNavigate('product', { slug: p.slug })}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition shadow-xs"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
