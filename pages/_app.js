import "@fontsource/quicksand/latin-400.css";
import "@fontsource/quicksand/latin-500.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { ChakraProvider } from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import Layout from "@/components/common/Layout";
import Loader from "@/components/common/Loader";
import { getUser } from "@/lib/directus";
import { AuthStore } from "@/stores/AuthStore";
import theme from "@/theme";

function MyApp({ Component, pageProps, router }) {
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("chakra-ui-custom-color-mode")) {
      localStorage.removeItem("chakra-ui-color-mode");
    }

    const loadUser = async () => {
      const user = await getUser();
      if (user) {
        AuthStore.update((s) => {
          s.user = user;
        });
      }

      setChecks((prev) => [...prev, "session"]);
    };

    loadUser();
  }, []);

  // Display page once all checks are done
  useEffect(() => {
    if (checks.includes("session")) {
      setLoading(false);
    }
  }, [checks]);

  return (
    <>
      <ChakraProvider theme={theme}>
        <AnimatePresence mode="wait">
          {loading ? (
            <Layout justify="center" align="center">
              <Loader />
            </Layout>
          ) : (
            <Component {...pageProps} key={router.route} />
          )}
        </AnimatePresence>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
