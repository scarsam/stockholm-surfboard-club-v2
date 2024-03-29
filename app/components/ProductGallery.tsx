import type {Maybe, MediaEdge} from '@shopify/hydrogen/storefront-api-types';
import {ATTR_LOADING_EAGER} from '~/lib/const';
import type {MediaImage} from '@shopify/hydrogen/storefront-api-types';
import {Image} from '@shopify/hydrogen';
import {useDebounce} from 'react-use';
import {useRef, useState} from 'react';
import {Button} from './Button';
import clsx from 'clsx';
import {useModal} from './Modals/useModal';
import {useMediaQuery} from '~/hooks/useMediaQuery';

/**
 * A client component that defines a media gallery for hosting images, 3D models, and videos of products
 */
export function ProductGallery({
  media,
  className,
}: {
  media: MediaEdge['node'][];
  className?: string;
}) {
  const [scrollLeft, setScrollLeft] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useDebounce(
    () => {
      const ref = containerRef.current;
      if (ref) {
        const index = Math.floor(scrollLeft / ref.offsetWidth);
        setActiveImageIndex(index);
      }
    },
    100,
    [scrollLeft],
  );

  const {Modal, setModal} = useModal(true);

  const isMobile = useMediaQuery();

  if (!media.length) {
    return null;
  }

  let i = 0;

  return (
    <>
      <Modal />
      <div
        ref={containerRef}
        onScroll={(event) => setScrollLeft(event.currentTarget.scrollLeft)}
        id="container"
        className={`swimlane md:grid-flow-row hiddenScroll md:p-0 md:overflow-x-auto md:grid-cols-2 ${className} relative`}
      >
        {media.map((med, index) => {
          let mediaProps: Record<string, any> = {};
          const isFirst = i === 0;
          const isFourth = i === 3;
          const isFullWidth = i % 3 === 0 || media.length === 2;

          const data = {
            ...med,
            image: {
              // @ts-ignore
              ...med.image,
              altText: med.alt || 'Product image',
            },
          } as MediaImage;

          switch (med.mediaContentType) {
            case 'IMAGE':
              mediaProps = {
                width: 800,
                widths: [400, 800, 1200, 1600, 2000, 2400],
              };
              break;
            case 'VIDEO':
              mediaProps = {
                width: '100%',
                autoPlay: true,
                controls: false,
                muted: true,
                loop: true,
                preload: 'auto',
              };
              break;
            case 'EXTERNAL_VIDEO':
              mediaProps = {width: '100%'};
              break;
            case 'MODEL_3D':
              mediaProps = {
                width: '100%',
                interactionPromptThreshold: '0',
                ar: true,
                loading: ATTR_LOADING_EAGER,
                disableZoom: true,
              };
              break;
          }

          if (i === 0 && med.mediaContentType === 'IMAGE') {
            mediaProps.loading = ATTR_LOADING_EAGER;
          }

          const style = [
            !isMobile && 'cursor-zoom-in',
            isFullWidth ? 'md:col-span-2' : 'md:col-span-1',
            isFirst || isFourth ? '' : 'md:aspect-[4/5]',
            'aspect-[4/5] snap-center card-image bg-white dark:bg-contrast/10 w-screen md:w-full',
          ].join(' ');

          i++;

          return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <div
              onClick={() =>
                isMobile ? {} : setModal({name: 'productImages', data: media})
              }
              id={`image-${index}`}
              className={style}
              // @ts-ignore
              key={med.id || med.image.id}
            >
              {/* TODO: Replace with MediaFile when it's available */}
              {(med as MediaImage).image && (
                <Image
                  src={data.image!.url}
                  alt={data.image!.altText!}
                  className="w-full h-full aspect-[4/5] fadeIn object-cover"
                />
              )}
              {/* <MediaFile
              tabIndex="0"
              className={`w-full h-full aspect-square fadeIn object-cover`}
              data={data}
              sizes={
                isFullWidth
                  ? '(min-width: 64em) 60vw, (min-width: 48em) 50vw, 90vw'
                  : '(min-width: 64em) 30vw, (min-width: 48em) 25vw, 90vw'
              }
              // @ts-ignore
              options={{
                crop: 'center',
                scale: 2,
              }}
              {...mediaProps}
            /> */}
            </div>
          );
        })}
        <div
          className="sticky md:invisible"
          style={{
            top: '100%',
            height: 'max-content',
            right: '50%',
            transform: 'translateX(50%)',
            zIndex: 10,
          }}
        >
          <div className="flex mb-4">
            {media.map((item, i) => (
              <Button
                key={item.id}
                variant="inline"
                onClick={() => {
                  const ref = containerRef.current;
                  if (ref) {
                    ref.scrollLeft = ref.offsetWidth * i;
                  }
                }}
                className={clsx(
                  'px-1 py-1 border-2 border-b-2 border-red-600 mx-1',
                  activeImageIndex === i && 'bg-red-600',
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
