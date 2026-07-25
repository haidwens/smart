import { Note, BacklinkItem } from '../types';

// Regular expression to match [[Note Title]] or [[Note Title|Display Alias]]
export const WIKILINK_REGEX = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

// Regex to match tags like #knowledge or #project/2026
export const TAG_REGEX = /(?:^|\s)#([a-zA-Z0-9_\-\u4e00-\u9fa5]+)/g;

/**
 * Extract all target note titles referenced via [[WikiLinks]] in content
 */
export function extractWikiLinks(content: string): { raw: string; title: string; alias?: string }[] {
  const matches: { raw: string; title: string; alias?: string }[] = [];
  let match;
  const regex = new RegExp(WIKILINK_REGEX.source, 'g');
  
  while ((match = regex.exec(content)) !== null) {
    matches.push({
      raw: match[0],
      title: match[1].trim(),
      alias: match[2]?.trim(),
    });
  }
  return matches;
}

/**
 * Extract all tags (#tag) from content
 */
export function extractTags(content: string): string[] {
  const tags = new Set<string>();
  let match;
  const regex = new RegExp(TAG_REGEX.source, 'g');
  while ((match = regex.exec(content)) !== null) {
    if (match[1]) {
      tags.add(match[1].toLowerCase());
    }
  }
  return Array.from(tags);
}

/**
 * Find all notes that link to `targetNoteTitle` (Linked Mentions)
 * and notes that mention `targetNoteTitle` as plain text (Unlinked Mentions)
 */
export function findBacklinks(
  targetNoteId: string,
  targetNoteTitle: string,
  notes: Record<string, Note>
): { linkedMentions: BacklinkItem[]; unlinkedMentions: BacklinkItem[] } {
  const linkedMentions: BacklinkItem[] = [];
  const unlinkedMentions: BacklinkItem[] = [];

  if (!targetNoteTitle.trim()) {
    return { linkedMentions, unlinkedMentions };
  }

  const normalizedTargetTitle = targetNoteTitle.trim().toLowerCase();

  Object.values(notes).forEach((note) => {
    if (note.id === targetNoteId) return; // Skip self

    const content = note.content;
    const wikiLinks = extractWikiLinks(content);
    
    // Check for explicit [[targetNoteTitle]] links
    const explicitLink = wikiLinks.find(
      (wl) => wl.title.toLowerCase() === normalizedTargetTitle
    );

    if (explicitLink) {
      // Find context snippet around the link
      const linkIndex = content.indexOf(explicitLink.raw);
      const snippet = extractSnippet(content, linkIndex, explicitLink.raw.length);
      
      linkedMentions.push({
        sourceNoteId: note.id,
        sourceNoteTitle: note.title,
        contextSnippet: snippet,
        isUnlinked: false,
      });
    } else {
      // Check for plain text mentions of the target note's title
      const lowerContent = content.toLowerCase();
      const plainIndex = lowerContent.indexOf(normalizedTargetTitle);
      
      if (plainIndex !== -1 && targetNoteTitle.length > 2) {
        // Ensure it's not part of another word or code block
        const snippet = extractSnippet(content, plainIndex, targetNoteTitle.length);
        unlinkedMentions.push({
          sourceNoteId: note.id,
          sourceNoteTitle: note.title,
          contextSnippet: snippet,
          isUnlinked: true,
        });
      }
    }
  });

  return { linkedMentions, unlinkedMentions };
}

/**
 * Extract a snippet of text surrounding a given index
 */
function extractSnippet(text: string, index: number, matchLength: number, windowSize: number = 60): string {
  const start = Math.max(0, index - windowSize);
  const end = Math.min(text.length, index + matchLength + windowSize);
  
  let snippet = text.substring(start, end).replace(/\n/g, ' ');
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  
  return snippet;
}

/**
 * Header outline item for Table of Contents
 */
export interface HeaderOutline {
  id: string;
  text: string;
  level: number; // 1, 2, 3...
}

/**
 * Extract headers from markdown text
 */
export function extractHeaders(markdown: string): HeaderOutline[] {
  const lines = markdown.split('\n');
  const headers: HeaderOutline[] = [];
  
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim().replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, p1, p2) => p2 || p1);
      const id = `header-${index}-${text.toLowerCase().replace(/[^\w]+/g, '-')}`;
      headers.push({ id, text, level });
    }
  });

  return headers;
}

/**
 * Convert raw Markdown into clean HTML with WikiLinks rendered as interactive elements,
 * callouts formatted, tables rendered, and code blocks styled.
 */
