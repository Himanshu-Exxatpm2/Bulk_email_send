import { useRef, useState } from 'react';
import { UploadCloud, X, Paperclip } from 'lucide-react';

export const UPLOAD_EXTS = ['.pdf', '.doc', '.jpg', '.jpeg', '.png', '.heic', '.docx', '.xlsx', '.pptx', '.pptm', '.potx', '.potm', '.ppt', '.rtf', '.xls', '.docm', '.bmp', '.csv', '.gif', '.tiff', '.mp4'];
export const UPLOAD_LIMIT_BYTES = 20 * 1024 * 1024;

export const formatBytes = (b: number) => (b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`);
export const remainingMb = (used: number) => (Math.max(0, UPLOAD_LIMIT_BYTES - used) / (1024 * 1024)).toFixed(2);

export interface UploadedFile { name: string; size: number }

/** Drop zone with the supported-formats note, a running "MB remaining" bar and the list of files added. */
export function EmailUploader({
  files,
  onChange,
  remainingLabel,
  extra,
}: {
  files: UploadedFile[];
  onChange: (next: UploadedFile[]) => void;
  remainingLabel: string;
  /** Optional element rendered next to the file list (e.g. a "Generate document" button). */
  extra?: React.ReactNode;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const used = files.reduce((a, f) => a + f.size, 0);

  function add(list: FileList | null) {
    if (!list) return;
    let total = used;
    const next = [...files];
    setError('');
    for (const f of Array.from(list)) {
      const ext = f.name.slice(f.name.lastIndexOf('.')).toLowerCase();
      if (!UPLOAD_EXTS.includes(ext)) { setError(`"${f.name}" was rejected: ${ext || 'that'} files are not supported.`); break; }
      if (total + f.size > UPLOAD_LIMIT_BYTES) { setError(`"${f.name}" was rejected: attachments can total 20 MB at most.`); break; }
      total += f.size;
      next.push({ name: f.name, size: f.size });
    }
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="rounded-md bg-blue-50 px-3 py-2.5 text-sm text-blue-600">{`You have ${remainingMb(used)} MB ${remainingLabel}`}</div>
      <p className="text-sm font-semibold text-neutral-900">Upload files</p>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files); }}
        className="flex w-full flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-neutral-400 bg-neutral-50 px-4 py-6 text-sm text-neutral-800 hover:border-blue-500 hover:bg-blue-50/40"
      >
        <UploadCloud className="size-6 text-neutral-700" strokeWidth={1.5} aria-hidden />
        Browse to upload
      </button>
      <input ref={input} type="file" multiple className="hidden" accept={UPLOAD_EXTS.join(',')} onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
      {error && <p className="text-xs text-negative-default">{error}</p>}
      {(files.length > 0 || extra) && (
        <ul className="flex flex-wrap items-center gap-2">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-neutral-50 py-1 pl-3 pr-1.5 text-xs text-neutral-900">
              <Paperclip className="size-3" aria-hidden />
              {f.name} <span className="text-neutral-700">({formatBytes(f.size)})</span>
              <button type="button" aria-label={`Remove ${f.name}`} className="flex size-4 items-center justify-center rounded-full hover:bg-neutral-200" onClick={() => onChange(files.filter((_, j) => j !== i))}>
                <X className="size-3" strokeWidth={2.5} />
              </button>
            </li>
          ))}
          {extra}
        </ul>
      )}
      <div className="space-y-1 text-xs leading-relaxed text-neutral-700">
        <p><span className="font-semibold text-neutral-900">Supported formats:</span> {UPLOAD_EXTS.join(', ')}</p>
        <p>You can only upload files with file size under 20 MB.</p>
        <p>We recommend switching to PDF format if you encounter issues viewing the uploaded file in other formats.</p>
      </div>
    </div>
  );
}
