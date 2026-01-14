import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Send,
  Users,
  MessageSquare,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Content', to: '/content', icon: FileText },
  { name: 'Distributions', to: '/distributions', icon: Send },
  { name: 'Contacts', to: '/contacts', icon: Users },
  { name: 'Prompts', to: '/prompts', icon: MessageSquare },
  { name: 'Analytics', to: '/analytics', icon: BarChart3 },
];

export function Sidebar() {
  return (
    <div className="flex w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">VH Labs</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 p-4">
        <button
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
          onClick={() => {
            /* Handle logout */
          }}
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400" />
          Logout
        </button>
      </div>
    </div>
  );
}
