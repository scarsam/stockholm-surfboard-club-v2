import {forwardRef} from 'react';
import {Link} from '@remix-run/react';
import clsx from 'clsx';
import type {ElementType} from 'react';

import {missingClass} from '~/lib/utils';

export const Button = forwardRef(
  (
    {
      as = 'button',
      className = '',
      variant = 'primary',
      width = 'auto',
      ...props
    }: {
      as?: ElementType;
      className?: string;
      variant?: 'primary' | 'secondary' | 'inline' | 'outline';
      width?: 'auto' | 'full';
      [key: string]: any;
    },
    ref,
  ) => {
    const Component = props?.to ? Link : as;

    const baseButtonClasses =
      'inline-block font-medium text-center py-3 px-6 border ease-in-out duration-200';

    const variants = {
      primary: `${baseButtonClasses} bg-black text-white`,
      secondary: `${baseButtonClasses} border border-primary/10 bg-contrast text-primary`,
      inline: 'border-b border-primary/10 leading-none pb-1',
      outline: `${baseButtonClasses} bg-white text-gray-400`,
    };

    const widths = {
      auto: 'w-auto',
      full: 'w-full',
    };

    const styles = clsx(
      missingClass(className, 'bg-') && variants[variant],
      missingClass(className, 'w-') && widths[width],
      className,
    );

    return (
      <Component
        // @todo: not supported until react-router makes it into Remix.
        // preventScrollReset={true}
        className={styles}
        {...props}
        ref={ref}
      />
    );
  },
);
