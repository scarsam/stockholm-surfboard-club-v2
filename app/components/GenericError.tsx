import {Button} from './Button';
import {FeaturedSection} from './FeaturedSection';
import {PageHeader, Text} from './Text';

export function GenericError({error}: {error?: any}) {
  const heading = `Something’s wrong here.`;
  let description = `We found an error while loading this page.`;

  // TODO hide error in prod?
  if (error) {
    description += `\n${error.message}`;
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return (
    <>
      <PageHeader
        className="flex flex-grow justify-center flex-col items-center"
        variant="none"
      >
        <div className="w-full flex flex-col items-center p-6">
          <div className="max-w-[1000px]">
            <Text as="p" className="font-bold">
              {heading}
            </Text>
            <Text as="span">{description}</Text>
            {error?.stack && (
              <pre
                style={{
                  padding: '2rem',
                  background: 'hsla(10, 50%, 50%, 0.1)',
                  color: 'red',
                  overflow: 'auto',
                  maxWidth: '100%',
                }}
                dangerouslySetInnerHTML={{
                  __html: addLinksToStackTrace(error.stack),
                }}
              />
            )}
          </div>
          <div className="text-center pt-[5rem]">
            <Button
              width="full"
              variant="secondary"
              to={'/collections/new'}
              className="min-w-[300px]"
            >
              GO TO HOME PAGE
            </Button>
          </div>
        </div>
      </PageHeader>
    </>
  );
}

function addLinksToStackTrace(stackTrace: string) {
  return stackTrace?.replace(
    /^\s*at\s?.*?[(\s]((\/|\w\:).+)\)\n/gim,
    (all, m1) =>
      all.replace(
        m1,
        `<a href="vscode://file${m1}" class="hover:underline">${m1}</a>`,
      ),
  );
}
