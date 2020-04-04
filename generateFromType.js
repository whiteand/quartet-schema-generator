const { Type } = require("./type.js");
const toCode = require("./toCode.js");
const addTabs = require("./addTabs.js");

// module.exports = {
//     Type,
//     boolean: () => ({ type: Type.Boolean }),
//     func: () => ({ type: Type.Function }),
//     number: () => ({ type: Type.Number }),
//     constant: (c) => ({ type: Type.Constant, value: c }),
//     string: () => ({ type: Type.String }),
//     symbol: () => ({ type: Type.Symbol }),
//     array: (itemType) => ({ type: Type.Symbol, item: itemType }),
//     And: (...itemTypes) => ({ type: Type.And, types: itemTypes }),
//     Or: (...itemTypes) => ({ type: Type.Or, types: itemTypes }),
//     Object: ({ props, restProps }) => ({ type: Type.Object, props, restProps }),
//   };

module.exports = function generateFromType(t, registry = {}) {
  if (!t) return t;
  switch (t.type) {
    case Type.Boolean:
      return `v.boolean`;
    case Type.Function:
      return `v.function`;
    case Type.Number:
      return `v.number`;
    case Type.Constant:
      return toCode(t.value);
    case Type.String:
      return `v.string`;
    case Type.Symbol:
      return `v.symbol`;
    case Type.Array:
      const itemSchema = generateFromType(t.item, registry);
      if (itemSchema.includes("\n")) {
        return `v.arrayOf(\n${addTabs(itemSchema)}\n)`;
      }
      return `v.arrayOf(${itemSchema})`;
    case Type.And:
      const andTypesSchemas = t.types.map((t) => generateFromType(t, registry));
      return `v.and(\n${addTabs(andTypesSchemas.join(",\n"))},\n)`;
    case Type.Or:
      const orTypesSchemas = t.types.map((t) => generateFromType(t, registry));
      return `[\n${addTabs(orTypesSchemas.join(",\n"))},\n]`;
    case Type.Object:
      const { props, restProps } = t;
      if (!restProps) {
        const propertyPairsSchemas = Object.entries(props)
          .map(([key, type]) => `${key}: ${generateFromType(type, registry)}`)
          .join(",\n");
        return `{\n${addTabs(propertyPairsSchemas)}\n}`;
      }
    case Type.Reference:
      return generateFromType(registry[t.name], registry);
    default:
      throw new Error("Wrong type: " + JSON.stringify(t));
  }
};
