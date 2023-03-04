import {useState} from 'react';
import {DrawerHeader} from './CartHeader';
import {CreateAccount} from './CreateAccount';
import {Login} from './Login';
import {ResetPassword} from './ResetPassword';

type Forms = 'login' | 'create' | 'reset';

export const Session = ({
  name,
  onClose,
}: {
  name: string;
  onClose: () => void;
}) => {
  const [form, setForm] = useState<Forms>('login');

  const renderForm = () => {
    switch (form) {
      case 'login':
        return (
          <>
            <DrawerHeader title="Sign in" onClose={onClose} />
            <Login name={name} />
            <p className="align-baseline text-sm mt-6">
              New to {name}? &nbsp;
              <button
                type="button"
                className="inline underline"
                onClick={() => setForm('create')}
              >
                Create an account
              </button>
              .
            </p>
            <p className="align-baseline text-sm">
              Or did you{' '}
              <button
                onClick={() => setForm('reset')}
                className="inline underline"
              >
                forget your password?
              </button>
            </p>
          </>
        );
      case 'create':
        return (
          <>
            <DrawerHeader title="Create an account" onClose={onClose} />
            <CreateAccount />
            <div className="flex items-center mt-8 border-t border-gray-300">
              <p className="align-baseline text-sm mt-6">
                Already have an account? &nbsp;
                <button
                  type="button"
                  className="inline underline"
                  onClick={() => setForm('login')}
                >
                  Sign in
                </button>
              </p>
            </div>
          </>
        );
      case 'reset':
        return (
          <>
            <DrawerHeader title="Forgot password" onClose={onClose} />
            <ResetPassword />
            <div className="flex items-center mt-8 border-t border-gray-300">
              <p className="align-baseline text-sm mt-6">
                Return to &nbsp;
                <button
                  type="button"
                  className="inline underline"
                  onClick={() => setForm('login')}
                >
                  Login
                </button>
              </p>
            </div>
          </>
        );
      default:
        return <Login name={name} />;
    }
  };

  return (
    <div className="flex justify-between items-center flex-col px-2">
      {renderForm()}
    </div>
  );
};
