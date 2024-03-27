import { Steps } from '../components/Steps';

export function checkDependencies(
  dependencies: Steps,
  steps: string[]
): string[] {
  const order: { [key: string]: number } = {};

  steps.forEach((step, index) => {
    order[step] = index;
  });

  const errors: string[] = [];

  steps.forEach((step) => {
    const dependent = Object.values(dependencies).find((d) => d.id === step);

    if (!dependent) {
      return;
    }

    if (
      dependent.dependencies.length > 0 &&
      !dependent.dependencies.some((dependency) => steps.includes(dependency))
    ) {
      errors.push(
        `Dependency error: [${step}] requires at least one of its dependencies [${dependent.dependencies.join(
          ', '
        )}] in the list.`
      );
    }

    dependent.dependencies.forEach((dependency) => {
      if (steps.includes(dependency) && order[dependency] > order[step]) {
        errors.push(`Dependency error: ${step} depends on ${dependency}`);
      }
    });
  });

  return errors;
}
