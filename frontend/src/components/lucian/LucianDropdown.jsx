// Lucian UX/UI Prompt #413 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#413
import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, CircleDot } from 'lucide-react';
import './lucian-413.css';

const DEFAULT_COLORS = ['u413-c1', 'u413-c2', 'u413-c3', 'u413-c4'];

const DEFAULT_ICON = <CircleDot />;

export function LucianDropdown({
  options = [],
  value,
  onChange,
  placeholder = 'Chọn...',
  disabled = false,
  compact = false,
  fullWidth = false,
  dense = false,
  hoverOpen = false,
  showDot = false,
  ariaLabel = 'Chọn mục',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [hlY, setHlY] = useState(0);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 272, openUp: false });

  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const itemRefs = useRef([]);
  const openTimerRef = useRef(0);
  const closeTimerRef = useRef(0);
  const hoverAtRef = useRef(0);
  const panelId = useId();

  const selectedOption = options.find((opt) => String(opt.value) === String(value ?? ''));
  const selectedColorClass =
    selectedOption?.colorClass ||
    DEFAULT_COLORS[
      Math.max(0, options.findIndex((o) => String(o.value) === String(value ?? ''))) %
        DEFAULT_COLORS.length
    ];

  const isDense = dense || options.every((opt) => !opt.desc);

  const computePosition = useCallback(() => {
    const tr = triggerRef.current;
    if (!tr) return;
    const rect = tr.getBoundingClientRect();
    const minW = fullWidth ? Math.max(rect.width, 232) : 260;
    const panelWidth = Math.min(Math.max(minW, 240), window.innerWidth - 24);
    const rowH = isDense ? 42 : 52;
    const panelHeight = Math.min(options.length * rowH + 14, 324);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < panelHeight + 16 && rect.top > panelHeight + 16;

    let left = fullWidth
      ? rect.left
      : rect.left + rect.width / 2 - panelWidth / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - panelWidth - 12));
    const top = openUp ? rect.top - panelHeight - 8 : rect.bottom + 8;

    setPos({ top, left, width: panelWidth, openUp });
  }, [fullWidth, isDense, options.length]);

  const mark = useCallback((idx, focusItem = false) => {
    setActiveIdx(idx);
    if (idx >= 0) {
      const btn = itemRefs.current[idx];
      if (btn) {
        setHlY(btn.offsetTop);
        if (focusItem) {
          btn.focus({ preventScroll: true });
        }
      }
    }
  }, []);

  const setOpenState = useCallback(
    (nextOpen, returnFocus = false) => {
      window.clearTimeout(openTimerRef.current);
      window.clearTimeout(closeTimerRef.current);
      if (nextOpen) {
        computePosition();
      }
      setOpen((prev) => {
        if (prev === nextOpen) return prev;
        if (!nextOpen) {
          setActiveIdx(-1);
          if (returnFocus) {
            window.requestAnimationFrame(() => {
              triggerRef.current?.focus({ preventScroll: true });
            });
          }
        }
        return nextOpen;
      });
    },
    [computePosition]
  );

  useLayoutEffect(() => {
    if (open) {
      computePosition();
    }
  }, [open, computePosition]);

  useEffect(() => {
    if (!open) return undefined;
    const handleReposition = () => computePosition();
    const handleOutside = (e) => {
      if (
        !triggerRef.current?.contains(e.target) &&
        !panelRef.current?.contains(e.target)
      ) {
        setOpenState(false, false);
      }
    };
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    document.addEventListener('pointerdown', handleOutside, true);
    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
      document.removeEventListener('pointerdown', handleOutside, true);
    };
  }, [open, computePosition, setOpenState]);

  useEffect(() => {
    return () => {
      window.clearTimeout(openTimerRef.current);
      window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handlePointerEnter = (e) => {
    if (!hoverOpen || disabled || e.pointerType !== 'mouse') return;
    window.clearTimeout(closeTimerRef.current);
    if (!open) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = window.setTimeout(() => {
        hoverAtRef.current = Date.now();
        setOpenState(true);
      }, 120);
    }
  };

  const handlePointerLeave = (e) => {
    if (!hoverOpen || e.pointerType !== 'mouse') return;
    window.clearTimeout(openTimerRef.current);
    if (open) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = window.setTimeout(() => {
        setOpenState(false);
      }, 240);
    }
  };

  const handleTriggerClick = (e) => {
    e.stopPropagation();
    if (disabled) return;
    if (hoverOpen && open && Date.now() - hoverAtRef.current < 500) return;
    setOpenState(!open);
  };

  const handleTriggerKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      setOpenState(true);
      window.requestAnimationFrame(() => {
        mark(e.key === 'ArrowDown' ? 0 : options.length - 1, true);
      });
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      e.stopPropagation();
      setOpenState(false, true);
    }
  };

  const handlePanelKeyDown = (e) => {
    const n = options.length;
    if (n === 0) return;
    const i =
      activeIdx < 0 ? itemRefs.current.indexOf(document.activeElement) : activeIdx;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setOpenState(false, true);
      return;
    }
    const to =
      e.key === 'ArrowDown'
        ? i + 1
        : e.key === 'ArrowUp'
        ? i - 1
        : e.key === 'Home'
        ? 0
        : e.key === 'End'
        ? n - 1
        : null;
    if (to === null) return;
    e.preventDefault();
    mark((to + n) % n, true);
  };

  const handleSelectOption = (e, option) => {
    e.preventDefault();
    e.stopPropagation();
    if (option.disabled) return;
    setOpenState(false, true);
    if (onChange) {
      onChange(option.value);
    }
  };

  const portalNode = (
    <div
      className={`ux u413-portal ${open ? 'is-open' : ''} ${pos.openUp ? 'is-up' : ''}`}
      style={{ top: `${pos.top}px`, left: `${pos.left}px` }}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        ref={panelRef}
        id={panelId}
        style={{ width: `${pos.width}px` }}
        className={`u413-pn ${isDense ? 'is-dense' : ''} ${activeIdx >= 0 ? 'is-hl' : ''}`}
        role="region"
        aria-label={ariaLabel}
        aria-hidden={open ? 'false' : 'true'}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={(e) => {
          setActiveIdx(-1);
          handlePointerLeave(e);
        }}
        onKeyDown={handlePanelKeyDown}
      >
        <div className="u413-pn-scroll">
          <span className="u413-hl" style={{ '--hy': `${hlY}px` }} aria-hidden="true" />
          <ul className="u413-ls">
            {options.map((opt, idx) => {
              const isCurrent = String(opt.value) === String(value ?? '');
              const colorClass = opt.colorClass || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
              return (
                <li key={String(opt.value) + '-' + idx}>
                  <button
                    ref={(el) => {
                      itemRefs.current[idx] = el;
                    }}
                    type="button"
                    tabIndex={open ? 0 : -1}
                    aria-disabled={opt.disabled ? 'true' : undefined}
                    aria-current={isCurrent ? 'true' : undefined}
                    className={`u413-it ${activeIdx === idx ? 'is-on' : ''} ${
                      opt.disabled ? 'is-disabled' : ''
                    }`}
                    style={{ '--i': idx }}
                    onPointerEnter={() => mark(idx)}
                    onFocus={() => mark(idx)}
                    onClick={(e) => handleSelectOption(e, opt)}
                  >
                    <span className={`u413-ic ${colorClass}`} aria-hidden="true">
                      {opt.icon || DEFAULT_ICON}
                    </span>
                    <span className="u413-tx">
                      <b>{opt.label}</b>
                      {opt.desc && <small>{opt.desc}</small>}
                    </span>
                    {isCurrent && <span className="u413-cur" aria-label="Đang chọn" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`ux u413 ${compact ? 'u413-sm' : ''} ${fullWidth ? 'u413-full' : ''} ${
        open ? 'is-open' : ''
      } ${className}`.trim()}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        className={`u413-tr ${selectedColorClass}`}
        aria-expanded={open ? 'true' : 'false'}
        aria-controls={panelId}
        aria-label={ariaLabel}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className="u413-tr-in">
          {showDot && <span className="u413-dot" aria-hidden="true" />}
          <span className={`u413-tr-lbl ${!selectedOption ? 'is-placeholder' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown aria-hidden="true" />
      </button>

      {typeof document !== 'undefined' && createPortal(portalNode, document.body)}
    </div>
  );
}

export default LucianDropdown;
