const Type = {
  Boolean: "Boolean",
  Function: "Function",
  Number: "Number",
  Constant: "Constant",
  String: "String",
  Symbol: "Symbol",
  Array: "Array",
  And: "And",
  Or: "Or",
  Object: "Object",
  Reference: "Reference",
};
const boolean = () => ({ type: Type.Boolean });
const func = () => ({ type: Type.Function });
const number = () => ({ type: Type.Number });
const constant = (c) => ({ type: Type.Constant, value: c });
const string = () => ({ type: Type.String });
const symbol = () => ({ type: Type.Symbol });
const array = (itemType) => ({ type: Type.Array, item: itemType });
const and = (...itemTypes) => ({ type: Type.And, types: itemTypes });
const or = (...itemTypes) => ({ type: Type.Or, types: itemTypes });
const object = (props, restProps) => ({ type: Type.Object, props, restProps });

function getFullTypeDef(t, registry) {
  if (t.type === Type.Reference) {
    return registry[t.name];
  }
  switch (t.type) {
    case Type.Object:
      const newProps = Object.entries(t.props)
        .map(([key, innerT]) => [key, getFullTypeDef(innerT, registry)])
        .reduce((props, [k, v]) => {
          props[k] = v;
          return props;
        }, {});
      const newRestProps = t.restProps && getFullTypeDef(t.restProps, registry);
      return object(newProps, newRestProps);
    case Type.Array:
      return array(getFullTypeDef(t.item, registry));
    case Type.And:
      return and(...t.types.map((t) => getFullTypeDef(t, registry)));
    case Type.Or:
      return or(...t.types.map((t) => getFullTypeDef(t, registry)));
    default:
      return t;
  }
}

module.exports = {
  Type,
  boolean,
  func,
  number,
  constant,
  string,
  symbol,
  array,
  and,
  or,
  object,
  ref: (typeName) => ({ type: Type.Reference, name: typeName }),
  getFullTypeDef,
};
