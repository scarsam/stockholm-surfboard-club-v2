import {type ActionFunction, json} from '@shopify/remix-oxygen';

type ActionData = {
  formError?: string;
};

const badRequest = (data: ActionData) => json(data, {status: 400});

export const action: ActionFunction = async ({request, context}) => {
  const formData = await request.formData();

  const formEmail = formData.get('email');

  try {
    const response = await fetch(
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
                  email: formEmail,
                },
              ],
            },
          },
        }),
      },
    );
    console.log({response});
    console.log({context});

    return json({error: null, ok: true});
  } catch (error: any) {
    return badRequest({
      formError: 'Something went wrong. Please try again later.',
    });
  }
};
