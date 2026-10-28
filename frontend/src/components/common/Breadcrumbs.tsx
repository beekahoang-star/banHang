import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigateHome: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigateHome }) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 py-2.5 overflow-x-auto">
      <button
        onClick={onNavigateHome}
        className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-medium transition"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Trang chủ</span>
      </button>

      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          {item.active || !item.onClick ? (
            <span className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-md">
              {item.label}
            </span>
          ) : (
            <button
              onClick={item.onClick}
              className="text-slate-600 hover:text-indigo-600 transition font-medium truncate max-w-[150px]"
            >
              {item.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
