import { PanelHeader } from '/@/components/common/PanelHeader';

import { Box } from '@chakra-ui/react';

export const PanelDocs: React.FC = () => {
  return (
    <Box
      position={'absolute'}
      borderLeft={'1px'}
      top={'3rem'}
      w={"100%"}
      h={"calc(100vh - 3rem)"}
      right={0}
      overflowY="scroll"
      bg={'gray.100'}
    >
    <PanelHeader title={'Docs'}/>
        <Box className="iframe-container">
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
