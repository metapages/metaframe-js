import { PanelHeader } from '../../common/PanelHeader';

import { Box } from '@chakra-ui/react';

export const PanelDocs: React.FC = () => {
  return (
    <Box
      position={'absolute'}
      borderLeft={'1px'}
      top={'3rem'}
      bg={'white'}
      w={"calc(100% - 4rem)"}
      h={"calc(100vh - 3rem)"}
      right={0}
      overflowY="scroll"
    >
    <PanelHeader title={'Docs'}/>
        <Box className="iframe-container" bg={"gray.100"}>
          <iframe
            className="iframe"
            src={`https://markdown.mtfm.io/#?hm=disabled&url=${
              window.location.origin
            }${
              window.location.pathname.endsWith("/")
                ? window.location.pathname.substring(
                    0,
                    window.location.pathname.length - 1
                  )
                : window.location.pathname
            }/README.md`}
          />
        </Box>
      </Box>
  );

};
