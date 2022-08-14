import { quickScore } from "quick-score";

import { getIndexRange, getTextItemWithNeighbors } from "../lib/search";

addEventListener("message", (event) => {
  const { index, query } = event.data;

  let results = {};

  Object.keys(index).forEach((document) => {
    let documentCounter = 0;

    let matches = [];
    const matchesInTitle =
      quickScore(index[document].title, query, matches) > 0.5
        ? matches
        : undefined;
    if (matchesInTitle !== undefined) {
      documentCounter++;
    }

    results[document] = {
      title: matchesInTitle,
      pages: Object.keys(index[document].pages).map((page) => {
        let pageCounter = 0;
        return {
          items: index[document].pages[page].map((textItem, itemIndex) => {
            if (!textItem.trim()) {
              return undefined;
            }

            let matches = [];
            const matchInTextItem = quickScore(textItem, query, matches);
            if (matchInTextItem > 0.5) {
              // Found matches within current item, no need for magic
              pageCounter++;
              documentCounter++;
              return matches;
            }

            const textItemWithNeighbors = getTextItemWithNeighbors(
              index[document].pages[page],
              itemIndex
            );
            const [textItemIndexStart, textItemIndexEnd] = getIndexRange(
              textItemWithNeighbors,
              textItem
            );

            // Look for matches with neighbors included
            matches = [];
            const matchInTextItemWithNeighbors = quickScore(
              textItemWithNeighbors,
              query,
              matches
            );
            if (matchInTextItemWithNeighbors > 0.5) {
              const matchIndexStart = matches[0][0];
              const matchIndexEnd = matches[matches.length - 1][1];
              if (
                matchIndexEnd < textItemIndexStart ||
                matchIndexStart > textItemIndexEnd
              ) {
                return undefined;
              }

              // Match found was partially in the line we're currently rendering. Now
              // we need to figure out what does "partially" exactly mean
              const indexOfCurrentTextItemInMergedLines =
                textItemWithNeighbors.indexOf(textItem);
              const matchIndexStartInTextItem = Math.max(
                0,
                matchIndexStart - indexOfCurrentTextItemInMergedLines
              );
              const matchIndexEndInTextItem =
                matchIndexEnd - indexOfCurrentTextItemInMergedLines;

              pageCounter++;
              documentCounter++;
              return [[matchIndexStartInTextItem, matchIndexEndInTextItem]];
            }
          }),
          count: pageCounter,
        };
      }),
      count: documentCounter,
    };
  });

  postMessage(results);
});
