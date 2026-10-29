import React, { useState, useEffect } from 'react';
import { CheckCircle2, Copy, QrCode, ShieldCheck, X } from 'lucide-react';

interface VietQrModalProps {
  orderCode: string;
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const VietQrModal: React.FC<VietQrModalProps> = ({
  orderCode,
  amount,
  isOpen,
  onClose,
  onPaymentSuccess
}) => {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<'WAITING' | 'SUCCESS'>('WAITING');

  const bankName = 'MBBank (Quân Đội)';
  const accountNo = '0987654321';
  const accountName = 'CTY CP THUONG MAI NEXUSTORE';
  const qrUrl = `https://img.vietqr.io/image/970422-${accountNo}-compact2.png?amount=${amount}&addInfo=${orderCode}&accountName=${encodeURIComponent(accountName)}`;

  useEffect(() => {
    if (!isOpen) return;
    setStatus('WAITING');
    // Simulate real-time webhook listening or polling for demo payment confirmation
    const timer = setTimeout(() => {
      // Auto-confirm after 12 seconds in demo
      setStatus('SUCCESS');
      setTimeout(() => {
        onPaymentSuccess();
      }, 1500);
    }, 12000);

    return () => clearTimeout(timer);
  }, [isOpen, onPaymentSuccess]);

  if (!isOpen) return null;

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualCheck = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setStatus('SUCCESS');
      setTimeout(() => {
        onPaymentSuccess();
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        {status === 'SUCCESS' ? (
          <div className="py-8 text-center animate-scale-up">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Thanh Toán Thành Công!</h3>
            <p className="mt-2 text-sm text-slate-600">
              Hệ thống đã tự động nhận tiền qua cổng VietQR Napas 247 cho đơn hàng <strong className="text-slate-900">{orderCode}</strong>.
            </p>
            <p className="mt-4 text-xs text-emerald-700 font-medium bg-emerald-50 py-2 px-4 rounded-lg inline-block">
              Đang chuyển hướng sang trang chi tiết đơn hàng...
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <QrCode className="h-6 w-6 text-indigo-600" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">Chuyển Khoản Qua VietQR Napas 247</h3>
                <p className="text-xs text-slate-500">Quét mã bằng ứng dụng ngân hàng bất kỳ để tự động điền thông tin</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col items-center">
              <div className="overflow-hidden rounded-xl border border-indigo-100 bg-white p-2 shadow-sm">
                <img
                  src={qrUrl}
                  alt="VietQR Code"
                  className="h-56 w-56 object-contain"
                />
              </div>

              <div className="mt-4 w-full space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Ngân hàng:</span>
                  <span className="font-semibold text-slate-800">{bankName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Số tài khoản:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-bold text-indigo-600">{accountNo}</span>
                    <button onClick={() => copyText(accountNo)} className="text-slate-400 hover:text-indigo-600">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Chủ tài khoản:</span>
                  <span className="font-semibold text-slate-800">{accountName}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200/60 pt-2">
                  <span className="text-slate-500">Số tiền:</span>
                  <span className="font-bold text-emerald-600 text-base">{amount.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Nội dung chuyển khoản:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-xs">{orderCode}</span>
                    <button onClick={() => copyText(orderCode)} className="text-slate-400 hover:text-indigo-600">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {copied && (
                <p className="mt-2 text-xs font-medium text-emerald-600 animate-pulse">Đã sao chép vào bộ nhớ tạm!</p>
              )}

              <div className="mt-4 flex w-full items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1 text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-indigo-500" />
                  <span>Xác nhận giao dịch tự động trong 5-15s</span>
                </div>
                <button
                  onClick={handleManualCheck}
                  disabled={checking}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-50"
                >
                  {checking ? 'Đang kiểm tra...' : 'Tôi đã chuyển khoản'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
