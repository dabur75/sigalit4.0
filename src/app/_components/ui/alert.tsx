'use client';

import { cva } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '~/lib/utils';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        success:
          'border-green-500/50 text-green-700 dark:border-green-500 [&>svg]:text-green-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// @ts-ignore
const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    // @ts-ignore
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };

interface InlineAlertProps {
    message: string;
    variant?: 'destructive' | 'success';
    onClose?: () => void;
}

export function InlineAlert({ message, variant = 'destructive', onClose }: InlineAlertProps) {
    if (!message) return null;

    const Icon = variant === 'success' ? CheckCircle : AlertCircle;

    return (
        <Alert variant={variant} className="flex items-center justify-between">
            <div className="flex items-center">
                <Icon className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
            </div>
            {onClose && (
                <button onClick={onClose} className="p-1 rounded-md hover:bg-black/10">
                    <XCircle className="h-4 w-4" />
                </button>
            )}
        </Alert>
    );
}