export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full animate-spin"></div>
        <div className="absolute inset-1 bg-background rounded-full"></div>
      </div>
    </div>
  )
}
