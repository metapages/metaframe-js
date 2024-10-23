import { useMetaframeUrl } from '/@/hooks/useMetaframeUrl';

import {
  Icon,
  Link,
  Tooltip,
} from '@chakra-ui/react';
import { ArrowSquareOut } from '@phosphor-icons/react';

export const ButtonGotoExternalLink: React.FC = () => {
  const { url } = useMetaframeUrl();

  return (
    <Link _hover={undefined} href={url} isExternal target="_parent">
      <Tooltip label={"Go to Source URL"}>
        <Icon
          aria-label="go to source url" 
          _hover={{ bg: "gray.300" }}
          bg={"none"}
          p={"3px"}
          borderRadius={5}
          as={ArrowSquareOut}
          boxSize="7"
        />
      </Tooltip>
    </Link>
  );
};
