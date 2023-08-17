import clsx from 'clsx';
import type {MediaImage} from '@shopify/hydrogen/storefront-api-types';
import {Image} from '@shopify/hydrogen';

export const ProductImages = ({
  data,
  handleClose,
}: {
  handleClose: () => void;
  data: any[];
}) => {
  return (
    <>
      <div className="">
        {data?.map((med, i) => {
          const data = {
            ...med,
            image: {
              // @ts-ignore
              ...med.image,
              altText: med.alt || 'Product image',
            },
          } as MediaImage;

          return (
            <div key={i}>
              {med.image && (
                <Image
                  role="button"
                  onClick={() => handleClose()}
                  src={data.image!.url}
                  alt={data.image!.altText!}
                  className="w-full h-full aspect-[4/5] fadeIn object-cover cursor-zoom-out"
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
