import {useState} from 'react';
import {CreateAccount} from './CreateAccount';
import {Login} from './Login';
import {ResetPassword} from './ResetPassword';

type Forms = 'login' | 'create' | 'reset';

export const Session = ({name}: {name: string}) => {
  const [form, setForm] = useState<Forms>('login');

  const renderForm = () => {
    switch (form) {
      case 'login':
        return (
          <>
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
              <div className="flex justify-between items-center mt-8 border-t border-gray-300">
                <button
                  onClick={() => setForm('reset')}
                  className="mt-6 inline-block align-baseline text-sm"
                >
                  Forgot password
                </button>
              </div>
            </p>
          </>
        );
      case 'create':
        return (
          <>
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
    <div className="flex justify-between items-center mt-8 flex-col border-gray-300">
      {renderForm()}
    </div>
  );
};
