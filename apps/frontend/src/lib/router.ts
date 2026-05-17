import { writable } from 'svelte/store';

export const currentPath = writable(typeof window !== 'undefined' ? window.location.pathname : '/');

export function navigate(path: string) {
  if (typeof window !== 'undefined') {
    window.history.pushState({}, '', path);
    currentPath.set(path);
  }
}

export function link(node: HTMLAnchorElement) {
  function handleClick(event: MouseEvent) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    )
      return;

    const target = event.currentTarget as HTMLAnchorElement;
    const href = target.getAttribute('href');

    if (!href || href.startsWith('http') || href.startsWith('//')) return;

    event.preventDefault();
    navigate(href);
  }

  node.addEventListener('click', handleClick);
  return {
    destroy() {
      node.removeEventListener('click', handleClick);
    }
  };
}

export function active(node: HTMLAnchorElement, activeClass = 'active') {
  const unsubscribe = currentPath.subscribe((path) => {
    const href = node.getAttribute('href');
    if (href === '/' && (path === '/' || path === '/dashboard')) {
      node.classList.add(activeClass);
    } else if (href !== '/' && path.startsWith(href || '')) {
      node.classList.add(activeClass);
    } else {
      node.classList.remove(activeClass);
    }
  });

  return {
    destroy() {
      unsubscribe();
    }
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    currentPath.set(window.location.pathname);
  });
}
