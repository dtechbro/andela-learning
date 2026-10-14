import type { Topic, Concept, Question } from "../types";
export const contentVersion = "biology-demo-1";
export const course = {
  id: "biology-demo",
  title: "Introduction to Biology",
  subtitle: "A sample university course",
  version: contentVersion,
};
export const topics: Topic[] = [
  {
    id: "cells",
    title: "Cell structure",
    description: "What cells share, and what sets them apart.",
    symbol: "◉",
    conceptIds: ["cell-types", "ribosomes"],
  },
  {
    id: "transport",
    title: "Membranes & transport",
    description: "How substances move into and out of cells.",
    symbol: "⇄",
    conceptIds: ["passive", "active"],
  },
  {
    id: "enzymes",
    title: "Enzymes",
    description: "Catalysts, active sites, and their environment.",
    symbol: "⌁",
    conceptIds: ["catalysis", "denaturation"],
  },
  {
    id: "division",
    title: "Cell division",
    description: "DNA replication and the cell cycle.",
    symbol: "◈",
    conceptIds: ["replication", "cytokinesis"],
  },
  {
    id: "genetics",
    title: "Meiosis & inheritance",
    description: "Chromosome sets and genetic variation.",
    symbol: "⤨",
    conceptIds: ["ploidy", "crossing"],
  },
];
export const concepts: Concept[] = [
  {
    id: "cell-types",
    topicId: "cells",
    title: "Prokaryotic and eukaryotic cells",
  },
  { id: "ribosomes", topicId: "cells", title: "Ribosomes" },
  { id: "passive", topicId: "transport", title: "Passive transport" },
  { id: "active", topicId: "transport", title: "Active transport" },
  { id: "catalysis", topicId: "enzymes", title: "Enzyme catalysis" },
  { id: "denaturation", topicId: "enzymes", title: "Enzyme denaturation" },
  { id: "replication", topicId: "division", title: "DNA replication" },
  { id: "cytokinesis", topicId: "division", title: "Cytokinesis" },
  { id: "ploidy", topicId: "genetics", title: "Haploid and diploid cells" },
  { id: "crossing", topicId: "genetics", title: "Crossing over" },
];
const commit = "89c14e6d065606fdbe1e696ce2e8d9612a080147";
function pair(
  id: string,
  module: string,
  section: string,
  prompt: string,
  options: string[],
  answer: number,
  written: string,
  criteria: string[],
  hint: string,
  explanation: string,
): Question[] {
  const base = {
    conceptId: id,
    criteria,
    hint,
    explanation,
    source: {
      title: "OpenStax · Biology 2e",
      section,
      url: `https://github.com/openstax/osbooks-biology-bundle/blob/${commit}/modules/${module}/index.cnxml`,
    },
    validated: true,
    checkedAt: "2026-10-14",
    verification:
      "Agent checked against official OpenStax CNXML source; not lecturer-reviewed",
  };
  return [
    {
      ...base,
      id: `${id}-choice`,
      type: "choice",
      prompt,
      options,
      correctIndex: answer,
    },
    { ...base, id: `${id}-written`, type: "written", prompt: written },
  ];
}
export const questions: Question[] = [
  ...pair(
    "cell-types",
    "m66446",
    "4.2 Prokaryotic Cells",
    "Which feature distinguishes a eukaryotic cell from a prokaryotic cell?",
    [
      "A plasma membrane",
      "DNA as genetic material",
      "A membrane-bound nucleus",
      "Ribosomes",
    ],
    2,
    "A bacterium contains DNA but has no membrane-bound nucleus. Why is it classified as prokaryotic?",
    [
      "Prokaryotic cells lack a membrane-bound nucleus.",
      "Having DNA does not make a cell eukaryotic; both cell types contain DNA.",
    ],
    "Think about how genetic material is enclosed.",
    "Both types have DNA, cytoplasm, a plasma membrane, and ribosomes. A membrane-bound nucleus distinguishes eukaryotic cells; prokaryotic DNA is not enclosed in one.",
  ),
  ...pair(
    "ribosomes",
    "m66446",
    "4.2 Prokaryotic Cells",
    "What is the primary function of ribosomes?",
    [
      "Synthesising proteins",
      "Storing cellular water",
      "Replicating the whole cell",
      "Making the cell wall",
    ],
    0,
    "Why do both bacterial and animal cells need ribosomes?",
    [
      "Ribosomes synthesise proteins.",
      "Both kinds of cells need proteins for cellular functions.",
    ],
    "Consider the molecules that carry out much of a cell’s work.",
    "Ribosomes assemble proteins. They occur in both prokaryotic and eukaryotic cells; having ribosomes alone does not distinguish the two.",
  ),
  ...pair(
    "passive",
    "m66374",
    "5.2 Passive Transport",
    "In passive transport, a substance generally moves…",
    [
      "Against its concentration gradient using ATP",
      "Down its concentration gradient without cellular energy expenditure",
      "Only through a pump",
      "Only when the cell divides",
    ],
    1,
    "A solute is more concentrated outside a cell than inside. If the membrane permits its passive diffusion, describe its net movement and energy requirement.",
    [
      "Net movement is from outside to inside, down the concentration gradient.",
      "The cell does not expend energy for passive diffusion.",
    ],
    "Compare the two concentrations before deciding on a direction.",
    "Passive transport moves substances down their concentration gradient without the cell expending energy. Movement continues in both directions; the net direction follows the gradient.",
  ),
  ...pair(
    "active",
    "m66375",
    "5.3 Active Transport",
    "Moving a solute against its concentration gradient requires…",
    [
      "No energy, because movement is automatic",
      "Energy supplied directly or indirectly",
      "Only a higher temperature",
      "The disappearance of the membrane",
    ],
    1,
    "How does moving a solute against its concentration gradient differ from passive transport?",
    [
      "Against-gradient movement requires an energy source.",
      "Passive transport moves down a gradient without cellular energy expenditure.",
    ],
    "Think about moving uphill compared with downhill.",
    "Active transport uses energy to move material against a gradient. Some mechanisms use ATP directly; others use energy stored in another gradient. A transport protein does not automatically mean transport is active.",
  ),
  ...pair(
    "catalysis",
    "m66463",
    "6.5 Enzymes",
    "How do enzymes speed up biochemical reactions?",
    [
      "By increasing the activation energy",
      "By lowering the activation energy",
      "By changing every reaction into an energy-releasing reaction",
      "By being permanently consumed",
    ],
    1,
    "An enzyme makes a reaction faster. What happens to the activation energy, and does the enzyme change the reaction’s overall free-energy difference?",
    [
      "The activation energy is lowered.",
      "The reaction’s overall free-energy difference (ΔG) is not changed.",
    ],
    "Distinguish the barrier to a reaction from its overall energy change.",
    "Enzymes lower the activation-energy barrier. They do not change the free energies of the reactants and products, so they do not change the reaction’s overall ΔG.",
  ),
  ...pair(
    "denaturation",
    "m66463",
    "6.5 Enzymes",
    "Why can very high temperatures reduce an enzyme’s activity?",
    [
      "They always remove the substrate",
      "They can alter the enzyme’s structure and active site",
      "They turn every enzyme into DNA",
      "They make all reactions stop permanently",
    ],
    1,
    "An enzyme works well at moderate temperature but poorly after strong heating. Explain one possible reason.",
    [
      "Strong heating can denature the enzyme and alter its structure.",
      "An altered active site may bind the substrate or catalyse the reaction poorly.",
    ],
    "Think about the fit between a substrate and an active site.",
    "Temperatures outside an enzyme’s suitable range can affect its structure. Strong heating can denature it, altering the active site. Warming within a suitable range may increase activity, so temperature effects are not simply “hotter is worse.”",
  ),
  ...pair(
    "replication",
    "m66478",
    "10.2 The Cell Cycle",
    "During which part of interphase is nuclear DNA replicated?",
    ["G1 phase", "S phase", "G2 phase", "Cytokinesis"],
    1,
    "What happens to nuclear DNA during S phase, and how are the resulting copies related?",
    [
      "DNA is replicated during S phase.",
      "Replication produces sister chromatids, initially identical copies joined at the centromeric region.",
    ],
    "The letter S refers to synthesis.",
    "DNA replication in S phase produces sister chromatids. These copies can later be separated during cell division. DNA replication is not the same process as dividing the cytoplasm.",
  ),
  ...pair(
    "cytokinesis",
    "m66478",
    "10.2 The Cell Cycle",
    "Cytokinesis is the division of the…",
    ["Cytoplasm", "DNA sequence", "Nuclear membrane only", "Ribosome"],
    0,
    "How is cytokinesis different from mitosis?",
    [
      "Mitosis divides the nucleus and distributes replicated chromosomes.",
      "Cytokinesis divides the cytoplasm, typically forming separate daughter cells.",
    ],
    "Distinguish the nucleus from the rest of the cell.",
    "Mitosis is nuclear division; cytokinesis partitions the cytoplasm. They are related but distinct processes, and nuclear division can sometimes occur without cytokinesis.",
  ),
  ...pair(
    "ploidy",
    "m66483",
    "11.1 The Process of Meiosis",
    "A haploid cell contains…",
    [
      "Two sets of chromosomes",
      "One set of chromosomes",
      "No chromosomes",
      "Only duplicated chromosomes",
    ],
    1,
    "Why must chromosome sets be reduced before fertilisation in a typical sexual life cycle?",
    [
      "Gametes carry one chromosome set rather than two.",
      "Fertilisation joins two gametes and restores the diploid number, avoiding doubling in each generation.",
    ],
    "Consider what would happen if both gametes carried two sets.",
    "Meiosis reduces chromosome sets from diploid to haploid. Fusion of haploid gametes restores two sets in the zygote. Ploidy refers to sets, not simply whether chromosomes have been replicated.",
  ),
  ...pair(
    "crossing",
    "m66483",
    "11.1 The Process of Meiosis",
    "During crossing over in meiosis, DNA segments are exchanged between…",
    [
      "Nonsister chromatids of homologous chromosomes",
      "Two unrelated cells",
      "Ribosomes and chromosomes",
      "Only identical sister chromatids",
    ],
    0,
    "How can crossing over during prophase I contribute to genetic variation?",
    [
      "Homologous chromosomes pair, and nonsister chromatids exchange corresponding segments.",
      "This produces new combinations of genetic material on the chromatids.",
    ],
    "Think about swapping corresponding sections of paired chromosomes.",
    "During prophase I, homologous chromosomes pair and nonsister chromatids can exchange segments. This recombination creates new combinations of genetic material rather than simply copying a chromosome.",
  ),
];
export function validateContent() {
  const ids = new Set<string>();
  for (const q of questions) {
    if (
      ids.has(q.id) ||
      !concepts.some((c) => c.id === q.conceptId) ||
      !q.criteria.length ||
      !q.source.url.startsWith("https://") ||
      !q.hint ||
      !q.explanation ||
      !q.checkedAt
    )
      throw Error(`Invalid question ${q.id}`);
    ids.add(q.id);
    if (
      q.type === "choice" &&
      (!q.options ||
        q.correctIndex === undefined ||
        q.correctIndex < 0 ||
        q.correctIndex >= q.options.length ||
        new Set(q.options).size !== q.options.length)
    )
      throw Error(`Invalid options ${q.id}`);
  }
  for (const c of concepts)
    if (!topics.some((t) => t.id === c.topicId && t.conceptIds.includes(c.id)))
      throw Error(`Invalid concept ${c.id}`);
}
validateContent();
