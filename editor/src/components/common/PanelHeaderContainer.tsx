import React from "react";
import { Flex, useMediaQuery, useStyleConfig } from "@chakra-ui/react";

// eslint-disable-next-line
export const PanelHeaderContainer: React.FC<any> = (props) => {
  const { size, variant, ...rest } = props;
  const styles = useStyleConfig("PanelHeaderContainer", { size, variant });
  const [isDesktop] = useMediaQuery("(min-width: 768px)");
  return (
    <Flex
      zIndex={2}
      w={"100%"}
      minH={isDesktop ? 6 : "44px"}
      sx={styles}
      borderBottom="1px"
      borderColor="gray.300"
      bg="gray.100"
      overflow="hidden"
      {...rest}
    />
  );
};
