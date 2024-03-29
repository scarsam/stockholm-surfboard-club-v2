import type {ReactNode} from 'react';
import {Button, IconClose, Link} from '~/components';

export function Modal({
  children,
  cancelLink,
}: {
  children: ReactNode;
  cancelLink?: string;
}) {
  return (
    <div
      className="relative z-50"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      id="modal-bg"
    >
      <div className="fixed inset-0 transition-opacity bg-opacity-75 bg-primary/40"></div>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-full p-4 text-center sm:p-0">
          <div
            className="relative flex-1 px-4 pt-5 pb-4 overflow-hidden text-left transition-all transform rounded shadow-xl bg-contrast sm:my-12 sm:flex-none sm:w-full sm:max-w-sm sm:p-6"
            role="button"
            onClick={(e) => {
              e.stopPropagation();
            }}
            onKeyPress={(e) => {
              e.stopPropagation();
            }}
            tabIndex={0}
          >
            <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
              {cancelLink && (
                <Link
                  to={cancelLink}
                  className="p-4 -m-4 transition text-primary hover:text-primary/50"
                >
                  <IconClose aria-label="Close panel" />
                </Link>
              )}
              <Button className="p-4 -m-4 transition text-primary hover:text-primary/50">
                <IconClose aria-label="Close panel" />
              </Button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
