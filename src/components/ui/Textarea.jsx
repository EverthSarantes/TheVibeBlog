export default function Textarea({ label, className = "", ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-sans font-medium text-ink-700 dark:text-ink-300 mb-1.5">{label}</label>}
      <textarea
        aria-label={props["aria-label"] || label || props.placeholder}
        className={`w-full px-4 py-2.5 rounded-md border border-ink-300 dark:border-ink-600 bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}