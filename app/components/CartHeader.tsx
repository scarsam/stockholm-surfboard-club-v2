export const DrawerHeader = ({
  title,
  onClose,
}: {
  title: string;
  onClose?: () => void;
}) => {
  return (
    <div className="flex justify-between p-[calc(0.5em-1px)] md:p-[calc(0.5em-0.5px)] border-b border-t w-full">
      <h2 className="font-semibold">{title}</h2>
      <button className="focus:ring-0" onClick={onClose} type="button">
        Close
      </button>
    </div>
  );
};
