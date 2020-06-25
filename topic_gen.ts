import Random from "https://deno.land/x/random/Random.js";
import { readCSV } from "https://deno.land/x/csv/mod.ts";

class TopicPair {
  topicA: string = "";
  topicB: string = "";
  common: string = "";
}

const rand = new Random();
const topicPairs = new Array<TopicPair>();

async function initPairs(): Promise<void>  {
    const f = await Deno.open("./topic_pairs.txt");
    for await (const row of readCSV(f)) {
      let csvRowVals: string[] = [];
      for await (const cell of row) {
        csvRowVals.push(cell);
      }
      if (csvRowVals.length < 3) continue;
      let topicPair = new TopicPair();
      topicPair.topicA = csvRowVals[0];
      topicPair.topicB = csvRowVals[1];
      topicPair.common = csvRowVals[2];
    }
    f.close();
  }

function returnRandomPair(): TopicPair {
    return rand.pick(topicPairs);
}
  