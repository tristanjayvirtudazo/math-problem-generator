interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'success' | 'warning' | 'danger' | 'blue' | 'purple' | 'indigo' | 'pink'
  children: React.ReactNode
  isSelected?: boolean
}

export default function Button({ variant, children, className = '', isSelected = true, ...props }: ButtonProps) {
  const variantStyles = {
    success: isSelected
      ? 'bg-green-300 hover:bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.6)] border-2 border-green-400'
      : 'bg-green-100 hover:bg-green-200',
    warning: isSelected
      ? 'bg-yellow-300 hover:bg-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.6)] border-2 border-yellow-400'
      : 'bg-yellow-100 hover:bg-yellow-200',
    danger: isSelected
      ? 'bg-red-300 hover:bg-red-400 shadow-[0_0_15px_rgba(239,68,68,0.6)] border-2 border-red-400'
      : 'bg-red-100 hover:bg-red-200',
    blue: isSelected
      ? 'bg-blue-300 hover:bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] border-2 border-blue-400'
      : 'bg-blue-100 hover:bg-blue-200',
    purple: isSelected
      ? 'bg-purple-300 hover:bg-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.6)] border-2 border-purple-400'
      : 'bg-purple-100 hover:bg-purple-200',
    indigo: isSelected
      ? 'bg-indigo-300 hover:bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.6)] border-2 border-indigo-400'
      : 'bg-indigo-100 hover:bg-indigo-200',
    pink: isSelected
      ? 'bg-pink-300 hover:bg-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.6)] border-2 border-pink-400'
      : 'bg-pink-100 hover:bg-pink-200',
  }

  return (
    <button
      className={`${variantStyles[variant]} min-w-32 py-2 rounded-lg transition-all ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}