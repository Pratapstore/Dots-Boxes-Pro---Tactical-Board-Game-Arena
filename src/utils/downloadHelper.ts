/**
 * Robust file download helper that handles browser iframe restrictions,
 * sandboxed environments, Blob downloads, and fallback copy-to-clipboard.
 */
export async function downloadFileWithFallback(url: string, filename: string): Promise<{ success: boolean; method: string }> {
  try {
    // 1. Try Fetch -> Blob -> Object URL (Most reliable in modern browsers)
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 2000);

    return { success: true, method: 'blob' };
  } catch (err) {
    console.warn('Blob download attempt failed, trying direct link navigation:', err);
    try {
      // 2. Direct anchor click fallback
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 1000);
      return { success: true, method: 'anchor' };
    } catch (e2) {
      console.warn('Anchor fallback failed:', e2);
      return { success: false, method: 'failed' };
    }
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback for older browsers
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch {
    return false;
  }
}
