'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';

import { LocaleLink } from '@/components/navigation/locale-link';
import { LanguageSwitcher } from '@/components/navigation/language-switcher';
import {
  navigationItems,
  type NavigationCopy,
  siteName,
} from '@/lib/site-config';
import type { ConversionLinks } from '@/lib/conversion-links';
import type { Locale } from '@/i18n/types';

type MobileNavigationProps = Readonly<{
  callHref: ConversionLinks['call'];
  copy?: NavigationCopy;
  locale: Locale;
  mapsHref: ConversionLinks['maps'];
}>;

const defaultCopy: NavigationCopy = {
  about: 'About',
  call: 'Call',
  closeMenu: 'Close navigation',
  directions: 'Directions',
  home: 'Home',
  language: 'Language',
  menu: 'Menu',
  openMenu: 'Open navigation',
  ourSpace: 'Our space',
  primary: 'Primary navigation',
  visit: 'Visit',
};

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter((element) => !element.hasAttribute('aria-hidden'));
}

export function MobileNavigation({
  callHref,
  copy = defaultCopy,
  locale,
  mapsHref,
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const shouldRestoreFocusRef = useRef(false);

  const closeNavigation = useCallback(() => {
    shouldRestoreFocusRef.current = true;
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      if (shouldRestoreFocusRef.current) {
        triggerRef.current?.focus();
        shouldRestoreFocusRef.current = false;
      }

      return;
    }

    firstLinkRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeNavigation();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const panel = panelRef.current;
      if (!panel) {
        return;
      }

      const focusableElements = getFocusableElements(panel);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) {
        event.preventDefault();
        return;
      }

      const activeElement = document.activeElement;
      if (!panel.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
        return;
      }

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeNavigation, isOpen]);

  useEffect(() => {
    if (!isOpen || !panelRef.current) {
      return;
    }

    const panel = panelRef.current;
    const inertSiblings = Array.from(document.body.children)
      .filter((element) => element !== panel)
      .map((element) => {
        const htmlElement = element as HTMLElement;
        const wasInert = htmlElement.hasAttribute('inert');
        htmlElement.setAttribute('inert', '');
        return { element: htmlElement, wasInert };
      });

    return () => {
      inertSiblings.forEach(({ element, wasInert }) => {
        if (wasInert) {
          element.setAttribute('inert', '');
        } else {
          element.removeAttribute('inert');
        }
      });
    };
  }, [isOpen]);

  const panel = isOpen ? (
    <div
      aria-label={copy.primary}
      aria-modal="true"
      className="fixed inset-0 z-50 flex min-h-dvh flex-col bg-[var(--navido-paper)] px-5 py-5"
      id={panelId}
      ref={panelRef}
      role="dialog"
    >
      <div className="flex items-center justify-between border-b border-[var(--navido-rule)] pb-5">
        <span className="text-sm font-semibold tracking-[0.08em]">
          {siteName}
        </span>
        <button
          aria-label={copy.closeMenu}
          className="grid size-11 place-items-center border border-[var(--navido-rule)] text-xl leading-none"
          onClick={closeNavigation}
          type="button"
        >
          <span aria-hidden="true">x</span>
        </button>
      </div>

      <nav
        aria-label={copy.primary}
        className="flex flex-1 flex-col justify-center gap-6"
      >
        {navigationItems.map((item, index) => (
          <LocaleLink
            className="w-fit text-3xl font-light text-[var(--navido-ink)]"
            href={item.href}
            key={item.key}
            locale={locale}
            ref={index === 0 ? firstLinkRef : undefined}
          >
            {copy[item.key]}
          </LocaleLink>
        ))}
      </nav>

      <div className="border-t border-[var(--navido-rule)] pt-5">
        <LanguageSwitcher label={copy.language} locale={locale} />
      </div>
    </div>
  ) : null;

  return (
    <div className="md:hidden">
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label={copy.openMenu}
        className="grid size-11 place-items-center border border-[var(--navido-rule)] bg-[var(--navido-paper)] text-[var(--navido-ink)]"
        onClick={() => setIsOpen(true)}
        ref={triggerRef}
        type="button"
      >
        <span aria-hidden="true" className="grid gap-1.5">
          <span className="block h-px w-5 bg-current" />
          <span className="block h-px w-5 bg-current" />
          <span className="block h-px w-5 bg-current" />
        </span>
      </button>

      {panel && typeof document !== 'undefined'
        ? createPortal(panel, document.body)
        : null}

      {isMounted && !isOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-[var(--navido-rule)] bg-[var(--navido-paper)] pb-[env(safe-area-inset-bottom)] md:hidden"
              data-testid="mobile-conversion-bar"
            >
              <a className="grid min-h-14 place-items-center" href={callHref}>
                {copy.call}
              </a>
              <a
                className="grid min-h-14 place-items-center border-l border-[var(--navido-rule)]"
                href={mapsHref}
                rel="noreferrer"
                target="_blank"
              >
                {copy.directions}
              </a>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
