import {Button} from './Button';
import {FeaturedSection} from './FeaturedSection';
import {PageHeader, Text} from './Text';

export function NotFound({type = 'page'}: {type?: string}) {
  const heading = 'Page Not Found (404 Error)';
  const description =
    "Oops! It seems like the page you're looking for doesn't exist or has been moved. We apologize for any inconvenience caused.";

  return (
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
        </div>
        <div className="text-center pt-[5rem]">
          <Button
            width="full"
            variant="secondary"
            to={'/collections/sale'}
            className="min-w-[300px]"
          >
            GO TO HOME PAGE
          </Button>
        </div>
      </div>
    </PageHeader>
  );
}
