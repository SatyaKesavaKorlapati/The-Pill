import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { playTactilePop } from '../utils/audioSynth';

export interface PopdownOption<T extends string = string> {
  value: T;
  label: string;
  sublabel?: string;
  badge?: string;
}

interface CustomPopdownProps<T extends string = string> {
  value: T;
  options: PopdownOption<T>[];
  onChange: (nextValue: T) => void;
  ariaLabel: string;
  prefixIcon?: React.ReactNode;
  accentHex?: string;
  size?: 'xs' | 'sm' | 'md';
  disabled?: boolean;
  fullWidth?: boolean;
  align?: 'left' | 'right';
  isLightSurface?: boolean;
  className?: string;
}

export function CustomPopdown<T extends string = string>({
  value,
  options,
  onChange,
  ariaLabel,
  prefixIcon,
  accentHex = '#22d3ee',
  size = 'sm',
  disabled = false,
  fullWidth = false,
  align = 'left',
  isLightSurface = false,
  className = '',
}: CustomPopdownProps<T>) {
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(() =>
    Math.max(
      0,
      options.findIndex((o) => o.value === value)
    )
  );
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    minWidth: number;
    openUpward: boolean;
  }>({ top: 0, left: 0, minWidth: 160, openUpward: false });

  const selectedOption = options.find((o) => o.value === value) ?? options[0];

  const updateMenuPosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const estimatedHeight = Math.min(264, options.length * 36 + 14);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < estimatedHeight + 12 && rect.top > estimatedHeight;
    const menuWidth = Math.max(rect.width, size === 'xs' ? 158 : 190);

    let left = align === 'right' ? rect.right - menuWidth : rect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));

    const top = openUpward ? rect.top - 6 : rect.bottom + 6;
    setCoords({
      top,
      left,
      minWidth: menuWidth,
      openUpward,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
  }, [open, options.length, align, size]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (ev: MouseEvent) => {
      const target = ev.target as Node | null;
      if (
        target &&
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleScrollOrResize = () => updateMenuPosition();

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [open]);

  const handleSelect = (val: T) => {
    playTactilePop('tab');
    onChange(val);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(
          Math.max(
            0,
            options.findIndex((o) => o.value === value)
          )
        );
        setOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % options.length);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + options.length) % options.length);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const chosen = options[activeIndex];
      if (chosen) handleSelect(chosen.value);
    }
  };

  const sizeCls =
    size === 'xs'
      ? 'px-2 py-0.5 text-[10.5px] rounded-lg gap-1'
      : size === 'sm'
        ? 'px-2.5 py-1 text-[11px] rounded-xl gap-1.5'
        : 'px-3 py-2 text-xs rounded-xl gap-2';

  const triggerSurfaceCls = isLightSurface
    ? 'bg-stone-900/[0.06] hover:bg-stone-900/[0.11] border-stone-900/18 text-stone-900'
    : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/14 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]';

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={(e) => {
          e.stopPropagation();
          if (disabled) return;
          playTactilePop('tab');
          setActiveIndex(
            Math.max(
              0,
              options.findIndex((o) => o.value === value)
            )
          );
          setOpen((prev) => !prev);
        }}
        onKeyDown={handleKeyDown}
        style={
          open
            ? {
                borderColor: `${accentHex}99`,
                boxShadow: `0 0 0 1px ${accentHex}33`,
              }
            : undefined
        }
        className={`inline-flex items-center justify-between border font-medium transition-all select-none disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-sky-400 ${sizeCls} ${triggerSurfaceCls} ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
      >
        <span className="flex items-center gap-1.5 min-w-0 truncate">
          {prefixIcon && <span className="shrink-0 opacity-80">{prefixIcon}</span>}
          <span className="truncate">{selectedOption?.label ?? value}</span>
        </span>
        <ChevronDown
          className={`w-3 h-3 shrink-0 opacity-70 transition-transform duration-150 ${
            open ? 'rotate-180 opacity-100' : ''
          }`}
        />
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              minWidth: `${coords.minWidth}px`,
              transform: coords.openUpward ? 'translateY(-100%)' : undefined,
            }}
            className="z-[120] max-h-64 overflow-y-auto ledge-scroll rounded-2xl p-1.5 bg-[#0b0f19]/95 backdrop-blur-2xl border border-white/16 shadow-[0_22px_50px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.14)] text-slate-100"
          >
            {options.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isHighlighted = idx === activeIndex;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => handleSelect(opt.value)}
                  style={
                    isSelected
                      ? {
                          backgroundColor: `${accentHex}24`,
                        }
                      : undefined
                  }
                  className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-xl text-left transition-colors ${
                    isSelected
                      ? 'text-white font-semibold'
                      : isHighlighted
                        ? 'bg-white/[0.09] text-white'
                        : 'text-slate-300 hover:bg-white/[0.07] hover:text-white'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[11.5px] leading-snug truncate flex items-center gap-1.5">
                      <span className="truncate">{opt.label}</span>
                      {opt.badge && (
                        <span className="px-1.5 py-0.2 rounded bg-white/10 text-[9.5px] font-mono text-slate-300 shrink-0">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {opt.sublabel && (
                      <div className="text-[10px] text-slate-400 truncate">{opt.sublabel}</div>
                    )}
                  </div>
                  <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                    {isSelected && (
                      <Check className="w-3.5 h-3.5" style={{ color: accentHex }} />
                    )}
                  </span>
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}
