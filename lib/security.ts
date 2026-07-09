const ALLOWED_TAGS = ['h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'br', 'a', 'span', 'div', 'blockquote', 'code', 'pre'];
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  'a': ['href', 'title', 'target', 'rel'],
  'span': ['class'],
  'div': ['class'],
  'code': ['class'],
  'pre': ['class'],
};

export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';

  // Create a temporary element to parse HTML
  if (typeof document === 'undefined') {
    // Server-side: basic regex sanitization
    let sanitized = html;

    // Remove script tags
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Remove event handlers
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    // Remove javascript: urls
    sanitized = sanitized.replace(/javascript:/gi, '');
    // Remove data: urls in href
    sanitized = sanitized.replace(/href\s*=\s*["']data:/gi, 'href="#"');

    return sanitized;
  }

  // Client-side sanitization
  const temp = document.createElement('div');
  temp.innerHTML = html;

  function sanitizeNode(node: Node): void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      // Remove disallowed tags
      if (!ALLOWED_TAGS.includes(tagName)) {
        element.remove();
        return;
      }

      // Remove event handlers and dangerous attributes
      const attributes = Array.from(element.attributes);
      for (const attr of attributes) {
        if (attr.name.startsWith('on') || attr.name === 'style') {
          element.removeAttribute(attr.name);
        }
        // Check for allowed attributes
        const allowedForTag = ALLOWED_ATTRIBUTES[tagName] || [];
        if (!allowedForTag.includes(attr.name) && attr.name !== 'class') {
          element.removeAttribute(attr.name);
        }
      }

      // Sanitize href attributes
      if (tagName === 'a') {
        const href = element.getAttribute('href');
        if (href) {
          const lowerHref = href.toLowerCase();
          if (lowerHref.startsWith('javascript:') || lowerHref.startsWith('data:text/html')) {
            element.setAttribute('href', '#');
          }
          // Add rel="noopener noreferrer" for external links
          if (!href.startsWith('/') && !href.startsWith('#') && !href.startsWith(window.location.origin)) {
            element.setAttribute('rel', 'noopener noreferrer');
            element.setAttribute('target', '_blank');
          }
        }
      }
    }

    // Recursively sanitize children
    const children = Array.from(node.childNodes);
    for (const child of children) {
      sanitizeNode(child);
    }
  }

  sanitizeNode(temp);
  return temp.innerHTML;
}

export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
}

export function stripHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, '');
}
