import { LoginForm } from '@/features/auth';
import { Building2 } from 'lucide-react';

export function LoginRoute() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center gap-3">
              <Building2 className="h-10 w-10" />
              <h1 className="text-3xl font-bold">VH Labs</h1>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              AI-Powered Investor
              <br />
              Engagement Platform
            </h2>
            <p className="text-lg text-primary-100 max-w-md">
              Manage content processing, track distributions, and optimize investor relationships
              across multiple channels.
            </p>
          </div>
          <div className="text-sm text-primary-200">
            © 2024 VH Labs. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center">
            <div className="flex items-center gap-2 text-primary-600">
              <Building2 className="h-8 w-8" />
              <span className="text-2xl font-bold">VH Labs</span>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access your admin dashboard
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
