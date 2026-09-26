export const shorelineExplainer = {
  id: "aral-shoreline",
  title: "Six decades of shoreline",
  steps: [
    { id: "1960", label: "1960", src: "/stories/aral-sea/step-1960.svg", alt: "One large lake.", caption: "One lake, fed by two rivers." },
    { id: "late-1980s", label: "Late 1980s", src: "/stories/aral-sea/step-1980s.svg", alt: "Two lakes.", caption: "The sea splits in two." },
    { id: "2014", label: "2014", src: "/stories/aral-sea/step-2014.svg", alt: "East basin dry.", caption: "The eastern basin is dry." },
  ],
};

export const oneStep = { ...shorelineExplainer, steps: shorelineExplainer.steps.slice(0, 1) };
export const duplicateSteps = { ...shorelineExplainer, steps: [shorelineExplainer.steps[0], shorelineExplainer.steps[0]] };
export const unknownInitial = { ...shorelineExplainer, initial: "1999" };
export const longLabel = {
  ...shorelineExplainer,
  steps: shorelineExplainer.steps.map((step, i) => (i === 0 ? { ...step, label: "The year nineteen hundred and sixty" } : step)),
};
export const relativeSrc = {
  ...shorelineExplainer,
  steps: shorelineExplainer.steps.map((step, i) => (i === 0 ? { ...step, src: "step-1960.svg" } : step)),
};
