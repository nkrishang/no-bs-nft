import { Container, PropsOf } from "@chakra-ui/react";

export const ContentWrapper: React.FC<PropsOf<typeof Container>> = ({
  children,
  ...restProps
}) => (
  <Container maxW="calc(1000px + 2rem)" {...restProps}>
    {children}
  </Container>
);