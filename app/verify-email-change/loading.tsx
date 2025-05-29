export default function VerifyEmailChangeLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Email Verification</h1>
          <p className="mt-2 text-sm text-zinc-400">Verifying your email address...</p>
        </div>

        <div className="flex justify-center py-8">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  )
}
