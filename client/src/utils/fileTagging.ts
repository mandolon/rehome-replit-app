// Smart file organization and auto-tagging system

export interface FileAnalysis {
  category: string;
  tags: string[];
  fileType: string;
}

// File type mappings
const FILE_TYPE_MAP: Record<string, string> = {
  // Documents
  'pdf': 'document',
  'doc': 'document',
  'docx': 'document',
  'txt': 'document',
  'rtf': 'document',
  'odt': 'document',
  
  // Spreadsheets
  'xls': 'spreadsheet',
  'xlsx': 'spreadsheet',
  'csv': 'spreadsheet',
  'ods': 'spreadsheet',
  
  // Presentations
  'ppt': 'presentation',
  'pptx': 'presentation',
  'odp': 'presentation',
  
  // Images
  'jpg': 'image',
  'jpeg': 'image',
  'png': 'image',
  'gif': 'image',
  'bmp': 'image',
  'svg': 'image',
  'webp': 'image',
  
  // Audio
  'mp3': 'audio',
  'wav': 'audio',
  'flac': 'audio',
  'aac': 'audio',
  'm4a': 'audio',
  
  // Video
  'mp4': 'video',
  'avi': 'video',
  'mov': 'video',
  'wmv': 'video',
  'mkv': 'video',
  'webm': 'video',
  
  // Archives
  'zip': 'archive',
  'rar': 'archive',
  '7z': 'archive',
  'tar': 'archive',
  'gz': 'archive',
  
  // Code
  'js': 'code',
  'ts': 'code',
  'jsx': 'code',
  'tsx': 'code',
  'html': 'code',
  'css': 'code',
  'py': 'code',
  'java': 'code',
  'cpp': 'code',
  'c': 'code',
  'php': 'code',
  'rb': 'code',
  'go': 'code',
  'rs': 'code',
  'swift': 'code',
  'kt': 'code',
  
  // Design
  'psd': 'design',
  'ai': 'design',
  'sketch': 'design',
  'fig': 'design',
  'xd': 'design',
};

// Category-based tag suggestions
const CATEGORY_TAGS: Record<string, string[]> = {
  document: ['documentation', 'report', 'manual', 'guide', 'contract', 'proposal'],
  spreadsheet: ['data', 'analysis', 'budget', 'tracking', 'calculations', 'metrics'],
  presentation: ['slides', 'pitch', 'training', 'meeting', 'demo', 'overview'],
  image: ['screenshot', 'mockup', 'photo', 'diagram', 'chart', 'visual'],
  audio: ['recording', 'interview', 'music', 'podcast', 'meeting', 'notes'],
  video: ['demo', 'tutorial', 'presentation', 'recording', 'training', 'meeting'],
  archive: ['backup', 'compressed', 'package', 'bundle', 'export', 'batch'],
  code: ['source', 'script', 'development', 'programming', 'technical', 'implementation'],
  design: ['mockup', 'wireframe', 'prototype', 'ui', 'ux', 'visual', 'branding'],
  other: ['misc', 'general', 'utility', 'tool', 'reference']
};

// Filename-based tagging patterns
const FILENAME_PATTERNS: Array<{ pattern: RegExp; tags: string[] }> = [
  // Meetings and calls
  { pattern: /meeting|call|standup|sync/i, tags: ['meeting', 'discussion'] },
  { pattern: /minutes|notes|agenda/i, tags: ['notes', 'meeting', 'documentation'] },
  
  // Screenshots and images
  { pattern: /screenshot|screen|capture/i, tags: ['screenshot', 'visual'] },
  { pattern: /mockup|wireframe|prototype/i, tags: ['design', 'mockup', 'ui'] },
  { pattern: /logo|brand|icon/i, tags: ['branding', 'design', 'visual'] },
  
  // Reports and analysis
  { pattern: /report|analysis|summary/i, tags: ['report', 'analysis', 'documentation'] },
  { pattern: /budget|financial|cost/i, tags: ['financial', 'budget', 'planning'] },
  { pattern: /metric|kpi|dashboard/i, tags: ['metrics', 'tracking', 'data'] },
  
  // Development
  { pattern: /spec|requirement|story/i, tags: ['specification', 'requirements', 'planning'] },
  { pattern: /test|qa|bug/i, tags: ['testing', 'qa', 'quality'] },
  { pattern: /deploy|release|build/i, tags: ['deployment', 'release', 'production'] },
  
  // Documentation
  { pattern: /readme|guide|manual|help/i, tags: ['documentation', 'guide', 'help'] },
  { pattern: /changelog|version|update/i, tags: ['changelog', 'version', 'updates'] },
  
  // Contracts and legal
  { pattern: /contract|agreement|legal|terms/i, tags: ['legal', 'contract', 'official'] },
  { pattern: /invoice|receipt|billing/i, tags: ['financial', 'billing', 'accounting'] },
  
  // Project phases
  { pattern: /draft|wip|work.in.progress/i, tags: ['draft', 'in-progress', 'working'] },
  { pattern: /final|approved|signed/i, tags: ['final', 'approved', 'completed'] },
  { pattern: /review|feedback|comments/i, tags: ['review', 'feedback', 'collaboration'] },
  
  // Time-based
  { pattern: /daily|weekly|monthly|quarterly/i, tags: ['recurring', 'scheduled', 'periodic'] },
  { pattern: /backup|archive|old/i, tags: ['backup', 'archive', 'historical'] },
];

