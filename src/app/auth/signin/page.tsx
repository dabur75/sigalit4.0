"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Input } from "~/app/_components/ui/input";
import { Label } from "~/app/_components/ui/label";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const result = await signIn("credentials", { 
        username, 
        password, 
        callbackUrl: "/dashboard",
        redirect: false
      });
      
      if (result?.error) {
        setError("שם המשתמש או הסיסמה שגויים");
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("שגיאה בהתחברות. נסה שוב.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <span className="text-3xl text-white font-bold">ס</span>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            ברוכים הבאים ל-Sigalit
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            מערכת ניהול שיבוצים מתקדמת
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 px-8 pb-8">
          {error && (
            <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg text-right">
              {error}
            </div>
          )}
          
          <form onSubmit={handleCredentialsSignIn} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-right block text-gray-700 font-medium">
                שם משתמש
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="הכנס את שם המשתמש שלך"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="text-right h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-right block text-gray-700 font-medium">
                סיסמה
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="הכנס את הסיסמה שלך"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-right h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium text-base shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? "מתחבר..." : "התחבר"}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <p className="font-medium mb-2">פרטי התחברות לדוגמה:</p>
            <div className="space-y-1 text-xs">
              <p><strong>מנהל:</strong> admin / admin123</p>
              <p><strong>רכז:</strong> coordinator_dor / coordinator123</p>
              <p><strong>מדריך:</strong> guide1 / guide123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
