export const metadata = {
  title: 'Authentication - COSMARA',
  description: 'Sign in to your COSMARA account',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-layout">
      {children}
    </div>
  )
}
