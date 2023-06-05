import {Button} from './Button';
import {FeaturedSection} from './FeaturedSection';
import {PageHeader, Text} from './Text';

export function NotFound({type = 'page'}: {type?: string}) {
  const heading = 'Page Not Found (404 Error)';
  const description =
    "Oops! It seems like the page you're looking for doesn't exist or has been moved. We apologize for any inconvenience caused.";

  return (
    <>
      <PageHeader heading={heading}>
        <Text width="narrow" as="p">
          {description}
        </Text>
        <Button width="auto" variant="secondary" to={'/'}>
          GO TO HOME PAGE
        </Button>
      </PageHeader>
    </>
  );
}

// Page Not Found (404 Error)
// Oops! It seems like the page you're looking for doesn't exist or has been moved. We apologize for any inconvenience caused.
