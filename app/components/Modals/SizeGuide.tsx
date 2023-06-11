import clsx from 'clsx';

export const SizeGuide = ({data}: {handleClose: () => void; data: any}) => {
  const sizeItems: string[] | undefined = data?.sizeItems;
  const listItems: string[] | undefined = data?.listItems;

  return (
    <>
      <div className="grid grid-flow-col text-fine">
        {sizeItems?.map((item, i) => (
          <div key={i}>
            {item.split(',').map((str, y) => (
              <div
                className={clsx(
                  'border-b border-black text-center py-1',
                  y === 0 && 'font-bold',
                )}
                key={y}
              >
                {str}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="px-4 pt-2">
        {listItems && (
          <ul className="list-disc">
            {listItems.map((item, i) => (
              <li className="text-fine" key={i}>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};
