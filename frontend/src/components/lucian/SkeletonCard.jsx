// Lucian UX/UI Prompt #439 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#439
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCw } from 'lucide-react';
import './lucian-439.css';

export function SkeletonCard({
  tag = 'TWP Workspace',
  title = 'Quản lý tiến độ Phase & Review Task',
  meta = 'Nhóm Đồ Án 2026 · 5 thành viên',
  loading: controlledLoading,
  onReload,
  theme = 'light',
  showReloadButton = true,
  className = '',
}) {
  const isControlled = typeof controlledLoading === 'boolean';
  const [internalLoading, setInternalLoading] = useState(true);
  const [liveText, setLiveText] = useState('Đang tải');
  const timerRef = useRef(0);

  const isLoading = isControlled ? controlledLoading : internalLoading;

  const triggerLoad = useCallback(() => {
    if (onReload) {
      onReload();
    }
    if (isControlled) return;

    window.clearTimeout(timerRef.current);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setInternalLoading(true);
    setLiveText('Đang tải');
    timerRef.current = window.setTimeout(() => {
      setInternalLoading(false);
      setLiveText('Đã tải xong');
    }, reducedMotion ? 500 : 1500);
  }, [isControlled, onReload]);

  useEffect(() => {
    if (isControlled) {
      setLiveText(controlledLoading ? 'Đang tải' : 'Đã tải xong');
      return undefined;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setInternalLoading(true);
    setLiveText('Đang tải');
    timerRef.current = window.setTimeout(() => {
      setInternalLoading(false);
      setLiveText('Đã tải xong');
    }, reducedMotion ? 500 : 1500);

    return () => {
      window.clearTimeout(timerRef.current);
    };
  }, [isControlled, controlledLoading]);

  return (
    <div
      data-theme={theme}
      className={`ux u439 ${isLoading ? 'is-loading' : ''} ${className}`.trim()}
    >
      <article className="u439-c" aria-busy={isLoading ? 'true' : 'false'}>
        <div className="u439-real">
          <div className="u439-im" style={{ '--d': '0s' }}>
            <div className="u439-art" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="u439-tx" style={{ '--d': '.12s' }}>
            <div className="u439-tg">{tag}</div>
            <div className="u439-tt">{title}</div>
          </div>
          <div
            className="u439-mt"
            style={{ '--d': '.22s', padding: '0 6px 4px', marginTop: 0 }}
          >
            <span className="u439-av" aria-hidden="true" />
            {meta}
          </div>
        </div>

        <div className="u439-sk" aria-hidden="true">
          <i className="u439-im" style={{ '--d': '0s' }} />
          <div className="u439-tx" style={{ '--d': '.12s' }}>
            <i className="a" />
            <i className="b" />
            <i className="c" />
          </div>
          <div
            className="u439-mt"
            style={{ '--d': '.22s', padding: '0 6px 4px', marginTop: 0 }}
          >
            <i />
            <i />
          </div>
        </div>
      </article>

      {showReloadButton && (
        <button
          type="button"
          className="u439-rl"
          aria-label="Tải lại"
          onClick={triggerLoad}
        >
          <RotateCw aria-hidden="true" />
        </button>
      )}

      <p className="u439-live" role="status">
        {liveText}
      </p>
    </div>
  );
}

export default SkeletonCard;
