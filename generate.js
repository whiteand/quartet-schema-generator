const util = require("util");
const fs = require("fs");
const ts = require("typescript");
const prettier = require('prettier')
const inspect = util.inspect;
const promisify = util.promisify;


function findPredicates(node) {
  const res = [];
  for (const key of Object.keys(ts)) {
    if (typeof ts[key] !== "function") continue;
    try {
      if (ts[key](node) === true) {
        res.push(key);
      }
    } catch (error) {}
  }
  return res;
}

const addTabs = require("./addTabs");

const writeFile = promisify(fs.writeFile);
const insplog = (x) => console.log(inspect(x, { depth: 100, colors: true }));
const generateFromType = require("./generateFromType");
const {
  object,
  or,
  constant,
  string,
  boolean,
  number,
  array,
  ref,
  Type,
  getFullTypeDef,
} = require("./type.js");

function getTypeName(node) {
  return node.name.escapedText;
}

function getTypeFromNode(t) {
  if (ts.isUnionTypeNode(t)) {
    return or(...t.types.map(getTypeFromNode));
  }
  if (ts.isLiteralTypeNode(t)) {
    if (ts.isStringLiteral(t.literal)) {
      return constant(t.literal.text);
    }
    return constant(eval(t.literal.text));
  }
  switch (ts.tokenToString(t.kind)) {
    case "string":
      return string();
    case "null":
      return constant(null);
    case "undefined":
      return constant(undefined);
    case "boolean":
      return boolean();
    case "number":
      return number();
  }

  if (ts.isTypeReferenceNode(t)) {
    const { typeName } = t;
    if (ts.isPropertyAccessOrQualifiedName(typeName)) {
      const { left, right } = typeName;
      const refKey = `${left.escapedText}.${right.escapedText}`;
      return ref(refKey);
    }
    const name = typeName.escapedText;
    return ref(name);
  }

  if (ts.isStringLiteral(t)) {
    return constant(t.text);
  }

  if (ts.isTypeLiteralNode(t)) {
    const props = {}
    for (const member of t.members) {
      const propName = getTypeName(member)
      const propType = getTypeFromNode(member.type)
      props[propName] = propType
    }
    return object(props)
  }

  if (ts.isArrayTypeNode(t)) {
    return array(getTypeFromNode(t.elementType))
  }
}

function registerTypeDeclaration(registry, node) {
  const name = getTypeName(node);
  const t = getTypeFromNode(node.type);
  registry[name] = t;
}

function registerInterfaceDeclaration(registry, node) {
  const name = getTypeName(node);
  const props = {};
  for (const member of node.members) {
    const isNotRequired = !!member.questionToken;
    const propName = getTypeName(member);
    let propType = getTypeFromNode(member.type);
    if (isNotRequired) {
      if (propType.type === Type.Or) {
        propType.types.push(constant(undefined));
      } else {
        propType = or(propType, constant(undefined));
      }
    }
    props[propName] = propType;
  }
  registry[name] = object(props);
}

function registerEnumDeclaration(registry, node) {
  const enumName = getTypeName(node);
  const membersTypes = node.members.reduce((dict, t) => {
    const { name, initializer } = t;

    dict[`${enumName}.${name.text}`] = getTypeFromNode(initializer);
    return dict;
  }, {});
  Object.assign(registry, membersTypes);
  registry[enumName] = or(...Object.values(membersTypes));
}
function kind(k) {
  return ts.SyntaxKind[k];
}

async function generateFromCode(code) {
  if (code) {
    await writeFile("./input.ts", code);
  }
  const program = ts.createProgram(["./input.ts"], { allowJs: true });
  const sourceFile = program.getSourceFile("./input.ts");
  const interfaceDeclarations = [];
  const typeDeclarations = [];
  const enumDeclarations = [];
  const exportedNames = {};

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isExternalModuleIndicator(node)) {
      exportedNames[node.name.escapedText] = true;
    }
    if (ts.isInterfaceDeclaration(node)) {
      interfaceDeclarations.push(node);
    } else if (ts.isTypeAliasDeclaration(node)) {
      typeDeclarations.push(node);
    } else if (ts.isEnumDeclaration(node)) {
      enumDeclarations.push(node);
    } else {
      // console.log(sourceFile)
      // console.log(program.getTypeChecker().resolveName('WebSocketChannel'))
      // console.log(program.getResolvedModuleWithFailedLookupLocationsFromCache());
    }
  });
  const registry = {};
  for (const node of enumDeclarations) {
    registerEnumDeclaration(registry, node);
  }
  for (const t of typeDeclarations) {
    registerTypeDeclaration(registry, t);
  }
  for (const t of interfaceDeclarations) {
    registerInterfaceDeclaration(registry, t);
  }
  const nameSchema = [];
  for (const [typeName, typeDef] of Object.entries(registry)) {
    if (exportedNames[typeName] !== true) continue;
    try {
      const fullTypeDef = getFullTypeDef(typeDef, registry);
      const schema = generateFromType(fullTypeDef);
      nameSchema.push([typeName, schema]);
    } catch (error) {
      console.log(error);
    }
  }
  const codeParts = [];
  for (const [name, schema] of nameSchema) {
    const checkerName = name && name.replace(/[^A-Za-z0-9]/g, "");
    codeParts.push(
      `export const check${checkerName} = v<${name}>(\n${addTabs(schema)}\n)`
    );
  }

  codeParts.unshift('import { v } from "quartet"');

  const c = codeParts.join("\n\n");

  const res = prettier.format(c, { parser: 'typescript' })

  await writeFile("./output.ts",res );
}

generateFromCode();
