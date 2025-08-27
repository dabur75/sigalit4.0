"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/app/_components/ui/card";
import Link from "next/link";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "בעיה בהגדרת המערכת";
      case "AccessDenied":
        return "גישה נדחתה";
      case "Verification":
        return "בעיה באימות";
      case "Default":
      default:
        return "שגיאה בהתחברות";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl text-white font-bold">!</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            שגיאה בהתחברות
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            אנא נסה שוב או פנה לתמיכה הטכנית
          </p>
          
          <div className="space-y-2">
            <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
              <Link href="/auth/signin">
                נסה שוב
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                חזור לדף הבית
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">טוען...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
