'use client';

import { api } from '~/trpc/react';
import { Button } from '~/app/_components/ui/button';

interface StaffTableProps {
  userRole: string;
  userHouseId: string | null;
  houseFilter: string | null;
  onEditUser: (user: any) => void;
  onDeleteUser: (user: any) => void;
}

export function StaffTable({ userRole, userHouseId, houseFilter, onEditUser, onDeleteUser }: StaffTableProps) {
  const { data: allUsers, isLoading, refetch } = api.sigalit.getAllUsers.useQuery();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">טוען רשימת צוות...</div>
      </div>
    );
  }

  if (!allUsers || allUsers.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">לא נמצאו חברי צוות</div>
      </div>
    );
  }

  // Filter users based on role permissions and house filter
  const filteredUsers = allUsers.filter(user => {
    // First, apply role-based permissions
    let hasPermission = false;
    if (userRole === 'ADMIN') {
      hasPermission = true; // Admin sees all users
    } else if (userRole === 'COORDINATOR') {
      // Coordinators see users from their house and users without house assignments
      hasPermission = !user.houseId || user.houseId === userHouseId;
    }
    
    if (!hasPermission) return false;
    
    // Then apply house filter
    if (houseFilter === 'no-house') {
      return !user.houseId;
    } else if (houseFilter && houseFilter !== '') {
      return user.houseId === houseFilter;
    }
    
    return true; // Show all if no house filter is selected
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'מנהל מערכת';
      case 'COORDINATOR':
        return 'רכז';
      case 'GUIDE':
        return 'מדריך';
      default:
        return role;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
          פעיל
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
          לא פעיל
        </span>
      );
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'COORDINATOR':
        return 'bg-blue-100 text-blue-800';
      case 'GUIDE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get user avatar initials
  const getUserInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      const names = name.trim().split(' ');
      if (names.length >= 2) {
        return (names[0]?.[0] ?? '') + (names[1]?.[0] ?? '');
      }
      return names[0]?.[0] ?? '?';
    }
    return email?.[0]?.toUpperCase() ?? '?';
  };

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-6 py-4 text-right text-sm font-medium">
                שם פרטי
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium">
                שם משפחה
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium">
                טלפון
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium">
                אימייל
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium">
                בית
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium">
                תפקיד
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium">
                איזה משרה
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium">
                %
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium">
                פעילות
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredUsers.map((user, index) => {
              // Extract first and last names
              const names = user.name?.trim().split(' ') ?? [];
              const firstName = names[0] ?? '';
              const lastName = names.slice(1).join(' ') ?? '';
              
              return (
                <tr key={user.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                  {/* שם פרטי with Avatar - RIGHTMOST COLUMN */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="text-sm font-medium text-gray-900">
                        {firstName ?? user.name ?? user.email}
                      </div>
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {getUserInitials(user.name, user.email)}
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  {/* שם משפחה */}
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {lastName ?? '-'}
                  </td>
                  
                  {/* טלפון */}
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.username || '-'}
                  </td>
                  
                  {/* אימייל */}
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.email}
                  </td>
                  
                  {/* בית */}
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.house?.name ?? '-'}
                  </td>
                  
                  {/* תפקיד */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  
                  {/* איזה משרה - Dash */}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    -
                  </td>
                  
                  {/* איזה משרה - Percentage */}
                  <td className="px-6 py-4 text-sm text-gray-900">
                    100%
                  </td>
                  
                  {/* פעילות - LEFTMOST COLUMN */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteUser(user)}
                        className="bg-red-100 text-red-700 border-red-300 hover:bg-red-200 text-xs px-3 py-1"
                      >
                        מחק
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditUser(user)}
                        className="bg-green-100 text-green-700 border-green-300 hover:bg-green-200 text-xs px-3 py-1"
                      >
                        עריכה
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-gray-50">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gray-400">👥</span>
            </div>
            <p className="text-gray-500 font-medium">לא נמצאו חברי צוות התואמים לקריטריונים</p>
            <p className="text-gray-400 text-sm mt-1">נסה לשנות את הפילטר או להוסיף חברי צוות חדשים</p>
          </div>
        )}
      </div>
    </div>
  );
}