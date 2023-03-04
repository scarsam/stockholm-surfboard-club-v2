export const DrawerHeader = ({
  title,
  onClose,
}: {
  title: string;
  onClose?: () => void;
}) => {
  return (
    <div className="flex justify-between py-4 mb-10 border-b w-full">
      <h2 className="font-semibold">{title}</h2>
      <button onClick={onClose} type="button">
        Close
      </button>
    </div>
  );
};
