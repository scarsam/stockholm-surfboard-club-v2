import {type ActionFunction, json} from '@shopify/remix-oxygen';

type ActionData = {
  formError?: string;
};

const badRequest = (data: ActionData) => json(data, {status: 400});

export const action: ActionFunction = async ({request, context}) => {
  const formData = await request.formData();

  const formEmail = formData.get('email');

  try {
    const res = await fetch('https://klaviyo-api.vercel.app/api/subscribe', {
      method: 'POST',
      headers: {
        // Authorization: context.env?.PRIVATE_KLAVIYO_NEWSLETTER,
        accept: 'application/json',
        // revision: '2023-02-22',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          email: formEmail,
        },
      }),
    });

    const data = await res.json();

    return json({error: null, ok: data?.status});
  } catch (error: any) {
    return badRequest({
      formError: 'Something went wrong. Please try again later.',
    });
  }
};
