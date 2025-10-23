import Link from "next/link"
import { SignOutButton } from "./SignOutButton"

type HeaderProps = {
  isAdmin?: boolean
}

export function Header({ isAdmin = false }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-4">
          <div className="flex items-center">
            <Link href={isAdmin ? "/admin/queue" : "/dashboard"}>
              <span className="text-xl font-bold text-gray-900">
                Moonbrush Portal
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {/* Navigation Links */}
            {!isAdmin ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <Link
                  href="/requests/new"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  + New Request
                </Link>
              </>
            ) : (
              <Link
                href="/admin/queue"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Request Queue
              </Link>
            )}

            {/* Sign Out Button */}
            <SignOutButton />
          </div>
        </div>
      </nav>
    </header>
  )
}
