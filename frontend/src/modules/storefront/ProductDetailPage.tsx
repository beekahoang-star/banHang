import React, { useState, useEffect } from 'react';
import {
  Star, ShoppingCart, ShieldCheck, Truck, RotateCcw,
  Check, AlertCircle, ChevronRight, MessageSquare
} from 'lucide-react';
import { ProductDetail, Variant, Review } from '../../types';
import { api } from '../../services/api';
import { useCartStore } from '../../stores/cartStore';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (view: string, payload?: any) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, onNavigate }) => {
  const { addItem } = useCartStore();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getProductDetail(slug).then((prod) => {
      setProduct(prod);
      if (prod && prod.variants && prod.variants.length > 0) {
        const firstVariant = prod.variants[0];
        setSelectedVariant(firstVariant);
        try {
          const opts = JSON.parse(firstVariant.options);
          setSelectedOptions(opts);
        } catch (e) {}
      }
      setLoading(false);
    });

    // Mock initial reviews
    setReviews([
      {
        id: 1,
        userId: 10,
        userName: 'Nguyễn Hồng Sơn',
        rating: 5,
        comment: 'Máy nguyên seal chính hãng, khung viền titan tự nhiên cầm cực kỳ đầm tay. Giao hàng trong vòng 2h siêu tốc!',
        sellerReply: 'Cảm ơn anh Sơn đã tin tưởng mua sắm tại hệ thống!',
        createdAt: '2026-10-26T14:20:00Z'
      },
      {
        id: 2,
        userId: 11,
        userName: 'Trần Thúy Nga',
        rating: 5,
        comment: 'Đã check bảo hành Apple chuẩn 12 tháng. Đóng gói 3 lớp chống sốc rất cẩn thận.',
        createdAt: '2026-10-25T09:10:00Z'
      }
    ]);
  }, [slug]);

  if (loading || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto" />
        <p className="mt-4 text-xs text-slate-500">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  // Extract distinct option keys and available values across all variants
  const optionKeys: string[] = [];
  const optionsMap: Record<string, string[]> = {};

  product.variants.forEach((v) => {
    try {
      const parsed = JSON.parse(v.options);
      Object.keys(parsed).forEach((k) => {
        if (!optionKeys.includes(k)) optionKeys.push(k);
        if (!optionsMap[k]) optionsMap[k] = [];
        if (!optionsMap[k].includes(parsed[k])) optionsMap[k].push(parsed[k]);
      });
    } catch (e) {}
  });

  const handleSelectOption = (key: string, val: string) => {
    const nextOptions = { ...selectedOptions, [key]: val };
    setSelectedOptions(nextOptions);

    // Find the variant matching this combination
    const matched = product.variants.find((v) => {
      try {
        const parsed = JSON.parse(v.options);
        return Object.keys(nextOptions).every((k) => parsed[k] === nextOptions[k]);
      } catch (e) {
        return false;
      }
    });

    if (matched) {
      setSelectedVariant(matched);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    addItem({
      variantId: selectedVariant.id,
      skuCode: selectedVariant.skuCode,
      productName: product.name,
      productSlug: product.slug,
      options: selectedVariant.options,
      imageUrl: selectedVariant.imageUrl || product.variants[0]?.imageUrl,
      price: selectedVariant.price,
      salePrice: selectedVariant.salePrice,
      quantity,
      availableStock: selectedVariant.availableStock
    });
  };

  // Parse technical specs JSONB
  let specs: Record<string, any> = {};
  try {
    if (product.attributes) {
      specs = JSON.parse(product.attributes);
    }
  } catch (e) {}

  const currentPrice = selectedVariant
    ? (selectedVariant.salePrice || selectedVariant.price)
    : product.basePrice;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-12">
      {/* Breadcrumb */}
      <Breadcrumbs
        items={[
          ...(product.category
            ? [{
                label: product.category.name,
                onClick: () => onNavigate('listing', { categorySlug: product.category?.slug })
              }]
            : []),
          { label: product.name, active: true }
        ]}
        onNavigateHome={() => onNavigate('home')}
      />

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <img
              src={selectedVariant?.imageUrl || product.variants[0]?.imageUrl || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800'}
              alt={product.name}
              className="h-full w-full object-contain transition-all duration-300"
            />
            {product.brand && (
              <span className="absolute top-4 left-4 rounded-lg bg-slate-900/80 px-2.5 py-1 text-xs font-bold uppercase text-white backdrop-blur-xs">
                {product.brand.name}
              </span>
            )}
          </div>

          {/* Variant Thumbnails */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setSelectedVariant(v);
                  try {
                    setSelectedOptions(JSON.parse(v.options));
                  } catch (e) {}
                }}
                className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-white p-1 transition ${
                  selectedVariant?.id === v.id ? 'border-indigo-600 shadow-sm' : 'border-slate-200 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={v.imageUrl} alt={v.skuCode} className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details & SKU Selection */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center text-amber-400 text-xs font-bold">
                <Star className="h-4 w-4 fill-amber-400" />
                <span className="ml-1 text-slate-900">{product.ratingAvg}</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-500">{product.reviewCount} đánh giá khách hàng</span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-400">Mã SP: #{product.id}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Price Box */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-indigo-600">
                {currentPrice.toLocaleString('vi-VN')} đ
              </span>
              {selectedVariant?.salePrice && (
                <span className="text-sm text-slate-400 line-through">
                  {selectedVariant.price.toLocaleString('vi-VN')} đ
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1 font-mono text-slate-500">
                Mã sản phẩm: <strong className="text-slate-800">{selectedVariant?.skuCode || 'Chưa chọn'}</strong>
              </span>
              <span>•</span>

              {/* Stock Status */}
              {selectedVariant ? (
                selectedVariant.availableStock > 0 ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                    <Check className="h-3.5 w-3.5" />
                    <span>Còn lại {selectedVariant.availableStock} sản phẩm sẵn sàng giao</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Tạm hết hàng</span>
                  </span>
                )
              ) : null}
            </div>
          </div>

          {/* Dynamic Variant Selector (Cartesian Combinations) */}
          <div className="space-y-4 border-y border-slate-200 py-4">
            {optionKeys.map((keyName) => {
              const label = keyName === 'color' ? 'Màu sắc' : keyName === 'storage' ? 'Dung lượng' : keyName === 'size' ? 'Kích cỡ' : keyName;
              const values = optionsMap[keyName] || [];

              return (
                <div key={keyName}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    {label}: <span className="text-indigo-600 font-semibold">{selectedOptions[keyName]}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {values.map((val) => {
                      const isSelected = selectedOptions[keyName] === val;
                      return (
                        <button
                          key={val}
                          onClick={() => handleSelectOption(keyName, val)}
                          className={`rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Quantity Stepper */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Số lượng:
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl border border-slate-200 bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-l-xl"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-bold text-slate-800">{quantity}</span>
                  <button
                    onClick={() => {
                      if (selectedVariant && quantity < selectedVariant.availableStock) {
                        setQuantity(quantity + 1);
                      }
                    }}
                    className="px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-r-xl"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-slate-400">
                  (Tối đa {selectedVariant?.availableStock || 0} món)
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.availableStock <= 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Thêm vào giỏ hàng</span>
            </button>

            <button
              onClick={() => {
                handleAddToCart();
                onNavigate('checkout');
              }}
              disabled={!selectedVariant || selectedVariant.availableStock <= 0}
              className="rounded-2xl border-2 border-indigo-600 bg-indigo-50 px-6 py-3.5 text-sm font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 transition"
            >
              Mua ngay
            </button>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 text-center text-xs">
            <div className="space-y-1">
              <Truck className="mx-auto h-5 w-5 text-indigo-600" />
              <div className="font-semibold text-slate-800">Miễn phí ship</div>
              <div className="text-[10px] text-slate-400">Đơn từ 500K</div>
            </div>
            <div className="space-y-1">
              <ShieldCheck className="mx-auto h-5 w-5 text-emerald-600" />
              <div className="font-semibold text-slate-800">Chính hãng 100%</div>
              <div className="text-[10px] text-slate-400">Cam kết bảo hành</div>
            </div>
            <div className="space-y-1">
              <RotateCcw className="mx-auto h-5 w-5 text-amber-600" />
              <div className="font-semibold text-slate-800">Đổi trả 7 ngày</div>
              <div className="text-[10px] text-slate-400">Lỗi nhà sản xuất</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Specifications & Reviews */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-sm font-bold transition border-b-2 ${
              activeTab === 'specs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Thông Số Kỹ Thuật Chi Tiết
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-sm font-bold transition border-b-2 ${
              activeTab === 'reviews' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Đánh Giá Khách Hàng ({reviews.length})
          </button>
        </div>

        <div className="pt-6">
          {activeTab === 'specs' ? (
            <div className="max-w-2xl">
              <table className="w-full text-xs">
                <tbody>
                  {Object.entries(specs).map(([key, val], idx) => (
                    <tr key={key} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="w-1/3 py-2.5 px-4 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                        {key.replace(/_/g, ' ')}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-800">
                        {String(val)}
                      </td>
                    </tr>
                  ))}
                  {Object.keys(specs).length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-slate-400">Chưa có thông số kỹ thuật</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-slate-100 pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">
                        {r.userName.charAt(0)}
                      </div>
                      <span className="font-bold text-xs text-slate-800">{r.userName}</span>
                    </div>
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                  {r.sellerReply && (
                    <div className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-100">
                      <strong className="text-indigo-600 block mb-0.5">Phản hồi từ NexusStore:</strong>
                      {r.sellerReply}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
