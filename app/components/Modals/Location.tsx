import {CountrySelector} from '../CountrySelector';

export const Location = ({handleClose}: {handleClose: () => void}) => {
  // Todo: Figure out why this is cached even if disabling cache
  // const sessionCountry = fetchSync('/api/countryCode');
  // const defaultCountry = sessionCountry.ok
  //   ? sessionCountry.json().countryCode
  //   : '';
  // const [selectedCountry, setSelectedCountry] = useState('');

  // const {
  //   country: {isoCode},
  // } = useLocalization();
  // const currentCountry = useMemo<{name: string; isoCode: CountryCode}>(() => {
  //   const regionNamesInEnglish = new Intl.DisplayNames(['en'], {
  //     type: 'region',
  //   });

  //   return {
  //     name: regionNamesInEnglish.of(defaultCountry || isoCode)!,
  //     isoCode: defaultCountry || (isoCode as CountryCode),
  //   };
  // }, [isoCode]);

  // const handleUpdate = async () => {
  //   if (selectedCountry) {
  //     try {
  //       await fetch('/api/countryCode', {
  //         method: 'post',
  //         body: JSON.stringify({countryCode: selectedCountry}),
  //       });
  //     } catch (err) {
  //       console.log('err', err);
  //     }
  //   }
  //   window.location.href = '/';
  // };

  return (
    <>
      <h2 className="font-semibold mb-2 text-black">Choose country</h2>
      <p className="text-xs mb-2 text-black">
        Please select the country where your order will be shipped to. This will
        give you the correct pricing, delivery dates and shipping cost for your
        destination. all orders are dispatched from Sweden.
      </p>
      <CountrySelector />
      {/* <label className="block mb-2">
        <p className="text-xs text-[#4D4D4D]">Choose country</p>
        <Suspense fallback={<div className="p-2">Loading…</div>}>
          <SelectCountries
            selectedCountry={currentCountry}
            setSelectedCountry={setSelectedCountry}
          />
        </Suspense>
      </label>
      <Suspense fallback={<div className="p-2">Loading…</div>}>
        <button
          onClick={handleUpdate}
          type="submit"
          className="bg-black text-white text-xs uppercase w-full py-2"
        >
          Update country
        </button>
      </Suspense> */}
    </>
  );
};

// export function SelectCountries({
//   selectedCountry,
//   setSelectedCountry,
// }: {
//   selectedCountry: Pick<Country, 'isoCode' | 'name'>;
//   setSelectedCountry: React.Dispatch<React.SetStateAction<string>>;
// }) {
//   // const response = fetchSync('/api/countries');

//   // let countries: Country[] | undefined;

//   // if (response.ok) {
//   //   countries = response.json();
//   // } else {
//   //   console.error(
//   //     `Unable to load available countries ${response.url} returned a ${response.status}`,
//   //   );
//   // }
//   const countries = [];
//   return countries ? (
//     <select
//       defaultValue={selectedCountry.isoCode}
//       id="country"
//       className="w-full border border-black p-2"
//       onChange={(e) => setSelectedCountry(e.target.value)}
//     >
//       {countries.map((country) => {
//         const isSelected = country.isoCode === selectedCountry.isoCode;

//         return (
//           <option
//             key={country.isoCode}
//             value={country.isoCode}
//             className={`${isSelected ? 'bg-red' : 'bg-black'}`}
//           >
//             {country.name}
//           </option>
//         );
//       })}
//     </select>
//   ) : (
//     <div className="flex justify-center">
//       <div className="mt-4 text-center">
//         <div>Unable to load available countries.</div>
//         <div>Please try again.</div>
//       </div>
//     </div>
//   );
// }
