import * as React from 'react';
import { cn } from '~/lib/utils/cn';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 1, children, ...props }, ref) => {
    const Component = `h${level}` as keyof JSX.IntrinsicElements;
    const baseStyles = 'font-heading font-semibold';
    const levelStyles = {
      1: 'text-4xl',
      2: 'text-3xl',
      3: 'text-2xl',
      4: 'text-xl',
      5: 'text-lg',
      6: 'text-base',
    };

    return (
      <Component
        ref={ref}
        className={cn(baseStyles, levelStyles[level], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Heading.displayName = 'Heading';

export { Heading };