// Size-based tagging
const getSizeTags = (size: number): string[] => {
  const tags: string[] = [];
  
  if (size < 1024 * 100) { // < 100KB
    tags.push('small');
  } else if (size < 1024 * 1024 * 10) { // < 10MB
    tags.push('medium');
  } else {
    tags.push('large');
  }
  
  if (size > 1024 * 1024 * 50) { // > 50MB
    tags.push('heavy');
  }
  
  return tags;
};

// Date-based tagging
const getDateTags = (): string[] => {
  const now = new Date();
  const tags: string[] = [];
  
  // Add current period tags
  const year = now.getFullYear();
  const month = now.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  
  tags.push(`${year}`, `${month}`, `q${quarter}-${year}`);
  
  // Add recency tags
  tags.push('recent', 'current');
  
  return tags;
};

// Main auto-tagging function
export function analyzeFile(file: File): FileAnalysis {
  const fileName = file.name.toLowerCase();
  const extension = fileName.split('.').pop() || '';
  const fileType = FILE_TYPE_MAP[extension] || 'other';
  
  // Start with basic category and tags
  let category = fileType;
  let tags: string[] = [];
  
  // Add category-based tags
  const categoryTags = CATEGORY_TAGS[category] || CATEGORY_TAGS.other;
  tags.push(...categoryTags.slice(0, 2)); // Add first 2 category tags
  
  // Add filename-based tags
  for (const { pattern, tags: patternTags } of FILENAME_PATTERNS) {
    if (pattern.test(fileName)) {
      tags.push(...patternTags);
      break; // Use first matching pattern
    }
  }
  
  // Add file extension tag
  if (extension) {
    tags.push(extension);
  }
  
  // Add size-based tags
  tags.push(...getSizeTags(file.size));
  
  // Add date-based tags
  tags.push(...getDateTags());
  
  // Smart categorization based on filename patterns
  if (/meeting|call|notes|minutes/i.test(fileName)) {
    category = 'meeting';
  } else if (/spec|requirement|story|task/i.test(fileName)) {
    category = 'specification';
  } else if (/design|mockup|wireframe|ui|ux/i.test(fileName)) {
    category = 'design';
  } else if (/test|qa|bug/i.test(fileName)) {
    category = 'testing';
  } else if (/contract|legal|agreement/i.test(fileName)) {
    category = 'legal';
  } else if (/financial|budget|invoice|cost/i.test(fileName)) {
    category = 'financial';
  }
  
  // Remove duplicates and limit tags
  tags = Array.from(new Set(tags)).slice(0, 8);
  
  return {
    category,
    tags,
    fileType
  };
}

// Get category color for UI display
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    document: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    spreadsheet: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    presentation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    image: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    audio: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    video: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    archive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    code: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    design: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    meeting: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    specification: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    testing: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
    legal: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    financial: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    other: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
  };
  
  return colors[category] || colors.other;
}

// Get tag color for UI display
export function getTagColor(tag: string): string {
  // Hash the tag to get consistent colors
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    'bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    'bg-pink-50 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
    'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
    'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    'bg-orange-50 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  ];
  
  return colors[Math.abs(hash) % colors.length];
}