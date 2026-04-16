// import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from '@react-email/components';

interface MagicLinkEmailProps {
  baseUrl: string;
  href: string;
  loginCode?: string;
  logoUrl: string;
}


export const MagicLinkEmail = ({
  baseUrl,
  href,
  loginCode,
  logoUrl,
}: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Tailwind config={{
        presets: [pixelBasedPreset],
        theme: {
          extend: {
            colors: {
              brand: "#041058",
            },
          },
        },
      }}>
      <Body className="bg-white font-notion">
        <Preview>Log in with this magic link</Preview>
        <Section className="bg-brand">
          <Container className="px-3 mx-auto">
            <Img
              src={logoUrl}
              width="32"
              height="32"
              alt="Accessible Community"
              className="mx-auto"
            />
          </Container>
        </Section>
        <Section>
          <Container className="px-3 mx-auto">
            <Heading className="text-[#333] text-[24px] my-10 mx-0 p-0">
              Accessible Community Login
            </Heading>
            <Link
              href={href}
              target="_blank"
              className="text-[#2754C5] text-[14px] underline mb-4 block"
            >
              Click here to log in with this magic link
            </Link>
            <Text className="text-[#333] text-[14px] my-6 mb-3.5">
              Or, copy and paste this temporary login code:
            </Text>
            <code className="inline-block py-4 px-[4.5%] w-9/10 bg-[#f4f4f4] rounded-md border border-solid border-[#eee] text-[#333]">
              {loginCode}
            </code>
            <Text className="text-[#ababab] text-[14px] mt-3.5 mb-4">
              If you didn&apos;t try to login, you can safely ignore this email.
            </Text>
          </Container>
        </Section>
        <Section className="bg-brand">
          <Container className="px-3 mx-auto">
            <Img
              src={logoUrl}
              width="32"
              height="32"
              alt="Accessible Community"
              className="mx-auto"
            />
          </Container>
        </Section>
      </Body>
    </Tailwind>
  </Html>
);

MagicLinkEmail.PreviewProps = {
  loginCode: 'sparo-ndigo-amurt-secan',
} as MagicLinkEmailProps;

export default MagicLinkEmail;
