import { Bell, User } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 border-b border-gray-200 bg-white">
      <div className="flex h-full items-center justify-between px-6">
        <div>
          {/* Breadcrumb or page title can go here */}
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100">
            <Bell className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {/* User menu */}
          <button className="flex items-center gap-2 rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
