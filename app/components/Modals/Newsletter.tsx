import {useFetcher} from '@remix-run/react';
import {useEffect, useState} from 'react';
import {Button} from '~/components';
import {usePrefixPathWithLocale} from '~/lib/utils';

export const Newsletter = ({handleClose}: {handleClose: () => void}) => {
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data?.ok) {
      handleClose();
    }
  }, [fetcher.data, handleClose]);

  return (
    <>
      <h2 className="font-semibold mb-2 text-center text-black">
        Subscribe to our newsletter
      </h2>
      <p className="text-xs mb-2 text-center text-black">
        Sign up for news and exclusive offers.
      </p>
      <fetcher.Form
        action={usePrefixPathWithLocale('/newsletter')}
        method="POST"
      >
        <label className="block mb-2">
          <p className="text-xs text-[#4D4D4D]">Email*</p>
          <input
            required
            placeholder="surf@board.com"
            type="email"
            name="email"
            className="w-full border border-black p-2"
          />
        </label>
        <Button as="button" type="submit" width="full">
          SUBSCRIBE
        </Button>
      </fetcher.Form>
    </>
  );
};
