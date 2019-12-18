import { readlines } from "../utils/io";

interface ReactionIngredient {
  name: string;
  quantity: number;
}

interface ReactionRequirement {
  ingredient: ReactionIngredient;
  dependencies: ReactionIngredient[];
}

interface ReactionRecipe {
  [key: string]: ReactionRequirement;
}

interface ReactionInventory {
  [key: string]: ReactionIngredient;
}

export function parseReactions(lines: string[]): ReactionRecipe {
  const recipe: ReactionRecipe = {};

  lines.forEach(line => {
    const [inputStr, outputStr] = line.trim().split(" => ", 2);
    const deps = inputStr.split(", ").map(s => {
      const [q, n] = s.split(" ", 2);
      return { name: n, quantity: parseInt(q, 10) };
    });
    const [riq, rin] = outputStr.split(" ", 2);
    if (recipe[rin]) {
      throw new Error(`Duplicate recipe for ${rin}`);
    }
    recipe[rin] = {
      ingredient: { name: rin, quantity: parseInt(riq, 10) },
      dependencies: deps
    };
  });

  return recipe;
}

export function findMinimumInput(
  recipe: ReactionRecipe,
  inputName: string,
  count: number,
  outputName: string
): number {
  let inputCount = 0;
  const inventory: ReactionInventory = {};

  Object.keys(recipe).forEach(
    name => (inventory[name] = { name: name, quantity: 0 })
  );
  inventory[inputName] = { name: inputName, quantity: 0 };

  const pending: ReactionIngredient[] = [];
  pending.push({ name: outputName, quantity: count });

  // console.log("recipe", recipe);

  while (inventory[outputName].quantity < count) {
    // console.log("pending", pending);
    // console.log("inventory", inventory);
    // console.log("inputCount", inputCount);
    let ingredient = pending.shift();
    if (ingredient === undefined) {
      throw new Error("Empty pending ingredient");
    }

    const missingDeps: ReactionIngredient[] = [];
    if (recipe[ingredient.name] === undefined) {
      // console.log("ingredient", ingredient, "inputName", inputName);
      if (ingredient.name === inputName) {
        inputCount += ingredient.quantity;
        inventory[ingredient.name].quantity += ingredient.quantity;
      } else {
        throw new Error(`Missing recipe for ingredient: ${ingredient.name}`);
      }
    } else {
      if (inventory[ingredient.name].quantity < ingredient.quantity) {
        recipe[ingredient.name].dependencies.forEach(dep => {
          if (inventory[dep.name].quantity < dep.quantity) {
            missingDeps.unshift(dep);
          }
        });
      }
    }

    if (missingDeps.length > 0) {
      pending.unshift(ingredient);
      pending.unshift(...missingDeps);
    } else {
      if (recipe[ingredient.name]) {
        // console.log(`Reaction for ${ingredient.name}`);
        // console.log("inventory before starting", inventory);
        if (inventory[ingredient.name].quantity < ingredient.quantity) {
          recipe[ingredient.name].dependencies.forEach(dep => {
            if (inventory[dep.name].quantity < dep.quantity) {
              throw new Error(
                `inventory mixup for ${dep.name} and ${inventory.name}`
              );
            }
            inventory[dep.name].quantity -= dep.quantity;
          });
          inventory[ingredient.name].quantity +=
            recipe[ingredient.name].ingredient.quantity;
        }
        // console.log("inventory after reaction", inventory);
        // console.log("pending after reaction", pending);
      }
    }
  }

  return inputCount;
}

export function findMaximumOutput(
  recipe: ReactionRecipe,
  inputCount: number,
  inputName: string,
  outputName: string
): number {
  const inventory: ReactionInventory = {};

  Object.keys(recipe).forEach(
    name => (inventory[name] = { name: name, quantity: 0 })
  );
  inventory[inputName] = { name: inputName, quantity: inputCount };

  const pending: ReactionIngredient[] = [];
  pending.push({ name: outputName, quantity: 1 });

  let inventoryAvailable = true;

  // console.log("recipe", recipe);

  while (inventoryAvailable) {
    // console.log("pending", pending);
    // console.log("inventory", inventory);
    // console.log("inputCount", inputCount);
    let ingredient = pending.shift();
    if (ingredient === undefined) {
      console.log("Empty pending ingredient");
      ingredient = { name: outputName, quantity: 1 };
    }

    const missingDeps: ReactionIngredient[] = [];
    if (
      inventoryAvailable &&
      inventory[ingredient.name].quantity < ingredient.quantity
    ) {
      if (recipe[ingredient.name] === undefined) {
        // console.log("ingredient", ingredient, "inputName", inputName);
        if (ingredient.name === inputName) {
          inventoryAvailable = false;
        } else {
          throw new Error(`Missing recipe for ingredient: ${ingredient.name}`);
        }
      } else {
        recipe[ingredient.name].dependencies.forEach(dep => {
          if (inventory[dep.name].quantity < dep.quantity) {
            missingDeps.unshift(dep);
          }
        });
      }
    }

    if (inventoryAvailable && missingDeps.length > 0) {
      pending.unshift(ingredient);
      pending.unshift(...missingDeps);
    } else {
      if (recipe[ingredient.name]) {
        // console.log(`Reaction for ${ingredient.name}`);
        // console.log("inventory before starting", inventory);
        if (inventory[ingredient.name].quantity < ingredient.quantity) {
          recipe[ingredient.name].dependencies.forEach(dep => {
            if (inventory[dep.name].quantity < dep.quantity) {
              throw new Error(
                `inventory mixup for ${dep.name} and ${inventory.name}`
              );
            }
            inventory[dep.name].quantity -= dep.quantity;
          });
          inventory[ingredient.name].quantity +=
            recipe[ingredient.name].ingredient.quantity;
        }
        // console.log("inventory after reaction", inventory);
        // console.log("pending after reaction", pending);
      }
    }
  }

  return inventory[outputName].quantity;
}

if (require.main === module) {
  if (process.env.P1) {
    readlines(process.stdin)
      .then(lines => parseReactions(lines))
      .then(recipe => findMinimumInput(recipe, "ORE", 1, "FUEL"))
      .then(ore => console.log("ORE", ore))
      .catch(err => console.log("Error", err));
  } else {
    readlines(process.stdin)
      .then(lines => parseReactions(lines))
      .then(recipe => findMaximumOutput(recipe, 1000000000000, "ORE", "FUEL"))
      .then(fuel => console.log("FUEL", fuel))
      .catch(err => console.log("Error", err));
  }
}
