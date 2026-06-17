interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, id, className = '', ...props }: InputProps) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm text-text-secondary mb-1.5 font-medium">
          {label}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={`w-full px-3.5 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-text-primary text-sm placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-green/30 focus:border-accent-green/50 transition-all ${
          error ? 'border-accent-red' : ''
        } ${className}`}
      />
      {error && <p className="mt-1.5 text-xs text-accent-red">{error}</p>}
    </div>
  )
}
