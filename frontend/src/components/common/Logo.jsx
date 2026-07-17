const SIZES = {
  sm: 'h-7 w-7',
  md: 'h-10 w-10',
  lg: 'h-16 w-16'
};

export default function Logo({ size = 'md', className = '' }) {
  return (
    <img
      src="/logo.png"
      alt="SomaPort"
      className={`${SIZES[size]} object-contain ${className}`}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}
