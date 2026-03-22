import { forwardRef } from 'react'

interface InputProps {
  label: string
  id: string
  type?: string
  placeholder?: string
  value?: string
  error?: string
  required?: boolean
  autoComplete?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, type = 'text', placeholder, value, error, required, autoComplete, onChange, onBlur }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={id}
          className="text-xs font-medium uppercase tracking-wider text-on-surface-variant"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
        <input
          ref={ref}
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          required={required}
          autoComplete={autoComplete}
          onChange={onChange}
          onBlur={onBlur}
          className={`
            bg-surface-container-low border-b-2 px-3 py-3 text-sm text-on-surface
            placeholder:text-outline-variant outline-none transition-colors duration-150
            focus:bg-surface-container-lowest focus:border-primary
            ${error ? 'border-error' : 'border-primary-fixed-dim'}
          `}
        />
        {error && <span className="text-xs text-error">{error}</span>}
      </div>
    )
  },
)
Input.displayName = 'Input'
