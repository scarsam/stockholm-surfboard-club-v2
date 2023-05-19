import {useState} from 'react';

export const Newsletter = () => {
  const [email, setEmail] = useState('');

  return (
    <>
      <h2 className="font-semibold mb-2 text-center text-black">
        Subscribe to our newsletter
      </h2>
      <p className="text-xs mb-2 text-center text-black">
        Sign up for news and exclusive offers.
      </p>
      <label className="block mb-2">
        <p className="text-xs text-[#4D4D4D]">Email*</p>
        <input
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="surf@board.com"
          type="email"
          className="w-full border border-black p-2"
        />
      </label>
      <button
        disabled={!email}
        onClick={() => {}}
        type="submit"
        className="bg-black text-white text-xs uppercase w-full py-2 disabled:opacity-50"
      >
        Submit
      </button>
    </>
  );
};