export function renderMarkdownToHtml(
  markdown: string,
  existingNoteTitles: Set<string>
): string {
  if (!markdown) return '<p class="text-gray-400 italic">Empty note</p>';

  let html = markdown;

  // Escaping HTML entities first for safety (except tags we generate)
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Render Callout blocks like > [!NOTE] Title
  html = html.replace(
    /^&gt;\s*\[!(NOTE|TIP|WARNING|DANGER|INFO|SUCCESS)\](?:\s+(.*))?$\n((?:^&gt;.*$\n?)*)/gm,
    (match, type, title, body) => {
      const calloutType = type.toLowerCase();
      const calloutTitle = title || type;
      const cleanBody = body.replace(/^&gt;\s?/gm, '');

      const typeStyles: Record<string, { bg: string; border: string; icon: string; text: string }> = {
        note: { bg: 'bg-blue-50/70 dark:bg-blue-950/30', border: 'border-blue-500', icon: '📝', text: 'text-blue-700 dark:text-blue-300' },
        tip: { bg: 'bg-emerald-50/70 dark:bg-emerald-950/30', border: 'border-emerald-500', icon: '💡', text: 'text-emerald-700 dark:text-emerald-300' },
        warning: { bg: 'bg-amber-50/70 dark:bg-amber-950/30', border: 'border-amber-500', icon: '⚠️', text: 'text-amber-700 dark:text-amber-300' },
        danger: { bg: 'bg-rose-50/70 dark:bg-rose-950/30', border: 'border-rose-500', icon: '🚨', text: 'text-rose-700 dark:text-rose-300' },
        info: { bg: 'bg-indigo-50/70 dark:bg-indigo-950/30', border: 'border-indigo-500', icon: 'ℹ️', text: 'text-indigo-700 dark:text-indigo-300' },
        success: { bg: 'bg-teal-50/70 dark:bg-teal-950/30', border: 'border-teal-500', icon: '✅', text: 'text-teal-700 dark:text-teal-300' },
      };

      const style = typeStyles[calloutType] || typeStyles.note;

      return `<div class="my-3 p-3.5 rounded-lg border-l-4 ${style.border} ${style.bg} transition-all">
        <div class="flex items-center gap-2 font-medium text-sm ${style.text} mb-1">
          <span>${style.icon}</span>
          <span>${calloutTitle}</span>
        </div>
        <div class="text-xs sm:text-sm text-gray-700 dark:text-gray-300 opacity-90">${cleanBody}</div>
      </div>`;
    }
  );

  // Render Math Blocks $$ math $$
  html = html.replace(/\$\$(.*?)\$\$/gs, (_, math) => {
    return `<div class="my-2 p-2.5 bg-gray-100 dark:bg-gray-800/60 rounded-md text-center font-mono text-sm overflow-x-auto text-sky-600 dark:text-sky-400">📐 ${math.trim()}</div>`;
  });

  // Render Inline Math $ math $
  html = html.replace(/\$([^\$\n]+)\$/g, (_, math) => {
    return `<code class="px-1.5 py-0.5 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 rounded font-mono text-xs">f(x) = ${math.trim()}</code>`;
  });

  // Render Code blocks ```lang ... ```
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<div class="my-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-900 text-gray-100 font-mono text-xs">
      <div class="px-3 py-1.5 bg-gray-800/80 border-b border-gray-700/50 flex justify-between items-center text-[10px] text-gray-400 uppercase tracking-wider">
        <span>${lang || 'code'}</span>
        <span class="text-gray-500">macOS code view</span>
      </div>
      <pre class="p-3 overflow-x-auto"><code>${code.trim()}</code></pre>
    </div>`;
  });

  // Render [[WikiLinks]] as clickable macOS tags
  html = html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, targetTitle, alias) => {
    const title = targetTitle.trim();
    const display = (alias || title).trim();
    const exists = existingNoteTitles.has(title.toLowerCase());

    const statusClasses = exists
      ? 'bg-accent/15 text-accent hover:bg-accent/25 dark:bg-accent/20 dark:hover:bg-accent/30 border-accent/30'
      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20 italic';

    return `<span class="wikilink cursor-pointer inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-medium text-xs border transition-all shadow-2xs ${statusClasses}"
            data-wikilink-title="${encodeURIComponent(title)}"
            title="${exists ? `Open [[${title}]]` : `Create [[${title}]] (New Note)`}">
      <span class="opacity-60 text-[10px]">[[</span>
      <span>${display}</span>
      <span class="opacity-60 text-[10px]">]]</span>
      ${!exists ? '<span class="text-[9px] ml-0.5 opacity-70">✨new</span>' : ''}
    </span>`;
  });

  // Render #tags as interactive visual pills
  html = html.replace(/(^|\s)#([a-zA-Z0-9_\-\u4e00-\u9fa5]+)/g, '$1<span class="tag-pill cursor-pointer inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-200/70 dark:bg-gray-800 dark:text-gray-300 text-gray-700 hover:bg-accent hover:text-white transition-colors" data-tag="$2">#$2</span>');

  // Render Checkboxes - [ ] and - [x]
  html = html.replace(/^(\s*)-\s+\[\s\]\s+(.*)$/gm, '$1<div class="flex items-center gap-2 my-1 text-sm"><input type="checkbox" disabled class="rounded border-gray-300 text-accent focus:ring-accent" /> <span>$2</span></div>');
  html = html.replace(/^(\s*)-\s+\[[xX]\]\s+(.*)$/gm, '$1<div class="flex items-center gap-2 my-1 text-sm"><input type="checkbox" checked disabled class="rounded border-gray-300 text-accent focus:ring-accent" /> <span class="line-through text-gray-400 dark:text-gray-500">$2</span></div>');

  // Headers # ## ###
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-base font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 mt-5 mb-2 pb-1 border-b border-gray-200 dark:border-gray-800">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 class="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-6 mb-3">$1</h1>');

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Blockquotes
  html = html.replace(/^&gt;\s?(.*$)/gm, '<blockquote class="border-l-2 border-accent/60 pl-3 my-2 text-gray-600 dark:text-gray-400 italic text-sm">$1</blockquote>');

  // Paragraph breaks
  html = html.split(/\n\n+/).map(p => {
    if (p.trim().startsWith('<h') || p.trim().startsWith('<div') || p.trim().startsWith('<blockquote') || p.trim().startsWith('<pre')) {
      return p;
    }
    return `<p class="my-2 leading-relaxed text-sm sm:text-base text-gray-800 dark:text-gray-200">${p.replace(/\n/g, '<br/>')}</p>`;
  }).join('');

  return html;
}
