// Lucian UX/UI Prompt #040 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#040
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Layers } from 'lucide-react';
import './lucian-040.css';

export function ExpandingSideRail({
  brandName = 'TWP Portal',
  items = [],
  activePath = '',
  onSelect,
  onBrandClick,
  defaultWide = false,
}) {
  const [isWide, setIsWide] = useState(defaultWide);
  const [hlY, setHlY] = useState(0);
  const itemRefs = useRef([]);
  const enterTimerRef = useRef(0);
  const leaveTimerRef = useRef(0);

  const activeIndex = items.findIndex(
    (item) => activePath === item.to || activePath.startsWith(item.to + '/')
  );

  // Chỉ đo lại offsetTop khi activeIndex hoặc số lượng mục thay đổi (không đo khi hover mở/đóng)
  useLayoutEffect(() => {
    if (activeIndex >= 0) {
      const btn = itemRefs.current[activeIndex];
      if (btn && btn.parentNode) {
        setHlY(btn.parentNode.offsetTop);
      }
    }
  }, [activeIndex, items.length]);

  useEffect(() => {
    return () => {
      window.clearTimeout(enterTimerRef.current);
      window.clearTimeout(leaveTimerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    window.clearTimeout(leaveTimerRef.current);
    window.clearTimeout(enterTimerRef.current);
    enterTimerRef.current = window.setTimeout(() => {
      setIsWide(true);
    }, 35);
  };

  const handleMouseLeave = () => {
    window.clearTimeout(enterTimerRef.current);
    window.clearTimeout(leaveTimerRef.current);
    leaveTimerRef.current = window.setTimeout(() => {
      setIsWide(false);
    }, 120);
  };

  const handleFocus = () => {
    window.clearTimeout(leaveTimerRef.current);
    setIsWide(true);
  };

  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsWide(false);
    }
  };

  const handleKeyDown = (e, index) => {
    const dir = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
    if (dir !== 0 && items.length > 0) {
      e.preventDefault();
      const nextIndex = (index + dir + items.length) % items.length;
      itemRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div
      className={`ux u040 ${isWide ? 'is-wide' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <nav className="u040-rail" aria-label="Menu điều hướng chính">
        <button
          type="button"
          className="u040-top"
          onClick={onBrandClick}
          title="Về trang chủ Team Workspace Portal TWP"
        >
          <span className="u040-logo" aria-hidden="true">
            <Layers />
          </span>
          <span className="u040-name">{brandName}</span>
        </button>

        <ul className="u040-nav">
          <li
            className={`u040-hl ${activeIndex < 0 ? 'is-hidden' : ''}`}
            role="presentation"
            style={{ '--y': `${hlY}px` }}
          />
          {items.map((item, idx) => {
            const Icon = item.icon;
            const isActive = idx === activeIndex;
            return (
              <li key={item.to}>
                <button
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  type="button"
                  className="u040-it"
                  style={{ '--i': idx }}
                  aria-current={isActive ? 'page' : undefined}
                  title={!isWide ? item.label : undefined}
                  onClick={() => onSelect && onSelect(item)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                >
                  <Icon aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.badge != null && (
                    <em className="u040-bd" aria-label={`${item.badge} mục`}>
                      {item.badge}
                    </em>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export default ExpandingSideRail;
