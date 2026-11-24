// Lucian UX/UI Prompt #002 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#002
import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import './lucian-002.css';

export function MagneticArrowButton({
  label = 'Đăng nhập',
  activeLabel = 'Đang mở...',
  type = 'button',
  onClick,
  disabled = false,
  busy = false,
  variant = 'hero', // 'hero' | 'form'
  theme,
  className = '',
}) {
  const [animState, setAnimState] = useState('idle');
  const [liveMsg, setLiveMsg] = useState('');
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const magRef = useRef(null);
  const txtRef = useRef(null);
  const orbRef = useRef(null);
  const timerRef = useRef(0);
  const rmRef = useRef(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    rmRef.current = mql.matches;
    const onChange = (e) => {
      rmRef.current = e.matches;
      if (rmRef.current) {
        if (magRef.current) magRef.current.style.translate = '0px 0px';
        if (txtRef.current) txtRef.current.style.translate = '0px 0px';
        if (orbRef.current) orbRef.current.style.translate = '0px 0px';
      }
    };
    mql.addEventListener('change', onChange);
    return () => {
      mql.removeEventListener('change', onChange);
      window.clearTimeout(timerRef.current);
    };
  }, []);

  const handlePointerMove = (e) => {
    if (rmRef.current || disabled || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const p = Math.max(0, 1 - Math.hypot(dx, dy) / 240);
    if (magRef.current) {
      magRef.current.style.translate = `${(dx * 0.12 * p).toFixed(1)}px ${(dy * 0.22 * p).toFixed(1)}px`;
    }
    if (txtRef.current) {
      txtRef.current.style.translate = `${(dx * 0.05 * p).toFixed(1)}px ${(dy * 0.08 * p).toFixed(1)}px`;
    }
    if (orbRef.current) {
      orbRef.current.style.translate = `${(dx * 0.1 * p).toFixed(1)}px ${(dy * 0.14 * p).toFixed(1)}px`;
    }
  };

  const handlePointerLeave = () => {
    if (magRef.current) magRef.current.style.translate = '0px 0px';
    if (txtRef.current) txtRef.current.style.translate = '0px 0px';
    if (orbRef.current) orbRef.current.style.translate = '0px 0px';
  };

  const handleClick = (e) => {
    if (disabled) return;
    window.clearTimeout(timerRef.current);
    setAnimState('idle');
    if (btnRef.current) {
      void btnRef.current.offsetWidth;
    }
    setAnimState('go');
    setLiveMsg(activeLabel);
    timerRef.current = window.setTimeout(() => {
      setAnimState('idle');
      setLiveMsg('');
    }, rmRef.current ? 900 : 1900);

    if (onClick) {
      onClick(e);
    }
  };

  const currentState = busy ? 'go' : animState;

  return (
    <div
      ref={rootRef}
      {...(theme ? { 'data-theme': theme } : {})}
      data-state={currentState}
      className={`ux u002 ${variant === 'form' ? 'u002-form' : ''} ${className}`.trim()}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <span className="u002-glow" aria-hidden="true" />
      <div className="u002-mag" ref={magRef}>
        <button
          ref={btnRef}
          className="u002-btn"
          type={type}
          disabled={disabled}
          onClick={handleClick}
        >
          <span className="u002-fill" aria-hidden="true" />
          <span className="u002-txt" ref={txtRef}>
            <span>{label}</span>
            <span aria-hidden="true">{activeLabel}</span>
          </span>
          <span className="u002-orb" ref={orbRef} aria-hidden="true">
            <ArrowRight />
            <ArrowRight />
          </span>
        </button>
      </div>
      <span className="u002-live" aria-live="polite">
        {busy ? activeLabel : liveMsg}
      </span>
    </div>
  );
}

export default MagneticArrowButton;
