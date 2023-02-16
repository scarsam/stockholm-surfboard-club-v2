import {Suspense, useCallback, useEffect, useMemo, useState} from 'react';
import {Newsletter} from './Newsletter';
import {Location} from './Location';

export const modals = {
  location: Location,
  newsletter: Newsletter,
};

export const useModal = () => {
  const [modal, setModal] = useState<keyof typeof modals>();

  useEffect(() => {
    document.body.style.overflow = modal ? 'hidden' : 'unset';
  }, [modal]);

  const RenderModal = useMemo(() => (modal ? modals[modal] : null), [modal]);

  return {
    setModal,
    Modal: useCallback(
      () => (
        <>
          {modal ? (
            <div className="h-full w-full bg-[#E6E6E6]/90 fixed left-0 top-0 bottom-0 z-50">
              <div className="flex items-center justify-center min-h-screen">
                <div className="w-full bg-white p-2 border border-black relative max-w-[370px] min-h-min">
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
                  {/* <Suspense fallback={<div className="p-2">Loading…</div>}> */}
                  {RenderModal ? (
                    <RenderModal handleClose={() => setModal(undefined)} />
                  ) : null}
                  {/* </Suspense> */}
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
