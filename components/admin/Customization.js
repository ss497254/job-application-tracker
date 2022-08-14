import "@react-page/editor/lib/index.css";

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
} from "@chakra-ui/react";
import Editor from "@react-page/editor";
import { useEffect, useState } from "react";

import { useDebounce } from "@/lib/debounce";
import { directus } from "@/lib/directus";
import {
  customSlateAbout,
  customSlateIntroduction,
} from "@/lib/react-page/plugins";

export default function Customization({ settings }) {
  const [introductionText, setIntroductionText] = useState(
    settings?.introduction_text
  );
  const [aboutText, setAboutText] = useState(settings?.about_text);

  const debouncedIntroductionText = useDebounce(introductionText, 500);
  useEffect(() => {
    async function updateIntroductionText() {
      try {
        await directus.singleton("settings").update({
          introduction_text: debouncedIntroductionText,
        });
      } catch {
        // TODO: Show error message
      }
    }
    if (debouncedIntroductionText) {
      updateIntroductionText();
    }
  }, [debouncedIntroductionText]);

  const debouncedAboutText = useDebounce(aboutText, 500);
  useEffect(() => {
    async function updateAboutText() {
      try {
        await directus.singleton("settings").update({
          about_text: debouncedAboutText,
        });
      } catch {
        // TODO: Show error message
      }
    }
    if (debouncedAboutText) {
      updateAboutText();
    }
  }, [debouncedAboutText]);

  return (
    <>
      <Accordion flex="1" allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontSize="lg" fontWeight="bold">
                introduction_text
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Box mt={6} maxW="700" fontSize={{ md: 18 }}>
              <Editor
                cellPlugins={[customSlateIntroduction]}
                value={introductionText}
                onChange={setIntroductionText}
                childConstraints={{
                  maxChildren: 1,
                }}
                uiTranslator={uiTranslator}
              />
            </Box>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontSize="lg" fontWeight="bold">
                about_text
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Box
              mt={6}
              maxW="800"
              fontSize={{ md: 18 }}
              sx={{
                "ul,ol": {
                  marginTop: "var(--chakra-space-2)",
                },
                li: {
                  marginInlineStart: "1em",
                },
                "li:not(:last-child)": {
                  marginBottom: "var(--chakra-space-2)",
                },
              }}
            >
              <Editor
                cellPlugins={[customSlateAbout]}
                value={aboutText}
                onChange={setAboutText}
                uiTranslator={uiTranslator}
              />
            </Box>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </>
  );
}
