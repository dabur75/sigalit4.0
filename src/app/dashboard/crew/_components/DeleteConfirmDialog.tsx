'use client';

import { useState } from 'react';
import { api } from '~/trpc/react';
import { 
  Dialog, 
  DialogHeader, 
  DialogTitle, 
  DialogContent, 
  DialogFooter 
} from '~/app/_components/ui/dialog';
import { Button } from '~/app/_components/ui/button';

interface DeleteConfirmDialogProps {
  user: any;
  onClose: () => void;
}

export function DeleteConfirmDialog({ user, onClose }: DeleteConfirmDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const updateUserMutation = api.sigalit.updateUser.useMutation();
  const deleteUserMutation = api.sigalit.deleteUser.useMutation();
  const utils = api.useUtils();

  const isGuide = user.role === 'GUIDE';
  const actionText = isGuide ? 'מחיקה' : 'השבתה';
  const actionVerb = isGuide ? 'למחוק' : 'להשבית';
  const confirmText = isGuide ? 'מחק לצמיתות' : 'השבת משתמש';

  const handleAction = async () => {
    setIsProcessing(true);

    try {
      if (isGuide) {
        // Permanently delete guides
        await deleteUserMutation.mutateAsync({
          id: user.id,
        });
      } else {
        // Deactivate coordinators and admins
        await updateUserMutation.mutateAsync({
          id: user.id,
          isActive: false,
        });
      }

      await utils.sigalit.getAllUsers.invalidate();
      onClose();
    } catch (error) {
      console.error('Error processing user action:', error);
    } finally {
      setIsProcessing(false);
    }
  };

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

  return (
    <Dialog open onClose={onClose}>
      <DialogHeader>
        <DialogTitle className="text-red-600 dark:text-red-400">
          {actionText} של איש צוות
        </DialogTitle>
      </DialogHeader>

      <DialogContent>
        <div className="space-y-4 text-right">
          <p className="text-gray-600 dark:text-gray-400">
            האם אתה בטוח שברצונך {actionVerb} את איש הצוות הבא?
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-r-4 border-r-red-500">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900 dark:text-gray-100">{user.name}</span>
                <span className="text-gray-500">:שם</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">{user.username}</span>
                <span className="text-gray-500">:שם משתמש</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">{user.email}</span>
                <span className="text-gray-500">:אימייל</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">{getRoleLabel(user.role)}</span>
                <span className="text-gray-500">:תפקיד</span>
              </div>
              {user.house && (
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">{user.house.name}</span>
                  <span className="text-gray-500">:בית</span>
                </div>
              )}
            </div>
          </div>

          {isGuide ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
              <div className="flex items-start space-x-3 space-x-reverse">
                <span className="text-red-500 text-xl">⚠️</span>
                <div>
                  <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                    <strong>זהירות:</strong> מחיקת מדריך היא פעולה בלתי הפיכה!
                  </p>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                    כל הנתונים של המדריך יימחקו לצמיתות מהמערכת. פעולה זו לא ניתנת לביטול.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
              <div className="flex items-start space-x-3 space-x-reverse">
                <span className="text-amber-500 text-xl">ℹ️</span>
                <div>
                  <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                    <strong>שים לב:</strong> השבתת המשתמש תמנע ממנו להתחבר למערכת.
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                    הנתונים שלו יישמרו במערכת וניתן יהיה להפעיל מחדש את החשבון בעתיד.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isProcessing}
          className="ml-3"
        >
          ביטול
        </Button>
        <Button
          onClick={handleAction}
          disabled={isProcessing}
          className={`${isGuide 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-amber-600 hover:bg-amber-700 text-white'
          } font-medium`}
        >
          {isProcessing ? 'מעבד...' : confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}