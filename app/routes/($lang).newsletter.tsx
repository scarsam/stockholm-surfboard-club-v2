import {redirect, type ActionFunction, json} from '@shopify/remix-oxygen';

type ActionData = {
  formError?: string;
};

const badRequest = (data: ActionData) => json(data, {status: 400});

export const action: ActionFunction = async ({request, context}) => {
  const formData = await request.formData();

  const email = formData.get('email');

  try {
    await fetch(
      'https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/',
      {
        method: 'POST',
        headers: {
          Authorization: context.env?.PRIVATE_KLAVIYO_NEWSLETTER,
          accept: 'application/json',
          revision: '2023-02-22',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            type: 'profile-subscription-bulk-create-job',
            attributes: {
              list_id: 'VhRvqf',
              custom_source: 'Marketing Event',
              subscriptions: [
                {
                  channels: {
                    email: ['MARKETING'],
                  },
                  email,
                },
              ],
            },
          },
        }),
      },
    );

    return json({error: null, ok: true});
  } catch (error: any) {
    console.log(error);
    return badRequest({
      formError: 'Something went wrong. Please try again later.',
    });
  }
};

// curl --request POST \
//      --url https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/ \
//      --header 'Authorization: Klaviyo-API-Key your-private-api-key' \
//      --header 'accept: application/json' \
//      --header 'content-type: application/json' \
//      --header 'revision: 2023-02-22' \
//      --data '
// {
//   "data": {
//     "type": "profile-subscription-bulk-create-job",
//     "attributes": {
//       "list_id": "Y6nRLr",
//       "custom_source": "Marketing Event",
//       "subscriptions": [
//         {
//           "channels": {
//             "email": [
//               "MARKETING"
//             ],
//             "sms": [
//               "MARKETING"
//             ]
//           },
//           "email": "matt-kemp@klaviyo-demo.com",
//           "phone_number": "+15005550006",
//           "profile_id": "01GDDKASAP8TKDDA2GRZDSVP4H"
//         }
//       ]
//     }
//   }
// }
// '
