import {useCallback, useEffect, useMemo, useState} from 'react';
import {Newsletter} from './Newsletter';
import {Location} from './Location';
import {SizeGuide} from './SizeGuide';
import {ProductImages} from './ProductImages';
import clsx from 'clsx';

export const modals = {
  location: Location,
  newsletter: Newsletter,
  sizeGuide: SizeGuide,
  productImages: ProductImages,
};

export const useModal = (fullscreen?: boolean) => {
  const [modal, setModal] = useState<{name: keyof typeof modals; data?: any}>();

  useEffect(() => {
    document.body.style.overflow = modal ? 'hidden' : 'unset';
  }, [modal]);

  const RenderModal = useMemo(
    () => (modal?.name ? modals[modal.name] : null),
    [modal],
  );

  const className = fullscreen
    ? ''
    : clsx('p-2 border border-black relative max-w-[390px] m-2');

  return {
    setModal,
    Modal: useCallback(
      () => (
        <>
          {modal ? (
            <div
              className={clsx(
                'h-full w-full bg-[#E6E6E6]/90 fixed left-0 top-0 bottom-0 z-50',
                fullscreen && 'overflow-scroll',
              )}
            >
              <div className="flex items-center justify-center min-h-screen">
                <div className={clsx('w-full bg-white min-h-min', className)}>
                  <button
                    onClick={() => setModal(undefined)}
                    className="absolute right-0 -top-6 font-mono"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 13 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="12.979"
                        y="12.2927"
                        width="1"
                        height="16"
                        transform="rotate(135 12.979 12.2927)"
                        fill="black"
                      />
                      <rect
                        width="1"
                        height="16"
                        transform="matrix(0.707107 0.707107 0.707107 -0.707107 0.979004 12.2927)"
                        fill="black"
                      />
                    </svg>
                  </button>
                  {RenderModal ? (
                    <RenderModal
                      handleClose={() => setModal(undefined)}
                      data={modal.data}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </>
      ),
      [RenderModal, modal],
    ),
  };
};
