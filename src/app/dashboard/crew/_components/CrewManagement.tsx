'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '~/app/_components/ui/card';
import { Button } from '~/app/_components/ui/button';
import { Select } from '~/app/_components/ui/select';
import { api } from '~/trpc/react';
import { StaffTable } from './StaffTable';
import { StaffForm } from './StaffForm';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

export function CrewManagement() {
  const { data: session, status } = useSession();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [selectedHouseFilter, setSelectedHouseFilter] = useState<string | null>(null);

  if (status === 'loading') {
    return <div className="flex items-center justify-center p-8">טוען...</div>;
  }

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const userRole = session.user.role;
  const userHouseId = session.user.houseId;

  // Check permissions - only ADMIN and COORDINATOR can access crew management
  if (userRole !== 'ADMIN' && userRole !== 'COORDINATOR') {
    redirect('/dashboard');
  }

  // Get houses for filtering
  const { data: houses } = api.sigalit.getAllHouses.useQuery();
  const { data: allUsers } = api.sigalit.getAllUsers.useQuery();

  // Calculate stats
  const stats = useMemo(() => {
    if (!allUsers) return { guides: 0, coordinators: 0, admins: 0 };
    
    const activeUsers = allUsers.filter(user => user.isActive);
    const guides = activeUsers.filter(user => user.role === 'GUIDE').length;
    const coordinators = activeUsers.filter(user => user.role === 'COORDINATOR').length;
    const admins = activeUsers.filter(user => user.role === 'ADMIN').length;
    
    return { guides, coordinators, admins };
  }, [allUsers]);

  const handleCreateUser = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
  };

  const handleDeleteUser = (user: any) => {
    setDeletingUser(user);
  };

  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setEditingUser(null);
    setDeletingUser(null);
  };

  return (
    <div className="min-h-screen" style={{background: '#fafafa'}}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl text-white font-bold">👥</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  ניהול מדריכים
                </h1>
                <p className="text-gray-500 text-sm">ניהול צוות ומדריכים</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  שלום, {session.user.name ?? session.user.email}
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {userRole === 'ADMIN' ? 'מנהל מערכת' : 'רכז'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header with Add Button */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">ניהול מדריכים</h2>
              <p className="text-gray-600">ניהול חברי הצוות, תפקידים והרשאות</p>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button 
                onClick={() => console.log('לחץ על "מה זה איזה מדריך"')} 
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                ? מה זה "איזה מדריך"
              </Button>
              <Button 
                onClick={handleCreateUser}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg"
              >
                הוסף מדריך חדש
              </Button>
            </div>
          </div>

          {/* Staff Management Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Filters */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-4 space-x-reverse justify-end">
                <label className="text-sm font-medium text-gray-700">
                  סינון לפי בית:
                </label>
                <Select
                  value={selectedHouseFilter || ''}
                  onChange={(e) => setSelectedHouseFilter(e.target.value || null)}
                  options={[
                    { value: '', label: 'כל הבתים' },
                    { value: 'no-house', label: 'ללא שיוך לבית' },
                    ...(houses?.map(house => ({
                      value: house.id,
                      label: house.name
                    })) || [])
                  ]}
                  className="min-w-[150px]"
                />
              </div>
            </div>
            
            <StaffTable
              userRole={userRole}
              userHouseId={userHouseId || null}
              houseFilter={selectedHouseFilter}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      {isCreateModalOpen && (
        <StaffForm
          mode="create"
          userRole={userRole}
          userHouseId={userHouseId || null}
          onClose={handleCloseModals}
        />
      )}

      {editingUser && (
        <StaffForm
          mode="edit"
          user={editingUser}
          userRole={userRole}
          userHouseId={userHouseId || null}
          onClose={handleCloseModals}
        />
      )}

      {deletingUser && (
        <DeleteConfirmDialog
          user={deletingUser}
          onClose={handleCloseModals}
        />
      )}
    </div>
  );
}