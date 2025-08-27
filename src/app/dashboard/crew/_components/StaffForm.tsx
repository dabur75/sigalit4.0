'use client';

import { useState, type FormEvent } from 'react';
import { api } from '~/trpc/react';
import { 
  Dialog, 
  DialogHeader, 
  DialogTitle, 
  DialogContent, 
  DialogFooter 
} from '~/app/_components/ui/dialog';
import { Button } from '~/app/_components/ui/button';
import { Input } from '~/app/_components/ui/input';
import { Label } from '~/app/_components/ui/label';
import { Select } from '~/app/_components/ui/select';
import { validatePasswordStrength, validateUsername } from '~/lib/auth-utils';

interface StaffFormProps {
  mode: 'create' | 'edit';
  user?: any;
  userRole: string;
  userHouseId: string | null;
  onClose: () => void;
}

export function StaffForm({ mode, user, userRole, userHouseId, onClose }: StaffFormProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    role: user?.role || 'GUIDE',
    houseId: user?.houseId || '',
    password: '',
    phone: user?.phone || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: houses } = api.sigalit.getAllHouses.useQuery();
  const createUserMutation = api.sigalit.createUser.useMutation();
  const updateUserMutation = api.sigalit.updateUser.useMutation();
  const utils = api.useUtils();

  const roleOptions = [
    { value: 'GUIDE', label: 'מדריך' },
    { value: 'COORDINATOR', label: 'רכז' },
  ];

  // Only ADMIN can create other ADMIN users
  if (userRole === 'ADMIN') {
    roleOptions.push({ value: 'ADMIN', label: 'מנהל מערכת' });
  }

  const houseOptions = [
    { value: '', label: 'ללא שיוך לבית' },
    ...(houses?.map(house => ({
      value: house.id,
      label: house.name
    })) || [])
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'שם חובה';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'שם משתמש חובה';
    } else {
      const usernameValidation = validateUsername(formData.username);
      if (!usernameValidation.isValid) {
        newErrors.username = usernameValidation.errors[0] || 'שגיאה בבדיקת שם המשתמש';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'אימייל חובה';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'פורמט אימייל לא תקין';
    }

    if (mode === 'create' && !formData.password) {
      newErrors.password = 'סיסמה חובה';
    } else if (formData.password) {
      const passwordValidation = validatePasswordStrength(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0] || 'שגיאה בבדיקת הסיסמה';
      }
    }

    if (formData.role === 'GUIDE' && !formData.houseId) {
      newErrors.houseId = 'מדריך חייב להיות שייך לבית';
    }

    // COORDINATOR users can only create/edit users in their own house (unless they're creating non-house users)
    if (userRole === 'COORDINATOR' && formData.houseId && formData.houseId !== userHouseId) {
      newErrors.houseId = 'רכז יכול לנהל רק משתמשים בבית שלו';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        role: formData.role as 'GUIDE' | 'COORDINATOR' | 'ADMIN',
        phone: formData.phone.trim() || undefined,
        houseId: formData.houseId || undefined,
        ...(formData.password && { password: formData.password }),
      };

      if (mode === 'create') {
        await createUserMutation.mutateAsync({
          ...submitData,
          password: formData.password, // Required for create
        });
      } else {
        await updateUserMutation.mutateAsync({
          id: user.id,
          ...submitData,
        });
      }

      await utils.sigalit.getAllUsers.invalidate();
      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || 'אירעה שגיאה בשמירת הנתונים';
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear related errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <Dialog open onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'הוספת איש צוות חדש' : 'עריכת איש צוות'}
          </DialogTitle>
        </DialogHeader>

        <DialogContent className="space-y-4">
          {errors.general && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400 text-right">{errors.general}</p>
            </div>
          )}

          <div>
            <Label htmlFor="name">שם מלא *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="text-right"
              placeholder="הכנס שם מלא"
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1 text-right">{errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="username">שם משתמש *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              className="text-right"
              placeholder="הכנס שם משתמש"
              disabled={mode === 'edit'} // Don't allow username changes
            />
            {errors.username && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1 text-right">{errors.username}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">אימייל *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="text-right"
              placeholder="הכנס כתובת אימייל"
            />
            {errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1 text-right">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">טלפון</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="text-right"
              placeholder="הכנס מספר טלפון"
            />
          </div>

          <div>
            <Label htmlFor="role">תפקיד *</Label>
            <Select
              id="role"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              options={roleOptions}
              placeholder="בחר תפקיד"
            />
          </div>

          {formData.role === 'GUIDE' && (
            <div>
              <Label htmlFor="houseId">בית *</Label>
              <Select
                id="houseId"
                value={formData.houseId}
                onChange={(e) => handleChange('houseId', e.target.value)}
                options={houseOptions}
                placeholder="בחר בית"
              />
              {errors.houseId && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1 text-right">{errors.houseId}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="password">
              {mode === 'create' ? 'סיסמה *' : 'סיסמה חדשה (השאר ריק לא לשנות)'}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="text-right"
              placeholder={mode === 'create' ? 'הכנס סיסמה' : 'הכנס סיסמה חדשה'}
            />
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1 text-right">{errors.password}</p>
            )}
          </div>
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            ביטול
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'שומר...' : (mode === 'create' ? 'צור משתמש' : 'שמור שינויים')}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}