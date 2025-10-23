import { interpretPrompt } from "./interpreter"

export type AIInterpretResponse = {
  plainEnglish: string
  taxonomyCodes: string[]
  personaCodes: string[]
  states: string[]
  jobTitleFuzzy: string[]
}

export async function aiInterpret(prompt: string): Promise<AIInterpretResponse> {
  // stub only
  const res = await interpretPrompt(prompt || "")
  const plain = `I've interpreted your request as: taxonomy=${res.taxonomyCodes.length}, personas=${res.personaCodes.length}, states=${res.inferredStates.join(",")||"—"}.`
  return {
    plainEnglish: plain,
    taxonomyCodes: res.taxonomyCodes,
    personaCodes: res.personaCodes,
    states: res.inferredStates,
    jobTitleFuzzy: res.jobTitleFuzzy
  }
}
