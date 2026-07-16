import { Container, Flex, Heading } from "@radix-ui/themes";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact details for Steven Junio",
  alternates: {
    canonical: "/contact",
  },
};
export default function ContactPage() {
  return (
    <Container height={"calc(100vh - 70px)"}>
      <Flex
        direction="column"
        gap="4"
        height={"calc(100% )"}
        justify={"center"}
        align={"center"}
      >
        <Link href={"mailto:steven.Junio91@gmail.com"}>
          <Heading as="h1" size="5" wrap="pretty">
            Steven.Junio91@gmail.com
          </Heading>
        </Link>
      </Flex>
    </Container>
  );
}
