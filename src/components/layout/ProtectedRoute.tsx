import { useAuth, SignIn } from '@clerk/clerk-react'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">SplitPay</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to manage your splits</p>
          </div>
          <SignIn routing="hash" />
        </div>
      </div>
    )
  }

  return <>{children}</>
}