// Lucian UX/UI Prompt #408 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#408
import React, { useEffect, useId, useRef, useState } from 'react';
import { User, Sun, Moon, Home, LogOut } from 'lucide-react';
import DayNightToggle from './DayNightToggle';
import './lucian-408.css';

export function AccountMenu({
  user,
  isDark = false,
  onToggleTheme,
  onProfile,
  onHelp,
  onLogout,
  theme,
}) {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const wrapRef = useRef(null);
  const avRef = useRef(null);
  const itemRefs = useRef([]);
  const menuId = useId();

  useEffect(() => {
    setImgError(false);
  }, [user?.avatarUrl]);

  const close = (returnFocus = false) => {
    setOpen((wasOpen) => {
      if (wasOpen && returnFocus) {
        window.requestAnimationFrame(() => {
          avRef.current?.focus({ preventScroll: true });
        });
      }
      return false;
    });
  };

  const openAndFocus = (focusIndex) => {
    setOpen(true);
    if (focusIndex != null) {
      window.requestAnimationFrame(() => {
        const items = itemRefs.current.filter(Boolean);
        if (items.length > 0) {
          const target = items[(focusIndex + items.length) % items.length];
          target?.focus({ preventScroll: true });
        }
      });
    }
  };

  useEffect(() => {
    const handleOutside = (e) => {
      if (open && wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutside, true);
    return () => {
      document.removeEventListener('pointerdown', handleOutside, true);
    };
  }, [open]);

  const handleAvatarKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      openAndFocus(e.key === 'ArrowDown' ? 0 : -1);
    } else if (e.key === 'Escape' && open) {
      e.stopPropagation();
      close(false);
    }
  };

  const handleMenuKeyDown = (e) => {
    const items = itemRefs.current.filter(Boolean);
    const i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(i + 1) % items.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(i - 1 + items.length) % items.length]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close(true);
    } else if (e.key === 'Tab') {
      close(false);
    }
  };

  const handleItemAction = (callback) => {
    close(true);
    if (callback) callback();
  };

  const displayName = user?.fullName || user?.username || 'Thành viên TWP';
  const displaySub =
    [user?.email, user?.studentCode].filter(Boolean).join(' · ') || 'Team Workspace Portal TWP';

  return (
    <div {...(theme ? { 'data-theme': theme } : {})} className={`ux u408 ${open ? 'is-open' : ''}`}>
      <div className="u408-w" ref={wrapRef}>
        <button
          ref={avRef}
          type="button"
          className="u408-av"
          aria-label="Mở menu tài khoản"
          aria-haspopup="menu"
          aria-expanded={open ? 'true' : 'false'}
          aria-controls={menuId}
          onClick={() => (open ? close(false) : setOpen(true))}
          onKeyDown={handleAvatarKeyDown}
        >
          {user?.avatarUrl && !imgError ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              onError={() => setImgError(true)}
            />
          ) : (
            <svg viewBox="0 0 46 46" aria-hidden="true">
              <path d="M7 46c1.6-8.6 7.6-13 16-13s14.4 4.4 16 13z" fill="#6366F1" />
              <path d="M19.6 29h6.8v5.4a3.4 3.4 0 0 1-6.8 0z" fill="#E9B08C" />
              <circle cx="23" cy="21" r="9" fill="#F6C6A4" />
              <path
                d="M13.6 21.6c-.8-7 3.6-11.6 9.6-11.6s10.2 4.4 9.4 11c-3-.6-5.8-2.6-7.4-5.2-2.6 3.2-7 5.2-11.6 5.8z"
                fill="#2B2238"
              />
              <circle cx="19.6" cy="22.6" r="1" fill="#2B2238" />
              <circle cx="26.4" cy="22.6" r="1" fill="#2B2238" />
              <path
                d="M20.8 25.8c1.3 1 3.1 1 4.4 0"
                fill="none"
                stroke="#2B2238"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <circle cx="17.4" cy="25" r="1.4" fill="#F49B8A" opacity=".55" />
              <circle cx="28.6" cy="25" r="1.4" fill="#F49B8A" opacity=".55" />
            </svg>
          )}
        </button>

        <span className="u408-dot" aria-hidden="true" />

        <div
          id={menuId}
          className="u408-m"
          role="menu"
          aria-label="Menu tài khoản"
          onKeyDown={handleMenuKeyDown}
        >
          <div className="u408-hd" style={{ '--i': 0 }}>
            <b title={displayName}>{displayName}</b>
            <span title={displaySub}>{displaySub}</span>
          </div>

          <button
            ref={(el) => { itemRefs.current[0] = el; }}
            type="button"
            className="u408-it"
            role="menuitem"
            tabIndex={-1}
            style={{ '--i': 1 }}
            onClick={() => handleItemAction(onProfile)}
          >
            <User aria-hidden="true" />
            <span>Hồ sơ cá nhân</span>
          </button>

          {/* Chế độ (Day–night dark mode toggle #447) */}
          <div
            className="u408-mode"
            style={{ '--i': 2 }}
            onClick={() => onToggleTheme && onToggleTheme()}
          >
            <span className="u408-mode-lbl">
              {isDark ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
              <span>Chế độ</span>
            </span>

            <DayNightToggle
              ref={(el) => { itemRefs.current[1] = el; }}
              checked={isDark}
              onChange={() => onToggleTheme && onToggleTheme()}
              compact
              tabIndex={-1}
              ariaLabel="Chuyển đổi chế độ sáng tối"
            />
          </div>

          <button
            ref={(el) => { itemRefs.current[2] = el; }}
            type="button"
            className="u408-it"
            role="menuitem"
            tabIndex={-1}
            style={{ '--i': 3 }}
            onClick={() => handleItemAction(onHelp)}
          >
            <Home aria-hidden="true" />
            <span>Trang chủ TWP</span>
          </button>

          <div className="u408-hr" role="separator" style={{ '--i': 4 }} />

          <button
            ref={(el) => { itemRefs.current[3] = el; }}
            type="button"
            className="u408-it is-out"
            role="menuitem"
            tabIndex={-1}
            style={{ '--i': 5 }}
            onClick={() => handleItemAction(onLogout)}
          >
            <LogOut aria-hidden="true" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccountMenu;
