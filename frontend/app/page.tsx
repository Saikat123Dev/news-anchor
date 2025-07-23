'use client';

import { useSession, signIn } from 'next-auth/react';
import UserProfile from '@/components/auth/UserProfile';
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                News Anchor
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <UserProfile />
              ) : (
                <Button 
                  onClick={() => signIn('google')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Sign in with Google
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {session ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome back, {session.user?.name}!
            </h2>
            <p className="text-gray-600 mb-6">
              You're successfully signed in to News Anchor. Your personalized news feed will appear here.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                🎉 Authentication System Ready!
              </h3>
              <ul className="text-blue-800 space-y-1">
                <li>✅ Google OAuth integration complete</li>
                <li>✅ User session management active</li>
                <li>✅ Protected routes configured</li>
                <li>✅ Backend JWT authentication ready</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to News Anchor
            </h2>
            <p className="text-gray-600 mb-6">
              Your personalized news aggregation platform. Sign in with Google to get started.
            </p>
            <Button 
              onClick={() => signIn('google')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Get Started with Google
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
